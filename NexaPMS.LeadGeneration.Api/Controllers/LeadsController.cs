using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NexaPMS.LeadGeneration.Application.Interfaces;

namespace NexaPMS.LeadGeneration.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly IGooglePlacesService _googlePlacesService;

    public LeadsController(IGooglePlacesService googlePlacesService)
    {
        _googlePlacesService = googlePlacesService ?? throw new ArgumentNullException(nameof(googlePlacesService));
    }

    /// <summary>
    /// Searches for hotel leads by a specific city or region query.
    /// </summary>
    /// <param name="query">The search query, e.g., 'hotels in Ras Sedr'</param>
    /// <returns>A list of potential hotel leads</returns>
    [HttpGet("search")]
    public async Task<IActionResult> SearchHotels([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return BadRequest("Query parameter is required.");
        }

        var results = await _googlePlacesService.SearchHotelsAsync(query);
        return Ok(results);
    }
}
