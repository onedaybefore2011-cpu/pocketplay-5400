export type Category = "Puzzle" | "Reflex" | "Word" | "Creative";

export type GameMeta = {
  id: string;
  title: string;
  pitch: string;
  category: Category;
  /** css var name for the accent color */
  accent: string;
  emoji: string;
  howto: string;
};

export const CATEGORIES: Category[] = ["Puzzle", "Reflex", "Word", "Creative"];

export const CATEGORY_ACCENT: Record<Category, string> = {
  Puzzle: "var(--sky)",
  Reflex: "var(--lime)",
  Word: "var(--coral)",
  Creative: "var(--amber)",
};

export const GAMES: GameMeta[] = [
  {
    id: "word-puzzle",
    title: "Word Puzzle",
    pitch: "Guess the 5-letter word in six tries.",
    category: "Word",
    accent: "var(--coral)",
    emoji: "🔤",
    howto: "Type any 5-letter word and hit Enter. Green = right spot, yellow = wrong spot, grey = not in the word. Crack it in 6 guesses.",
  },
  {
    id: "emoji-cipher",
    title: "Emoji Cipher",
    pitch: "Decode the movie, song or phrase from emojis.",
    category: "Word",
    accent: "var(--pink)",
    emoji: "🎬",
    howto: "A few emojis hint at a famous movie, song or phrase. Type your guess before the timer runs out. Use a hint if you're stuck.",
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    pitch: "Classic X and O — beat the computer.",
    category: "Puzzle",
    accent: "var(--sky)",
    emoji: "⭕",
    howto: "Get three in a row before the computer does. Tap an empty square to place your mark. Choose Easy or Hard.",
  },
  {
    id: "echo-pattern",
    title: "Echo Pattern",
    pitch: "Watch the colors, repeat the sequence.",
    category: "Reflex",
    accent: "var(--primary)",
    emoji: "🎵",
    howto: "Watch the pads light up with sound, then tap them back in the exact same order. Each round adds one more step.",
  },
  {
    id: "snake",
    title: "Snake",
    pitch: "Eat, grow, and don't bite your tail.",
    category: "Reflex",
    accent: "var(--lime)",
    emoji: "🐍",
    howto: "Use arrow keys, WASD, swipe, or the on-screen pad to steer. Eat food to grow. Don't hit the walls or yourself.",
  },
  {
    id: "shape-maker",
    title: "Shape Maker",
    pitch: "Draw the perfect circle, square or triangle.",
    category: "Creative",
    accent: "var(--amber)",
    emoji: "⭐",
    howto: "Pick a shape, then draw it freehand in one stroke. We score how close you got to the perfect shape — chase 100%.",
  },
  {
    id: "memory-match",
    title: "Memory Match",
    pitch: "Flip cards and find every matching pair.",
    category: "Puzzle",
    accent: "var(--primary)",
    emoji: "🧠",
    howto: "Tap two cards to flip them. If they match, they stay face up. Match all 8 pairs in as few moves as you can.",
  },
  {
    id: "reaction-time",
    title: "Reaction Time",
    pitch: "Tap the instant the screen turns green.",
    category: "Reflex",
    accent: "var(--pink)",
    emoji: "⚡",
    howto: "Tap to start, then wait. The moment the panel turns green, tap as fast as you can. Don't jump early! Lower milliseconds win.",
  },
  {
    id: "sliding-puzzle",
    title: "Sliding Puzzle",
    pitch: "Slide the tiles into order — 200 levels.",
    category: "Puzzle",
    accent: "var(--sky)",
    emoji: "🧩",
    howto: "Tap a tile next to the empty space to slide it. Arrange the numbers in order to solve each level and unlock the next. 200 levels get bigger and tougher.",
  },
];

export function getGame(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}
