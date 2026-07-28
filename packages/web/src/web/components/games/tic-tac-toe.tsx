import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { playSuccess, playFail, playTone } from "@/lib/sound";

type Cell = "X" | "O" | null;
type Difficulty = "Easy" | "Hard";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winner(b: Cell[]): { player: Cell; line: number[] } | null {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a], line };
  }
  return null;
}

function emptyCells(b: Cell[]) {
  return b.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
}

// Minimax for the "Hard" (unbeatable) computer playing O.
function minimax(b: Cell[], isMax: boolean): { score: number; move: number } {
  const win = winner(b);
  if (win?.player === "O") return { score: 10, move: -1 };
  if (win?.player === "X") return { score: -10, move: -1 };
  const spots = emptyCells(b);
  if (spots.length === 0) return { score: 0, move: -1 };

  let best = isMax
    ? { score: -Infinity, move: -1 }
    : { score: Infinity, move: -1 };
  for (const i of spots) {
    const next = b.slice();
    next[i] = isMax ? "O" : "X";
    const { score } = minimax(next, !isMax);
    if (isMax ? score > best.score : score < best.score) best = { score, move: i };
  }
  return best;
}

function computerMove(b: Cell[], difficulty: Difficulty): number {
  const spots = emptyCells(b);
  if (spots.length === 0) return -1;
  if (difficulty === "Easy") {
    // 55% random, else best move — beatable but not silly.
    if (Math.random() < 0.55) return spots[Math.floor(Math.random() * spots.length)];
  }
  return minimax(b, true).move;
}

export function TicTacToe() {
  const game = getGame("tic-tac-toe")!;
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState({ you: 0, cpu: 0, draw: 0 });

  const result = winner(board);
  const full = emptyCells(board).length === 0;
  const over = !!result || full;

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setBusy(false);
  }, []);

  // Computer responds after the player moves.
  useEffect(() => {
    if (over) return;
    const xCount = board.filter((c) => c === "X").length;
    const oCount = board.filter((c) => c === "O").length;
    if (xCount > oCount) {
      setBusy(true);
      const t = setTimeout(() => {
        const move = computerMove(board, difficulty);
        if (move >= 0) {
          setBoard((b) => {
            const next = b.slice();
            next[move] = "O";
            return next;
          });
          playTone(330, 160, "square");
        }
        setBusy(false);
      }, 420);
      return () => clearTimeout(t);
    }
  }, [board, difficulty, over]);

  // Tally + sound when a game ends.
  useEffect(() => {
    if (!over) return;
    if (result?.player === "X") {
      setScore((s) => ({ ...s, you: s.you + 1 }));
      playSuccess();
    } else if (result?.player === "O") {
      setScore((s) => ({ ...s, cpu: s.cpu + 1 }));
      playFail();
    } else {
      setScore((s) => ({ ...s, draw: s.draw + 1 }));
      playTone(440, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  function play(i: number) {
    if (board[i] || over || busy) return;
    const xCount = board.filter((c) => c === "X").length;
    const oCount = board.filter((c) => c === "O").length;
    if (xCount > oCount) return; // not your turn
    setBoard((b) => {
      const next = b.slice();
      next[i] = "X";
      return next;
    });
    playTone(523, 160, "triangle");
  }

  const status = result
    ? result.player === "X"
      ? "You win! 🎉"
      : "Computer wins 🤖"
    : full
      ? "It's a draw 🤝"
      : busy
        ? "Computer thinking…"
        : "Your turn — you're X";

  return (
    <GameShell game={game} onRestart={reset}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-4 flex gap-2 rounded-full bg-muted p-1">
          {(["Easy", "Hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                reset();
              }}
              className={
                "rounded-full px-5 py-1.5 text-sm font-600 transition-all " +
                (difficulty === d ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")
              }
            >
              {d}
            </button>
          ))}
        </div>

        <div
          className="mb-5 rounded-2xl px-5 py-2 text-center font-display text-lg font-600"
          style={{ backgroundColor: `color-mix(in oklch, ${game.accent} 14%, var(--card))`, color: game.accent }}
        >
          {status}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {board.map((cell, i) => {
            const inWin = result?.line.includes(i);
            return (
              <button
                key={i}
                onClick={() => play(i)}
                disabled={!!cell || over || busy}
                className="press grid size-24 place-items-center rounded-2xl border border-border/70 bg-muted/40 font-display text-5xl font-700 disabled:cursor-default sm:size-28"
                style={inWin ? { backgroundColor: `color-mix(in oklch, ${game.accent} 22%, var(--card))` } : undefined}
              >
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    style={{ color: cell === "X" ? "var(--sky)" : "var(--coral)" }}
                  >
                    {cell}
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex w-full justify-around text-center">
          <Tally label="You" value={score.you} color="var(--sky)" />
          <Tally label="Draws" value={score.draw} color="var(--muted-foreground)" />
          <Tally label="Computer" value={score.cpu} color="var(--coral)" />
        </div>
      </div>
    </GameShell>
  );
}

function Tally({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-700" style={{ color }}>
        {value}
      </div>
      <div className="text-xs font-500 text-muted-foreground">{label}</div>
    </div>
  );
}
