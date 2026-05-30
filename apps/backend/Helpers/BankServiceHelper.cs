using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;
using FinanceAI.Api.Data;
using FinanceAI.Api.Models;
using FinanceAI.Api.Modules.Banking.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceAI.Api.Helpers;

public static class BankServiceHelper
{
    public static async Task<string> GetServerToken(HttpClient httpClient, string apiKey)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/token");
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", apiKey);
        request.Content = new FormUrlEncodedContent([new KeyValuePair<string, string>("scope", "SERVER_ACCESS")]);
        
        var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        
        return doc.RootElement.GetProperty("access_token").ToString();
    }
    
    public static async Task<JsonDocument?> PollJobsAsync(HttpClient httpClient, string apiKey, string jobId)
    {
        var token = await GetServerToken(httpClient, apiKey);

        for (var i = 0; i < 20; ++i)
        {   
            var request = new HttpRequestMessage(HttpMethod.Get, $"/jobs/{jobId}");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("steps", out var steps))
            {
                var stepList = steps.EnumerateArray().ToList();

                var allDone = stepList.All(s =>
                {
                    var status = s.GetProperty("status").GetString();
                    return status == "success";
                });

                if (allDone) return doc;
            }
            await Task.Delay(2000);
        }
        
        return null;
    }

    public static async Task<List<Transaction>> GetNewTransactionsFromBasiqData(JsonElement data, AppDbContext context, 
        BankConnection connection)
    {
        var newTransactions = new List<Transaction>();
        
        foreach (var t in data.EnumerateArray())
        {
            var externalId = t.TryGetProperty("id", out var idProp) ? idProp.GetString() : null;
            if (string.IsNullOrEmpty(externalId)) continue;
            
            var exists = await context.Transactions
                .AnyAsync(x => x.ExternalId == externalId);
            if (exists) continue;

            var amountStr = t.TryGetProperty("amount", out var amountProp) ? amountProp.GetString() ?? "0" : "0";
            var amount = decimal.Parse(amountStr, CultureInfo.InvariantCulture);

            var postDateStr = t.TryGetProperty("postDate", out var dateProp) ?  dateProp.GetString() : null;
            if (string.IsNullOrEmpty(postDateStr)) continue;
            var postDate = DateTime.Parse(postDateStr, CultureInfo.InvariantCulture);

            var description = t.TryGetProperty("description", out var descProp)
                ? descProp.GetString() ?? "Unknown"
                : "Unknown";

            var category = CategoryHelper.NormalizeCategory(t.TryGetProperty("class", out var catProp)
                ? catProp.GetString() ?? "Uncategorized"
                : "Uncategorized");
            
            newTransactions.Add(new Transaction
            {
                Amount = Math.Abs(amount),
                BankConnectionId = connection.Id,
                Category = category,
                Date = DateOnly.FromDateTime(postDate),
                Description = description,
                Id = Guid.NewGuid(),
                ExternalId = externalId,
                UserId = connection.UserId
            });
        }
        
        return newTransactions;
    }

    public static string GenerateAustralianMobile()
    {
        var random = new Random();

        var suffix = random.Next(10_000_000, 99_999_999);

        return $"+614{suffix}";
    }
}