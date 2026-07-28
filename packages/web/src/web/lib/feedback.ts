export type Feedback = {
  id: string;
  rating: number;
  topic: string;
  message: string;
  name: string;
  createdAt: number;
};

const KEY = "pocketplay:feedback";

export const FEEDBACK_TOPICS = [
  "General",
  "A game idea",
  "Found a bug",
  "Loving it",
  "Something else",
];

export function listFeedback(): Feedback[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Feedback[]) : [];
  } catch {
    return [];
  }
}

export function addFeedback(input: Omit<Feedback, "id" | "createdAt">): Feedback {
  const entry: Feedback = {
    ...input,
    id: Math.random().toString(36).slice(2),
    createdAt: Date.now(),
  };
  try {
    const all = listFeedback();
    all.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
  } catch {
    /* ignore */
  }
  return entry;
}
