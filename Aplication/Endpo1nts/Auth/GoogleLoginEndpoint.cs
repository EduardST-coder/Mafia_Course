using Application.DTOs.Auth;
using Application.Features.Auth.GoogleLogin;

namespace API.Endpoints.Auth;

public static class GoogleLoginEndpoint
{
    public static void MapGoogleLoginEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/auth/google-login",  
            async (
                GoogleLoginRequest request,
                GoogleLoginHandler handler) =>
            {
                return await handler.Handle(
                    request);
            });
    }
}