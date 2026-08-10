using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services;

public interface ITriviaQuestionService
{
    Task<IReadOnlyList<QuizQuestion>> GetRandomQuestionsAsync(int count);
}
