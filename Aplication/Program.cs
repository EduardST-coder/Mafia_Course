using System.Text;

using API.Endpoints.Auth;
using API.Endpoints.Rooms;
using API.Endpoints.Users;
using API.Extensions;
using API.Habs;
using API.SignalR;

using Application.Features.Auth.GoogleLogin;
using Application.Features.Auth.Login;
using Application.Features.Auth.Register;
using Application.Features.Rooms;
using Application.Features.Users;
using Application.Interfaces;

using Infrastructure.Auth;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using Persistence.Context;
using Persistence.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddRazorPages();

builder.Services.AddDatabase(
    builder.Configuration);

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();

builder.Services.AddScoped<
    IGameNotifier,
    GameNotifier>();

builder.Services.AddSingleton<
    IConnectionManager,
    ConnectionManager>();

// DbContext abstraction
builder.Services.AddScoped<IAppDbContext>(
    provider => provider
        .GetRequiredService<AppDbContext>());

// Repositories
builder.Services.AddScoped<
    IUserRepository,
    UserRepository>();

// Auth
builder.Services.AddScoped<
    IPasswordHasher,
    PasswordHasher>();

builder.Services.AddScoped<
    IJwtProvider,
    JwtProvider>();

// Handlers
builder.Services.AddScoped<RegisterHandler>();

builder.Services.AddScoped<LoginHandler>();

builder.Services.AddScoped<GoogleLoginHandler>();

builder.Services.AddScoped<GoogleRedirectHandler>();

builder.Services.AddScoped<GoogleCallbackHandler>();

builder.Services.AddScoped<CreateRoomHandler>();

builder.Services.AddScoped<JoinRoomHandler>();

builder.Services.AddScoped<ChooseSeatHandler>();

builder.Services.AddScoped<LeaveRoomHandler>();

builder.Services.AddScoped<StartGameHandler>();

builder.Services.AddScoped<NextPhaseHandler>();

builder.Services.AddScoped<MafiaKillHandler>();

builder.Services.AddScoped<SheriffCheckHandler>();

builder.Services.AddScoped<DonCheckHandler>();

builder.Services.AddScoped<CheckGameResultHandler>();

builder.Services.AddScoped<CreateVoteHandler>();

builder.Services.AddScoped<CreateRevoteHandler>();

builder.Services.AddScoped<FinishVotingHandler>();

builder.Services.AddScoped<FinishRevoteHandler>();

builder.Services.AddScoped<GetGameStateHandler>();

builder.Services.AddScoped<GetRoomsHandler>();

builder.Services.AddScoped<GetUsersHandler>();

builder.Services.AddScoped<GetRoleHandler>();

builder.Services.AddScoped<GetRoomPlayersHandler>();

// JWT
var jwtKey =
    builder.Configuration["Jwt:Key"];

var key = Encoding.UTF8.GetBytes(
    jwtKey!);

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = false,

                ValidateAudience = false,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        key)
            };
    });

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "Frontend",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Middleware
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");

    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors(
    "Frontend");

app.UseAuthentication();

app.UseAuthorization();

// Swagger
app.UseSwagger();

app.UseSwaggerUI();

// Endpoints
app.MapStaticAssets();

app.MapRazorPages()
   .WithStaticAssets();

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

app.MapGetUsersEndpoint();

app.MapGetRoleEndpoint();

app.MapGetRoomPlayersEndpoint();

app.MapHub<GameHub>(
    "/hubs/game");

app.Run();