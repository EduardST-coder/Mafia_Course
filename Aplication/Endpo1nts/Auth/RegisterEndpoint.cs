using Application.DTOs.Auth;
using Application.Features.Auth.Register;

namespace API.Endpoints.Auth;

public static class RegisterEndpoint
{
    public static void MapRegisterEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/auth/register",
            async (
                RegisterRequest request,
                RegisterHandler handler) =>
            {
                var response =
                    await handler.Handle(request);

                return Results.Ok(response);
            });
    }
}