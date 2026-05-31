using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class CheckGameResultEndpoint
{
    public static void MapCheckGameResultEndpoint(
        this WebApplication app)
    {
        app.MapGet(
            "/rooms/{roomId}/result",
            async (
                Guid roomId,
                CheckGameResultHandler handler) =>
            {
                var result =
                    await handler.Handle(roomId);

                return result;
            })
            .RequireAuthorization();
    }
}