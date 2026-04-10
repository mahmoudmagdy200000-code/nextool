using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System;
using NexaPMS.LeadGeneration.Application.Interfaces;

namespace NexaPMS.LeadGeneration.Infrastructure.Services;

public class GeminiService : IAICopywriterService
{
    private readonly HttpClient _httpClient;

    public GeminiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> GenerateMessageAsync(
        string apiKey, 
        string leadName, 
        string leadRating, 
        string leadReviews,
        string businessType,
        string leadAddress,
        string leadCity,
        string templateContent, 
        string businessProfile)
    {
        var cleanApiKey = apiKey?.Trim();
        var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key={cleanApiKey}";

        var prompt = $@"You are an expert B2B Sales Copywriter specializing in WhatsApp outreach for SaaS products. 
Your goal is to write a highly personalized, conversational, and persuasive WhatsApp message to a potential client.

Use the following data to craft the message:
- Lead Name/Business: {leadName}
- Business Type: {businessType}
- City/Location: {leadCity}
- Detailed Address: {leadAddress}
- Total Reviews: {leadReviews} (Rating: {leadRating})
- My SaaS Profile: {businessProfile}
- Base Template (Drafting guide): {templateContent}

CRITICAL RULES:
1. Tone: Professional yet conversational, friendly, and natural. Do NOT use overly corporate or rigid language. Write in clear, modern Arabic (Egyptian business dialect is preferred if applicable).
2. Icebreaker: Start by naturally complimenting them using their City, Address, or Total Reviews. Make them feel you actually researched them.
3. The Pitch: Seamlessly connect their potential pain points (manual data entry, wasted time) to how your SaaS (Nexa PMS) solves them. NEVER say ""automating manually"" - ensure logical consistency.
4. Call to Action (CTA): End with a low-friction, soft CTA (e.g., ""Do you have 5 minutes this week for a quick chat?"" in Arabic).
5. Length: Keep it under 4-5 short paragraphs. People scan WhatsApp messages.
6. Emojis: Use 1-2 relevant emojis naturally, do not overdo it.
7. Return ONLY the final message content, ready to be sent, with no preamble or explanation.";

        // Build payload as an anonymous object matching the required JSON structure exactly
        var payloadObject = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[] { new { text = prompt } }
                }
            }
        };

        // Serialize and send as explicit StringContent to guarantee Content-Type: application/json
        var jsonPayload = JsonSerializer.Serialize(payloadObject);
        using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        // POST request
        var response = await _httpClient.PostAsync(endpoint, content);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API Error. Status: {(int)response.StatusCode} {response.StatusCode}. Details: {errorBody}");
        }

        var jsonStr = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(jsonStr);
        
        try 
        {
            var generatedText = jsonDoc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();
                
            return generatedText?.Trim() ?? string.Empty;
        } 
        catch 
        {
            throw new Exception($"Unexpected Gemini API response format. Raw response: {jsonStr}");
        }
    }
}
