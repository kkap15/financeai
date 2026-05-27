using Azure;
using Azure.AI.OpenAI;
using FinanceAI.Api.Data;
using FinanceAI.Api.Modules.AI.Service;
using FinanceAI.Api.Modules.Budget.Services;
using FinanceAI.Api.Modules.Chat.Services;
using FinanceAI.Api.Modules.Chat.Tools;
using FinanceAI.Api.Modules.Plaid.Service;
using FinanceAI.Api.Modules.Users.Service;
using Going.Plaid;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.SemanticKernel;
using Stripe;
using Environment = Going.Plaid.Environment;
using SubscriptionService = FinanceAI.Api.Modules.Subscriptions.Service.SubscriptionService;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseVector()
    )
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
builder.Services.AddScoped<PlaidService>();
builder.Services.AddScoped<FinanceTools>();
builder.Services.AddScoped<AgentService>();
builder.Services.AddScoped<SubscriptionService>();
builder.Services.AddScoped<BudgetService>();

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
                "https://financeai.moviegasm.xyz"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

var app = builder.Build();

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
