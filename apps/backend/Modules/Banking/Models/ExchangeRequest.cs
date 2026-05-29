namespace FinanceAI.Api.Modules.Banking.Models;

public record ExchangeRequest(BankProvider Provider, string Token, string InstitutionName);