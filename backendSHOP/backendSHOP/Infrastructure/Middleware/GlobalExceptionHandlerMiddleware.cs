using System.Net;
using System.Text.Json;

namespace backendSHOP.Infrastructure.Middleware;

/// <summary>
/// Middleware global pour la gestion des exceptions.
/// Masque les détails techniques des erreurs en production.
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "Une erreur non gérée s'est produite: {Message}", exception.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var response = new ErrorResponse
        {
            Message = _environment.IsDevelopment()
                ? exception.Message
                : "Une erreur interne s'est produite. Veuillez réessayer plus tard.",
            StatusCode = context.Response.StatusCode
        };

        // En développement, inclure la stack trace
        if (_environment.IsDevelopment())
        {
            response.Details = exception.StackTrace;
        }

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}

public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public string? Details { get; set; }
}

/// <summary>
/// Extension pour faciliter l'ajout du middleware
/// </summary>
public static class GlobalExceptionHandlerMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionHandlerMiddleware>();
    }
}
