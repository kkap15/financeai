using FinanceAI.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<PlaidConnection> PlaidConnections => Set<PlaidConnection>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Budget> Budgets => Set<Budget>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("vector");
        
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Auth0Id)
            .IsUnique();

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.User)
            .WithOne(u => u.Subscription)
            .HasForeignKey<Subscription>(s => s.UserId);
        
        modelBuilder.Entity<Transaction>()
            .Property(t => t.Embedding)
            .HasColumnType("vector(1536)");

        modelBuilder.Entity<Transaction>()
            .HasIndex(t => t.Embedding)
            .HasMethod("hnsw")
            .HasOperators("vector_cosine_ops");
    }
}