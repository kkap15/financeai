namespace FinanceAI.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string? BasiqUserId { get; set; }
    public string Auth0Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Subscription? Subscription { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = [];
    public ICollection<Budget> Budgets { get; set; } = [];
}