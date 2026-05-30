using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Azure.AI.OpenAI;
using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Modules.Banking.Models;
using FinanceAI.Api.Modules.Banking.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Banking.Services;

public class BasiqBankService : BankServiceBase
{
    private readonly ILogger<BasiqBankService> _logger;
    private readonly IBankConnectionRepository _bankConnectionRepository;
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    
    public BasiqBankService(IConfiguration configuration, AppDbContext context, ILogger<BasiqBankService> logger,
        AzureOpenAIClient azureOpenAiClient, IBankConnectionRepository bankConnectionRepository,
        IHttpClientFactory httpClientFactory) : base(context, azureOpenAiClient, configuration)
    {
        _logger = logger;
        _bankConnectionRepository = bankConnectionRepository;
        _httpClient = httpClientFactory.CreateClient("Basiq");
        _apiKey = _configuration["Basiq:ApiKey"]!;
    }

    public override async Task<LinkDataResponse> GetLinkDataAsync(Guid userId, string email)
    {
        var serverToken = await BankServiceHelper.GetServerToken(_httpClient, _apiKey);
        var basiqUserId = await GetOrCreateBasiqUserAsync(userId, email, serverToken);
        
        var request = new HttpRequestMessage(HttpMethod.Post, "/token");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", _apiKey);
        request.Content = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("scope", "CLIENT_ACCESS"),
            new KeyValuePair<string, string>("userId", basiqUserId)
        ]);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        
        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var clientToken = doc.RootElement.GetProperty("access_token").ToString();

        var consentUrl = $"https://consent.basiq.io/home?token={clientToken}&environment=sandbox&action=connect";
        
        return new LinkDataResponse
        {
            BasiqUserId = basiqUserId,
            Provider = BankProvider.Basiq,
            ConsentUrl = consentUrl
        };
    }

    public override async Task<BankConnection> ExchangeTokenAsync(Guid userId, string jobId, string institutionName)
    {
        var jobDoc = await BankServiceHelper.PollJobsAsync(_httpClient, _apiKey, jobId);
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
        await SyncBasiqTransactionsAsync(connection, transactionUrl);
        
        return connection;
    }

    public override async Task SyncTransactionsAsync(BankConnection connection)
        => await SyncBasiqTransactionsAsync(connection, null);
    
    private async Task SyncBasiqTransactionsAsync(BankConnection connection, string? transactionUrl)
    {
        var token = await BankServiceHelper.GetServerToken(_httpClient, _apiKey);

        var url = transactionUrl ?? $"/users/{connection.BasiqUserId}/transactions?limit=500";

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await _httpClient.SendAsync(request);
        var json = await response.Content.ReadAsStringAsync();
        response.EnsureSuccessStatusCode();
        
        var doc = JsonDocument.Parse(json);
        var data = doc.RootElement.GetProperty("data");

        var transactions = await BankServiceHelper.GetNewTransactionsFromBasiqData(data, _context, connection);
        
        if (transactions.Any())
        {
            await GenerateEmbeddingsAsync(transactions);
            await _context.Transactions.AddRangeAsync(transactions);
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Synced {count} transactions for connection: {connectionId}", transactions.Count,
            connection.UserId);
    }

    private async Task<string> GetOrCreateBasiqUserAsync(Guid userId, string email, string serverToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        
        if (!string.IsNullOrEmpty(user?.BasiqUserId)) return user.BasiqUserId;
        

        var request = new HttpRequestMessage(HttpMethod.Post, "/users");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serverToken);
        request.Content = new StringContent(
            JsonSerializer.Serialize(new
            {
                email,
                mobile = BankServiceHelper.GenerateAustralianMobile()
            }),
            Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var basiqUserId = doc.RootElement.GetProperty("id").ToString()!;

        if (user is not null)
        {
            user.BasiqUserId = basiqUserId;
            await _context.SaveChangesAsync();
        }
        
        return basiqUserId;
    }
}