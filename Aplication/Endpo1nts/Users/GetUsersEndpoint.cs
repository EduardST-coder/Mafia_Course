using Application.Features.Users;

namespace API.Endpoints.Users;

public static class GetUsersEndpoint
{
    public static void MapGetUsersEndpoint(
        this WebApplication app)
    {
        app.MapGet(
            "/users",
            async (
                GetUsersHandler handler) =>
            {
                var result = await handler.Handle();

                return Results.Ok(result);
            });
    }
}