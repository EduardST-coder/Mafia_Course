using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class CreateVoteEndpoint
{
    public static void MapCreateVoteEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/vote",
            async (
                CreateVoteRequest request,
                CreateVoteHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}