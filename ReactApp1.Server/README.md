# ReactApp1.Server — Database & Integration Guide

This README explains what is required to make the server and client work together so:
- `Available Rooms` shows only active rooms
- rooms are removed when empty
- the SignalR hub and REST endpoints are used correctly
- a Postgres schema is provided (`tablas.sql`)

## Summary of changes you need

- The project currently keeps rooms in-memory in `Hubs/GameHub.cs`.
- To support persistent, correct listings you must add a database and wire the hub to update it.
- `tablas.sql` (in this folder) contains a recommended PostgreSQL schema for users, games, rooms, room_players, matches, moves and player_stats.

## How the system should work (recommended architecture)

1. REST endpoint to list active rooms
   - GET `/api/rooms?gameId={slug}` → returns rooms where `status IN ('waiting','in_game')` and `current_players > 0`.
   - The client uses this on page load to populate `Available Rooms`.

2. SignalR for realtime updates
   - Hub path: `/gameHub` (already mapped in `Program.cs`).
   - Events emitted by server:
     - `RoomsChanged` (optional): broadcast when rooms list changes (create/delete/status)
     - `RoomCreated` { room }
     - `RoomDeleted` { roomId }
     - `EstadoJuegoActualizado` { estadoSala } — already present and used by the game page
     - `JugadoresEnSala` integer — already present

   - Client should subscribe to `RoomsChanged` / `RoomDeleted` and update the listing in realtime.

3. Hub should be authoritative
   - When a client calls `UnirseSala` or `Leave` (disconnect), the hub must:
     - Update `room_players` (insert / update left_at)
     - Update `rooms.current_players` inside the same transaction
     - If `current_players == 0` then either delete the room row or set `status='closed'` and emit `RoomDeleted`/`RoomsChanged`.

4. Transactions & concurrency
   - Use database transactions to update `room_players`, `rooms.current_players`, and create `matches` atomically.
   - Use row-level locks if necessary in high concurrency scenarios.

## Database schema (quick recap)

- `users` — players (optional if you rely on external auth)
- `games` — catalog of games (tic-tac-toe, etc.)
- `rooms` — lobbies with `status`, `current_players`, `room_code`
- `room_players` — join/leave per-connection rows
- `matches` and `moves` — persisted match history
- `player_stats` — leaderboard and ELO

The full DDL is in `tablas.sql` (Postgres). It includes triggers and indices.

## How to apply schema

1. Install PostgreSQL and create a database, e.g. `playhub`.
2. Run the SQL file using psql:

```bash
psql "postgresql://<user>:<pass>@localhost:5432/playhub" -f ReactApp1.Server/tablas.sql
```

3. Configure your connection string in the server (e.g., appsettings.json or environment variable):

```
ConnectionStrings:DefaultConnection = "Host=localhost;Port=5432;Database=playhub;Username=...;Password=..."
```

## Server changes required

1. Add database integration: install and configure EF Core (`Npgsql.EntityFrameworkCore.PostgreSQL`) or Dapper.
2. Add a `RoomsController` with REST endpoints: list active rooms, get room by code, create room (optional).
3. Modify `GameHub` to update DB:
   - On `UnirseSala`: insert or update `room_players`, update `rooms.current_players`, emit `RoomCreated`/`RoomsChanged` if new.
   - On disconnect: mark `room_players.left_at`, decrement `rooms.current_players`; if 0 then delete or close the room and emit `RoomDeleted`.
4. Consider a background cleanup worker to remove stale waiting rooms older than X minutes.

## Client changes required

1. Replace `mockRoomsByGameId` / `localStorage` listing with a call to GET `/api/rooms?gameId={slug}` on page load.
2. Subscribe to hub events (`RoomCreated`, `RoomDeleted`, `RoomsChanged`, `EstadoJuegoActualizado`) and keep UI in sync.
3. When creating a room, POST to `/api/rooms` (server creates row) and then navigate to the room page. The server will propagate the new room via SignalR.

## SignalR event contract (suggested)

- Client → Server:
  - `UnirseSala(roomCode)` — join a room (already present)
  - `LeaveRoom(roomCode)` — optional explicit leave
  - `HacerJugada(roomCode, position)` — play a move (already present)
  - `ReiniciarPartida(roomCode)` — restart (already present)

- Server → Client:
  - `RoomCreated` { room }
  - `RoomDeleted` { roomId }
  - `RoomsChanged` { rooms[] }
  - `EstadoJuegoActualizado` { estadoSala }
  - `JugadoresEnSala` { count }
  - `JugadaRealizada` { connectionId, position, symbol }

## Tips and next steps

- Start by adding a simple `rooms` REST endpoint backed by the `rooms` table and change the client to use it.
- Then adapt `GameHub` to use the DB for persistence and emit the `RoomCreated/RoomDeleted` events.
- Use a small migration/seed to add `games` entries (`tic-tac-toe`), then test creating/joining rooms.

If quieres, puedo generar:
- EF Core model classes and a `DbContext` scaffold for these tables,
- a sample `RoomsController` and minimal repository code to operate rooms,
- or a step-by-step migration script using `dotnet ef`.
