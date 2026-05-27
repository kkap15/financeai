using FinanceAI.Api.Data;
using FinanceAI.Api.Helpers;
using FinanceAI.Api.Modules.Budget.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceAI.Api.Modules.Budget.Controller;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class BudgetController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly BudgetService _budgetService;
    
    public BudgetController(AppDbContext context, BudgetService budgetService)
    {
        _context = context;
        _budgetService = budgetService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAllBudgetsAsync()
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();
        
        var result = await _budgetService.GetBudgetAsync(user.Id, _context);

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> PostBudgetAsync([FromBody]CreateBudgetRequest request)
    {
        var user = await ControllerHelper.GetCurrentUserAsync(User, _context);
        if (user is null) return Unauthorized();

        var result =
            await _budgetService.CreateOrUpdateBudgetAsync(user.Id, _context, request.Category, request.Limit);

        return Ok(result);
    }
    
    public record CreateBudgetRequest(string Category, decimal Limit);
}