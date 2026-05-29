using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Modules.Subscriptions.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FinanceAI.Api.Attributes;

public class RequireProAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var dbContext = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
        var user = await ControllerHelper.GetCurrentUserAsync(context.HttpContext.User, dbContext,
            includeSubscription: true);


        if (user?.Subscription.Tier != SubscriptionTier.Pro)
        {
            context.Result = new ObjectResult(new
            {
                error = "This feature needs a Pro subscription.",
                code = "SUBSCRIPTION_REQUIRED"
            })
            {
                StatusCode = 402
            };
            return;
        }
        
        await next();
    }    
}