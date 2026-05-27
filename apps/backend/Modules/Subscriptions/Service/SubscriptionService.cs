using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace FinanceAI.Api.Modules.Subscriptions.Service;

public class SubscriptionService
{
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly string _frontendBaseUrl;

    public SubscriptionService(IConfiguration configuration, AppDbContext context, IWebHostEnvironment env)
    {
        _configuration = configuration;
        _context = context;
        _frontendBaseUrl = env.IsProduction()
            ? "https://financeai.moviegasm.xyz"
            : "http://localhost:3000";
    }
    
    public async Task<string> CreateCheckoutSessionAsync(Guid userId, string userEmail)
    {
        var subscription = await _context.Subscriptions
            .FirstOrDefaultAsync(s => s.UserId == userId);

        string customerId;

        if (!string.IsNullOrEmpty(subscription?.StripeCustomerId))
        {
            customerId = subscription.StripeCustomerId;
        }
        else
        {
            var customerService = new CustomerService();
            var customer = await customerService.CreateAsync(new CustomerCreateOptions
            {
                Email = userEmail,
                Metadata = new Dictionary<string, string> { { "UserId", userId.ToString() } }
            });
            Console.WriteLine($"Created stripe customer: {customer.Id}");
            customerId = customer.Id;
        }

        if (subscription is not null)
        {
            subscription.StripeCustomerId = customerId;
        }
        else
        {
            var newSubscription = new FinanceAI.Api.Models.Subscription
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                StripeCustomerId = customerId,
                Tier = Enums.SubscriptionTier.Free,
                Status = Enums.SubscriptionStatus.Active
            };
            await _context.Subscriptions.AddAsync(newSubscription);
        }
        await _context.SaveChangesAsync();
        
        var sessionService = new SessionService();
        var session = await sessionService.CreateAsync(new SessionCreateOptions
        {
            Customer = customerId,
            Mode = "subscription",
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Price = _configuration["Stripe:PriceId"],
                    Quantity = 1
                }
            },
            SuccessUrl = $"{_frontendBaseUrl}/dashboard?upgraded=true",
            CancelUrl = $"{_frontendBaseUrl}/settings"
        });
        
        return session.Url;
    }

    public async Task<string> CreateCustomerPortalAsync(Guid userId)
    {
        var user = await _context.Users.Include(user => user.Subscription)
            .FirstOrDefaultAsync(u => u.Id.Equals(userId));

        if (user is null || string.IsNullOrEmpty(user.Subscription?.StripeCustomerId))
        {
            throw new InvalidOperationException("User not found or not subscribed.");
        }

        var customerId = user.Subscription!.StripeCustomerId;
        var options = new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = customerId,
            ReturnUrl = $"{_frontendBaseUrl}/dashboard"
        };
        
        var service = new Stripe.BillingPortal.SessionService();
        var session = await service.CreateAsync(options);
        
        return session.Url;
    }

    public async Task HandleWebhook(string payload, string stripeSignature)
    {
        var webHookSecret = _configuration["Stripe:WebhookSecret"]!;
        try
        { 
           var  stripeEvent = EventUtility.ConstructEvent(payload, stripeSignature, webHookSecret);
           Console.WriteLine($"Stripe event type: {stripeEvent.Type}");
            switch (stripeEvent.Type)
            {
                case EventTypes.CustomerSubscriptionCreated:
                {
                    Console.WriteLine("inside customer sub");
                    var (subscription, dbSubscription) =
                        await StripeSubscriptionHelper.GetSubscriptionData(_context, stripeEvent);
                    
                    if (subscription is null || dbSubscription is null) break;

                    await StripeSubscriptionHelper.CreateNewSubscription(subscription, dbSubscription, _context);
                    break;
                }
                case EventTypes.CustomerSubscriptionUpdated:
                {
                    var (subscription, dbSubscription) =
                        await StripeSubscriptionHelper.GetSubscriptionData(_context, stripeEvent);

                    if (subscription is null || dbSubscription is null) break;
                    
                    await StripeSubscriptionHelper.UpdateExistingSubscription(subscription, dbSubscription, _context);
                    
                    break;
                }
                case EventTypes.CustomerSubscriptionDeleted:
                {
                    var (subscription, dbSubscription) =
                        await StripeSubscriptionHelper.GetSubscriptionData(_context, stripeEvent);

                    if (subscription is null || dbSubscription is null) break;
                    
                    await StripeSubscriptionHelper.DowngradeSubscription(subscription, dbSubscription, _context);
                    
                    break;
                }
            }
        }
        catch (StripeException e)
        {
            throw new InvalidOperationException($"Webhook error: {e.Message}", e);
        }
    }
}