using System.Text.Json;
using FinanceAI.Api.Attributes;
using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Modules.AI.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceAI.Api.Modules.AI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class AIController : ControllerBase
{
    private readonly AIService _aiService;
    private readonly AppDbContext _context;

    public AIController(AIService aiService, AppDbContext context)
    {
        _aiService = aiService;
        _context = context;   
    }

    [HttpGet("insights/stream")]
    [RequirePro]
    public async Task StreamInsights()
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) Response.StatusCode = 401;
        
        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";

        await foreach (var chunk in _aiService.GetSpendingInsightAsync(user!.Id))
        {
            var json = JsonSerializer.Serialize(new { text = chunk });
            await Response.WriteAsync($"data: {json}\n\n");
            await Response.Body.FlushAsync();
        }

        await Response.WriteAsync("data: [DONE]\n\n");
        await Response.Body.FlushAsync();
    }

    [RequirePro]
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest(new { error = "Query is required" });
        }

        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();

        var results = await _aiService.SemanticSearchAsync(user.Id, query);
        
        return Ok(results.Select(t => new
        {
            t.Id,
            t.Description,
            t.Amount,
            t.Category,
            t.Date
        }));
    }
}