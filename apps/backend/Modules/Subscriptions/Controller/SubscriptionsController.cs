using FinanceAI.Api.Data;
using FinanceAI.Api.Modules.Subscriptions.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Subscriptions.Controller;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly SubscriptionService _subscriptionService;
    
    public SubscriptionsController(AppDbContext context, SubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
        _context = context;
    }
    
    [HttpPost("checkout")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> CheckoutAsync()
    {
        var auth0Id = User.Claims.FirstOrDefault(x => x.Type == "sub")?.Value;
        if (auth0Id is null)
        {
            return Unauthorized();
        }
        
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Auth0Id == auth0Id);
        if (user is null)
        {
            return Unauthorized();
        }

        var url = await _subscriptionService.CreateCheckoutSessionAsync(user.Id, user.Email);
        
        return Ok(new {url});
    }

    [HttpPost("portal")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> PortalAsync()
    {
        var auth0Id = User.Claims.FirstOrDefault(x => x.Type == "sub")?.Value;
        if (auth0Id is null)
        {
            return Unauthorized();
        }
        
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Auth0Id == auth0Id);
        if (user is null)
        {
            return Unauthorized();
        }

        var url = await _subscriptionService.CreateCustomerPortalAsync(user.Id);
        
        return Ok(new {url});       
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> WebhookAsync()
    {
        Console.WriteLine("Webhook received");
        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync();
        var stripeSignature = Request.Headers["Stripe-Signature"].ToString();
        
        await _subscriptionService.HandleWebhook(payload, stripeSignature);
        
        return Ok();
    }
}