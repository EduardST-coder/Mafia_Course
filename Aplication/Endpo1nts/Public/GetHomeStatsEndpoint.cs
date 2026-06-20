using Application.Features.Public;

namespace API.Endpoints.Public;

public static class GetHomeStatsEndpoint
{
    public static void MapGetHomeStatsEndpoint(this WebApplication app)
    {
        app.MapGet("/public/stats", async (
            GetHomeStatsHandler handler) =>
        {
            var stats = await handler.Handle();
            return Results.Ok(stats);
        });
    }
}