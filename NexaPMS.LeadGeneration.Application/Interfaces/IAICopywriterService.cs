using System.Threading.Tasks;

namespace NexaPMS.LeadGeneration.Application.Interfaces;

public interface IAICopywriterService
{
    Task<string> GenerateMessageAsync(
        string apiKey, 
        string leadName, 
        string leadRating, 
        string leadReviews,
        string businessType,
        string leadAddress,
        string leadCity,
        string templateContent, 
        string businessProfile);
}
