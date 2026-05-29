using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Azure.AI.OpenAI;
using FinanceAI.Api.Data;
using FinanceAI.Api.Models;
using FinanceAI.Api.Modules.Banking.Models;
using FinanceAI.Api.Modules.Banking.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Banking.Services;

public class BasiqBankService : BankServiceBase
{
    private readonly ILogger<BasiqBankService> _logger;
    private readonly IBankConnectionRepository _bankConnectionRepository;
    private readonly HttpClient _httpClient;
    
    public BasiqBankService(IConfiguration configuration, AppDbContext context, ILogger<BasiqBankService> logger,
        AzureOpenAIClient azureOpenAiClient, IBankConnectionRepository bankConnectionRepository,
        IHttpClientFactory httpClientFactory) : base(context, azureOpenAiClient, configuration)
    {
        _logger = logger;
        _bankConnectionRepository = bankConnectionRepository;
        _httpClient = httpClientFactory.CreateClient("Basiq");
    }

    public override async Task<LinkDataResponse> GetLinkDataAsync(Guid userId, string email)
    {
        var serverToken = await GetServerToken();
        var basiqUserId = await GetOrCreateBasiqUserAsync(userId, email, serverToken);

        var apiKey = _configuration["Basiq:ApiKey"]!;
        
        var request = new HttpRequestMessage(HttpMethod.Post, "/token");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", apiKey);
        request.Content = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("scope", "CLIENT_ACCESS"),
            new KeyValuePair<string, string>("userId", basiqUserId)
        ]);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        
        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var clientToken = doc.RootElement.GetProperty("access_token").ToString();

        var consentUrl = $"https://consent.basiq.io/home?token={clientToken}&environment=sandbox";
        
        return new LinkDataResponse
        {
            BasiqUserId = basiqUserId,
            Provider = BankProvider.Basiq,
            ConsentUrl = consentUrl
        };
    }

    public override async Task<BankConnection> ExchangeTokenAsync(Guid userId, string jobId, string institutionName)
    {
        var jobDoc = await PollJobsAsync(jobId);
        if (jobDoc is null) throw new Exception("Basiq jobs did not complete in time.");

        var sourceUrl = jobDoc.RootElement
            .GetProperty("links")
            .GetProperty("source")
            .GetString();
        
        var transactionUrl = jobDoc.RootElement
            .GetProperty("steps")
            .EnumerateArray()
            .First(s => s.GetProperty("title").GetString() == "retrieve-transactions")
            .GetProperty("result")
            .GetProperty("url")
            .GetString();
        
        var parts = sourceUrl!.Split('/');
        var basiqUserId = parts[4];

        var connection = new BankConnection
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BasiqUserId = basiqUserId,
            InstitutionName = institutionName,
            LastSynced = DateTime.UtcNow,
            Provider = BankProvider.Basiq
        };
        
        connection = await _bankConnectionRepository.AddBankConnectionAsync(connection);
        await SyncTransactionsAsync(connection, transactionUrl);
        
        return connection;
    }

    public override async Task SyncTransactionsAsync(BankConnection connection)
        => await SyncTransactionsAsync(connection, null);
    
    private async Task SyncTransactionsAsync(BankConnection connection, string? transactionUrl)
    {
        var token = await GetServerToken();

        var url = transactionUrl ?? $"/users/{connection.BasiqUserId}/transactions?limit=500";

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.SendAsync(request);
        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var data = doc.RootElement.GetProperty("data");
        response.EnsureSuccessStatusCode();
        var newTransactions = new List<Transaction>();

        foreach (var t in data.EnumerateArray())
        {
            var externalId = t.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
            if (string.IsNullOrEmpty(externalId)) continue;
            
            var exists = await _context.Transactions
                .AnyAsync(x => x.ExternalId == externalId);
            if (exists) continue;

            var amountStr = t.TryGetProperty("amount", out var amountProp) ? amountProp.GetString() ?? "0" : "0";
            var amount = decimal.Parse(amountStr, CultureInfo.InvariantCulture);

            var postDateStr = t.TryGetProperty("postDate", out var dateProp) ?  dateProp.GetString() : null;
            if (string.IsNullOrEmpty(postDateStr)) continue;
            var postDate = DateTime.Parse(postDateStr, CultureInfo.InvariantCulture);

            var description = t.TryGetProperty("description", out var descProp)
                ? descProp.GetString() ?? "Unknown"
                : "Unknown";
            
            var category = t.TryGetProperty("class", out var catProp)
                ? catProp.GetString() ?? "Uncategorized" : "Uncategorized";
            
            newTransactions.Add(new Transaction
            {
                Amount = Math.Abs(amount),
                BankConnectionId = connection.Id,
                Category = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(category.ToLower()),
                Date = DateOnly.FromDateTime(postDate),
                Description = description,
                Id = Guid.NewGuid(),
                ExternalId = externalId,
                UserId = connection.UserId
            });
        }

        if (newTransactions.Any())
        {
            await GenerateEmbeddingsAsync(newTransactions);
            await _context.Transactions.AddRangeAsync(newTransactions);
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Synced {count} transactions for connection: {connectionId}", newTransactions.Count,
            connection.UserId);
    }

    private async Task<string> GetServerToken()
    {
        var apiKey = _configuration["Basiq:ApiKey"]!;

        var request = new HttpRequestMessage(HttpMethod.Post, "/token");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", apiKey);
        request.Content = new FormUrlEncodedContent([new KeyValuePair<string, string>("scope", "SERVER_ACCESS")]);
        
        var response = await _httpClient.SendAsync(request);
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        
        var doc = JsonDocument.Parse(json);
        
        return doc.RootElement.GetProperty("access_token").ToString();
    }

    private async Task<string> GetOrCreateBasiqUserAsync(Guid userId, string email, string serverToken)
    {
        var existing = await _bankConnectionRepository.GetUserByIdAsync(userId, BankProvider.Basiq);
        if (existing?.BasiqUserId is not null) return existing.BasiqUserId;

        var request = new HttpRequestMessage(HttpMethod.Post, "/users");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serverToken);
        request.Content = new StringContent(JsonSerializer.Serialize(new { email, mobile="+61412345678" }), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("id").ToString()!;
    }

    private async Task<JsonDocument?> PollJobsAsync(string jobId)
    {
        var token = await GetServerToken();

        for (var i = 0; i < 20; ++i)
        {   
            var request = new HttpRequestMessage(HttpMethod.Get, $"/jobs/{jobId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("steps", out var steps))
            {
                var stepList = steps.EnumerateArray().ToList();

                var allDone = stepList.All(s =>
                {
                    var status = s.GetProperty("status").GetString();
                    return status == "success";
                });

                if (allDone) return doc;
            }
            await Task.Delay(2000);
        }
        
        return null;
    }
}