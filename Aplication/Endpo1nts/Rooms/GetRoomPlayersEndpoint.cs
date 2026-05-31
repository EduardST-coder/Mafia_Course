using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class GetRoomPlayersEndpoint
{
    public static void MapGetRoomPlayersEndpoint(
        this WebApplication app)
    {
        app.MapGet(
            "/rooms/{roomId}/players",
            async (
                Guid roomId,
                GetRoomPlayersHandler handler) =>
            {
                var result =
                    await handler.Handle(roomId);

                return result;
            });
    }
}