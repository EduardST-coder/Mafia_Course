using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class GetGameStateEndpoint
{
    public static void MapGetGameStateEndpoint(
        this WebApplication app)
    {
        app.MapGet(
            "/rooms/{roomId}/state",
            async (
                Guid roomId,
                GetGameStateHandler handler) =>
            {
                var result =
                    await handler.Handle(roomId);

                return result;
            })
            .RequireAuthorization();
    }
}