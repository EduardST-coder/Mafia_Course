using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class CreateRevoteEndpoint
{
    public static void MapCreateRevoteEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/revote",
            async (
                CreateRevoteRequest request,
                CreateRevoteHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}