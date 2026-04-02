namespace NexaPMS.LeadGeneration.Domain.Entities;

public class HotelLead
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public double Rating { get; set; }
    public string Status { get; set; } = string.Empty;
}
