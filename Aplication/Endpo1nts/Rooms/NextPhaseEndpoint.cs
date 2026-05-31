using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class NextPhaseEndpoint
{
    public static void MapNextPhaseEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/next-phase",
            async (
                NextPhaseRequest request,
                NextPhaseHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}