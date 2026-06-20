using Application.Features.Admin;
using Application.Interfaces;

namespace API.Endpoints.Admin;

public static class ChangeUserRoleEndpoint
{
    public static void MapChangeUserRoleEndpoint(this WebApplication app)
    {
        app.MapPut("/admin/users/{userId}/role", async (
            string userId,
            ChangeRoleRequest request,
            ChangeUserRoleHandler handler,
            ICurrentUserService currentUser) =>
        {
            if (!IsAdmin(currentUser))
                return Results.Forbid();

            var user = await handler.Handle(userId, request.Role);

            if (user == null)
                return Results.NotFound(new { message = "Користувача не знайдено" });

            return Results.Ok(new
            {
                id = user.Id,
                role = user.Role.ToString()
            });
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

public class ChangeRoleRequest
{
    public string Role { get; set; } = string.Empty;
}