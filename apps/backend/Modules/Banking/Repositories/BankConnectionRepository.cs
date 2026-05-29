using FinanceAI.Api.Data;
using FinanceAI.Api.Modules.Banking.Models;
using FinanceAI.Api.Modules.Banking.Services;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Modules.Banking.Repositories;

public class BankConnectionRepository : IBankConnectionRepository
{
    private readonly AppDbContext _context;
    
    public BankConnectionRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<BankConnection?> GetUserByIdAsync(Guid userId, BankProvider provider)
    {
        return await _context.BankConnections
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Provider == provider);
    }

    public async Task<BankConnection?> GetByProviderUserIdAsync(string providerId, BankProvider provider)
    {
        return await _context.BankConnections
            .FirstOrDefaultAsync(c => c.BasiqUserId == providerId && c.Provider == provider);
    }

    public async Task<List<BankConnection>> GetAllUserByIdAsync(Guid userId)
    {
        return await _context.BankConnections
            .Where(c => c.UserId == userId)
            .ToListAsync();
    }

    public async Task<BankConnection?> GetByIdAsync(Guid connectionId, Guid userId)
    {
        return await _context.BankConnections
            .FirstOrDefaultAsync(c => c.Id == connectionId && c.UserId == userId);
    }

    public async Task<BankConnection> AddBankConnectionAsync(BankConnection connection)
    {
        await _context.BankConnections.AddAsync(connection);
        await _context.SaveChangesAsync();
        return connection;
    }

    public async Task UpdateBankConnectionAsync(BankConnection connection)
    {
        _context.BankConnections.Update(connection);
        await _context.SaveChangesAsync();
    }
}