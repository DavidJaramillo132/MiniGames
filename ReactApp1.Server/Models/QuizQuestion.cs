namespace ReactApp1.Server.Models;

public sealed class QuizQuestion
{
    public Guid Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public string Options { get; set; } = "[]";
    public int CorrectOptionIndex { get; set; }
}
