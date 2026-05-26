using Microsoft.AspNetCore.SignalR;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Hubs
{
    public class GameHub : Hub
    {
        private readonly ILogger<GameHub> _logger;
        private readonly IRoomService _roomService;
        private readonly IMatchService _matchService;
        private readonly ILeaderboardService _leaderboardService;

        // In-memory cache for fast game state during active play.
        // The database is the source of truth for rooms, players, and match results.
        private static Dictionary<string, RoomState> salas = new();
        private static Dictionary<string, string> ConexionSala = new();
        private static Lock SalasLock = new();

        public GameHub(
            ILogger<GameHub> logger,
            IRoomService roomService,
            IMatchService matchService,
            ILeaderboardService leaderboardService)
        {
            _logger = logger;
            _roomService = roomService;
            _matchService = matchService;
            _leaderboardService = leaderboardService;
        }

        public async Task UnirseSala(string salaId)
        {
            await UnirseASala(salaId);
        }
        
        public async Task UnirseASala(string salaId)
        {
            if (string.IsNullOrWhiteSpace(salaId))
            {
                throw new HubException("La sala es obligatoria.");
            }

            salaId = salaId.Trim();
            var connectionId = Context.ConnectionId;
            bool iniciarJuego = false;
            string jugadorUnoId;
            int indiceJugador;
            string nombreJugador;

            nombreJugador =
                Context.User?.FindFirst("username")?.Value
                ?? Context.User?.Identity?.Name
                ?? "Jugador";

            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var sala))
                {
                    sala = new RoomState();
                    salas[salaId] = sala;
                }

                if (ConexionSala.TryGetValue(connectionId, out var salaActual) && salaActual != salaId)
                {
                    throw new HubException("Ya estás conectado a otra sala.");
                }

                if (Array.IndexOf(sala.Players, connectionId) == -1)
                {
                    if (sala.Players[0] is null)
                    {
                        sala.Players[0] = connectionId;
                        sala.PlayerNames[0] = nombreJugador;
                    }
                    else if (sala.Players[1] is null)
                    {
                        sala.Players[1] = connectionId;
                        sala.PlayerNames[1] = nombreJugador;
                    }
                    else
                    {
                        throw new HubException("La sala está llena.");
                    }
                }

                indiceJugador = Array.IndexOf(sala.Players, connectionId);

                if (indiceJugador >= 0)
                {
                    sala.PlayerNames[indiceJugador] = nombreJugador;
                }

                ConexionSala[connectionId] = salaId;

                if (sala.PlayersConnected == 2 && !sala.IsStarted)
                {
                    sala.ResetBoard();
                    sala.IsStarted = true;
                    iniciarJuego = true;
                }

                jugadorUnoId = sala.Players[0]!;
            }

            // Persist player join to database (fire-and-forget for speed)
            try
            {
                var room = await _roomService.GetRoomByCodeAsync(salaId);

                if (room is not null)
                {
                    // Extract userId from JWT claims if authenticated
                    Guid? userId = null;
                    var userIdClaim = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                    if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedId))
                    {
                        userId = parsedId;
                    }

                    await _roomService.AddPlayerAsync(room.Id, userId, connectionId);

                    if (iniciarJuego)
                    {
                        await _roomService.UpdateStatusAsync(room.Id, "in_game");

                        // Start a match record in the database
                        var match = await _matchService.StartMatchAsync(room.Id);

                        lock (SalasLock)
                        {
                            if (salas.TryGetValue(salaId, out var s))
                            {
                                s.MatchId = match.Id;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to persist player join for room {RoomId}", salaId);
            }

            await Groups.AddToGroupAsync(connectionId, salaId);
            await Clients.Caller.SendAsync(
                "AsignacionJugador",
                new PlayerAssignmentDto(indiceJugador == 0 ? "X" : "O", nombreJugador));

            // Notify all clients that the rooms list has changed
            await Clients.All.SendAsync("RoomsChanged");
            await EnviarEstadoSala(salaId);

            if (iniciarJuego)
            {
                await Clients.Group(salaId).SendAsync("JuegoIniciado", jugadorUnoId);
                await EnviarEstadoSala(salaId);
            }
        }

        public async Task HacerJugada(string salaId, int posicion)
        {
            if (posicion < 0 || posicion > 8)
            {
                await Clients.Caller.SendAsync("MovimientoInvalido", "Posición fuera del tablero.");
                return;
            }

            salaId = salaId.Trim();
            var connectionId = Context.ConnectionId;
            bool movimientoAplicado = false;
            string simbolo = string.Empty;
            string? ganador;
            bool empate;
            int turnNumber = 0;
            Guid? matchId = null;

            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var sala))
                {
                    throw new HubException("Sala no encontrada.");
                }

                var indiceJugador = Array.IndexOf(sala.Players, connectionId);
                if (indiceJugador == -1)
                {
                    throw new HubException("No perteneces a esta sala.");
                }

                if (!sala.IsStarted || sala.IsFinished)
                {
                    _ = Clients.Caller.SendAsync("MovimientoInvalido", "La partida no está activa.");
                    return;
                }

                simbolo = indiceJugador == 0 ? "X" : "O";

                if (sala.CurrentTurn != simbolo)
                {
                    _ = Clients.Caller.SendAsync("MovimientoInvalido", "No es tu turno.");
                    return;
                }

                if (!string.IsNullOrEmpty(sala.Board[posicion]))
                {
                    _ = Clients.Caller.SendAsync("MovimientoInvalido", "Esa casilla ya está ocupada.");
                    return;
                }

                sala.Board[posicion] = simbolo;
                sala.TurnCount++;
                turnNumber = sala.TurnCount;
                matchId = sala.MatchId;
                movimientoAplicado = true;

                ganador = ObtenerGanador(sala.Board);
                empate = ganador is null && sala.Board.All(c => !string.IsNullOrEmpty(c));

                if (ganador is not null || empate)
                {
                    sala.IsFinished = true;
                    sala.Winner = ganador;
                }
                else
                {
                    sala.CurrentTurn = simbolo == "X" ? "O" : "X";
                }
            }

            if (!movimientoAplicado)
            {
                return;
            }

            // Persist move to database
            if (matchId.HasValue)
            {
                try
                {
                    Guid? userId = null;
                    var userIdClaim = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                    if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedId))
                    {
                        userId = parsedId;
                    }

                    await _matchService.RecordMoveAsync(matchId.Value, userId, turnNumber, posicion, simbolo);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to persist move for match {MatchId}", matchId);
                }
            }

            await Clients.Group(salaId).SendAsync("JugadaRealizada", connectionId, posicion, simbolo);
            await EnviarEstadoSala(salaId);

            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var sala) || !sala.IsFinished)
                {
                    return;
                }

                ganador = sala.Winner;
            }

            // Persist match result to database
            if (matchId.HasValue)
            {
                try
                {
                    // Determine winner/loser user IDs from the room's connection-to-player mapping
                    await _matchService.EndMatchAsync(matchId.Value, null, ganador is null ? "{\"draw\":true}" : $"{{\"winner\":\"{ganador}\"}}");

                    // Update the room status
                    var room = await _roomService.GetRoomByCodeAsync(salaId);

                    if (room is not null)
                    {
                        await _roomService.UpdateStatusAsync(room.Id, "finished");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to persist match result for match {MatchId}", matchId);
                }
            }

            await Clients.Group(salaId).SendAsync("JuegoFinalizado", ganador);
        }

        public async Task ReiniciarPartida(string salaId)
        {
            salaId = salaId.Trim();
            var connectionId = Context.ConnectionId;
            Guid? newMatchId = null;

            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var sala))
                {
                    throw new HubException("Sala no encontrada.");
                }

                if (Array.IndexOf(sala.Players, connectionId) == -1)
                {
                    throw new HubException("No perteneces a esta sala.");
                }

                if (sala.PlayersConnected < 2)
                {
                    throw new HubException("No hay suficientes jugadores para reiniciar.");
                }

                sala.ResetBoard();
                sala.IsStarted = true;
            }

            // Start a new match record in the database
            try
            {
                var room = await _roomService.GetRoomByCodeAsync(salaId);

                if (room is not null)
                {
                    await _roomService.UpdateStatusAsync(room.Id, "in_game");
                    var match = await _matchService.StartMatchAsync(room.Id);
                    newMatchId = match.Id;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to start new match for room {RoomId}", salaId);
            }

            if (newMatchId.HasValue)
            {
                lock (SalasLock)
                {
                    if (salas.TryGetValue(salaId, out var sala))
                    {
                        sala.MatchId = newMatchId.Value;
                    }
                }
            }

            await Clients.Group(salaId).SendAsync("PartidaReiniciada");
            await EnviarEstadoSala(salaId);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            string? salaId = null;

            lock (SalasLock)
            {
                if (ConexionSala.TryGetValue(Context.ConnectionId, out var id))
                {
                    salaId = id;
                    ConexionSala.Remove(Context.ConnectionId);

                    if (salas.TryGetValue(salaId, out var sala))
                    {
                        var index = Array.IndexOf(sala.Players, Context.ConnectionId);
                        if (index >= 0)
                        {
                            sala.Players[index] = null;
                            sala.PlayerNames[index] = null;
                        }

                        if (sala.PlayersConnected == 0)
                        {
                            salas.Remove(salaId);
                        }
                        else
                        {
                            sala.IsStarted = false;
                            sala.IsFinished = false;
                            sala.Winner = null;
                            Array.Fill(sala.Board, string.Empty);
                            sala.CurrentTurn = "X";
                        }
                    }
                }
            }

            // Persist player leave to database
            if (!string.IsNullOrEmpty(salaId))
            {
                try
                {
                    await _roomService.RemovePlayerByConnectionAsync(Context.ConnectionId);

                    var room = await _roomService.GetRoomByCodeAsync(salaId);

                    if (room is not null && room.CurrentPlayers <= 0)
                    {
                        await _roomService.DeleteRoomIfEmptyAsync(room.Id);
                        await Clients.All.SendAsync("RoomDeleted", salaId);
                    }

                    // Notify all clients that rooms list changed
                    await Clients.All.SendAsync("RoomsChanged");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to persist player leave for room {RoomId}", salaId);
                }

                await Clients.Group(salaId).SendAsync("JugadorDesconectado");
                await EnviarEstadoSala(salaId);
            }

            if (exception is not null)
            {
                _logger.LogWarning(exception, "Cliente desconectado con error: {ConnectionId}", Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        private async Task EnviarEstadoSala(string salaId)
        {
            EstadoSalaDto? estado = null;

            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var sala))
                {
                    return;
                }

                estado = new EstadoSalaDto(
                    salaId,
                    [.. sala.Board],
                    sala.CurrentTurn,
                    sala.CurrentTurn == "X" ? sala.PlayerNames[0] : sala.PlayerNames[1],
                    sala.PlayerNames[0],
                    sala.PlayerNames[1],
                    sala.IsStarted,
                    sala.IsFinished,
                    sala.Winner,
                    sala.PlayersConnected);
            }

            await Clients.Group(salaId).SendAsync("JugadoresEnSala", estado!.JugadoresConectados);
            await Clients.Group(salaId).SendAsync("EstadoJuegoActualizado", estado);
        }

        private static string? ObtenerGanador(string[] board)
        {
            int[][] lineas =
            [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];

            foreach (var linea in lineas)
            {
                var a = board[linea[0]];
                if (!string.IsNullOrEmpty(a) && a == board[linea[1]] && a == board[linea[2]])
                {
                    return a;
                }
            }

            return null;
        }

        private sealed class RoomState
        {
            public string?[] Players { get; } = new string?[2];
            public string?[] PlayerNames { get; } = new string?[2];
            public string[] Board { get; } = new string[9];
            public string CurrentTurn { get; set; } = "X";
            public bool IsStarted { get; set; }
            public bool IsFinished { get; set; }
            public string? Winner { get; set; }
            public Guid? MatchId { get; set; }
            public int TurnCount { get; set; }
            public int PlayersConnected => Players.Count(x => !string.IsNullOrEmpty(x));

            public void ResetBoard()
            {
                Array.Fill(Board, string.Empty);
                CurrentTurn = "X";
                IsFinished = false;
                Winner = null;
                MatchId = null;
                TurnCount = 0;
            }
        }

        private sealed record EstadoSalaDto(
            string SalaId,
            string[] Board,
            string CurrentTurn,
            string? CurrentTurnPlayerName,
            string? PlayerXName,
            string? PlayerOName,
            bool IsStarted,
            bool IsFinished,
            string? Winner,
            int JugadoresConectados);

        private sealed record PlayerAssignmentDto(
            string Symbol,
            string PlayerName);
    }
}
