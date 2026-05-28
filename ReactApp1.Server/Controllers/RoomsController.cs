using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReactApp1.Server.DTOs;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms([FromQuery] string? gameSlug)
    {
        var rooms = await _roomService.GetActiveRoomsAsync(gameSlug);

        var dtos = rooms.Select(r => new RoomDto(
            r.Id.ToString(),
            r.GameSlug,
            r.Name,
            r.RoomCode,
            r.Status,
            r.Capacity,
            r.CurrentPlayers,
            r.CreatorUsername ?? "Unknown",
            r.CreatedAt.ToString("o")));

        return Ok(dtos);
    }

    [HttpGet("{roomCode}")]
    public async Task<ActionResult<RoomDto>> GetRoom(string roomCode)
    {
        var room = await _roomService.GetRoomByCodeAsync(roomCode);

        if (room is null)
        {
            return NotFound(new { message = "Room not found." });
        }

        return Ok(new RoomDto(
            room.Id.ToString(),
            room.GameSlug,
            room.Name,
            room.RoomCode,
            room.Status,
            room.Capacity,
            room.CurrentPlayers,
            room.CreatorUsername ?? "Unknown",
            room.CreatedAt.ToString("o")));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<RoomDto>> CreateRoom([FromBody] CreateRoomRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.GameSlug) || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("GameSlug and Name are required.");
        }

        Guid? userId = null;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedId))
        {
            userId = parsedId;
        }

        var room = await _roomService.CreateRoomAsync(
            request.GameSlug.Trim(),
            request.Name.Trim(),
            request.RoomCode?.Trim(),
            userId);

        var dto = new RoomDto(
            room.Id.ToString(),
            room.GameSlug,
            room.Name,
            room.RoomCode,
            room.Status,
            room.Capacity,
            room.CurrentPlayers,
            room.CreatorUsername ?? "Host",
            room.CreatedAt.ToString("o"));

        return CreatedAtAction(nameof(GetRoom), new { roomCode = room.RoomCode }, dto);
    }

    [Authorize]
    [HttpDelete("{roomCode}")]
    public async Task<IActionResult> DeleteRoom(string roomCode)
    {
        var room = await _roomService.GetRoomByCodeAsync(roomCode);

        if (room is null)
        {
            return NotFound(new { message = "Room not found." });
        }

        await _roomService.UpdateStatusAsync(room.Id, "closed");
        return NoContent();
    }
}
