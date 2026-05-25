using Azure.AI.OpenAI;
using FinanceAI.Api.Data;
using FinanceAI.Api.Models;
using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Transaction = FinanceAI.Api.Models.Transaction;

namespace FinanceAI.Api.Modules.Plaid;

public class PlaidService
{
    private readonly PlaidClient _client;
    private readonly AppDbContext _context;
    private readonly ILogger<PlaidService> _logger;
    private readonly IConfiguration _configuration;
    private readonly AzureOpenAIClient _azureOpenAiClient;

    public PlaidService(PlaidClient client, AppDbContext context, ILogger<PlaidService> logger,
        IConfiguration configuration, AzureOpenAIClient azureOpenAiClient)
    {
        _client = client;
        _context = context;
        _logger = logger;
        _configuration = configuration;
        _azureOpenAiClient = azureOpenAiClient;
    }

    public async Task<string> CreateLinkTokenAsync(Guid userId)
    {
        var request = new LinkTokenCreateRequest
        {
            User = new LinkTokenCreateRequestUser
            {
                ClientUserId = userId.ToString()
            },
            ClientName = "FinanceAI",
            Products = [Products.Transactions],
            CountryCodes = [CountryCode.Us, CountryCode.Ca, CountryCode.Gb],
            Language = Language.English
        };
        
        var response = await _client.LinkTokenCreateAsync(request);
        
        return response.LinkToken;
    }

    public async Task<PlaidConnection> ExchangeTokenAsync(Guid userId, string publicToken, string institutionName)
    {
        var exchangeRequest = new ItemPublicTokenExchangeRequest
        {
            PublicToken = publicToken
        };
        
        var exchangeResponse = await _client.ItemPublicTokenExchangeAsync(exchangeRequest);

        var connection = new PlaidConnection
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccessToken = exchangeResponse.AccessToken,
            ItemId = exchangeResponse.ItemId,
            InstitutionName = institutionName,
            LastSynced = DateTime.UtcNow
        };
        
        await _context.PlaidConnections.AddAsync(connection);
        await _context.SaveChangesAsync();
        
        await SyncTransactionsAsync(connection);
        return connection;
    }

    public async Task SyncTransactionsAsync(PlaidConnection connection)
    {
        var request = new TransactionsSyncRequest
        {
            AccessToken = connection.AccessToken,
        };
        
        var response = await _client.TransactionsSyncAsync(request);

        var newTransactions = new List<Transaction>();

        foreach (var t in response.Added)
        {
            var exists = await _context.Transactions.AnyAsync(x => x.PlaidId == t.TransactionId);
            
            if (exists) continue;
            
            newTransactions.Add(new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = connection.UserId,
                PlaidConnectionId = connection.Id,
                Amount = (decimal)t.Amount,
                Category = t.PersonalFinanceCategory?.Primary ?? "Uncategorized",
                Date = t.Date!.Value,
                Description = t.Name,
                PlaidId = t.TransactionId!
            });
        }
        
        if (newTransactions.Any())
        {
            await GenerateEmbeddingsAsync(newTransactions);
            
            await _context.Transactions.AddRangeAsync(newTransactions);
        }
        
        connection.LastSynced = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Synced {count} transactions for connection: {connectionId}", newTransactions.Count,
            connection.Id);
    }

    private async Task GenerateEmbeddingsAsync(List<Transaction> transactions)
    {
        var deploymentName = _configuration["AzureOpenAI:EmbeddingDeploymentName"]!;
        var embeddingClient = _azureOpenAiClient.GetEmbeddingClient(deploymentName);
        
        var texts = transactions
            .Select(t => $"{t.Description} {t.Category.Replace("_", " ")} ${t.Amount}")
            .ToList();

        var embeddingResult = await embeddingClient.GenerateEmbeddingsAsync(texts);

        for (int i = 0; i < transactions.Count; i++)
        {
            var vector = embeddingResult.Value[i].ToFloats().ToArray();
            transactions[i].Embedding = new Vector(vector);
        }
    }
}