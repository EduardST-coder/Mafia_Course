using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Entities;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Application.Features.Auth.GoogleLogin;

public record GoogleLoginResult(
    User User,
    string Token
);

public class GoogleLoginHandler
{
    private readonly IAppDbContext _context;
    private readonly IJwtProvider _jwtProvider;
    private readonly string _googleClientId;

    public GoogleLoginHandler(
        IAppDbContext context,
        IJwtProvider jwtProvider,
        IConfiguration configuration)
    {
        _context = context;
        _jwtProvider = jwtProvider;
        _googleClientId = configuration["GoogleAuth:ClientId"]!;
    }

    public async Task<GoogleLoginResult> Handle(GoogleLoginRequest request)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(
            request.IdToken,
            new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = [_googleClientId]
            });

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == payload.Email);

        if (user is null)
        {
            user = new User(
                payload.Name,
                payload.Email,
                Guid.NewGuid().ToString());

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            user.SetOnline();
            await _context.SaveChangesAsync();
        }

        var token = _jwtProvider.Generate(user);

        return new GoogleLoginResult(user, token);
    }
}