using System.Collections.Generic;
using System.Threading.Tasks;
using NexaPMS.LeadGeneration.Domain.Entities;

namespace NexaPMS.LeadGeneration.Application.Interfaces;

public interface ILeadRepository
{
    Task<IEnumerable<HotelLead>> GetLeadsByUserIdAsync(string userId);
    Task<HotelLead?> GetLeadByPlaceIdAsync(string placeId, string userId);
    Task AddLeadsAsync(IEnumerable<HotelLead> leads);
    Task<bool> UpdateLeadStatusAsync(string id, string userId, string status);
}
