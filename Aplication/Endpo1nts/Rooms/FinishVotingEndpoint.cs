using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class FinishVotingEndpoint
{
    public static void MapFinishVotingEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/finish-voting",
            async (
                FinishVotingRequest request,
                FinishVotingHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}