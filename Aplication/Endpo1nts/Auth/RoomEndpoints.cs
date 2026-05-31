using System.Security.Claims;

using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class RoomEndpoints
{
    public static void MapCreateRoomEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms",
            async (
                HttpContext httpContext,
                CreateRoomRequest request,
                CreateRoomHandler handler) =>
            {
                var userIdClaim =
                    httpContext.User.FindFirst(
                        ClaimTypes.NameIdentifier);

                if (userIdClaim is null)
                {
                    return Results.Unauthorized();
                }

                var ownerId =
                    Guid.Parse(
                        userIdClaim.Value);

                var result =
                    await handler.Handle(
                        ownerId,
                        request);

                return Results.Ok(
                    result);
            })
            .RequireAuthorization();
    }
}