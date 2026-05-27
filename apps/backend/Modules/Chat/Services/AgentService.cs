using FinanceAI.Api.Modules.Chat.Tools;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.AzureOpenAI;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace FinanceAI.Api.Modules.Chat.Services;

public class AgentService
{
    private readonly Kernel _kernel;
    private readonly FinanceTools _financeTools;

    public AgentService(Kernel kernel, FinanceTools financeTools)
    {
        _kernel = kernel;
        _financeTools = financeTools;
    }

    public async IAsyncEnumerable<string> ChatAsync(Guid userId, string message, List<string> history)
    {
        _financeTools.SetUserId(userId);

        var chatHistory = new ChatHistory();
        
        _kernel.Plugins.Clear();
        _kernel.Plugins.AddFromObject(_financeTools, "FinanceTools");

        chatHistory.AddSystemMessage(
            """
            You are a helpful personal finance assistant with access to the user's real transaction data.You can:
            - Summarise spending by category
            - Show recent transactions
            - Compare spending across months
            - Create and check budgets
            - Search transactions by natural language
            
            Always use the available tools to ground your answers in real data.
            Be concise, friendly, and specific with dollar amounts.
            """);

        for (int i = 0; i < history.Count; i++)
        {
            if (i % 2 == 0)
            {
               chatHistory.AddUserMessage(history[i]); 
            }
            else
            {
                chatHistory.AddAssistantMessage(history[i]);
            }
        }
        
        chatHistory.AddUserMessage(message);

        var settings = new AzureOpenAIPromptExecutionSettings
        {
            ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions
        };
        
        var chatService = _kernel.GetRequiredService<IChatCompletionService>();

        await foreach (var chunk in chatService.GetStreamingChatMessageContentsAsync(chatHistory, settings, _kernel))
        {
            if (!string.IsNullOrEmpty(chunk.Content))
            {
                yield return chunk.Content;
            }
        } 
    }
}