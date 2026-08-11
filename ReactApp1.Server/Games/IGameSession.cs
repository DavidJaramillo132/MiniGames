using System.Text.Json;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Games;

public interface IGameSession
{
    string Slug { get; }
    int SequenceNumber { get; }
    bool IsFinished { get; }
    int CurrentPlayerIndex { get; }
    string? Validate(int playerIndex, string actionType, string payload);
    string? Apply(int playerIndex, string actionType, string payload, DateTimeOffset now);
    object GetClientState();
    object GetFinalResult(Guid?[] playerIds);
}

public static class GameSessionFactory
{
    public static IGameSession Create(string slug, IReadOnlyList<QuizQuestion>? questions = null) => slug switch
    {
        "memory" => new MemorySession(),
        "trivia" when questions?.Count == 10 => new TriviaSession(questions),
        _ => throw new InvalidOperationException($"No generic engine is registered for '{slug}'.")
    };
}

public sealed class MemorySession : IGameSession
{
    private readonly int[] _deck;
    private readonly CardState[] _cards = new CardState[12];
    private readonly int[] _scores = new int[2];
    private readonly List<int> _flipped = [];
    public string Slug => "memory";
    public int SequenceNumber { get; private set; }
    public bool IsFinished => _scores.Sum() == 6;
    public int CurrentPlayerIndex { get; private set; }
    public bool HasPendingMismatch => _flipped.Count == 2 && _cards[_flipped[0]] != CardState.Claimed && _deck[_flipped[0]] != _deck[_flipped[1]];

    public MemorySession()
    {
        _deck = Enumerable.Range(0, 6).SelectMany(x => new[] { x, x }).ToArray();
        var random = Random.Shared;
        for (var i = _deck.Length - 1; i > 0; i--)
        {
            var j = random.Next(i + 1);
            (_deck[i], _deck[j]) = (_deck[j], _deck[i]);
        }
    }

    public string? Apply(int playerIndex, string actionType, string payload, DateTimeOffset now)
    {
        var error = Validate(playerIndex, actionType, payload);
        if (error is not null) return error;
        TryPosition(payload, out var position);

        _cards[position] = CardState.Revealed;
        _flipped.Add(position);
        SequenceNumber++;
        if (_flipped.Count == 2 && _deck[_flipped[0]] == _deck[_flipped[1]])
        {
            _cards[_flipped[0]] = CardState.Claimed;
            _cards[_flipped[1]] = CardState.Claimed;
            _scores[playerIndex]++;
            _flipped.Clear();
        }
        return null;
    }

    public string? Validate(int playerIndex, string actionType, string payload)
    {
        if (actionType != "flip") return "Unsupported Memory action.";
        if (playerIndex != CurrentPlayerIndex) return "It is not your turn.";
        if (HasPendingMismatch) return "Cards are resolving.";
        if (!TryPosition(payload, out var position) || position is < 0 or > 11) return "Invalid card position.";
        return _cards[position] != CardState.Hidden ? "That card is not available." : null;
    }

    public void ResolveMismatch()
    {
        if (!HasPendingMismatch) return;
        foreach (var position in _flipped) _cards[position] = CardState.Hidden;
        _flipped.Clear();
        CurrentPlayerIndex = CurrentPlayerIndex == 0 ? 1 : 0;
    }

    public object GetClientState() => new
    {
        cards = Enumerable.Range(0, 12).Select(i => new { position = i, state = _cards[i].ToString().ToLowerInvariant(), value = _cards[i] == CardState.Hidden ? (string?)null : PairLabel(_deck[i]) }),
        scores = _scores,
        currentPlayerIndex = CurrentPlayerIndex,
        isResolving = HasPendingMismatch,
        isFinished = IsFinished,
        winnerIndex = IsFinished ? _scores[0] == _scores[1] ? (int?)null : _scores[0] > _scores[1] ? 0 : 1 : null
    };
    public object GetFinalResult(Guid?[] playerIds) => new { game = Slug, scores = _scores, winnerUserId = _scores[0] == _scores[1] ? (Guid?)null : playerIds[_scores[0] > _scores[1] ? 0 : 1], draw = _scores[0] == _scores[1] };
    private static bool TryPosition(string payload, out int position) { try { position = JsonDocument.Parse(payload).RootElement.GetProperty("position").GetInt32(); return true; } catch { position = -1; return false; } }
    private static readonly string[] _pairLabels = ["🪐", "🛸", "👽", "🌙", "⭐", "🚀"];
    private static string PairLabel(int value) => _pairLabels[value];
    private enum CardState { Hidden, Revealed, Claimed }
}

public sealed class TriviaSession : IGameSession
{
    private readonly IReadOnlyList<Question> _questions;
    private readonly int[] _progress = new int[2];
    private readonly int[] _correct = new int[2];
    private readonly DateTimeOffset[] _completedAt = new DateTimeOffset[2];
    private readonly DateTimeOffset _startedAt = DateTimeOffset.UtcNow;
    public string Slug => "trivia";
    public int SequenceNumber { get; private set; }
    public bool IsFinished => _progress.All(p => p == 10);
    public int CurrentPlayerIndex => -1;

    public TriviaSession(IReadOnlyList<QuizQuestion> questions) => _questions = questions.Select(q => new Question(q.Category, q.Question, JsonSerializer.Deserialize<string[]>(q.Options) ?? [], q.CorrectOptionIndex)).ToList();
    public string? Apply(int playerIndex, string actionType, string payload, DateTimeOffset now)
    {
        var error = Validate(playerIndex, actionType, payload);
        if (error is not null) return error;
        TryAnswer(payload, out var questionIndex, out var optionIndex);
        if (_questions[questionIndex].CorrectOptionIndex == optionIndex) _correct[playerIndex]++;
        _progress[playerIndex]++;
        if (_progress[playerIndex] == 10) _completedAt[playerIndex] = now;
        SequenceNumber++;
        return null;
    }
    public string? Validate(int playerIndex, string actionType, string payload)
    {
        if (actionType != "answer") return "Unsupported Trivia action.";
        if (_progress[playerIndex] >= 10) return "You have already completed the quiz.";
        return !TryAnswer(payload, out var questionIndex, out var optionIndex) || questionIndex != _progress[playerIndex] || optionIndex is < 0 or > 3
            ? "That answer is no longer valid."
            : null;
    }
    public object GetClientState() => new { questions = _questions.Select(q => new { q.Category, q.Text, q.Options }), progress = _progress, isFinished = IsFinished };
    public object GetFinalResult(Guid?[] playerIds)
    {
        var raw = _completedAt.Select(t => (t - _startedAt).TotalSeconds).ToArray();
        var effective = raw.Select((value, i) => value + (10 - _correct[i]) * 5).ToArray();
        var draw = Math.Abs(effective[0] - effective[1]) < 0.0001;
        return new { game = Slug, correct = _correct, rawSeconds = raw, effectiveSeconds = effective, winnerUserId = draw ? (Guid?)null : playerIds[effective[0] < effective[1] ? 0 : 1], draw };
    }
    private static bool TryAnswer(string payload, out int question, out int option) { try { var root = JsonDocument.Parse(payload).RootElement; question = root.GetProperty("questionIndex").GetInt32(); option = root.GetProperty("optionIndex").GetInt32(); return true; } catch { question = option = -1; return false; } }
    private sealed record Question(string Category, string Text, string[] Options, int CorrectOptionIndex);
}
