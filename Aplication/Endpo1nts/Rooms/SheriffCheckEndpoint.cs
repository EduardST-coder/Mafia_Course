using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class SheriffCheckEndpoint
{
    public static void MapSheriffCheckEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/sheriff-check",
            async (
                SheriffCheckRequest request,
                SheriffCheckHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}