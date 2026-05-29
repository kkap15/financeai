using Azure.AI.OpenAI;
using FinanceAI.Api.Data;
using FinanceAI.Api.Models;
using FinanceAI.Api.Modules.Banking.Models;
using Pgvector;

namespace FinanceAI.Api.Modules.Banking.Services;

public abstract class BankServiceBase : IBankService
{
    protected readonly AppDbContext _context;
    protected readonly AzureOpenAIClient _azureOpenAiClient;
    protected readonly IConfiguration _configuration;
    
    protected BankServiceBase(AppDbContext context, AzureOpenAIClient azureOpenAiClient, IConfiguration configuration)
    {
        _context = context;
        _azureOpenAiClient = azureOpenAiClient;
        _configuration = configuration;
    }

    public async Task ResyncTransactionsAsync(BankConnection connection)
    {
        var existing = _context.Transactions
            .Where(t => t.BankConnectionId == connection.Id);
        _context.Transactions.RemoveRange(existing);
        await _context.SaveChangesAsync();
        await SyncTransactionsAsync(connection);
    }
    
    public async Task GenerateEmbeddingsAsync(List<Transaction> transactions)
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
    
    public abstract Task<LinkDataResponse> GetLinkDataAsync(Guid userId, string email);
    public abstract Task<BankConnection> ExchangeTokenAsync(Guid userId, string token, string institutionName);
    public abstract Task SyncTransactionsAsync(BankConnection connection);
}