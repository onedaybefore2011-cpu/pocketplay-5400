import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { useBestScore } from "@/hooks/use-best-score";
import { playSuccess, playFail, playTone } from "@/lib/sound";

type Phase = "idle" | "waiting" | "go" | "result" | "tooSoon";

export function ReactionTime() {
  const game = getGame("reaction-time")!;
  const { best, submit } = useBestScore("reaction-time", false); // faster = better
  const [phase, setPhase] = useState<Phase>("idle");
  const [ms, setMs] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => () => clearTimer(), []);

  const arm = useCallback(() => {
    setPhase("waiting");
    setMs(null);
    const delay = 1200 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setPhase("go");
      playTone(660, 120, "sine");
    }, delay);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setPhase("idle");
    setMs(null);
    setHistory([]);
  }, []);

  const handleTap = useCallback(() => {
    if (phase === "idle" || phase === "result" || phase === "tooSoon") {
      arm();
      return;
    }
    if (phase === "waiting") {
      // tapped before green
      clearTimer();
      setPhase("tooSoon");
      playFail();
      return;
    }
    if (phase === "go") {
      const elapsed = Math.round(performance.now() - startRef.current);
      setMs(elapsed);
      setPhase("result");
      setHistory((h) => [elapsed, ...h].slice(0, 5));
      submit(elapsed);
      playSuccess();
    }
  }, [phase, arm, submit]);

  const avg =
    history.length > 0
      ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
      : null;

  const panel = (() => {
    switch (phase) {
      case "idle":
        return { bg: "var(--sky)", title: "Tap to start", sub: "Wait for green, then tap as fast as you can" };
      case "waiting":
        return { bg: "var(--coral)", title: "Wait…", sub: "Tap the moment it turns green" };
      case "go":
        return { bg: "var(--lime)", title: "TAP!", sub: "Now!" };
      case "tooSoon":
        return { bg: "var(--amber)", title: "Too soon! 😅", sub: "Tap to try again" };
      case "result":
        return { bg: "var(--sky)", title: `${ms} ms`, sub: "Tap to go again" };
    }
  })();

  return (
    <GameShell game={game} best={best} bestLabel="Best (ms)" onRestart={reset}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <motion.button
          onClick={handleTap}
          whileTap={{ scale: 0.98 }}
          className="grid aspect-[4/3] w-full place-items-center rounded-3xl text-center text-white shadow-[0_8px_0_rgba(0,0,0,0.12)] select-none"
          style={{ backgroundColor: panel.bg }}
        >
          <div>
            <div className="font-display text-4xl font-700 sm:text-5xl">{panel.title}</div>
            <div className="mt-2 px-4 text-sm font-500 text-white/85">{panel.sub}</div>
          </div>
        </motion.button>

        {history.length > 0 && (
          <div className="mt-5 flex w-full flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {history.map((h, i) => (
                <span
                  key={i}
                  className="rounded-full bg-muted px-3 py-1.5 text-sm font-600"
                  style={i === 0 ? { color: game.accent } : undefined}
                >
                  {h}ms
                </span>
              ))}
            </div>
            {avg !== null && (
              <div className="text-sm text-muted-foreground">
                Last {history.length} avg: <span className="font-700 text-foreground">{avg} ms</span>
              </div>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}
