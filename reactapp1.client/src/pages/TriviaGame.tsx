import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
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
  return <main className="min-h-screen text-[#edf6ff]"><Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} /><section className="px-6 py-7 max-sm:px-4"><div className="mx-auto max-w-5xl rounded-[34px] border border-[rgba(141,232,255,0.14)] bg-[rgba(8,18,34,0.96)] p-6"><div className="flex justify-between gap-3"><div><span className="text-sm uppercase tracking-[0.18em] text-[#97dafc]/58">Trivia Quiz</span><h1 className="font-['Rajdhani'] text-4xl font-bold uppercase">Room {searchParams.get('name') ?? roomId}</h1></div><Badge variant="primary">{index}/10 answered</Badge></div>{game?.isFinished ? <div className="mt-8 text-center"><h2 className="text-2xl font-bold">Quiz complete</h2><p className="mt-2 text-[#d7ebff]/70">Final results are recorded by the server.</p><Button onClick={() => navigate('/game/trivia')}>Back to Trivia lobby</Button></div> : question ? <div className="mt-6"><p className="text-sm text-[#97dafc]">{question.category} / Question {index + 1} of 10</p><h2 className="mt-3 text-2xl font-bold">{question.text}</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{question.options.map((option, optionIndex) => <button key={option} type="button" onClick={() => answer(optionIndex)} className="rounded-[20px] border border-[rgba(141,232,255,0.14)] bg-[rgba(255,255,255,0.03)] p-4 text-left hover:border-[rgba(76,201,240,0.52)]">{option}</button>)}</div></div> : <p className="mt-6 text-[#d7ebff]/70">{message}</p>}</div></section></main>;
}

export default TriviaGame;
