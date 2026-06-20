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
            try
            {
                var result = await handler.Handle(code, state);

                var redirectUrl = $"http://localhost:5173/login?" +
                    $"token={Uri.EscapeDataString(result.Token)}" +
                    $"&id={result.User.Id}" +
                    $"&nickname={Uri.EscapeDataString(result.User.Nickname)}" +
                    $"&email={Uri.EscapeDataString(result.User.Email)}" +
                    $"&rating={result.User.Rating}" +
                    $"&role={result.User.Role}";

                return Results.Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                return Results.Redirect($"http://localhost:5173/login?error={Uri.EscapeDataString(ex.Message)}");
            }
        });
    }
}