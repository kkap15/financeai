namespace FinanceAI.Api.Models;

public class PlaidConnection
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string AccessToken { get; set; } = string.Empty;
    public string ItemId { get; set; } = string.Empty;
    public string InstitutionName { get; set; } = string.Empty;
    public DateTime LastSynced { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = [];
}