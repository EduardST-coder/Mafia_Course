using Application.Interfaces;

namespace Mafia.Tests.Mocks;

public class GameNotifierMock
    : IGameNotifier
{
    public Task GameUpdated(
        Guid roomId)
    {
        return Task.CompletedTask;
    }
}