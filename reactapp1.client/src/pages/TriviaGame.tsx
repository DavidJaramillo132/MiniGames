import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { usePresence } from '../hooks/usePresence';

interface TriviaQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

const questions: TriviaQuestion[] = [
  {
    question: 'Que pais gano el Mundial de futbol en 2022?',
    options: ['Brasil', 'Argentina', 'Francia', 'Alemania'],
    answerIndex: 1,
  },
  {
    question: 'Cual es el resultado de 9 x 7?',
    options: ['56', '63', '67', '72'],
    answerIndex: 1,
  },
  {
    question: 'Que lenguaje usa React principalmente?',
    options: ['Java', 'TypeScript/JavaScript', 'C#', 'Go'],
    answerIndex: 1,
  },
];

function TriviaGame() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('name') ?? roomId;
  const { totalOnline, gameOnline } = usePresence('trivia');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  const current = questions[index];
  const isFinished = index >= questions.length;

  const progress = useMemo(() => {
    return Math.round(((index + (isFinished ? 0 : 1)) / questions.length) * 100);
  }, [index, isFinished]);

  if (!roomId) {
    return <Navigate to="/game/trivia" replace />;
  }

  const handleAnswer = (optionIndex: number) => {
    if (isAnswerLocked) {
      return;
    }

    setSelectedOption(optionIndex);
    setIsAnswerLocked(true);

    if (optionIndex === current.answerIndex) {
      setScore((v) => v + 100);
    }
  };

  const handleNext = () => {
    if (index === questions.length - 1) {
      setIndex(questions.length);
      return;
    }

    setIndex((v) => v + 1);
    setSelectedOption(null);
    setIsAnswerLocked(false);
  };

  return (
    <main className="min-h-screen bg-transparent text-[#edf6ff]">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(76,201,240,0.16),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(255,123,99,0.1),transparent_20%)]" />
        <Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} />

        <section className="relative px-6 py-7 max-sm:px-4">
          <div className="mx-auto grid max-w-6xl gap-5">
            <article className="overflow-hidden rounded-[34px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.96),rgba(5,12,24,0.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-sm uppercase tracking-[0.18em] text-[#97dafc]/58">
                    Trivia Quiz
                  </span>
                  <h1 className="font-['Rajdhani'] text-[clamp(2.3rem,4.5vw,3.8rem)] leading-none font-bold uppercase tracking-[0.06em] text-[#f6fbff]">
                    Sala {roomName}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <Badge variant="primary">Score {score}</Badge>
                  <Badge variant="success">{progress}%</Badge>
                </div>
              </div>

              {isFinished ? (
                <div className="mt-6 grid gap-4 rounded-[24px] border border-[rgba(141,232,255,0.1)] bg-[rgba(255,255,255,0.03)] p-6 text-center">
                  <h2 className="text-[2rem] font-bold tracking-[-0.04em]">Partida finalizada</h2>
                  <p className="text-[1.2rem] text-[#d7ebff]/70">Puntaje total: {score}</p>
                  <Button onClick={() => navigate('/game/trivia')}>Volver al lobby de Trivia</Button>
                </div>
              ) : (
                <div className="mt-6 grid gap-5">
                  <div className="rounded-[24px] border border-[rgba(141,232,255,0.1)] bg-[rgba(255,255,255,0.03)] p-5">
                    <p className="text-sm uppercase tracking-[0.16em] text-[#d7ebff]/45">
                      Pregunta {index + 1} de {questions.length}
                    </p>
                    <h2 className="mt-3 text-[1.6rem] font-bold leading-tight">{current.question}</h2>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {current.options.map((option, optionIndex) => {
                      const isCorrect = optionIndex === current.answerIndex;
                      const isSelected = optionIndex === selectedOption;

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={isAnswerLocked}
                          onClick={() => handleAnswer(optionIndex)}
                          className="rounded-[20px] border border-[rgba(141,232,255,0.14)] bg-[rgba(255,255,255,0.03)] p-4 text-left transition hover:border-[rgba(76,201,240,0.52)] disabled:cursor-not-allowed"
                          style={
                            isAnswerLocked
                              ? isCorrect
                                ? { borderColor: 'rgba(134,240,190,0.75)', backgroundColor: 'rgba(134,240,190,0.13)' }
                                : isSelected
                                  ? { borderColor: 'rgba(255,123,99,0.65)', backgroundColor: 'rgba(255,123,99,0.12)' }
                                  : undefined
                              : undefined
                          }
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="surface" onClick={() => navigate('/game/trivia')}>
                      Salir
                    </Button>
                    <Button onClick={handleNext} disabled={!isAnswerLocked}>
                      {index === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
                    </Button>
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

export default TriviaGame;
