using Pgvector;

namespace FinanceAI.Api.Models;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? PlaidConnectionId { get; set; }
    public string PlaidId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public Vector? Embedding { get; set; }

    public User User { get; set; } = null!;
    public PlaidConnection? PlaidConnection { get; set; }
}