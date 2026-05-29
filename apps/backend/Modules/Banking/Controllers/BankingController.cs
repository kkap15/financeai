using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Modules.Banking.Models;
using FinanceAI.Api.Modules.Banking.Repositories;
using FinanceAI.Api.Modules.Banking.Services;
using FinanceAI.Api.Modules.Plaid.Controllers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceAI.Api.Modules.Banking.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class BankingController : ControllerBase
{
    private readonly BankServiceFactory _bankServiceFactory;
    private readonly IBankConnectionRepository _bankConnectionRepository;
    private readonly AppDbContext _context;
    private readonly ILogger<BankingController> _logger;

    public BankingController(BankServiceFactory bankServiceFactory, AppDbContext context,
        ILogger<BankingController> logger, IBankConnectionRepository bankConnectionRepository)
    {
        _bankServiceFactory = bankServiceFactory;
        _bankConnectionRepository = bankConnectionRepository;
        _context = context;
        _logger = logger;
    }

    [HttpGet("link")]
    public async Task<IActionResult> GetLinkData([FromQuery] LinkRequest request)
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();

        var service = _bankServiceFactory.GetService(request.Provider);
        var result = await service.GetLinkDataAsync(user.Id, user.Email);
        
        return Ok(result);
    }

    [HttpPost("exchange")]
    public async Task<IActionResult> ExchangeToken([FromBody] ExchangeRequest request)
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();

        var service = _bankServiceFactory.GetService(request.Provider);
        var connection = await service.ExchangeTokenAsync(user.Id, request.Token, request.InstitutionName);

        return Ok(new
        {
            connection.Id,
            connection.InstitutionName,
            connection.LastSynced,
            connection.Provider
        });
    }

    [HttpGet("connection")]
    public async Task<IActionResult> GetConnection()
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();
        
        var connections = await _bankConnectionRepository.GetAllUserByIdAsync(user.Id);
        
        return Ok(connections.Select(c => new
        {
            c.Id,
            c.InstitutionName,
            c.LastSynced,
            c.Provider
        }));
    }
    
    [HttpPost("connections/{connectionId}/resync")]
    public async Task<IActionResult> ResyncConnection([FromBody] ExchangeRequest request, Guid connectionId)
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();
        
        try
        {
            var connection = await _bankConnectionRepository.GetByIdAsync(connectionId, user.Id);
            if (connection is null) return NotFound(new { error = "Connection not found" });

            var service = _bankServiceFactory.GetService(connection.Provider);
            await service.SyncTransactionsAsync(connection);
            return Ok();
        }
        catch (InvalidOperationException e)
        {
            return NotFound(new { error = e.Message });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error resyncing connection {ConnectionId}", connectionId);
            return StatusCode(500, new { error = e.Message });
        }
    }
}