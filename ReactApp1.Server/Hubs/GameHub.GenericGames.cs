using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using ReactApp1.Server.Games;
using ReactApp1.Server.Services;

namespace ReactApp1.Server.Hubs;

public partial class GameHub
{
    public async Task<MoveSubmissionDto> JugarAccion(string salaId, string actionType, string payload, Guid idempotencyKey)
    {
        var userId = GetAuthenticatedUserId();
        if (string.IsNullOrWhiteSpace(salaId) || string.IsNullOrWhiteSpace(actionType) || string.IsNullOrWhiteSpace(payload) || idempotencyKey == Guid.Empty)
            return MoveSubmissionDto.Rejected("Room, action, payload, and idempotency key are required.");

        salaId = salaId.Trim();
        var actionGate = RoomActionGates.GetOrAdd(salaId, static _ => new SemaphoreSlim(1, 1));
        await actionGate.WaitAsync();
        try
        {
            Guid matchId;
            int playerIndex;
            int sequence;
            IGameSession session;
            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var room) || room.MatchId is null || room.GameSession is null)
                    return MoveSubmissionDto.Rejected("The game is not ready.");
                playerIndex = Array.IndexOf(room.Players, Context.ConnectionId);
                if (playerIndex < 0 || room.PlayerUserIds[playerIndex] != userId)
                    return MoveSubmissionDto.Rejected("You do not belong to this room.");
                session = room.GameSession;
                matchId = room.MatchId.Value;
            }

            GameActionSubmissionStatus? existing;
            try { existing = await _gameActionService.GetIdempotencyStatusAsync(matchId, userId, idempotencyKey, actionType, payload); }
            catch (Exception ex) { _logger.LogWarning(ex, "Could not resolve game action idempotency for match {MatchId}", matchId); return MoveSubmissionDto.Rejected("The action could not be saved. Try again."); }
            if (existing == GameActionSubmissionStatus.Replay) return MoveSubmissionDto.Replay("The action was already registered.");
            if (existing == GameActionSubmissionStatus.IdempotencyKeyReuse) return MoveSubmissionDto.Rejected("That idempotency key was used for another action.");

            string? validationError;
            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var room) || room.MatchId != matchId || room.GameSession != session)
                    return MoveSubmissionDto.Rejected("The game changed before the action was recorded.");
                playerIndex = Array.IndexOf(room.Players, Context.ConnectionId);
                if (playerIndex < 0 || room.PlayerUserIds[playerIndex] != userId)
                    return MoveSubmissionDto.Rejected("You do not belong to this room.");
                if (session.IsFinished) return MoveSubmissionDto.Rejected("The game has finished.");
                validationError = session.Validate(playerIndex, actionType, payload);
                sequence = session.SequenceNumber + 1;
            }
            if (validationError is not null) return MoveSubmissionDto.Rejected(validationError);

            GameActionSubmissionStatus persisted;
            try { persisted = await _gameActionService.SubmitAsync(matchId, userId, idempotencyKey, sequence, actionType, payload); }
            catch (Exception ex) { _logger.LogWarning(ex, "Could not persist game action for match {MatchId}", matchId); return MoveSubmissionDto.Rejected("The action could not be saved. Try again."); }
            if (persisted == GameActionSubmissionStatus.Replay) return MoveSubmissionDto.Replay("The action was already registered.");
            if (persisted != GameActionSubmissionStatus.Applied) return MoveSubmissionDto.Rejected("The game changed before the action was recorded.");

            string? error;
            bool resolveMemory = false;
            bool finished;
            lock (SalasLock)
            {
                if (!salas.TryGetValue(salaId, out var room) || room.MatchId != matchId || room.GameSession != session)
                    return MoveSubmissionDto.Rejected("The game changed before the action was applied.");
                error = session.Validate(playerIndex, actionType, payload);
                if (error is not null) return MoveSubmissionDto.Rejected(error);
                error = session.Apply(playerIndex, actionType, payload, DateTimeOffset.UtcNow);
                resolveMemory = error is null && session is MemorySession memory && memory.HasPendingMismatch;
                finished = error is null && session.IsFinished;
            }
            if (error is not null) return MoveSubmissionDto.Rejected(error);

            await EnviarEstadoSala(salaId);
            if (resolveMemory) _ = ResolveMemoryMismatchAsync(salaId, matchId, session);
            if (finished) await FinishGenericMatchAsync(salaId, matchId, session);
            return MoveSubmissionDto.Success();
        }
        finally
        {
            actionGate.Release();
        }
    }

    private async Task StartGenericSessionAsync(string salaId, string gameSlug)
    {
        if (gameSlug is not ("memory" or "trivia")) return;
        IReadOnlyList<Models.QuizQuestion>? questions = null;
        if (gameSlug == "trivia")
        {
            questions = await _triviaQuestionService.GetRandomQuestionsAsync(10);
            if (questions.Count != 10) throw new HubException("Trivia requires ten seeded questions.");
        }
        lock (SalasLock)
        {
            if (salas.TryGetValue(salaId, out var room) && room.GameSession is null)
                room.GameSession = GameSessionFactory.Create(gameSlug, questions);
        }
    }

    private async Task ResolveMemoryMismatchAsync(string salaId, Guid matchId, IGameSession session)
    {
        await Task.Delay(TimeSpan.FromMilliseconds(900));
        lock (SalasLock)
        {
            if (salas.TryGetValue(salaId, out var room) && room.MatchId == matchId && ReferenceEquals(room.GameSession, session) && session is MemorySession memory)
                memory.ResolveMismatch();
        }
        await EnviarEstadoSala(salaId);
    }

    private async Task FinishGenericMatchAsync(string salaId, Guid matchId, IGameSession session)
    {
        Guid?[] playerIds;
        string? slug;
        lock (SalasLock)
        {
            if (!salas.TryGetValue(salaId, out var room) || room.MatchId != matchId) return;
            room.IsFinished = true;
            playerIds = room.PlayerUserIds;
            slug = room.GameSlug;
        }
        var result = session.GetFinalResult(playerIds);
        var json = JsonSerializer.Serialize(result);
        var winner = JsonDocument.Parse(json).RootElement.TryGetProperty("winnerUserId", out var winnerProperty) && winnerProperty.ValueKind == JsonValueKind.String && Guid.TryParse(winnerProperty.GetString(), out var winnerId) ? winnerId : (Guid?)null;
        var draw = JsonDocument.Parse(json).RootElement.GetProperty("draw").GetBoolean();
        await _matchService.EndMatchAsync(matchId, winner, json);
        var roomRecord = await _roomService.GetRoomByCodeAsync(salaId);
        if (roomRecord is not null) await _roomService.UpdateStatusAsync(roomRecord.Id, "finished");
        if (!string.IsNullOrEmpty(slug)) await _leaderboardService.UpdateStatsAfterMatchAsync(slug, winner ?? playerIds[0], winner is null ? playerIds[1] : playerIds.First(id => id != winner), draw);
        await Clients.Group(salaId).SendAsync("JuegoFinalizado", winner?.ToString());
        await EnviarEstadoSala(salaId);
    }
}
