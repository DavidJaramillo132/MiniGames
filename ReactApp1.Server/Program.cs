using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using ReactApp1.Server.Data;
using ReactApp1.Server.Services;

// ── Bootstrap ────────────────────────────────────────────────────────────────

Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

var builder = WebApplication.CreateBuilder(args);

// ── CORS ─────────────────────────────────────────────────────────────────────

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientPolicy", policy =>
    {
        policy.WithOrigins("https://localhost:5173", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Framework services ───────────────────────────────────────────────────────

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddOpenApi();

// ── JWT Authentication ───────────────────────────────────────────────────────

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Missing Jwt:Key in configuration.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
    };

    // Allow SignalR to receive the JWT via query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

             if (!string.IsNullOrEmpty(accessToken) &&
                 (context.HttpContext.Request.Path.StartsWithSegments("/gameHub") ||
                  context.HttpContext.Request.Path.StartsWithSegments("/presenceHub")))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ── Database ─────────────────────────────────────────────────────────────────

builder.Services.AddSingleton<DbConnectionFactory>();
builder.Services.AddTransient<DatabaseSeeder>();

// ── Application services ─────────────────────────────────────────────────────

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IGameCatalogService, GameCatalogService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IGameActionService, GameActionService>();
builder.Services.AddScoped<ITriviaQuestionService, TriviaQuestionService>();
builder.Services.AddScoped<ILeaderboardService, LeaderboardService>();
builder.Services.AddSingleton<PresenceTracker>();

// ── Build ────────────────────────────────────────────────────────────────────

var app = builder.Build();

var forceHttps = builder.Configuration.GetValue<bool>("ForceHttps");
var trustForwardedHeaders = builder.Configuration.GetValue<bool>("TrustForwardedHeaders");

// ── Seed database ────────────────────────────────────────────────────────────

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();

    try
    {
        await seeder.SeedAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex,
            "Database seeding failed. Make sure PostgreSQL is running and the schema has been applied. " +
            "The server will continue without seeding.");
    }
}

// ── Middleware pipeline ──────────────────────────────────────────────────────

var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};

if (trustForwardedHeaders)
{
    // The Compose proxy network is the only non-loopback source allowed to set these headers.
    forwardedHeadersOptions.KnownIPNetworks.Clear();
    forwardedHeadersOptions.KnownIPNetworks.Add(System.Net.IPNetwork.Parse("172.30.0.0/24"));
}

app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseDefaultFiles();
app.MapStaticAssets();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("ClientPolicy");

if (app.Environment.IsDevelopment() || forceHttps)
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallback(async context =>
{
    var path = context.Request.Path.Value ?? "/";
    var isSpaRoute = path is "/" or "/login" or "/register" or "/app" or "/home" || IsKnownGameRoute(path);

    if ((!HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method)) || !isSpaRoute)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    if (path != "/")
    {
        context.Response.Headers["X-Robots-Tag"] = "noindex, nofollow";
    }

    var indexFile = app.Environment.WebRootFileProvider.GetFileInfo("index.html");

    if (!indexFile.Exists || indexFile.PhysicalPath is null)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        return;
    }

    await Results.File(indexFile.PhysicalPath, "text/html; charset=utf-8").ExecuteAsync(context);
});

// SignalR hub
app.MapHub<ReactApp1.Server.Hubs.GameHub>("/gameHub").RequireAuthorization();
app.MapHub<ReactApp1.Server.Hubs.PresenceHub>("/presenceHub").RequireAuthorization();

app.Run();

static bool IsKnownGameRoute(string path) => path is "/game/tic-tac-toe" or "/game/memory" or "/game/trivia" ||
    IsRoomRoute(path, "tic-tac-toe") ||
    IsRoomRoute(path, "memory") ||
    IsRoomRoute(path, "trivia");

static bool IsRoomRoute(string path, string gameSlug)
{
    var prefix = $"/game/{gameSlug}/room/";
    return path.StartsWith(prefix, StringComparison.Ordinal) &&
        path[prefix.Length..].Length > 0 &&
        !path[prefix.Length..].Contains('/');
}
