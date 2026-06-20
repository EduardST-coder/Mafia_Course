using Application.DTOs.Auth;
using Application.Features.Auth.GoogleLogin;

namespace API.Endpoints.Auth;

public static class GoogleLoginEndpoint
{
    public static void MapGoogleLoginEndpoint(this WebApplication app)
    {
        app.MapPost("/auth/google-login", async (
            GoogleLoginRequest request,
            GoogleLoginHandler handler) =>
        {
            var result = await handler.Handle(request);

            return Results.Ok(new
            {
                Token = result.Token,
                UserId = result.User.Id,
                Nickname = result.User.Nickname,
                Email = result.User.Email,
                AvatarUrl = result.User.AvatarUrl,
                Rating = result.User.Rating,
                Role = result.User.Role.ToString()
            });
        });
    }
}