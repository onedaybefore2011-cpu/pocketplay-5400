import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { useBestScore } from "@/hooks/use-best-score";
import { playSuccess, playTone } from "@/lib/sound";

const TOTAL_LEVELS = 200;
const PROGRESS_KEY = "pocketplay:sliding:maxlevel";

/** Deterministic RNG so each level always generates the same puzzle. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sizeForLevel(level: number): number {
  if (level <= 60) return 3;
  if (level <= 140) return 4;
  return 5;
}

function shuffleDepthForLevel(level: number, size: number): number {
  return size * size * 4 + level * 3;
}

const solvedBoard = (n: number) => {
  const b = Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n));
  return b; // [1,2,...,n*n-1,0]
};

/** Generate a solvable board by walking valid moves from solved with a seed. */
function generateBoard(level: number): { board: number[]; size: number } {
  const size = sizeForLevel(level);
  const board = solvedBoard(size);
  const rng = mulberry32(level * 2654435761);
  let blank = board.indexOf(0);
  const depth = shuffleDepthForLevel(level, size);
  let last = -1;
  for (let i = 0; i < depth; i++) {
    const r = Math.floor(blank / size);
    const c = blank % size;
    const opts: number[] = [];
    if (r > 0) opts.push(blank - size);
    if (r < size - 1) opts.push(blank + size);
    if (c > 0) opts.push(blank - 1);
    if (c < size - 1) opts.push(blank + 1);
    const filtered = opts.filter((o) => o !== last);
    const pick = filtered[Math.floor(rng() * filtered.length)];
    last = blank;
    [board[blank], board[pick]] = [board[pick], board[blank]];
    blank = pick;
  }
  // Avoid handing back an already-solved board.
  if (isSolved(board)) return generateBoard(level + 1000);
  return { board, size };
}

function isSolved(board: number[]): boolean {
  for (let i = 0; i < board.length - 1; i++) if (board[i] !== i + 1) return false;
  return board[board.length - 1] === 0;
}

function loadMaxLevel(): number {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const n = raw ? Number(raw) : 1;
    return Number.isFinite(n) && n >= 1 ? Math.min(n, TOTAL_LEVELS) : 1;
  } catch {
    return 1;
  }
}

export function SlidingPuzzle() {
  const game = getGame("sliding-puzzle")!;
  const { best, submit } = useBestScore("sliding-puzzle", true); // highest level reached
  const [maxLevel, setMaxLevel] = useState(1);
  const [level, setLevel] = useState(1);
  const [{ board, size }, setState] = useState(() => generateBoard(1));
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const m = loadMaxLevel();
    setMaxLevel(m);
    setLevel(m);
    setState(generateBoard(m));
    submit(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLevel = useCallback((lvl: number) => {
    setLevel(lvl);
    setState(generateBoard(lvl));
    setMoves(0);
    setSolved(false);
  }, []);

  const move = useCallback(
    (idx: number) => {
      if (solved) return;
      const blank = board.indexOf(0);
      const r = Math.floor(idx / size);
      const c = idx % size;
      const br = Math.floor(blank / size);
      const bc = blank % size;
      const adjacent = (r === br && Math.abs(c - bc) === 1) || (c === bc && Math.abs(r - br) === 1);
      if (!adjacent) return;

      const next = [...board];
      [next[blank], next[idx]] = [next[idx], next[blank]];
      setState({ board: next, size });
      setMoves((m) => m + 1);
      playTone(480, 70, "triangle");

      if (isSolved(next)) {
        setSolved(true);
        playSuccess();
        const unlocked = Math.min(level + 1, TOTAL_LEVELS);
        if (unlocked > maxLevel) {
          setMaxLevel(unlocked);
          try {
            localStorage.setItem(PROGRESS_KEY, String(unlocked));
          } catch {
            /* ignore */
          }
          submit(unlocked);
        }
      }
    },
    [board, size, solved, level, maxLevel, submit],
  );

  const canPrev = level > 1;
  const canNext = level < maxLevel && level < TOTAL_LEVELS;
  const canGoNextUnlocked = solved && level + 1 <= TOTAL_LEVELS;

  const tileColor = useMemo(() => game.accent, [game.accent]);

  return (
    <GameShell game={game} best={best} bestLabel="Reached lvl" onRestart={() => loadLevel(level)}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Level selector */}
        <div className="mb-5 flex items-center gap-2">
          <button
            disabled={!canPrev}
            onClick={() => loadLevel(level - 1)}
            className="press grid size-10 place-items-center rounded-2xl bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="rounded-2xl bg-muted px-5 py-2 text-center">
            <div className="font-display text-lg font-700 leading-none">Level {level}</div>
            <div className="text-xs text-muted-foreground">
              {size}×{size} · of {TOTAL_LEVELS}
            </div>
          </div>
          <button
            disabled={!canNext}
            onClick={() => loadLevel(level + 1)}
            className="press grid size-10 place-items-center rounded-2xl bg-muted disabled:opacity-40"
          >
            {level >= maxLevel ? <Lock className="size-4" /> : <ChevronRight className="size-5" />}
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-muted px-4 py-2 text-sm font-600">
          Moves: <span className="text-foreground">{moves}</span>
        </div>

        {/* Board */}
        <div
          className="grid gap-1.5 rounded-3xl bg-muted/60 p-2"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: "min(100%, 22rem)" }}
        >
          {board.map((val, idx) => {
            if (val === 0)
              return <div key={idx} className="aspect-square rounded-xl" />;
            return (
              <motion.button
                key={idx}
                layout
                onClick={() => move(idx)}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="grid aspect-square place-items-center rounded-xl font-display text-xl font-700 text-white shadow-[0_4px_0_rgba(0,0,0,0.12)] sm:text-2xl"
                style={{ backgroundColor: tileColor }}
              >
                {val}
              </motion.button>
            );
          })}
        </div>

        {solved && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="font-display text-2xl font-700">Solved! 🎉</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Level {level} in <span className="font-700 text-foreground">{moves}</span> moves
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => loadLevel(level)}
                className="press rounded-full bg-muted px-5 py-2.5 font-600"
              >
                Replay
              </button>
              {canGoNextUnlocked && (
                <button
                  onClick={() => loadLevel(level + 1)}
                  className="press rounded-full bg-primary px-6 py-2.5 font-600 text-primary-foreground"
                >
                  Next level →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </GameShell>
  );
}
