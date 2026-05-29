using FinanceAI.Api.Modules.Banking.Models;

namespace FinanceAI.Api.Modules.Banking.Services;

public interface IBankService
{
    Task<LinkDataResponse> GetLinkDataAsync(Guid userId, string email);
    Task<BankConnection> ExchangeTokenAsync(Guid userId, string token, string institutionName);
    Task SyncTransactionsAsync(BankConnection connection);
    Task ResyncTransactionsAsync(BankConnection connection);
}