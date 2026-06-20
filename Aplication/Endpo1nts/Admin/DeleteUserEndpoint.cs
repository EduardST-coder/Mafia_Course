using Application.Features.Admin;
using Application.Interfaces;

namespace API.Endpoints.Admin;

public static class DeleteUserEndpoint
{
    public static void MapDeleteUserEndpoint(this WebApplication app)
    {
        app.MapDelete("/admin/users/{userId}", async (
            string userId,
            DeleteUserHandler handler,
            ICurrentUserService currentUser) =>
        {
            if (!IsAdmin(currentUser))
                return Results.Forbid();

            // Не можна видалити самого себе
            if (currentUser.UserId == userId)
                return Results.BadRequest(new { message = "Не можна видалити самого себе" });

            var success = await handler.Handle(userId);

            if (!success)
                return Results.NotFound(new { message = "Користувача не знайдено" });

            return Results.Ok(new { message = "Користувача видалено" });
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