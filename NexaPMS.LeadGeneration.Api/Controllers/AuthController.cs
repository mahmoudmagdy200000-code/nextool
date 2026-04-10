using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaPMS.LeadGeneration.Application.Interfaces;
using NexaPMS.LeadGeneration.Domain.Entities;
using NexaPMS.LeadGeneration.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NexaPMS.LeadGeneration.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto loginDto)
    {
        try
        {
            Console.WriteLine($"[Register] Received: Username='{loginDto.Username}', Password length={loginDto.Password?.Length}");

            if (string.IsNullOrWhiteSpace(loginDto.Username) || string.IsNullOrWhiteSpace(loginDto.Password))
                return BadRequest("Username and password are required.");

            if (await UserExists(loginDto.Username)) return BadRequest("Username is taken");

            Console.WriteLine("[Register] Hashing password...");
            var hash = global::BCrypt.Net.BCrypt.HashPassword(loginDto.Password, workFactor: 11);
            Console.WriteLine("[Register] Password hashed.");

            var user = new User
            {
                Username = loginDto.Username.ToLower(),
                PasswordHash = hash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            Console.WriteLine("[Register] User saved to DB.");

            return Ok(new UserDto
            {
                Username = user.Username,
                Token = _tokenService.CreateToken(user.Id, user.Username)
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Register] EXCEPTION: {ex}");
            return StatusCode(500, $"Registration error: {ex.Message}");
        }
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.Username) || string.IsNullOrWhiteSpace(loginDto.Password))
            return BadRequest("Username and password are required.");

        var user = await _context.Users.SingleOrDefaultAsync(x => x.Username == loginDto.Username.ToLower());

        if (user == null) return Unauthorized("Invalid username");

        if (!global::BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            return Unauthorized("Invalid password");

        return Ok(new UserDto
        {
            Username = user.Username,
            Token = _tokenService.CreateToken(user.Id, user.Username)
        });
    }

    private async Task<bool> UserExists(string username)
    {
        return await _context.Users.AnyAsync(x => x.Username == username.ToLower());
    }

}

public class RegisterDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UserDto
{
    public string Username { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}
