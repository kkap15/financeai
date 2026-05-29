using FinanceAI.Api.Modules.Banking.Models;

namespace FinanceAI.Api.Modules.Banking.Services;

public class BankServiceFactory(PlaidBankService plaidBankService, BasiqBankService basiqBankService)
{
    public IBankService GetService(BankProvider provider) => provider switch
    {
        BankProvider.Plaid => plaidBankService,
        BankProvider.Basiq => basiqBankService,
        _ => throw new ArgumentOutOfRangeException($"Unknown provider: {provider}")
    };
}