import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { TrophyIcon } from '../components/ui/Icons';
import { usePresence } from '../hooks/usePresence';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../i18n/LanguageContext';
import { playTriviaTone, prepareGameAudio } from '../utils/gameAudio';

type Question = { category: string; text: string; options: string[] };
type State = { isStarted: boolean; jugadoresConectados: number; gameState?: { questions: Question[]; progress: number[]; isFinished: boolean } };
type Assignment = { symbol: 'X' | 'O' };
type Result = { accepted: boolean; replayed: boolean; message?: string };

function TriviaGame() {
  const { t } = useI18n();
  const navigate = useNavigate(); const { roomId } = useParams<{ roomId: string }>(); const [searchParams] = useSearchParams(); const { totalOnline, gameOnline } = usePresence('trivia');
  const connectionRef = useRef<HubConnection | null>(null); const keys = useRef(new Map<number, string>()); const [state, setState] = useState<State | null>(null); const [playerIndex, setPlayerIndex] = useState<number | null>(null); const [message, setMessage] = useState('');
  useEffect(() => { if (!roomId) return; const connection = new HubConnectionBuilder().withUrl(import.meta.env.VITE_SIGNALR_HUB ?? '/gameHub', { accessTokenFactory: () => useAuthStore.getState().token ?? '' }).withAutomaticReconnect().configureLogging(LogLevel.Warning).build(); connectionRef.current = connection; const onState = (next: State) => { setState(next); setMessage(next.isStarted ? t('answerIndependently') : t('waitingSecond')); }; const onAssignment = (a: Assignment) => setPlayerIndex(a.symbol === 'X' ? 0 : 1); connection.on('EstadoJuegoActualizado', onState); connection.on('AsignacionJugador', onAssignment); void connection.start().then(() => connection.invoke('UnirseSala', roomId)).catch(() => setMessage(t('roomConnectFailed'))); return () => { connection.off('EstadoJuegoActualizado', onState); connection.off('AsignacionJugador', onAssignment); connectionRef.current = null; void connection.stop(); }; }, [roomId, t]);
  const game = state?.gameState; const index = playerIndex === null ? 0 : game?.progress[playerIndex] ?? 0; const question = game?.questions[index];
  const answer = async (optionIndex: number) => { await prepareGameAudio(); const connection = connectionRef.current; if (!connection || connection.state !== HubConnectionState.Connected || !roomId || playerIndex === null || !question) return; const key = keys.current.get(index) ?? crypto.randomUUID(); keys.current.set(index, key); try { const result = await connection.invoke<Result>('JugarAccion', roomId, 'answer', JSON.stringify({ questionIndex: index, optionIndex }), key); if (result.accepted) { keys.current.delete(index); if (!result.replayed) playTriviaTone(); } else { keys.current.delete(index); setMessage(result.message ?? t('answerRejected')); } } catch { setMessage(t('answerConfirmFailed')); } };
  if (!roomId) return <Navigate to="/game/trivia" replace />;

  return (
    <main className="min-h-screen bg-transparent text-[#f4f4f6]">
      <Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} />
      <section className="px-6 py-7 max-sm:px-4">
        <div className="mx-auto max-w-5xl rounded-[26px] border border-white/[0.08] bg-[#111114] p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-['Rajdhani'] text-3xl sm:text-4xl font-bold uppercase tracking-[0.04em] text-[#f4f4f6]">
              Room {searchParams.get('name') ?? roomId}
            </h1>
            <Badge variant="primary">{index}/10 answered</Badge>
          </div>

          {/* Telemetry Progress Bar */}
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#0d0d10] border border-white/[0.08]">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(100, (index / 10) * 100)}%`,
                background: 'linear-gradient(90deg, #d4ff00, #e2ff33)',
                boxShadow: '0 0 14px rgba(212,255,0,0.6)',
              }}
            />
          </div>

          {game?.isFinished ? (
            <div className="mt-10 rounded-[20px] border border-[#00f5a0]/40 bg-[#00f5a0]/8 p-8 text-center shadow-[0_0_30px_rgba(0,245,160,0.12)]">
              <TrophyIcon size={44} className="text-[#00f5a0] mx-auto" />
              <h2 className="mt-3 font-['Rajdhani'] text-3xl sm:text-4xl font-bold uppercase tracking-wide text-[#00f5a0]">
                Quiz complete
              </h2>
              <p className="mt-2 text-sm font-medium text-[#8c8c9a]">
                Final results and telemetry are recorded by the server.
              </p>
              <div className="mt-6 flex justify-center">
                <Button variant="surface" onClick={() => navigate('/game/trivia')}>
                  Back to Trivia lobby
                </Button>
              </div>
            </div>
          ) : question ? (
            <div className="mt-8">
              <span className="inline-flex items-center rounded-full border border-[#d4ff00]/30 bg-[#d4ff00]/10 px-3.5 py-1 font-['Rajdhani'] text-xs font-bold uppercase tracking-[0.16em] text-[#d4ff00]">
                {question.category} • Question {index + 1} of 10
              </span>
              <h2 className="mt-4 font-['Rajdhani'] text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#f4f4f6] leading-snug">
                {question.text}
              </h2>
              <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => answer(optionIndex)}
                    className="flex items-center rounded-[18px] border border-white/[0.08] bg-[#0d0d10] p-4 sm:p-5 text-left transition-all duration-150 hover:border-[#d4ff00] hover:bg-[#d4ff00]/10 hover:shadow-[0_0_20px_rgba(212,255,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a] active:scale-[0.98]"
                  >
                    <span className="mr-3.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d4ff00]/40 bg-[#d4ff00]/15 font-['Rajdhani'] text-sm font-bold text-[#d4ff00]">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="text-base font-semibold text-[#f4f4f6]">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-[#8c8c9a]">{message}</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default TriviaGame;
