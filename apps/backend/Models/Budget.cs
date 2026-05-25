namespace FinanceAI.Api.Models;

public class Budget
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal MonthlyLimit { get; set; }
    public DateOnly Month { get; set; }

    public User User { get; set; } = null!;
}