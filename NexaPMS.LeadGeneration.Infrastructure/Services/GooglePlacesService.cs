using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NexaPMS.LeadGeneration.Application.Interfaces;
using NexaPMS.LeadGeneration.Domain.Entities;

namespace NexaPMS.LeadGeneration.Infrastructure.Services;

/// <summary>
/// Implements hotel lead search using the Google Places API (New) — Text Search v1.
/// Endpoint: POST https://places.googleapis.com/v1/places:searchText
/// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
/// </summary>
public class GooglePlacesService : IGooglePlacesService
{
    private const string PlacesTextSearchUrl = "https://places.googleapis.com/v1/places:searchText";

    /// <summary>
    /// The FieldMask controls which fields are returned (and billed).
    /// We request only the fields we need for lead generation.
    /// </summary>
    private const string FieldMask = "places.id,places.displayName,places.internationalPhoneNumber,places.nationalPhoneNumber,places.rating,places.formattedAddress,places.userRatingCount,places.primaryTypeDisplayName,places.types";

    private readonly HttpClient _httpClient;
    private readonly ILogger<GooglePlacesService> _logger;

    public GooglePlacesService(
        HttpClient httpClient,
        ILogger<GooglePlacesService> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<IEnumerable<HotelLead>> SearchHotelsAsync(string location, string businessType, string apiKey)
    {
        var leads = new List<HotelLead>();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogError("Google Places API Key is not provided.");
            return leads;
        }

        var isAny = string.IsNullOrWhiteSpace(businessType) || businessType.Equals("any", StringComparison.OrdinalIgnoreCase);
        var textQuery = isAny ? location : $"{businessType.Replace("_", " ")} in {location}";

        try
        {
            var requestBody = new Dictionary<string, object>
            {
                { "textQuery", textQuery },
                { "maxResultCount", 20 }
            };

            if (!isAny)
            {
                requestBody.Add("includedType", businessType);
            }

            var jsonContent = JsonSerializer.Serialize(requestBody);
            using var request = new HttpRequestMessage(HttpMethod.Post, PlacesTextSearchUrl)
            {
                Content = new StringContent(jsonContent, Encoding.UTF8, "application/json")
            };

            // New API uses headers for auth and field selection (not query params)
            request.Headers.Add("X-Goog-Api-Key", apiKey);
            request.Headers.Add("X-Goog-FieldMask", FieldMask);

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError(
                    "Google Places API returned HTTP {StatusCode}: {Body}",
                    (int)response.StatusCode,
                    content);
                return leads;
            }

            var jsonDocument = JsonDocument.Parse(content);

            // The new API returns a "places" array (may be absent if zero results)
            if (!jsonDocument.RootElement.TryGetProperty("places", out var placesArray))
            {
                _logger.LogInformation("Google Places API returned zero results for query: '{Query}'", textQuery);
                return leads;
            }

            _logger.LogInformation(
                "Google Places API returned {Count} results for query: '{Query}'",
                placesArray.GetArrayLength(),
                textQuery);

            foreach (var place in placesArray.EnumerateArray())
            {
                var id = place.TryGetProperty("id", out var idProp)
                    ? idProp.GetString()
                    : Guid.NewGuid().ToString();

                var name = place.TryGetProperty("displayName", out var displayNameProp)
                           && displayNameProp.TryGetProperty("text", out var textProp)
                    ? textProp.GetString()
                    : "Unknown";

                var rating = place.TryGetProperty("rating", out var ratingProp)
                    ? ratingProp.GetDouble()
                    : 0.0;

                var totalReviews = place.TryGetProperty("userRatingCount", out var countProp)
                    ? countProp.GetInt32()
                    : 0;

                // Better business type mapping with fallbacks and formatting
                string? displayBusinessType = null;
                if (place.TryGetProperty("primaryTypeDisplayName", out var pTypeDispProp) && 
                    pTypeDispProp.TryGetProperty("text", out var bbtextProp))
                {
                    displayBusinessType = bbtextProp.GetString();
                }
                else if (place.TryGetProperty("types", out var typesProp) && typesProp.GetArrayLength() > 0)
                {
                    displayBusinessType = typesProp[0].GetString();
                }

                if (string.IsNullOrEmpty(displayBusinessType) || displayBusinessType.Equals("place", StringComparison.OrdinalIgnoreCase))
                {
                    displayBusinessType = "Business";
                }
                
                // Format: replace _ with space and Title Case
                displayBusinessType = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(displayBusinessType.Replace("_", " ").ToLower());

                // Prefer international phone number, fallback to national
                var phoneNumber = place.TryGetProperty("internationalPhoneNumber", out var intlPhoneProp)
                    ? intlPhoneProp.GetString()
                    : place.TryGetProperty("nationalPhoneNumber", out var natPhoneProp)
                        ? natPhoneProp.GetString()
                        : "Not Available";

                var address = place.TryGetProperty("formattedAddress", out var addressProp)
                    ? addressProp.GetString()
                    : "Not Available";

                leads.Add(new HotelLead
                {
                    PlaceId = id ?? string.Empty,
                    Name = name ?? string.Empty,
                    PhoneNumber = phoneNumber ?? string.Empty,
                    Rating = rating,
                    TotalReviews = totalReviews,
                    BusinessType = displayBusinessType ?? string.Empty,
                    Address = address ?? string.Empty,
                    Status = "New"
                });
            }

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while fetching data from Google Places API.");
        }

        return leads;
    }
}
