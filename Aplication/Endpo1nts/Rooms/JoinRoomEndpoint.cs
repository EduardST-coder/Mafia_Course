using System.Security.Claims;

using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class JoinRoomEndpoint
{
    public static void MapJoinRoomEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/join",
            async (
                HttpContext httpContext,
                JoinRoomRequest request,
                JoinRoomHandler handler) =>
            {
                var userIdClaim =
                    httpContext.User.FindFirst(
                        ClaimTypes.NameIdentifier);

                if (userIdClaim is null)
                {
                    return Results.Unauthorized();
                }

                var userId =
                    Guid.Parse(
                        userIdClaim.Value);

                return await handler.Handle(
                    userId,
                    request);
            })
            .RequireAuthorization();
    }
}