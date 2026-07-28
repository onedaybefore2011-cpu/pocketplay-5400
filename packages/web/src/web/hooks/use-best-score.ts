import { useCallback, useEffect, useState } from "react";

const PREFIX = "pocketplay:best:";

/**
 * Persist a per-game best score in localStorage.
 * `higherIsBetter` decides whether a larger or smaller value wins.
 */
export function useBestScore(gameId: string, higherIsBetter = true) {
  const key = PREFIX + gameId;
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      setBest(raw === null ? null : Number(raw));
    } catch {
      setBest(null);
    }
  }, [key]);

  const submit = useCallback(
    (score: number) => {
      setBest((prev) => {
        const isBetter =
          prev === null || (higherIsBetter ? score > prev : score < prev);
        if (!isBetter) return prev;
        try {
          localStorage.setItem(key, String(score));
        } catch {
          /* ignore */
        }
        return score;
      });
    },
    [key, higherIsBetter],
  );

  return { best, submit };
}
