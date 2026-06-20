using Application.Features.Admin;
using Application.Interfaces;

namespace API.Endpoints.Admin;

public static class GetAdminRoomsEndpoint
{
    public static void MapGetAdminRoomsEndpoint(this WebApplication app)
    {
        app.MapGet("/admin/rooms", async (
            GetAdminRoomsHandler handler,
            ICurrentUserService currentUser) =>
        {
            if (!IsAdmin(currentUser))
                return Results.Forbid();

            var rooms = await handler.Handle();
            return Results.Ok(rooms);
        });
    }

    private static bool IsAdmin(ICurrentUserService currentUser)
    {
        return string.Equals(
            currentUser.Role,
            "Admin",
            StringComparison.OrdinalIgnoreCase);
    }
}