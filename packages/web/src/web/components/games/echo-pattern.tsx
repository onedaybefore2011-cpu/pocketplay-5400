import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Play } from "lucide-react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { useBestScore } from "@/hooks/use-best-score";
import { playTone, playFail } from "@/lib/sound";

type PadId = 0 | 1 | 2 | 3;

const PADS: { color: string; active: string; freq: number }[] = [
  { color: "var(--lime)", active: "#7ee06a", freq: 329.63 }, // green - E
  { color: "var(--coral)", active: "#ff7a6b", freq: 261.63 }, // red - C
  { color: "var(--sky)", active: "#5cc6ff", freq: 392.0 }, // blue - G
  { color: "var(--amber)", active: "#ffcf5c", freq: 220.0 }, // yellow - A
];

type Phase = "idle" | "showing" | "input" | "gameover";

export function EchoPattern() {
  const game = getGame("echo-pattern")!;
  const { best, submit } = useBestScore("echo-pattern", true);
  const [sequence, setSequence] = useState<PadId[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState<PadId | null>(null);
  const [inputIdx, setInputIdx] = useState(0);
  const [round, setRound] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const flash = useCallback((pad: PadId, dur = 400) => {
    setLit(pad);
    playTone(PADS[pad].freq, dur, "sine");
    const t = setTimeout(() => setLit(null), dur);
    timers.current.push(t);
  }, []);

  const playSequence = useCallback(
    (seq: PadId[]) => {
      setPhase("showing");
      const gap = Math.max(320, 620 - seq.length * 20);
      seq.forEach((pad, i) => {
        const on = setTimeout(() => flash(pad, gap * 0.6), i * gap + 400);
        timers.current.push(on);
      });
      const done = setTimeout(() => {
        setPhase("input");
        setInputIdx(0);
      }, seq.length * gap + 500);
      timers.current.push(done);
    },
    [flash],
  );

  const nextRound = useCallback(
    (prev: PadId[]) => {
      const next = [...prev, Math.floor(Math.random() * 4) as PadId];
      setSequence(next);
      setRound(next.length);
      playSequence(next);
    },
    [playSequence],
  );

  const start = useCallback(() => {
    clearTimers();
    setSequence([]);
    setRound(0);
    setInputIdx(0);
    nextRound([]);
  }, [nextRound]);

  const reset = useCallback(() => {
    clearTimers();
    setSequence([]);
    setPhase("idle");
    setRound(0);
    setLit(null);
    setInputIdx(0);
  }, []);

  useEffect(() => () => clearTimers(), []);

  function tap(pad: PadId) {
    if (phase !== "input") return;
    flash(pad, 250);
    if (sequence[inputIdx] === pad) {
      const nextIdx = inputIdx + 1;
      if (nextIdx === sequence.length) {
        // round cleared
        setPhase("showing");
        submit(sequence.length);
        const t = setTimeout(() => nextRound(sequence), 700);
        timers.current.push(t);
      } else {
        setInputIdx(nextIdx);
      }
    } else {
      // wrong
      clearTimers();
      setPhase("gameover");
      submit(Math.max(0, sequence.length - 1));
      setTimeout(playFail, 120);
    }
  }

  return (
    <GameShell game={game} best={best} bestLabel="Best round" onRestart={reset}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-6 text-center">
          <div className="font-display text-5xl font-700" style={{ color: game.accent }}>
            {round}
          </div>
          <div className="text-sm font-500 text-muted-foreground">
            {phase === "showing"
              ? "Watch closely…"
              : phase === "input"
                ? "Your turn — repeat it!"
                : phase === "gameover"
                  ? "Round"
                  : "Round"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {PADS.map((pad, i) => {
            const isLit = lit === i;
            return (
              <motion.button
                key={i}
                onClick={() => tap(i as PadId)}
                disabled={phase !== "input"}
                animate={{ scale: isLit ? 1.05 : 1 }}
                transition={{ duration: 0.12 }}
                className="size-32 rounded-3xl shadow-[0_6px_0_rgba(0,0,0,0.12)] transition-all disabled:cursor-default sm:size-36"
                style={{
                  backgroundColor: isLit ? pad.active : pad.color,
                  opacity: isLit ? 1 : 0.82,
                  boxShadow: isLit
                    ? `0 0 40px ${pad.active}, 0 6px 0 rgba(0,0,0,0.12)`
                    : "0 6px 0 rgba(0,0,0,0.12)",
                }}
              />
            );
          })}
        </div>

        {(phase === "idle" || phase === "gameover") && (
          <div className="mt-7 text-center">
            {phase === "gameover" && (
              <div className="mb-3 font-display text-xl font-700">
                You reached round {round}! 🎯
              </div>
            )}
            <button
              onClick={start}
              className="press inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-display text-lg font-600 text-primary-foreground shadow-[0_5px_0_color-mix(in_oklch,var(--primary)_65%,black)]"
            >
              <Play className="size-5" /> {phase === "gameover" ? "Try again" : "Start"}
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
