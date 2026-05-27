using FinanceAI.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Budget.Services;

public class BudgetService
{
    public async Task<List<BudgetSummary>> GetBudgetAsync(Guid userId, AppDbContext context)
    {
        var thisMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        
        var budgets = await context.Budgets
            .Where(t => t.UserId == userId && t.Month == thisMonth)
            .ToListAsync();

        var actualSpending = await context.Transactions
            .Where(u => u.UserId == userId
                        && u.Date >= thisMonth
                        && u.Amount > 0)
            .GroupBy(c => c.Category)
            .Select(s => new
            {
                Sum= s.Sum(x => x.Amount),
                Category = s.Key
            })
            .ToListAsync();

        var result = budgets.Select(b => new
        {
            b.Category,
            Limit = b.MonthlyLimit,
            Spent = actualSpending.FirstOrDefault(a => a.Category == b.Category)?.Sum ?? 0
        }).Select(x => new BudgetSummary(
            x.Category,
            x.Limit,
            x.Spent,
            x.Limit > 0 ? Math.Round((x.Spent / x.Limit) * 100, 1) : 0
        )).ToList();

        return result;
    }

    public async Task<BudgetSummary> CreateOrUpdateBudgetAsync(Guid userId, AppDbContext context, string category,
        decimal limit)
    {
        var currentMonth = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var normalizedCategory = category.ToUpperInvariant().Replace(" ", "_");
        
        var userHasBudget = await context.Budgets
            .Where(x => x.User.Id.Equals(userId)
                        && x.Month.Equals(currentMonth)
                        && x.Category.ToUpper().Equals(normalizedCategory))
            .ToListAsync();
        
        if (userHasBudget.Any())
        {
            var actualSpending = await context.Transactions
                .Where(u => u.UserId == userId
                            && u.Date >= currentMonth
                            && u.Amount > 0
                            && u.Category == category)
                .SumAsync(x => x.Amount);
            var budget = userHasBudget.FirstOrDefault()!;
            budget.MonthlyLimit = limit;
            var spent = actualSpending;
            var percentage = Math.Round((spent / limit) * 100, 1);
            context.Budgets.Update(budget);
            await context.SaveChangesAsync();

            return new BudgetSummary(budget.Category, budget.MonthlyLimit, spent, percentage);
        }
        else
        {
            var budget = new Models.Budget
            {
                Category = category,
                Id = Guid.NewGuid(),
                UserId = userId,
                Month = currentMonth,
                MonthlyLimit = limit
            };

            context.Budgets.Add(budget);
            await context.SaveChangesAsync();
            
            return new BudgetSummary(budget.Category, budget.MonthlyLimit, 0, 0);
        }
    }
    
    public record BudgetSummary(string Category, decimal Limit, decimal Spent, decimal Percentage);
}