using Application.DTOs.Rooms;
using Application.Features.Rooms;

namespace API.Endpoints.Rooms;

public static class GetRoleEndpoint
{
    public static void MapGetRoleEndpoint(
        this WebApplication app)
    {
        app.MapPost(
            "/rooms/role",
            async (
                GetRoleRequest request,
                GetRoleHandler handler) =>
            {
                var result =
                    await handler.Handle(request);

                return result;
            })
            .RequireAuthorization();
    }
}