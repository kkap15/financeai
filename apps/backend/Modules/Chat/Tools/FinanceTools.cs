using System.ComponentModel;
using System.Globalization;
using Azure.AI.OpenAI;
using FinanceAI.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Chat.Tools;

public class FinanceTools
{
    private readonly AppDbContext _context;
    private readonly AzureOpenAIClient _azureOpenAiClient;
    private readonly IConfiguration _configuration;
    private Guid _userId;

    public FinanceTools(AppDbContext context, AzureOpenAIClient azureOpenAiClient, IConfiguration configuration)
    {
        _context = context;
        _azureOpenAiClient = azureOpenAiClient;
        _configuration = configuration;
    }
    
    public void SetUserId(Guid userId) => _userId = userId;

    [KernelFunction("get_spending_summary")]
    [Description("Gets total spending grouped by category for the current month")]
    public async Task<string> GetSpendingSummaryAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startOfMonth = new DateOnly(today.Year, today.Month, 1);

        var transactions = await _context.Transactions
            .Where(t => t.UserId == _userId && t.Date >= startOfMonth && t.Date < today)
            .ToListAsync();

        if (!transactions.Any())
        {
            return "No transactions found.";
        }

        var totalAmount = transactions
            .Where(t => t.Amount > 0)
            .Sum(t => t.Amount);
        
        var spendingCategory = await GetSpendingCategoryAsync(startOfMonth, today);

        var summary = string.Join("\n",
            spendingCategory.Select(c => $"{c.Category.Replace("_", " ")}: ${c.Total:F2}"));

