using Azure.AI.OpenAI;
using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Models;
using FinanceAI.Api.Modules.Banking.Models;
using FinanceAI.Api.Modules.Banking.Repositories;
using Going.Plaid;
using Going.Plaid.Entity;
using Going.Plaid.Item;
using Going.Plaid.Link;
using Going.Plaid.Transactions;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Transaction = FinanceAI.Api.Models.Transaction;

namespace FinanceAI.Api.Modules.Banking.Services;

public class PlaidBankService : BankServiceBase
{
    private readonly PlaidClient _plaidClient;
    private readonly ILogger<PlaidBankService> _logger;
    private readonly IBankConnectionRepository _bankConnectionRepository;

    public PlaidBankService(PlaidClient plaidClient, AppDbContext context, IConfiguration configuration,
        ILogger<PlaidBankService> logger, AzureOpenAIClient azureOpenAiClient,
        IBankConnectionRepository bankConnectionRepository) : base(context, azureOpenAiClient, configuration)
    {
        _plaidClient = plaidClient;
        _logger = logger;
        _bankConnectionRepository = bankConnectionRepository;
    }

    public override async Task<LinkDataResponse> GetLinkDataAsync(Guid userId, string email)
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
        
        var response = await _plaidClient.LinkTokenCreateAsync(request);

        return new LinkDataResponse
        {
            LinkToken = response.LinkToken,
            Provider = BankProvider.Plaid
        };
    }

    public override async Task<BankConnection> ExchangeTokenAsync(Guid userId, string publicToken, string institutionName)
    {
        var exchangeRequest = new ItemPublicTokenExchangeRequest
        {
            PublicToken = publicToken
        };
        
        var exchangeResponse = await _plaidClient.ItemPublicTokenExchangeAsync(exchangeRequest);

        var connection = new BankConnection
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccessToken = exchangeResponse.AccessToken,
            ItemId = exchangeResponse.ItemId,
            InstitutionName = institutionName,
            LastSynced = DateTime.UtcNow,
            Provider = BankProvider.Plaid
        };
        
        await _bankConnectionRepository.AddBankConnectionAsync(connection);
        await SyncTransactionsAsync(connection);
        
        return connection;
    }
    
    public override async Task SyncTransactionsAsync(BankConnection connection)
    {
        var request = new TransactionsSyncRequest
        {
            AccessToken = connection.AccessToken,
        };
        
        var response = await _plaidClient.TransactionsSyncAsync(request);

        var newTransactions = new List<Transaction>();

        foreach (var t in response.Added)
        {
            var exists = await _context.Transactions.AnyAsync(x => x.ExternalId == t.TransactionId);
            
            if (exists) continue;
            
            newTransactions.Add(new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = connection.UserId,
                ExternalId = t.TransactionId,
                Amount = (decimal)t.Amount!,
                Category = CategoryHelper.NormalizeCategory(t.PersonalFinanceCategory?.Primary ?? "Uncategorized"),
                Date = t.Date!.Value,
                Description = t.MerchantName ?? t.Name ?? t.OriginalDescription ?? "Unknown",
                BankConnectionId = connection.Id
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
}