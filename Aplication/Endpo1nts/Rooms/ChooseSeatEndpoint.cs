using System.Security.Claims;

using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class ChooseSeatEndpoint
{
    public static void MapChooseSeatEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/seat",
            async (
                HttpContext httpContext,
                ChooseSeatRequest request,
                ChooseSeatHandler handler) =>
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