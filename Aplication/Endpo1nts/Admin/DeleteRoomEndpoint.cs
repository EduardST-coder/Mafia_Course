using Application.Features.Admin;
using Application.Interfaces;

namespace API.Endpoints.Admin;

public static class DeleteRoomEndpoint
{
    public static void MapDeleteRoomEndpoint(this WebApplication app)
    {
        app.MapDelete("/admin/rooms/{roomId}", async (
            string roomId,
            DeleteRoomHandler handler,
            ICurrentUserService currentUser) =>
        {
            if (!IsAdmin(currentUser))
                return Results.Forbid();

            var success = await handler.Handle(roomId);

            if (!success)
                return Results.NotFound(new { message = "Кімнату не знайдено" });

            return Results.Ok(new { message = "Кімнату видалено" });
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