using FinanceAI.Api.Data;
using FinanceAI.Api.Models;
using FinanceAI.Api.Modules.Subscriptions.Enums;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Users.Service;

public class UserService
{
    private readonly AppDbContext _context;
    
    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User> GetOrCreateUserAsync(string auth0Id, string email, string name)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);

        if (user is not null)
        {
            var existingSub = await _context.Subscriptions.FirstOrDefaultAsync(s => s.UserId == user.Id);

            if (existingSub is null)
            {
                var subscription = new Subscription
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    StripeCustomerId = string.Empty,
                    Tier = SubscriptionTier.Free,
                    Status = SubscriptionStatus.Active
                };
                await _context.Subscriptions.AddAsync(subscription);
            }
            
            user.Email = email;
            user.Name = name;
            await _context.SaveChangesAsync();
            
            return user;       
        }

        user = new User
        {
            Id = Guid.NewGuid(),
            Auth0Id = auth0Id,
            Email = email,
            CreatedAt = DateTime.UtcNow,
            Name = name
        };
        
        var newSubscription = new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            StripeCustomerId = string.Empty,
            Tier = SubscriptionTier.Free,
            Status = SubscriptionStatus.Active
        };
        
        await _context.Users.AddAsync(user);
        await _context.Subscriptions.AddAsync(newSubscription);
        await _context.SaveChangesAsync();
        
        return user;
    }
}