using FinanceAI.Api.Data;
using FinanceAI.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Transactions;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public TransactionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTransactionsAsync([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? category = null)
    {
        var auth0Id = User.Claims.FirstOrDefault(x => x.Type == "sub")?.Value;
        if (auth0Id is null) return Unauthorized();
        
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Auth0Id == auth0Id);
        if (user is null) return Unauthorized();

        var query = _context.Transactions
            .Where(x => x.UserId == user.Id)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(t => t.Category == category);
        }
        
        var total = await query.CountAsync();

        var transactions = await query
            .OrderByDescending(t => t.Date)
            .Skip(page - 1)
            .Take(pageSize)
            .Select(t => new
            {
                t.Id,
                t.Description,
                t.Amount,
                t.Category,
                t.Date
            })
            .ToListAsync();

        return Ok(new
        {
            transactions,
            total,
            page,
            pageSize,
            totalPages = (int) Math.Ceiling(total / (double) pageSize)
        });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var auth0Id = User.Claims.FirstOrDefault(s => s.Type == "sub")?.Value;
        if (auth0Id is null) return Unauthorized();
        
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Auth0Id == auth0Id);
        if (user is null) return Unauthorized();
        
        var thisMonth = DateOnly.FromDateTime(DateTime.UtcNow)
            .AddDays(-(DateTime.UtcNow.Day - 1));

        var transactions = await _context.Transactions
            .Where(t => t.UserId == user.Id && t.Date >= thisMonth)
            .ToListAsync();
        
        var summary = transactions
            .GroupBy(x => x.Category)
            .Select(t => new
            {
                category = t.Key,
                total = t.Sum(x => x.Amount),
                count = t.Count()
            })
            .OrderByDescending(g => g.total)
            .ToList();

        return Ok(new
        {
            totalSpent = transactions.Where(t => t.Amount > 0).Sum(t => t.Amount),
            totalIncome = transactions.Where(t => t.Amount < 0).Sum(t => t.Amount),
            byCategory = summary
        });
    }
}