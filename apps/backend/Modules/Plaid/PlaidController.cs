using FinanceAI.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Plaid;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class PlaidController : ControllerBase
{
    private readonly PlaidService _plaidService;
    private readonly AppDbContext _context;
    private readonly ILogger<PlaidController> _logger;

    public PlaidController(PlaidService plaidService, AppDbContext context, ILogger<PlaidController> logger)
    {
        _plaidService = plaidService;
        _context = context;
        _logger = logger;
    }

    [HttpPost("link-token")]
    public async Task<IActionResult> CreateLinkToken()
    {
        var userId = await GetUserIdAsync();
        if (userId is null)
        {
            return Unauthorized();
        }
        
        var linkToken = await _plaidService.CreateLinkTokenAsync(userId.Value);
        return Ok(new {linkToken});
    }

    [HttpPost("exchange-token")]
    public async Task<IActionResult> ExchangeToken([FromBody] ExchangeTokenRequest request)
    {
        var userId = await GetUserIdAsync();
        if (userId is null) return Unauthorized();

        try
        {
            var connection = await _plaidService.ExchangeTokenAsync(
                userId.Value,
                request.PublicToken,
                request.InstitutionName);

            return Ok(new
            {
                connection.Id,
                connection.LastSynced,
                connection.InstitutionName,
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error exchanging token");
            return StatusCode(500, new {error = e.Message, detail = e.ToString()});
        }
    }

    [HttpGet("connections")]
    public async Task<IActionResult> GetConnections()
    {
        var userId = await GetUserIdAsync();
        if (userId is null) return Unauthorized();

        var connections = await _context.PlaidConnections
            .Where(r => r.UserId == userId.Value)
            .Select(x => new
            {
                x.Id,
                x.InstitutionName,
                x.LastSynced
            })
            .ToListAsync();
        
        return Ok(connections);
    }

    private async Task<Guid?> GetUserIdAsync()
    {
        var auth0Id = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        if (auth0Id is null) return null;
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Auth0Id == auth0Id);
        
        return user?.Id;
    }
}

public record ExchangeTokenRequest(string PublicToken, string InstitutionName);