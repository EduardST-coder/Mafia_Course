using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class StartGameEndpoint
{
    public static void MapStartGameEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/start",
            async (
                StartGameRequest request,
                StartGameHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}