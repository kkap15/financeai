using Azure.AI.OpenAI;
using FinanceAI.Api.Data;
using FinanceAI.Api.Models;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.AI.Service;

public class AIService
{
    private readonly AzureOpenAIClient _azureOpenAiClient;
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AIService> _logger;

    public AIService(AzureOpenAIClient azureOpenAiClient, AppDbContext context, IConfiguration configuration,
        ILogger<AIService> logger)
    {
        _azureOpenAiClient = azureOpenAiClient;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async IAsyncEnumerable<string> GetSpendingInsightAsync(Guid userId)
    {
        var thirtyDaysAgo = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30));
        
        var transactions = await _context.Transactions
            .Where(t => t.UserId == userId && t.Date >= thirtyDaysAgo)
            .OrderByDescending(t => t.Date)
            .ToListAsync();

        if (!transactions.Any())
        {
            yield return "No transactions found in the last 30 days.";
            yield break;
        }
        
        var totalSpent = transactions
            .Where(t => t.Amount > 0)
            .Sum(t => t.Amount);
        
        var byCategory = transactions
            .Where(t => t.Amount > 0)
            .GroupBy(t => t.Category)
            .Select(g => new
            {
                Category = g.Key,
                Total = g.Sum(t => t.Amount),
                Count = g.Count()
            })
            .OrderByDescending(g => g.Total)
            .ToList();

        var categoryBreakdown = string.Join("\n",
            byCategory.Select(c => $"{c.Category.Replace("-", " ")}: ${c.Total:F2} ({c.Count} transactions)"));
        
        var topTransactions = transactions
            .Where(t => t.Amount > 0)
            .OrderByDescending(t => t.Amount)
            .Take(5)
            .Select(s => $"- {s.Description}: ${s.Amount:F2}")
            .ToList();

        var prompt = $"""
                      You are a friendly personal finance advisor. Analyse this person's spending for the last 30 days
                      and provide clear, actionable insights.
                      
                      Total Spent = ${totalSpent:F2}
                      
                      Spending by Category:
                      {categoryBreakdown}
                      
                      Top 5 Transactions:
                      {string.Join("\n", topTransactions)}
                      
                      Respond using this exact markdown structure:
                      ## Spending Summary
                      
                      A brief paragraph summarising their overall spending.
                      
                      ##Areas for Potential Savings
                      
                      - **Category name**: explanation
                      - **Category name**: explanation
                      
                      ## Actionable Tips
                      
                      One specific tip based on their biggest expense.
                      
                      ## Positive Observations
                      
                      One positive observation about their spending.
                      
                      Keep your responses concise, friendly and practical. Use dollar amounts where relevant. Format
                      with clear sections.
                      """;
        
        var deploymentName = _configuration["AzureOpenAI:DeploymentName"]!;
        var chatClient = _azureOpenAiClient.GetChatClient(deploymentName);

        var messages = new List<ChatMessage>
        {
            new UserChatMessage(prompt)
        };

        await foreach (var chunk in chatClient.CompleteChatStreamingAsync(messages))
        {
            foreach (var part in chunk.ContentUpdate)
            {
                if (!string.IsNullOrEmpty(part.Text))
                {
                    yield return part.Text;
                }
            }
        }
    }

    public async Task<List<Transaction>> SemanticSearchAsync(Guid userId, string query)
    {
        var deploymentName = _configuration["AzureOpenAI:EmbeddingDeploymentName"]!;
        var embeddingClient = _azureOpenAiClient.GetEmbeddingClient(deploymentName);

        var embeddingResult = await embeddingClient.GenerateEmbeddingAsync(query);
        var queryVector = new Vector(embeddingResult.Value.ToFloats().ToArray());

        var results = await _context.Transactions
            .Where(t => t.UserId == userId && t.Embedding != null)
            .OrderBy(t => t.Embedding!.CosineDistance(queryVector))
            .Take(10)
            .ToListAsync();

        return results;
    }
}