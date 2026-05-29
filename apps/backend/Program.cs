using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Azure;
using Azure.AI.OpenAI;
using Azure.Monitor.OpenTelemetry.AspNetCore;
using FinanceAI.Api.Data;
using FinanceAI.Api.Modules.AI.Service;
using FinanceAI.Api.Modules.Banking.Repositories;
using FinanceAI.Api.Modules.Banking.Services;
using FinanceAI.Api.Modules.Budget.Services;
using FinanceAI.Api.Modules.Chat.Services;
using FinanceAI.Api.Modules.Chat.Tools;
using FinanceAI.Api.Modules.Users.Service;
using Going.Plaid;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.SemanticKernel;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Events;
using Stripe;
using Environment = Going.Plaid.Environment;
using SubscriptionService = FinanceAI.Api.Modules.Subscriptions.Service.SubscriptionService;


Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFramework.Core", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3} {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateBootstrapLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, services, config) =>
{
    config.MinimumLevel.Information()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.EntityFramework.Core", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3} {Message:lj} {Properties:j}{NewLine}{Exception}")
        .WriteTo.ApplicationInsights(ctx.Configuration["ApplicationInsights:ConnectionString"], TelemetryConverter.Traces);
});

builder.Services.AddOpenTelemetry()
    .UseAzureMonitor(options =>
    {
        options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    })
    .WithTracing(tracing => tracing
        .SetResourceBuilder(ResourceBuilder.CreateDefault()
            .AddService("FinanceAI.Api"))
        .AddAspNetCoreInstrumentation(options =>
        {
            options.RecordException = true;
        })
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation());

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
var rawConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")!;
string connectionString;
if (rawConnectionString.StartsWith("postgres://") || rawConnectionString.StartsWith("postgresql://"))
{
    var uri = new Uri(rawConnectionString);
    var userInfo = uri.UserInfo.Split(':');
    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={Uri.UnescapeDataString(userInfo[0])};Password={Uri.UnescapeDataString(userInfo[1])};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    // Normalize libpq keywords Azure provides that Npgsql doesn't accept
    connectionString = Regex.Replace(rawConnectionString, @"\buser\b\s*=", "Username=", RegexOptions.IgnoreCase);
    connectionString = Regex.Replace(connectionString, @"\bdbname\b\s*=", "Database=", RegexOptions.IgnoreCase);
}

builder.Services.AddHttpClient("Basiq", client =>
{
    client.BaseAddress = new Uri("https://au-api.basiq.io");
    client.DefaultRequestHeaders.Add("basiq-version", "3.0");
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.UseVector())
);

builder.Services.AddScoped<UserService>();
builder.Services.AddSingleton<PlaidClient>(options =>
{
    var config = builder.Configuration.GetSection("Plaid");
    return new PlaidClient(Environment.Sandbox, config["ClientId"], config["Secret"]);
});
builder.Services.AddSingleton<AzureOpenAIClient>(options =>
{
    var endpoint = builder.Configuration["AzureOpenAI:Endpoint"]!;
    var key = builder.Configuration["AzureOpenAI:Key"]!;
    return new AzureOpenAIClient(new Uri(endpoint), new AzureKeyCredential(key));
});

builder.Services.AddScoped<AIService>();
builder.Services.AddScoped<PlaidBankService>();
builder.Services.AddScoped<BasiqBankService>();
builder.Services.AddScoped<BankServiceFactory>();
builder.Services.AddScoped<FinanceTools>();
builder.Services.AddScoped<AgentService>();
builder.Services.AddScoped<SubscriptionService>();
builder.Services.AddScoped<BudgetService>();
builder.Services.AddScoped<IBankConnectionRepository, BankConnectionRepository>();

var domain = builder.Configuration["Auth0:Domain"];
var audience = builder.Configuration["Auth0:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{domain}/";
        options.Audience = audience;
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            NameClaimType = "sub"
        };
    });

builder.Services.AddScoped<Kernel>(options =>
{
    var endpoint = builder.Configuration["AzureOpenAI:Endpoint"]!;
    var key = builder.Configuration["AzureOpenAI:Key"]!;
    var deployment = builder.Configuration["AzureOpenAI:DeploymentName"]!;

    var kernel = Kernel.CreateBuilder()
        .AddAzureOpenAIChatCompletion(deployment, endpoint, key)
        .Build();

    return kernel;
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJs", policy =>
        policy.WithOrigins("http://localhost:3000", 
                "https://financeai.moviegasm.xyz",
                "https://consent.basiq.io"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!,
        name: "postgresql",
        tags: ["db", "ready"]);

var app = builder.Build();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        var result = JsonSerializer.Serialize(new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(x => new
            {
                name = x.Key,
                status = x.Value.Status.ToString(),
                duration = x.Value.Duration.TotalMilliseconds
            })
        });
        
        await context.Response.WriteAsync(result);
    }
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("NextJs");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
