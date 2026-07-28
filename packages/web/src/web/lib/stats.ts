import { GAMES } from "./games";

const PLAYS_PREFIX = "pocketplay:plays:";
const TOTAL_KEY = "pocketplay:plays:__total";
const STREAK_KEY = "pocketplay:streak";
const BEST_PREFIX = "pocketplay:best:";

function num(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

/** Record that a game was opened. Also updates the daily play streak. */
export function recordPlay(gameId: string) {
  try {
    localStorage.setItem(PLAYS_PREFIX + gameId, String(num(PLAYS_PREFIX + gameId) + 1));
    localStorage.setItem(TOTAL_KEY, String(num(TOTAL_KEY) + 1));
    bumpStreak();
    window.dispatchEvent(new Event("pocketplay:stats"));
  } catch {
    /* ignore */
  }
}

export function totalPlays(): number {
  return num(TOTAL_KEY);
}

export function playsFor(gameId: string): number {
  return num(PLAYS_PREFIX + gameId);
}

/** Number of distinct games the player has tried at least once. */
export function gamesTried(): number {
  return GAMES.filter((g) => playsFor(g.id) > 0).length;
}

export function bestScoreCount(): number {
  return GAMES.filter((g) => {
    try {
      return localStorage.getItem(BEST_PREFIX + g.id) !== null;
    } catch {
      return false;
    }
  }).length;
}

type Streak = { count: number; last: string };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readStreak(): Streak {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw) as Streak;
  } catch {
    /* ignore */
  }
  return { count: 0, last: "" };
}

function bumpStreak() {
  const s = readStreak();
  const today = todayKey();
  if (s.last === today) return; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const count = s.last === yesterday ? s.count + 1 : 1;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count, last: today }));
  } catch {
    /* ignore */
  }
}

export function currentStreak(): number {
  const s = readStreak();
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  // Streak only counts if the last play was today or yesterday.
  return s.last === today || s.last === yesterday ? s.count : 0;
}

/** Deterministic "game of the day" based on the current date. */
export function gameOfTheDay() {
  const seed = Number(todayKey().replace(/-/g, ""));
  return GAMES[seed % GAMES.length];
}

export function resetProgress() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith(PLAYS_PREFIX) ||
          k.startsWith(BEST_PREFIX) ||
          k === STREAK_KEY)
      )
        keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("pocketplay:stats"));
  } catch {
    /* ignore */
  }
}

export type Achievement = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  done: (s: StatsSnapshot) => boolean;
};

export type StatsSnapshot = {
  total: number;
  tried: number;
  bests: number;
  streak: number;
};

export function snapshot(): StatsSnapshot {
  return {
    total: totalPlays(),
    tried: gamesTried(),
    bests: bestScoreCount(),
    streak: currentStreak(),
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-play",
    emoji: "🎉",
    title: "First Steps",
    desc: "Play your very first game.",
    done: (s) => s.total >= 1,
  },
  {
    id: "explorer",
    emoji: "🧭",
    title: "Explorer",
    desc: "Try 3 different games.",
    done: (s) => s.tried >= 3,
  },
  {
    id: "collector",
    emoji: "🗂️",
    title: "Collector",
    desc: "Try every single game.",
    done: (s) => s.tried >= GAMES.length,
  },
  {
    id: "record-setter",
    emoji: "🏆",
    title: "Record Setter",
    desc: "Set a best score in 3 games.",
    done: (s) => s.bests >= 3,
  },
  {
    id: "regular",
    emoji: "🔥",
    title: "On a Roll",
    desc: "Keep a 3-day play streak.",
    done: (s) => s.streak >= 3,
  },
  {
    id: "addict",
    emoji: "💎",
    title: "Pocket Pro",
    desc: "Play 25 games in total.",
    done: (s) => s.total >= 25,
  },
];
