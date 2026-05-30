using System.Globalization;

namespace FinanceAI.Api.Helpers;

public static class CategoryHelper
{
    public static string NormalizeCategory(string category)
    {
        return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(category.Replace("_", " ").ToLower());
    }
}