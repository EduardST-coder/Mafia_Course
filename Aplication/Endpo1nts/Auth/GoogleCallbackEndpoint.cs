using Application.Features.Auth.GoogleLogin;

namespace API.Endpoints.Auth;

public static class GoogleCallbackEndpoint
{
    public static void MapGoogleCallbackEndpoint(this WebApplication app)
    {
        app.MapGet("/auth/google/callback", async (
            string code,
            string state,
            GoogleCallbackHandler handler) =>
        {
            return await handler.Handle(code, state);
        });
    }
}