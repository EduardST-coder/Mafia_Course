using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class LeaveRoomEndpoint
{
    public static void MapLeaveRoomEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/leave",
            async (
                LeaveRoomRequest request,
                LeaveRoomHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}