using FinanceAI.Api.Data;
using FinanceAI.Api.Enums;
using FinanceAI.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Users;

public class UserService
{
    private readonly AppDbContext _context;
    
    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User> GetOrCreateUserAsync(string auth0Id, string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);

        if (user != null)
        {
            return user;
        }

        user = new User
        {
            Id = Guid.NewGuid(),
            Auth0Id = auth0Id,
            Email = email,
            CreatedAt = DateTime.UtcNow
        };

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            StripeCustomerId = string.Empty,
            Tier = SubscriptionTier.Free,
            Status = SubscriptionStatus.Active
        };
        
        await _context.Users.AddAsync(user);
        await _context.Subscriptions.AddAsync(subscription);
        await _context.SaveChangesAsync();
        
        return user;
    }
}