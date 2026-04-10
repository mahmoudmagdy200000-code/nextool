namespace NexaPMS.LeadGeneration.Domain.Entities;

public class HotelLead
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PlaceId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public double Rating { get; set; }
    public int TotalReviews { get; set; }
    public string BusinessType { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Status { get; set; } = "New";
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
