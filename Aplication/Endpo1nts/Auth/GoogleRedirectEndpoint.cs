using Application.Features.Auth.GoogleLogin;

namespace API.Endpoints.Auth;

public static class GoogleRedirectEndpoint
{
    public static void MapGoogleRedirectEndpoint(this WebApplication app)
    {
        app.MapGet("/auth/google", (GoogleRedirectHandler handler) =>
        {
            return handler.Handle();
        });
    }
}