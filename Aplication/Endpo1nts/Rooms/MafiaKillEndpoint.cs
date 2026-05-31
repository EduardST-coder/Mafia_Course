using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class MafiaKillEndpoint
{
    public static void MapMafiaKillEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/mafia-kill",
            async (
                MafiaKillRequest request,
                MafiaKillHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}