import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { useBestScore } from "@/hooks/use-best-score";
import { playSuccess, playFail, playTone } from "@/lib/sound";

const EMOJIS = ["🐶", "🐱", "🦊", "🐼", "🐵", "🦄", "🐸", "🐙", "🦋", "🐳", "🌺", "🍉"];
const PAIRS = 8; // 4x4 board

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const picks = shuffle(EMOJIS).slice(0, PAIRS);
  const doubled = shuffle([...picks, ...picks]);
  return doubled.map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
}

export function MemoryMatch() {
  const game = getGame("memory-match")!;
  const { best, submit } = useBestScore("memory-match", false); // fewer moves = better
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  const matchedCount = useMemo(() => cards.filter((c) => c.matched).length, [cards]);
  const won = matchedCount === PAIRS * 2;

  const reset = useCallback(() => {
    setCards(buildDeck());
    setOpen([]);
    setMoves(0);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (won) {
      playSuccess();
      submit(moves);
    }
  }, [won, moves, submit]);

  const flip = useCallback(
    (idx: number) => {
      if (busy || won) return;
      const card = cards[idx];
      if (card.flipped || card.matched) return;

      playTone(520, 90, "triangle");
      const next = cards.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
      const opened = [...open, idx];
      setCards(next);
      setOpen(opened);

      if (opened.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = opened;
        if (next[a].emoji === next[b].emoji) {
          setBusy(true);
          setTimeout(() => {
            setCards((cs) =>
              cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)),
            );
            setOpen([]);
            setBusy(false);
            playTone(760, 140, "sine");
          }, 320);
        } else {
          setBusy(true);
          playFail();
          setTimeout(() => {
            setCards((cs) =>
              cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)),
            );
            setOpen([]);
            setBusy(false);
          }, 780);
        }
      }
    },
    [busy, cards, open, won],
  );

  return (
    <GameShell game={game} best={best} bestLabel="Best (moves)" onRestart={reset}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-muted px-4 py-2 text-sm font-600">
            Moves: <span className="text-foreground">{moves}</span>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-2 text-sm font-600">
            Pairs: <span className="text-foreground">{matchedCount / 2}/{PAIRS}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {cards.map((card, idx) => {
            const shown = card.flipped || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => flip(idx)}
                className="relative size-16 sm:size-[4.5rem]"
                style={{ perspective: 600 }}
              >
                <motion.div
                  className="relative size-full"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: shown ? 180 : 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* back */}
                  <div
                    className="absolute inset-0 grid place-items-center rounded-2xl text-2xl font-700 text-white shadow-[0_4px_0_rgba(0,0,0,0.12)]"
                    style={{
                      backfaceVisibility: "hidden",
                      backgroundColor: game.accent,
                    }}
                  >
                    ?
                  </div>
                  {/* front */}
                  <div
                    className={
                      "absolute inset-0 grid place-items-center rounded-2xl text-3xl shadow-[0_4px_0_rgba(0,0,0,0.08)] " +
                      (card.matched ? "bg-[var(--lime)]/20 ring-2 ring-[var(--lime)]" : "bg-card border border-border")
                    }
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {card.emoji}
                  </div>
                </motion.div>
              </button>
            );
          })}
        </div>

        {won && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="font-display text-2xl font-700">Cleared! 🎉</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Solved in <span className="font-700 text-foreground">{moves}</span> moves
            </div>
            <button
              onClick={reset}
              className="press mt-4 rounded-full bg-primary px-6 py-2.5 font-600 text-primary-foreground"
            >
              Play again
            </button>
          </motion.div>
        )}
      </div>
    </GameShell>
  );
}
