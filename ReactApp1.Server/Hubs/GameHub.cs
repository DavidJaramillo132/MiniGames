using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Hubs
{
    [Authorize]
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
            var joiningUserId = GetAuthenticatedUserId();

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
                        sala.PlayerUserIds[0] = joiningUserId;
                    }
                    else if (sala.Players[1] is null)
                    {
                        sala.Players[1] = connectionId;
                        sala.PlayerNames[1] = nombreJugador;
                        sala.PlayerUserIds[1] = joiningUserId;
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
                    sala.PlayerUserIds[indiceJugador] = joiningUserId;
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
                    // Store the game slug so we can update stats when the game ends
                    lock (SalasLock)
                    {
                        if (salas.TryGetValue(salaId, out var s))
                        {
                            s.GameSlug = room.GameSlug;
                        }
                    }

                    await _roomService.AddPlayerAsync(room.Id, joiningUserId, connectionId);

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

        public async Task<MoveSubmissionDto> HacerJugada(string salaId, int posicion, Guid idempotencyKey)
        {
            var playerUserId = GetAuthenticatedUserId();

            if (posicion < 0 || posicion > 8)
            {
                return MoveSubmissionDto.Rejected("Posición fuera del tablero.");
            }

            if (idempotencyKey == Guid.Empty)
            {
                return MoveSubmissionDto.Rejected("La clave de idempotencia es obligatoria.");
            }

            if (string.IsNullOrWhiteSpace(salaId))
            {
                return MoveSubmissionDto.Rejected("La sala es obligatoria.");
            }

            salaId = salaId.Trim();
            var connectionId = Context.ConnectionId;
            Guid matchId;

            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var sala))
                {
                    return MoveSubmissionDto.Rejected("Sala no encontrada.");
                }

                var indiceJugador = Array.IndexOf(sala.Players, connectionId);
                if (indiceJugador == -1)
                {
                    return MoveSubmissionDto.Rejected("No perteneces a esta sala.");
                }

                if (sala.PlayerUserIds[indiceJugador] != playerUserId)
                {
                    return MoveSubmissionDto.Rejected("La identidad de la conexión no coincide con el jugador de la sala.");
                }

                if (!sala.MatchId.HasValue)
                {
                    return MoveSubmissionDto.Rejected("La partida todavía no está lista.");
                }

                matchId = sala.MatchId.Value;
            }

            MoveSubmissionStatus? idempotencyStatus;
            try
            {
                idempotencyStatus = await _matchService.GetIdempotencyStatusAsync(
                    matchId,
                    playerUserId,
                    idempotencyKey,
                    posicion);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to resolve idempotency key for match {MatchId}", matchId);
                return MoveSubmissionDto.Rejected("No se pudo guardar la jugada. Inténtalo de nuevo.");
            }

            if (idempotencyStatus == MoveSubmissionStatus.Replay)
            {
                return MoveSubmissionDto.Replay("La jugada ya estaba registrada.");
            }

            if (idempotencyStatus == MoveSubmissionStatus.IdempotencyKeyReuse)
            {
                return MoveSubmissionDto.Rejected("La clave de idempotencia ya se usó para otra jugada.");
            }

            PendingMove pendingMove;
            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var sala))
                {
                    return MoveSubmissionDto.Rejected("Sala no encontrada.");
                }

                var indiceJugador = Array.IndexOf(sala.Players, connectionId);
                if (indiceJugador == -1)
                {
                    return MoveSubmissionDto.Rejected("No perteneces a esta sala.");
                }

                if (sala.PlayerUserIds[indiceJugador] != playerUserId)
                {
                    return MoveSubmissionDto.Rejected("La identidad de la conexión no coincide con el jugador de la sala.");
                }

                if (!sala.IsStarted || sala.IsFinished)
                {
                    return MoveSubmissionDto.Rejected("La partida no está activa.");
                }

                var simbolo = indiceJugador == 0 ? "X" : "O";

                if (sala.CurrentTurn != simbolo)
                {
                    return MoveSubmissionDto.Rejected("No es tu turno.");
                }

                if (!string.IsNullOrEmpty(sala.Board[posicion]))
                {
                    return MoveSubmissionDto.Rejected("Esa casilla ya está ocupada.");
                }

                if (!sala.MatchId.HasValue)
                {
                    return MoveSubmissionDto.Rejected("La partida todavía no está lista.");
                }

                pendingMove = new PendingMove(
                    sala.MatchId.Value,
                    playerUserId,
                    idempotencyKey,
                    sala.TurnCount + 1,
                    posicion,
                    simbolo,
                    indiceJugador);
            }

            MoveSubmissionResult persistenceResult;
            try
            {
                persistenceResult = await _matchService.SubmitMoveAsync(
                    pendingMove.MatchId,
                    pendingMove.PlayerUserId,
                    pendingMove.IdempotencyKey,
                    pendingMove.TurnNumber,
                    pendingMove.Position,
                    pendingMove.Symbol);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to persist move for match {MatchId}", pendingMove.MatchId);
                return MoveSubmissionDto.Rejected("No se pudo guardar la jugada. Inténtalo de nuevo.");
            }

            if (!persistenceResult.IsAccepted)
            {
                var message = persistenceResult.Status == MoveSubmissionStatus.IdempotencyKeyReuse
                    ? "La clave de idempotencia ya se usó para otra jugada."
                    : "El turno ya fue registrado. Se actualizó el estado de la sala.";
                await EnviarEstadoSala(salaId);
                return MoveSubmissionDto.Rejected(message);
            }

            string? ganador;
            bool empate;
            bool movimientoAplicado = false;
            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var sala))
                {
                    return MoveSubmissionDto.Rejected("Sala no encontrada.");
                }

                // The database commit succeeds before this authoritative state changes.
                if (sala.MatchId != pendingMove.MatchId ||
                    sala.TurnCount != pendingMove.TurnNumber - 1 ||
                    !string.IsNullOrEmpty(sala.Board[pendingMove.Position]) ||
                    sala.CurrentTurn != pendingMove.Symbol ||
                    sala.PlayerUserIds[pendingMove.PlayerIndex] != pendingMove.PlayerUserId)
                {
                    return persistenceResult.Status == MoveSubmissionStatus.Replay
                        ? MoveSubmissionDto.Replay("La jugada ya había sido aplicada.")
                        : MoveSubmissionDto.Rejected("El estado de la partida cambió antes de aplicar la jugada.");
                }

                sala.Board[pendingMove.Position] = pendingMove.Symbol;
                sala.TurnCount++;
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
                    sala.CurrentTurn = pendingMove.Symbol == "X" ? "O" : "X";
                }
            }

            if (!movimientoAplicado)
            {
                return MoveSubmissionDto.Rejected("No se pudo aplicar la jugada.");
            }

            await Clients.Group(salaId).SendAsync("JugadaRealizada", connectionId, pendingMove.Position, pendingMove.Symbol);
            await EnviarEstadoSala(salaId);

            // Persist match result and update leaderboard stats
            if (ganador is not null || empate)
            {
                Guid? winnerUserId = null;
                Guid? loserUserId = null;
                string? gameSlug = null;
                bool isDraw = ganador is null;

                lock (SalasLock)
                {
                    if (salas.TryGetValue(salaId, out var sala))
                    {
                        gameSlug = sala.GameSlug;

                        if (ganador is not null)
                        {
                            // ganador is "X" or "O" — map to player index
                            int winnerIndex = ganador == "X" ? 0 : 1;
                            int loserIndex = ganador == "X" ? 1 : 0;
                            winnerUserId = sala.PlayerUserIds[winnerIndex];
                            loserUserId = sala.PlayerUserIds[loserIndex];
                        }
                        else
                        {
                            // Draw — both players passed as winner/loser for stats tracking
                            winnerUserId = sala.PlayerUserIds[0];
                            loserUserId = sala.PlayerUserIds[1];
                        }
                    }
                }

                try
                {
                    await _matchService.EndMatchAsync(pendingMove.MatchId, winnerUserId, ganador is null ? "{\"draw\":true}" : $"{{\"winner\":\"{ganador}\"}}");

                    // Update the room status
                    var room = await _roomService.GetRoomByCodeAsync(salaId);

                    if (room is not null)
                    {
                        await _roomService.UpdateStatusAsync(room.Id, "finished");
                    }

                    // Update leaderboard stats
                    if (!string.IsNullOrEmpty(gameSlug))
                    {
                        await _leaderboardService.UpdateStatsAfterMatchAsync(gameSlug, winnerUserId, loserUserId, isDraw);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to persist match result for match {MatchId}", pendingMove.MatchId);
                }
            }

            if (ganador is not null || empate)
            {
                await Clients.Group(salaId).SendAsync("JuegoFinalizado", ganador);
            }

            return persistenceResult.Status == MoveSubmissionStatus.Replay
                ? MoveSubmissionDto.Replay("La jugada ya estaba registrada.")
                : MoveSubmissionDto.Success();
        }

        public async Task ReiniciarPartida(string salaId)
        {
            var playerUserId = GetAuthenticatedUserId();
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

                var playerIndex = Array.IndexOf(sala.Players, connectionId);
                if (sala.PlayerUserIds[playerIndex] != playerUserId)
                {
                    throw new HubException("La identidad de la conexión no coincide con el jugador de la sala.");
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

        private Guid GetAuthenticatedUserId()
        {
            if (Context.User?.Identity?.IsAuthenticated != true)
            {
                throw new HubException("Se requiere una sesión autenticada.");
            }

            var userIdClaim = Context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                ?? Context.User.FindFirst("sub")?.Value;

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                throw new HubException("La sesión no contiene un identificador de usuario válido.");
            }

            return userId;
        }

        private sealed class RoomState
        {
            public string?[] Players { get; } = new string?[2];
            public string?[] PlayerNames { get; } = new string?[2];
            public Guid?[] PlayerUserIds { get; } = new Guid?[2];
            public string? GameSlug { get; set; }
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

        private sealed record PendingMove(
            Guid MatchId,
            Guid PlayerUserId,
            Guid IdempotencyKey,
            int TurnNumber,
            int Position,
            string Symbol,
            int PlayerIndex);

        public sealed record MoveSubmissionDto(bool Accepted, bool Replayed, string? Message)
        {
            public static MoveSubmissionDto Success() => new(true, false, null);
            public static MoveSubmissionDto Replay(string message) => new(true, true, message);
            public static MoveSubmissionDto Rejected(string message) => new(false, false, message);
        }
    }
}
