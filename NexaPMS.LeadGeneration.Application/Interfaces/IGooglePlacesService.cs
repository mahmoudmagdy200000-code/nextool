using System.Collections.Generic;
using System.Threading.Tasks;
using NexaPMS.LeadGeneration.Domain.Entities;

namespace NexaPMS.LeadGeneration.Application.Interfaces;

public interface IGooglePlacesService
{
    Task<IEnumerable<HotelLead>> SearchHotelsAsync(string query);
}
