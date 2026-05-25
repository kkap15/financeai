using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceAI.Api.Modules.Users;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    
    public UserController(UserService userService)
    {
        _userService = userService;
    }
    
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        var email = User.Claims
            .FirstOrDefault(c => c.Type == "https://microservices-api/email")?
            .Value ?? string.Empty;

        if (userId == null)
        {
            return Unauthorized();
        }
        
        var user = await _userService.GetOrCreateUserAsync(userId, email);
        
        return Ok(new
        {
            user.Id,
            user.Auth0Id,
            user.Email,
            user.CreatedAt
        });
    }
}