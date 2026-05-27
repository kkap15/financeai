using System.Text.Json;
using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Modules.Chat.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Chat.Controller;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
[Route("api/[controller]")]
public class ChatController(AgentService agentService, AppDbContext context) : ControllerBase
{
    [HttpPost("agent")]
    public async Task AgentStream([FromBody] ChatRequest requestBody)
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, context);
        if (user is null) Response.StatusCode = 401;
        
        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";

        await foreach (var response in agentService.ChatAsync(user!.Id, requestBody.Message,
                           requestBody.History))
        {
            var json = JsonSerializer.Serialize(new { text = response });
            await Response.WriteAsync($"data: {json}\n\n");
            await Response.Body.FlushAsync();
        }
        
        await Response.WriteAsync("data: [DONE]\n\n");
        await Response.Body.FlushAsync();
    }

    public record ChatRequest(string Message, List<string> History);
}