using System.Security.Claims;
using FinanceAI.Api.Data;
using FinanceAI.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Helpers;

public static class ControllerHelper
{
    public static async Task<User?> GetCurrentUserAsync(ClaimsPrincipal claimsPrincipal, AppDbContext context,
        bool includeSubscription = false)
    {
        var auth0Id = claimsPrincipal.Claims.FirstOrDefault(c => c.Type.Equals(("sub")))?.Value;

        if (auth0Id is null) return null;

        var query = context.Users.AsQueryable();

        if (includeSubscription)
        {
            query = query.Include(u => u.Subscription);
        }
        
        return await query.FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);
    }
}