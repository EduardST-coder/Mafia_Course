using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class FinishRevoteEndpoint
{
    public static void MapFinishRevoteEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/finish-revote",
            async (
                FinishRevoteRequest request,
                FinishRevoteHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}