namespace NexaPMS.LeadGeneration.Application.Interfaces;

public interface ITokenService
{
    string CreateToken(string userId, string username);
}
