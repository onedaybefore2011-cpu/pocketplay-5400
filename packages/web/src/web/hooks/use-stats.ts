import { useEffect, useState } from "react";
import { snapshot, type StatsSnapshot } from "@/lib/stats";

/** Live stats snapshot that refreshes on mount and when progress changes. */
export function useStats(): StatsSnapshot {
  const [stats, setStats] = useState<StatsSnapshot>(() => ({
    total: 0,
    tried: 0,
    bests: 0,
    streak: 0,
  }));

  useEffect(() => {
    const refresh = () => setStats(snapshot());
    refresh();
    window.addEventListener("pocketplay:stats", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("pocketplay:stats", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return stats;
}
