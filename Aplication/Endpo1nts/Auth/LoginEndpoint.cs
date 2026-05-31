using Application.DTOs.Auth;
using Application.Features.Auth.Login;

namespace API.Endpoints.Auth;

public static class LoginEndpoint
{
    public static void MapLoginEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/auth/login",
            async (
                LoginRequest request,
                LoginHandler handler) =>
            {
                var response =
                    await handler.Handle(request);

                return Results.Ok(response);
            });
    }
}