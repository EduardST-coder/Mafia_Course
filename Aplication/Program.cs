using API.Auth;
using API.Endpoints.Admin;
using API.Endpoints.Auth;
using API.Endpoints.Public;
using API.Endpoints.Rooms;
using API.Endpoints.Users;
using API.Extensions;
using API.Habs;
using API.Services;
using API.SignalR;
using Application.Features.Admin;
using Application.Features.Auth.GoogleLogin;
using Application.Features.Auth.Login;
using Application.Features.Auth.Register;
using Application.Features.Public;
using Application.Features.Rooms;
using Application.Features.Users;
using Application.Features.Users.UpdateProfile;
using Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Persistence.Context;
using Persistence.Repositories;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddScoped < IGameNotifier, GameNotifier > ();
builder.Services.AddSingleton<IConnectionManager, ConnectionManager>();
builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService < AppDbContext > ());
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtProvider, JwtProvider>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped < ICurrentUserService, CurrentUserService > ();

builder.Services.AddMediatR(typeof(UpdateUserProfileCommand).Assembly);

builder.Services.AddScoped < RegisterHandler > ();
builder.Services.AddScoped < LoginHandler > ();
builder.Services.AddScoped < GoogleLoginHandler > ();
builder.Services.AddScoped < GoogleRedirectHandler > ();
builder.Services.AddScoped < GoogleCallbackHandler > ();

builder.Services.AddScoped < CreateRoomHandler > ();
builder.Services.AddScoped < JoinRoomHandler > ();
builder.Services.AddScoped < ChooseSeatHandler > ();
builder.Services.AddScoped < LeaveRoomHandler > ();
builder.Services.AddScoped < StartGameHandler > ();
builder.Services.AddScoped < NextPhaseHandler > ();
builder.Services.AddScoped<MafiaKillHandler>();
builder.Services.AddScoped<SheriffCheckHandler>();
builder.Services.AddScoped < DonCheckHandler > ();
builder.Services.AddScoped < CheckGameResultHandler > ();
builder.Services.AddScoped < CreateVoteHandler > ();
builder.Services.AddScoped < CreateRevoteHandler > ();
builder.Services.AddScoped < FinishVotingHandler > ();
builder.Services.AddScoped < FinishRevoteHandler > ();
builder.Services.AddScoped<GetGameStateHandler>();
builder.Services.AddScoped<GetRoomsHandler>();
builder.Services.AddScoped<GetRoomPlayersHandler>();

builder.Services.AddScoped<GetUsersHandler>();
builder.Services.AddScoped<GetRoleHandler>();

builder.Services.AddScoped<GetAdminUsersHandler>();
builder.Services.AddScoped < ChangeUserRoleHandler > ();
builder.Services.AddScoped < DeleteUserHandler > ();
builder.Services.AddScoped<GetAdminStatsHandler>();
builder.Services.AddScoped<GetAdminRoomsHandler>();
builder.Services.AddScoped < DeleteRoomHandler > ();

builder.Services.AddScoped<GetHomeStatsHandler>();

var jwtKey = builder.Configuration["Jwt:Key"];
var key = Encoding.UTF8.GetBytes(jwtKey!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            RoleClaimType = "role"  // <-- ДОДАНО: мапити "role" як роль
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "https://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.UseSwagger();
app.UseSwaggerUI();

app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();

app.MapRegisterEndpoint();
app.MapLoginEndpoint();
app.MapGoogleLoginEndpoint();
app.MapGoogleRedirectEndpoint();
app.MapGoogleCallbackEndpoint();

app.MapCreateRoomEndpoint();
app.MapJoinRoomEndpoint();
app.MapChooseSeatEndpoint();
app.MapLeaveRoomEndpoint();
app.MapStartGameEndpoint();
app.MapNextPhaseEndpoint();
app.MapMafiaKillEndpoint();
app.MapSheriffCheckEndpoint();
app.MapDonCheckEndpoint();
app.MapCheckGameResultEndpoint();
app.MapCreateVoteEndpoint();
app.MapCreateRevoteEndpoint();
app.MapFinishVotingEndpoint();
app.MapFinishRevoteEndpoint();
app.MapGetGameStateEndpoint();
app.MapGetRoomsEndpoint();
app.MapGetRoomPlayersEndpoint();

app.MapGetUsersEndpoint();
app.MapGetRoleEndpoint();

app.MapGetAdminUsersEndpoint();
app.MapChangeUserRoleEndpoint();
app.MapDeleteUserEndpoint();
app.MapGetAdminStatsEndpoint();
app.MapGetAdminRoomsEndpoint();
app.MapDeleteRoomEndpoint();

app.MapGetHomeStatsEndpoint();

app.MapPut("users/me", async (
    UpdateProfileRequest request,
    IMediator mediator,
    CancellationToken cancellationToken) =>
{
    var command = new UpdateUserProfileCommand(
        request.Nickname,
        request.AvatarUrl);

    var result = await mediator.Send(command, cancellationToken);

    if (result.IsFailed)
        return Results.BadRequest(new { errors = result.Errors.Select(e => e.Message) });

    var user = result.Value;

    return Results.Ok(new
    {
        id = user.Id,
        nickname = user.Nickname,
        email = user.Email,
        avatarUrl = user.AvatarUrl,
        rating = user.Rating,
        role = user.Role.ToString()
    });
})
.RequireAuthorization();

app.MapHub<GameHub>("/hubs/game");
app.MapHub<WebRTCHub>("/hubs/webrtc");

app.Run();

public class UpdateProfileRequest
{
    public string Nickname { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}