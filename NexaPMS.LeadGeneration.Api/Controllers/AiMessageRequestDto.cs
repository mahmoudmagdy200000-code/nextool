namespace NexaPMS.LeadGeneration.Api.Controllers;

public class AiMessageRequestDto
{
    public string LeadName { get; set; } = string.Empty;
    public string LeadRating { get; set; } = string.Empty;
    public string LeadCity { get; set; } = string.Empty;
    public string TotalReviews { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string TemplateContent { get; set; } = string.Empty;
}
