namespace Application.Interfaces;

public interface IGameNotifier
{
    Task GameUpdated(
        Guid roomId);
}