using Application.Features.Admin;
using Application.Interfaces;

namespace API.Endpoints.Admin;

public static class GetAdminStatsEndpoint
{
    public static void MapGetAdminStatsEndpoint(this WebApplication app)
    {
        app.MapGet("/admin/stats", async (
            GetAdminStatsHandler handler,
            ICurrentUserService currentUser) =>
        {
            if (!IsAdmin(currentUser))
                return Results.Forbid();

            var stats = await handler.Handle();
            return Results.Ok(stats);
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