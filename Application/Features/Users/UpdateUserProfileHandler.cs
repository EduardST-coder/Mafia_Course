using Application.Interfaces;
using Domain.Entities;
using FluentResults;
using MediatR;

namespace Application.Features.Users.UpdateProfile;

public record UpdateUserProfileCommand(
    string Nickname,
    string? AvatarUrl
) : IRequest<Result<User>>;

public class UpdateUserProfileHandler : IRequestHandler<UpdateUserProfileCommand, Result<User>>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public UpdateUserProfileHandler(
        IUserRepository userRepository,
        ICurrentUserService currentUserService)
    {
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Result<User>> Handle(
        UpdateUserProfileCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (string.IsNullOrEmpty(userId))
            return Result.Fail("User.Unauthorized: Користувач не авторизований");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user == null)
            return Result.Fail("User.NotFound: Користувача не знайдено");

        try
        {
            user.ChangeNickname(request.Nickname);
        }
        catch (ArgumentException ex)
        {
            return Result.Fail($"User.InvalidNickname: {ex.Message}");
        }

        if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
        {
            user.ChangeAvatar(request.AvatarUrl.Trim());
        }
        else
        {
            user.ChangeAvatar(null);
        }

        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return Result.Ok(user);
    }
}