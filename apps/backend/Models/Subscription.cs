using FinanceAI.Api.Modules.Subscriptions.Enums;

namespace FinanceAI.Api.Models;

public class Subscription
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? StripeCustomerId { get; set; } = string.Empty;
    public string? StripeSubscriptionId { get; set; } = string.Empty;
    public SubscriptionTier Tier { get; set; } = SubscriptionTier.Free;
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    public DateTime? CurrentPeriodEnd { get; set; }

    public User User { get; set; } = null!;
}