namespace NexaPMS.LeadGeneration.Domain.Entities;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? GoogleApiKey { get; set; }
    public string? GeminiApiKey { get; set; }
    public string? BusinessProfile { get; set; }
}
