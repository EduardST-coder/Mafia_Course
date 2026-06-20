using Application.Features.Admin;
using Application.Interfaces;

namespace API.Endpoints.Admin;

public static class GetAdminUsersEndpoint
{
    public static void MapGetAdminUsersEndpoint(this WebApplication app)
    {
        app.MapGet("/admin/users", async (
            GetAdminUsersHandler handler,
            ICurrentUserService currentUser) =>
        {
            if (!IsAdmin(currentUser))
                return Results.Forbid();

            var users = await handler.Handle();
            return Results.Ok(users);
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