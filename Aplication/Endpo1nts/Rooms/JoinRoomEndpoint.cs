using Application.DTOs.Rooms;
using Application.Features.Rooms;
using System.Security.Claims;

namespace API.Endpoints.Rooms;

public static class JoinRoomEndpoint
{
    public static void MapJoinRoomEndpoint(this WebApplication app)
    {
        app.MapPost("/rooms/{roomId:guid}/join", async (
            Guid roomId,
            HttpContext httpContext,
            JoinRoomRequest request,
            JoinRoomHandler handler,
            CancellationToken ct) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim is null)
            {
                return Results.Unauthorized();
            }

            var userId = Guid.Parse(userIdClaim.Value);

            var result = await handler.Handle(userId, roomId, request.Password, ct);

            if (!result.Success)
            {
                return Results.BadRequest(new { message = result.Message });
            }

            return Results.Ok(new { message = result.Message });
        })
        .RequireAuthorization();
    }
}