        return $"Total spent this month: ${totalAmount:F2}\n\nBy category:\n{summary}";
    }

    [KernelFunction("get_recent_transactions")]
    [Description("Gets recent transactions for the user")]
    public async Task<string> GetRecentTransactions(int numbTransactions = 10)
    {
        var transactions = await _context.Transactions
            .Where(t => t.UserId == _userId)
            .OrderByDescending(d => d.Date)
            .Take(numbTransactions)
            .ToListAsync();

        if (!transactions.Any())
        {
            return "No transactions found for the current month.";
        }
        
        var recentTransactionSummary = string.Join("\n",
            transactions.Select(x => $"- {x.Date}: {x.Description} ${x.Amount:F2} ({x.Category.Replace("_", " ")})"));
        
        return recentTransactionSummary;
    }

    [KernelFunction("compare_spending_range")]
    [Description("Compare spending by category across a range of months")]
    public async Task<string> CompareSpendingRangeAsync(
        [Description("Start month in YYYY-MM format e.g. 2026-04")]
        string startMonth,
        [Description("End month in YYYY-MM format e.g. 2026-06")]
        string endMonth)
    {
        var parsedStartMonth = DateOnly.ParseExact(startMonth, "yyyy-MM", CultureInfo.InvariantCulture);
        var parsedEndMonth = DateOnly.ParseExact(endMonth, "yyyy-MM", CultureInfo.InvariantCulture);

        var listOfMonths = new List<DateOnly>();

        while (parsedStartMonth <= parsedEndMonth)
        {
            listOfMonths.Add(parsedStartMonth);
            parsedStartMonth = parsedStartMonth.AddMonths(1);
        }
        
        var results = new Dictionary<string, List<(string Category, decimal Total)>>();
        
        foreach (var month in listOfMonths)
        {
            var spendingByCategory = await _context.Transactions
                .Where(t => t.UserId == _userId
                            && t.Date.Month == month.Month
                            && t.Date.Year == month.Year
                            && t.Amount > 0)
                .GroupBy(t => t.Category)
                .Select(g => new
                {
                    Category = g.Key,
                    Total = g.Sum(t => t.Amount)
                })
                .ToListAsync();
            
            var monthKey = month.ToString("MMM yyyy");
            
            results[monthKey] = spendingByCategory
                .Select(c => (c.Category, c.Total))
                .ToList();
        }

        var allCategories = results.Values
            .SelectMany(v => v.Select(x => x.Category))
            .Distinct()
            .OrderBy(c => c);
        
        var lines = new List<string>();
        lines.Add($"Spending comparison {results.Keys.First()} -> {results.Keys.Last()}:\n");

        foreach (var category in allCategories)
        {
            lines.Add(category.Replace("_", " ") + ":");
            foreach (var month in results.Keys)
            {
                var total = results[month]
                    .FirstOrDefault(x => x.Category == category).Total;
                lines.Add($"   {month}: ${total:F2}");
            }
            lines.Add("");
        }

        return string.Join("\n", lines);
    }

    [KernelFunction("create_budget")]
    [Description("Creates or updates a monthly budget limit for a spending category")]
    public async Task<string> CreateABudgetAsync(
        [Description("The spending category e.g. FOOD_AND_DRINK")] string category,
        [Description("The monthly spending limit in dollars")] decimal limit)
    {
        var currentMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        
        var userHasBudget = await _context.Budgets
            .Where(x => x.User.Id.Equals(_userId)
                        && x.Month.Equals(currentMonth)
                        && x.Category.Equals(category))
            .ToListAsync();

        if (userHasBudget.Any())
        {
            var budget = userHasBudget.FirstOrDefault()!;
            budget.MonthlyLimit = limit;
            _context.Budgets.Update(budget);
            await _context.SaveChangesAsync();
            
            return $"Budget updated: ${limit:F2}/month for {category.Replace("_", " ")}";
        }
        else
        {
            var budget = new Models.Budget
            {
                Category = category,
                Id = Guid.NewGuid(),
                UserId = _userId,
                Month = DateOnly.FromDateTime(DateTime.UtcNow),
                MonthlyLimit = limit
            };

            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();
            
            return $"Budget created: ${limit:F2}/month for {category.Replace("_", " ")}";
        }
    }

    [KernelFunction("get_budget_status")]
    [Description("Gets current spending vs budget limits for this month")]
    public async Task<string> GetBudgetStatusAsync()
    {
        var currentMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        
        var allBudgets = await _context.Budgets
            .Where(x => x.UserId.Equals(_userId)
            && x.Month.Equals(currentMonth))
            .ToListAsync();

        if (!allBudgets.Any())
        {
            return "No budgets set for this month yet.";
        }

        var actualSpendingPerCategory = await GetSpendingCategoryAsync(currentMonth, DateOnly.FromDateTime(DateTime.UtcNow));
        var lines = new List<string> { $"Budget Status - {currentMonth:MMM yyyy}:\n" };

        foreach (var budget in allBudgets)
        {
            var actualSpending = actualSpendingPerCategory.FirstOrDefault(x => x.Category == budget.Category).Total;
            var percentage = (actualSpending / budget.MonthlyLimit) * 100;
            var indicator = percentage >= 100 ? "❌" : percentage > 80 ? "⚠️" : "✅";

            lines.Add(
                $"{budget.Category.Replace("_", " ")}: ${actualSpending:F2} of ${budget.MonthlyLimit:F2} ({percentage:F0}%) {indicator}");
        }

        return string.Join("\n", lines);
    }

    [KernelFunction("search_transactions")]
    [Description("Searches transactions using natural language e.g. 'coffee shops' or 'subscriptions'")]
    public async Task<string> SearchTransactionsAsync([Description("Natural language search query")] string query)
    {
        var embeddingDeployment = _configuration["AzureOpenAI:EmbeddingDeploymentName"];
        var embeddingClient = _azureOpenAiClient.GetEmbeddingClient(embeddingDeployment);
        var embedQuery = await embeddingClient.GenerateEmbeddingAsync(query);
        var queryVector = new Vector(embedQuery.Value.ToFloats());
        
        var transactions = await _context.Transactions
            .Where(t => t.UserId.Equals(_userId) && t.Embedding != null)
            .OrderBy(s => s.Embedding!.CosineDistance(queryVector))
            .Take(10)
            .ToListAsync();

        if (!transactions.Any())
        {
            return $"No transactions found matching '{query}'";
        }

        var lines = new List<string> { $"Found {transactions.Count} transactions matching \"{query}\"" };

        foreach (var transaction in transactions)
        {
            lines.Add($" - {transaction.Date}: {transaction.Description} ${transaction.Amount:F2} ({transaction.Category.Replace("_", " ")})");
        }
        
        var total = transactions.Sum(x => x.Amount);
        lines.Add($"Total: ${total:F2}");

        return string.Join("\n", lines);
    }

    private async Task<List<(string Category, decimal Total)>> GetSpendingCategoryAsync(DateOnly from, DateOnly to)
    {
        return await _context.Transactions
            .Where(t => t.UserId.Equals(_userId)
                        && t.Date >= from
                        && t.Date <= to
                        && t.Amount > 0)
            .GroupBy(t => t.Category)
            .Select(g => new
            {
                Category = g.Key,
                Total = g.Sum(t => t.Amount)
            })
            .ToListAsync()
            .ContinueWith(t => t.Result
                .Select(x => (x.Category, x.Total))
                .ToList());
    }
}