using FinanceAI.Api.Modules.Banking.Models;

namespace FinanceAI.Api.Modules.Banking.Repositories;

public interface IBankConnectionRepository
{
    Task<BankConnection?> GetUserByIdAsync(Guid userId, BankProvider provider);
    Task<BankConnection?> GetByProviderUserIdAsync(string providerId, BankProvider provider);
    Task<List<BankConnection>> GetAllUserByIdAsync(Guid userId);
    Task<BankConnection> AddBankConnectionAsync(BankConnection connection);
    Task<BankConnection?> GetByIdAsync(Guid connectionId, Guid userId);
    Task UpdateBankConnectionAsync(BankConnection connection);
}