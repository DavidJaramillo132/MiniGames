import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { usePresence } from '../hooks/usePresence';

interface MemoryCard {
  id: number;
  value: string;
  isMatched: boolean;
}

const baseValues = ['A', 'B', 'C', 'D', 'E', 'F'];

function shuffle<T>(items: T[]) {
  const clone = [...items];

  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }

  return clone;
}

function createDeck(): MemoryCard[] {
  return shuffle([...baseValues, ...baseValues]).map((value, index) => ({
    id: index + 1,
    value,
    isMatched: false,
  }));
}

function MemoryGame() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('name') ?? roomId;
  const { totalOnline, gameOnline } = usePresence('memory');
  const [cards, setCards] = useState<MemoryCard[]>(() => createDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  const isFinished = pairsFound === baseValues.length;
  const progress = useMemo(() => Math.round((pairsFound / baseValues.length) * 100), [pairsFound]);

  if (!roomId) {
    return <Navigate to="/game/memory" replace />;
  }

  const handleFlip = (cardId: number) => {
    if (isBusy || flipped.includes(cardId)) {
      return;
    }

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched) {
      return;
    }

    const nextFlipped = [...flipped, cardId];
    setFlipped(nextFlipped);

    if (nextFlipped.length < 2) {
      return;
    }

    setMoves((v) => v + 1);
    const [firstId, secondId] = nextFlipped;
    const first = cards.find((c) => c.id === firstId);
    const second = cards.find((c) => c.id === secondId);

    if (!first || !second) {
      return;
    }

    if (first.value === second.value) {
      setCards((prev) =>
        prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)),
      );
      setPairsFound((v) => v + 1);
      setFlipped([]);
      return;
    }

    setIsBusy(true);
    setTimeout(() => {
      setFlipped([]);
      setIsBusy(false);
    }, 750);
  };

  const reset = () => {
    setCards(createDeck());
    setFlipped([]);
    setMoves(0);
    setPairsFound(0);
    setIsBusy(false);
  };

  return (
    <main className="min-h-screen bg-transparent text-[#edf6ff]">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(224,165,38,0.16),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(134,240,190,0.1),transparent_20%)]" />
        <Navbar onlineCount={totalOnline} gameOnlineCount={gameOnline} />

        <section className="relative px-6 py-7 max-sm:px-4">
          <div className="mx-auto grid max-w-6xl gap-5">
            <article className="overflow-hidden rounded-[34px] border border-[rgba(141,232,255,0.14)] bg-[linear-gradient(180deg,rgba(8,18,34,0.96),rgba(5,12,24,0.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-sm uppercase tracking-[0.18em] text-[#97dafc]/58">
                    Memory / Parejas
                  </span>
                  <h1 className="font-['Rajdhani'] text-[clamp(2.3rem,4.5vw,3.8rem)] leading-none font-bold uppercase tracking-[0.06em] text-[#f6fbff]">
                    Sala {roomName}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <Badge variant="primary">Movimientos {moves}</Badge>
                  <Badge variant="success">{progress}%</Badge>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="grid grid-cols-3 gap-3">
                  {cards.map((card) => {
                    const isVisible = card.isMatched || flipped.includes(card.id);

                    return (
                      <button
                        key={card.id}
                        type="button"
                        disabled={isBusy || card.isMatched || flipped.includes(card.id)}
                        onClick={() => handleFlip(card.id)}
                        className="aspect-square rounded-[18px] border border-[rgba(141,232,255,0.14)] bg-[rgba(255,255,255,0.03)] text-[2rem] font-bold transition hover:border-[rgba(224,165,38,0.5)] disabled:cursor-not-allowed"
                        style={isVisible ? { color: '#ffd48e', borderColor: 'rgba(224,165,38,0.55)' } : undefined}
                      >
                        {isVisible ? card.value : '?'}
                      </button>
                    );
                  })}
                </div>

                <aside className="grid content-start gap-3">
                  <div className="rounded-[22px] border border-[rgba(141,232,255,0.12)] bg-[rgba(255,255,255,0.03)] p-4 text-center">
                    <p className="text-[0.75rem] uppercase tracking-[0.2em] text-[#d7ebff]/44">Parejas</p>
                    <p className="mt-2 text-[1.8rem] font-bold text-[#f7fbff]">
                      {pairsFound}/{baseValues.length}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-[rgba(255,199,106,0.2)] bg-[rgba(255,199,106,0.08)] p-4 text-center">
                    <p className="text-[0.75rem] uppercase tracking-[0.2em] text-[#ffe2b8]/60">Estado</p>
                    <p className="mt-2 text-[1rem] font-semibold text-[#fff7ec]">
                      {isFinished ? 'Completado' : isBusy ? 'Memorizando...' : 'Buscando parejas'}
                    </p>
                  </div>

                  <Button fullWidth variant="surface" onClick={reset}>
                    Reiniciar tablero
                  </Button>
                  <Button fullWidth onClick={() => navigate('/game/memory')}>
                    Volver al lobby Memory
                  </Button>
                </aside>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

export default MemoryGame;
