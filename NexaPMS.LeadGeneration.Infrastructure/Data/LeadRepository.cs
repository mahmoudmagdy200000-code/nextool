using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NexaPMS.LeadGeneration.Application.Interfaces;
using NexaPMS.LeadGeneration.Domain.Entities;

namespace NexaPMS.LeadGeneration.Infrastructure.Data;

public class LeadRepository : ILeadRepository
{
    private readonly AppDbContext _context;

    public LeadRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HotelLead>> GetLeadsByUserIdAsync(string userId)
    {
        return await _context.HotelLeads
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.Rating)
            .ToListAsync();
    }

    public async Task<HotelLead?> GetLeadByPlaceIdAsync(string placeId, string userId)
    {
        return await _context.HotelLeads.FirstOrDefaultAsync(x => x.PlaceId == placeId && x.UserId == userId);
    }

    public async Task AddLeadsAsync(IEnumerable<HotelLead> leads)
    {
        await _context.HotelLeads.AddRangeAsync(leads);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> UpdateLeadStatusAsync(string id, string userId, string status)
    {
        var lead = await _context.HotelLeads.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (lead == null) return false;
        
        lead.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }
}
