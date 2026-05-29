namespace FinanceAI.Api.Modules.Banking.Models;

public class LinkDataResponse
{
    public string? LinkToken { get; set; }
    public string? ConsentUrl { get; set; }
    public BankProvider Provider { get; set; }
    public string? BasiqUserId { get; set; }
}