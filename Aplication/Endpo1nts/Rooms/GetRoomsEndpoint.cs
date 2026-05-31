using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class GetRoomsEndpoint
{
    public static void MapGetRoomsEndpoint(
        this WebApplication app)
    {
        app.MapGet(
            "/rooms",
            async (
                GetRoomsHandler handler) =>
            {
                var result = await handler.Handle();

                return Results.Ok(result);
            });
    }
}