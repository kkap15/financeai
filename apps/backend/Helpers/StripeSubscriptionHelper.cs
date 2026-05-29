using FinanceAI.Api.Data;
using FinanceAI.Api.Modules.Subscriptions.Enums;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace FinanceAI.Api.Helpers;

public static class StripeSubscriptionHelper
{
    public static async Task<(Subscription? subscription, Models.Subscription? dbSubscription)> GetSubscriptionData(
        AppDbContext context, Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Stripe.Subscription;
        if (subscription is null) return (null, null);

        var dbSubscription = await context.Subscriptions
            .FirstOrDefaultAsync(s => s.StripeCustomerId == subscription.CustomerId);

        if (dbSubscription is null)
        {
            var customer = await new CustomerService().GetAsync(subscription.CustomerId);
            if (customer.Metadata.TryGetValue("UserId", out var userIdStr) && Guid.TryParse(userIdStr, out var userId))
            {
                dbSubscription = await context.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId);
                if (dbSubscription is not null)
                {
                    dbSubscription.StripeCustomerId = subscription.CustomerId;
                    await context.SaveChangesAsync();
                }
            }
        }

        return (subscription, dbSubscription);
    }

    public static async Task CreateNewSubscription(Subscription stripeSubscription, Models.Subscription dbSubscription,
        AppDbContext context)
    {
        
        dbSubscription.CurrentPeriodEnd = stripeSubscription.BillingCycleAnchor;
        dbSubscription.Status = SubscriptionStatus.Active;
        dbSubscription.Tier = SubscriptionTier.Pro;
        dbSubscription.StripeSubscriptionId = stripeSubscription.Id;
                    
        context.Subscriptions.Update(dbSubscription);
        await context.SaveChangesAsync();
    }

    public static async Task UpdateExistingSubscription(Subscription stripeSubscription,
        Models.Subscription dbSubscription, AppDbContext context)
    {
        if (stripeSubscription.CancelAtPeriodEnd)
        {
            dbSubscription.Status = SubscriptionStatus.Cancelled;
            dbSubscription.CurrentPeriodEnd = stripeSubscription.BillingCycleAnchor;
            await context.SaveChangesAsync();
            return;
        }
        
        dbSubscription.Status = stripeSubscription.Status switch
        {
            "active"   => SubscriptionStatus.Active,
            "past_due" => SubscriptionStatus.PastDue,
            _          => SubscriptionStatus.Active
        };
                    
        context.Subscriptions.Update(dbSubscription);
        await context.SaveChangesAsync();
    }
    
    public static async Task DowngradeSubscription(Subscription stripeSubscription,
        Models.Subscription dbSubscription, AppDbContext context)
    {
        dbSubscription.CurrentPeriodEnd = stripeSubscription.CanceledAt;
        dbSubscription.Status = SubscriptionStatus.Cancelled;
        dbSubscription.Tier = SubscriptionTier.Free;
                    
        context.Subscriptions.Update(dbSubscription);
        await context.SaveChangesAsync();
    }
}