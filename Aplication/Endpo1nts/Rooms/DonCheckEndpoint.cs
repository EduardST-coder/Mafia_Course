using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class DonCheckEndpoint
{
    public static void MapDonCheckEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/don-check",
            async (
                DonCheckRequest request,
                DonCheckHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}