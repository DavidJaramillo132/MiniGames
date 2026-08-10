using Dapper;
using ReactApp1.Server.Data;
using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services;

public sealed class TriviaQuestionService : ITriviaQuestionService
{
    private readonly DbConnectionFactory _db;
    public TriviaQuestionService(DbConnectionFactory db) => _db = db;

    public async Task<IReadOnlyList<QuizQuestion>> GetRandomQuestionsAsync(int count)
    {
        const string sql = "SELECT id, category, question, options::text AS options, correct_option_index FROM quiz_questions ORDER BY random() LIMIT @Count;";
        await using var conn = _db.CreateConnection();
        return (await conn.QueryAsync<QuizQuestion>(sql, new { Count = count })).ToList();
    }
}
