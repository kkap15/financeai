using FinanceAI.Api.Models;

namespace FinanceAI.Api.Modules.Banking.Models;

public class BankConnection
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public BankProvider Provider { get; set; }
    
    public string? AccessToken { get; set; }
    public string? ItemId { get; set; }
    
    public string? BasiqUserId { get; set; }
    
    public string InstitutionName { get; set; } = string.Empty;
    public DateTime LastSynced { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = [];
}