using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NexaPMS.LeadGeneration.Application.Interfaces;

namespace NexaPMS.LeadGeneration.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly SymmetricSecurityKey _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expireMinutes;

    public TokenService(IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Key"] ?? throw new ArgumentNullException("JwtSettings:Key");
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        _issuer = jwtSettings["Issuer"] ?? "NexaPMSAuthAPI";
        _audience = jwtSettings["Audience"] ?? "NexaPMSAppClients";
        _expireMinutes = int.TryParse(jwtSettings["ExpireMinutes"], out var expire) ? expire : 1440;
    }

    public string CreateToken(string userId, string username)
    {
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.NameId, userId),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, username)
        };

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_expireMinutes),
            SigningCredentials = creds,
            Issuer = _issuer,
            Audience = _audience
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
