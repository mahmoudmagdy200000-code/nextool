using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaPMS.LeadGeneration.Infrastructure.Data;
using System.Security.Claims;
using NexaPMS.LeadGeneration.Domain.Entities;

namespace NexaPMS.LeadGeneration.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPut("apikey")]
    public async Task<IActionResult> UpdateApiKey(ApiKeyDto apiKeyDto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.GoogleApiKey = apiKeyDto.GoogleApiKey;
        user.GeminiApiKey = apiKeyDto.GeminiApiKey;
        user.BusinessProfile = apiKeyDto.BusinessProfile;
        await _context.SaveChangesAsync();

        return Ok(new { message = "API Keys updated successfully" });
    }

    [HttpGet("apikey")]
    public async Task<IActionResult> GetApiKey()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new 
        { 
            googleApiKey = user.GoogleApiKey,
            geminiApiKey = user.GeminiApiKey,
            businessProfile = user.BusinessProfile
        });
    }
}

public class ApiKeyDto
{
    public string? GoogleApiKey { get; set; }
    public string? GeminiApiKey { get; set; }
    public string? BusinessProfile { get; set; }
}
