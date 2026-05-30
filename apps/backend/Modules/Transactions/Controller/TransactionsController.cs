using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Transactions.Controller;

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
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
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
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();

        var transactions = await _context.Transactions
            .Where(t => t.UserId == user.Id)
            .ToListAsync();

        if (!transactions.Any()) return Ok(null);
        
        var summary = transactions
            .Where(t => t.Amount > 0)
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

    [HttpGet("categories")]
    public async Task<IActionResult> GetTransactionCategoriesAsync()
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();
        
        var categories = await _context.Transactions
            .Where(t => t.UserId == user.Id)
            .Select(t => t.Category)
            .Distinct()
            .ToListAsync();
        
        return Ok(categories);
    }
}