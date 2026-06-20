using Application.Features.Users.UpdateProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Endpoints.Users;

[ApiController]
[Route("users")]
public class UpdateProfileEndpoint : ControllerBase
{
    private readonly IMediator _mediator;

    public UpdateProfileEndpoint(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var command = new UpdateUserProfileCommand(
            request.Nickname,
            request.AvatarUrl);

        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        var user = result.Value;

        return Ok(new
        {
            id = user.Id,
            nickname = user.Nickname,
            email = user.Email,
            avatarUrl = user.AvatarUrl,
            rating = user.Rating,
            role = user.Role.ToString()
        });
    }
}

public class UpdateProfileRequest
{
    public string Nickname { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}