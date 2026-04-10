using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaPMS.LeadGeneration.Application.Interfaces;
using NexaPMS.LeadGeneration.Infrastructure.Data;
using System.Security.Claims;
using NexaPMS.LeadGeneration.Domain.Entities;

namespace NexaPMS.LeadGeneration.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly IGooglePlacesService _googlePlacesService;
    private readonly IAICopywriterService _aiCopywriterService;
    private readonly AppDbContext _context;
    private readonly ILeadRepository _leadRepository;

    public LeadsController(IGooglePlacesService googlePlacesService, IAICopywriterService aiCopywriterService, AppDbContext context, ILeadRepository leadRepository)
    {
        _googlePlacesService = googlePlacesService ?? throw new ArgumentNullException(nameof(googlePlacesService));
        _aiCopywriterService = aiCopywriterService ?? throw new ArgumentNullException(nameof(aiCopywriterService));
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _leadRepository = leadRepository ?? throw new ArgumentNullException(nameof(leadRepository));
    }

    /// <summary>
    /// Searches for hotel leads by a specific city or region query.
    /// </summary>
    /// <param name="query">The search query, e.g., 'hotels in Ras Sedr'</param>
    /// <returns>A list of potential hotel leads</returns>
    [HttpGet("search")]
    public async Task<IActionResult> SearchHotels([FromQuery] string location, [FromQuery] string businessType)
    {
        if (string.IsNullOrWhiteSpace(location))
        {
            return BadRequest("Location parameter is required.");
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (string.IsNullOrWhiteSpace(user.GoogleApiKey))
        {
            return BadRequest("Google API Key is not set. Please go to Settings to provide your personal key.");
        }

        var results = await _googlePlacesService.SearchHotelsAsync(location, businessType, user.GoogleApiKey);
        
        var existingLeads = (await _leadRepository.GetLeadsByUserIdAsync(userId)).ToList();
        var newLeadsToSave = new List<HotelLead>();

        var mergedResults = new List<HotelLead>();

        foreach (var lead in results)
        {
            var alreadySaved = existingLeads.FirstOrDefault(l => l.PlaceId == lead.PlaceId);
            if (alreadySaved == null)
            {
                lead.Id = Guid.NewGuid().ToString(); // Prevent PK collisions for different users with same Google Place
                lead.UserId = userId;
                lead.Status = "New";
                lead.CreatedAt = DateTime.UtcNow;
                
                newLeadsToSave.Add(lead);
                mergedResults.Add(lead);
            }
            else
            {
                // Result already exists locally
                mergedResults.Add(alreadySaved);
            }
        }
        
        if (newLeadsToSave.Any())
        {
            await _leadRepository.AddLeadsAsync(newLeadsToSave);
        }

        return Ok(mergedResults);
    }

    [HttpGet]
    public async Task<IActionResult> GetSavedLeads()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var leads = await _leadRepository.GetLeadsByUserIdAsync(userId);
        return Ok(leads);
    }

    [HttpPost]
    public async Task<IActionResult> SaveLead(HotelLead lead)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        lead.UserId = userId;
        
        // Use the ID from Google or generate a new one if missing
        if (string.IsNullOrEmpty(lead.Id)) lead.Id = Guid.NewGuid().ToString();

        var existing = await _context.HotelLeads.FindAsync(lead.Id);
        if (existing != null)
        {
            return BadRequest("Lead already saved.");
        }

        _context.HotelLeads.Add(lead);
        await _context.SaveChangesAsync();

        return Ok(lead);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateLeadStatus(string id, [FromQuery] string status)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var updated = await _leadRepository.UpdateLeadStatusAsync(id, userId, status);
        if (!updated) return NotFound();

        return Ok(new { message = "Status updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLead(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var lead = await _context.HotelLeads.FindAsync(id);
        if (lead == null) return NotFound();
        if (lead.UserId != userId) return Forbid();

        _context.HotelLeads.Remove(lead);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Lead deleted successfully" });
    }

    [HttpPost("generate-ai-message")]
    public async Task<IActionResult> GenerateAiMessage([FromBody] AiMessageRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (string.IsNullOrWhiteSpace(user.GeminiApiKey))
        {
            return BadRequest("Please set your Gemini API Key in Settings first.");
        }

        try
        {
            var businessProfile = string.IsNullOrWhiteSpace(user.BusinessProfile) 
                ? "We are a hotel software provider." 
                : user.BusinessProfile;

            var generatedMessage = await _aiCopywriterService.GenerateMessageAsync(
                user.GeminiApiKey,
                request.LeadName,
                request.LeadRating,
                request.TotalReviews,
                request.BusinessType,
                request.Address,
                request.LeadCity,
                request.TemplateContent,
                businessProfile
            );

            return Ok(new { message = generatedMessage });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"AI Generation failed: {ex.Message}" });
        }
    }
}
