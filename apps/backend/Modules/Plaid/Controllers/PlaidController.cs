using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Modules.Plaid.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Plaid.Controllers;

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
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();
        
        var linkToken = await _plaidService.CreateLinkTokenAsync(user.Id);
        return Ok(new {linkToken});
    }

    [HttpPost("exchange-token")]
    public async Task<IActionResult> ExchangeToken([FromBody] ExchangeTokenRequest request)
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();

        try
        {
            var connection = await _plaidService.ExchangeTokenAsync(
                user.Id,
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
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();

        var connections = await _context.PlaidConnections
            .Where(r => r.UserId == user.Id)
            .Select(x => new
            {
                x.Id,
                x.InstitutionName,
                x.LastSynced
            })
            .ToListAsync();
        
        return Ok(connections);
    }
}

public record ExchangeTokenRequest(string PublicToken, string InstitutionName);