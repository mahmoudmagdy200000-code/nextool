using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaPMS.LeadGeneration.Domain.Entities;
using NexaPMS.LeadGeneration.Infrastructure.Data;
using System.Security.Claims;

namespace NexaPMS.LeadGeneration.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TemplatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public TemplatesController(AppDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    /// <summary>
    /// Gets all message templates for the authenticated user.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetTemplates()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var templates = await _context.MessageTemplates
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Name)
            .ToListAsync();

        return Ok(templates);
    }

    /// <summary>
    /// Creates a new message template for the authenticated user.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateTemplate(TemplateDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Name and content are required.");

        var template = new MessageTemplate
        {
            Name = dto.Name,
            Content = dto.Content,
            UserId = userId
        };

        _context.MessageTemplates.Add(template);
        await _context.SaveChangesAsync();

        return Ok(template);
    }

    /// <summary>
    /// Updates an existing message template owned by the authenticated user.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTemplate(string id, TemplateDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var template = await _context.MessageTemplates.FindAsync(id);
        if (template == null) return NotFound();
        if (template.UserId != userId) return Forbid();

        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Name and content are required.");

        template.Name = dto.Name;
        template.Content = dto.Content;
        await _context.SaveChangesAsync();

        return Ok(template);
    }

    /// <summary>
    /// Deletes a message template owned by the authenticated user.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTemplate(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var template = await _context.MessageTemplates.FindAsync(id);
        if (template == null) return NotFound();
        if (template.UserId != userId) return Forbid();

        _context.MessageTemplates.Remove(template);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Template deleted successfully" });
    }
}

public class TemplateDto
{
    public string Name { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
