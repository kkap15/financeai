using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Modules.Users.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceAI.Api.Modules.Users.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    private readonly AppDbContext _context;
    
    public UserController(UserService userService, AppDbContext context)
    {
        _userService = userService;
        _context = context;
    }
    
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        var email = User.Claims
            .FirstOrDefault(c => c.Type == "http://microservices-api:email")?
            .Value ?? string.Empty;
        var name = User.Claims.FirstOrDefault(c => c.Type == "http://microservices-api:name")?.Value;

        if (userId == null)
        {
            return Unauthorized();
        }
        
        var user = await _userService.GetOrCreateUserAsync(userId, email, name);
        
        return Ok(new
        {
            user.Id,
            user.Auth0Id,
            user.Email,
            user.Name,
            user.CreatedAt
        });
    }

    [HttpGet("subscription")]
    public async Task<IActionResult> GetSubscriptionAsync()
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context, true);
        if (user is null) return Unauthorized();

        return Ok(new
        {
            tier = user.Subscription?.Tier.ToString() ?? "Free",
            status = user.Subscription?.Status.ToString() ?? "Active",
            currentPeriodEnd = user.Subscription?.CurrentPeriodEnd
        });
    }
}