import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Lightbulb, SkipForward, Send } from "lucide-react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { useBestScore } from "@/hooks/use-best-score";
import { playSuccess, playFail, playTone } from "@/lib/sound";

type Puzzle = { emojis: string; answer: string; hint: string; kind: string };

const PUZZLES: Puzzle[] = [
  // Movies
  { emojis: "🦁👑", answer: "The Lion King", hint: "Disney movie", kind: "Movie" },
  { emojis: "🕷️👦", answer: "Spider Man", hint: "Marvel superhero", kind: "Movie" },
  { emojis: "❄️👸", answer: "Frozen", hint: "Let it go…", kind: "Movie" },
  { emojis: "🐟🔍🐠", answer: "Finding Nemo", hint: "A dad searches the ocean", kind: "Movie" },
  { emojis: "🚢🧊💔", answer: "Titanic", hint: "Iceberg, right ahead", kind: "Movie" },
  { emojis: "🤖❤️🌱", answer: "Wall E", hint: "A lonely robot", kind: "Movie" },
  { emojis: "🧙⚡🤓", answer: "Harry Potter", hint: "Boy wizard", kind: "Movie" },
  { emojis: "🦖🏝️", answer: "Jurassic Park", hint: "Dinosaurs return", kind: "Movie" },
  { emojis: "👻🚫", answer: "Ghostbusters", hint: "Who you gonna call?", kind: "Movie" },
  { emojis: "🌟⭐⚔️", answer: "Star Wars", hint: "A galaxy far away", kind: "Movie" },
  { emojis: "👑💍💍💍", answer: "Lord Of The Rings", hint: "One ring to rule them all", kind: "Movie" },
  { emojis: "🐼🥋", answer: "Kung Fu Panda", hint: "A clumsy panda warrior", kind: "Movie" },
  { emojis: "🚗⚡🏁", answer: "Cars", hint: "Pixar racing movie", kind: "Movie" },
  { emojis: "🎈🏠👴", answer: "Up", hint: "A house lifted by balloons", kind: "Movie" },
  { emojis: "🐭👨‍🍳🍝", answer: "Ratatouille", hint: "A rat who cooks", kind: "Movie" },
  { emojis: "🍫🏭🎫", answer: "Charlie And The Chocolate Factory", hint: "Golden ticket", kind: "Movie" },
  { emojis: "🦇🃏🌃", answer: "The Dark Knight", hint: "Batman vs Joker", kind: "Movie" },
  { emojis: "👽📞🏠", answer: "E T", hint: "Phone home", kind: "Movie" },
  { emojis: "🐷🕸️", answer: "Charlottes Web", hint: "A spider saves a pig", kind: "Movie" },
  { emojis: "🧸👦🤠", answer: "Toy Story", hint: "Toys come alive", kind: "Movie" },
  { emojis: "🐉🏹🧑", answer: "How To Train Your Dragon", hint: "A boy befriends a dragon", kind: "Movie" },
  { emojis: "🟡👨‍👩‍👦📺", answer: "The Simpsons", hint: "Yellow cartoon family", kind: "Movie" },
  { emojis: "🐠🩹🔍", answer: "Finding Dory", hint: "A forgetful fish", kind: "Movie" },
  { emojis: "😱👻🏫", answer: "Monsters Inc", hint: "Scarers who work in a factory", kind: "Movie" },

  // Songs
  { emojis: "☔️🌈🎶", answer: "Somewhere Over The Rainbow", hint: "Classic song", kind: "Song" },
  { emojis: "👶🦈🎵", answer: "Baby Shark", hint: "Doo doo doo…", kind: "Song" },
  { emojis: "⭐⭐🌙🎵", answer: "Twinkle Twinkle Little Star", hint: "Nursery rhyme", kind: "Song" },
  { emojis: "🌧️🌧️➡️", answer: "Rain Rain Go Away", hint: "Kids' rhyme", kind: "Song" },
  { emojis: "🕷️🚿🎵", answer: "Itsy Bitsy Spider", hint: "Up the water spout", kind: "Song" },
  { emojis: "👏😀🎵", answer: "If Youre Happy And You Know It", hint: "Clap your hands", kind: "Song" },
  { emojis: "🚀👨‍🚀🎸", answer: "Rocket Man", hint: "Elton John hit", kind: "Song" },
  { emojis: "💃👑🎵", answer: "Dancing Queen", hint: "ABBA classic", kind: "Song" },

  // Phrases & sayings
  { emojis: "🎂🎉🎈", answer: "Happy Birthday", hint: "You sing it every year", kind: "Phrase" },
  { emojis: "🌍🕊️❤️", answer: "World Peace", hint: "Everyone wishes for it", kind: "Phrase" },
  { emojis: "🌧️➡️🌈", answer: "After The Rain Comes The Rainbow", hint: "Hopeful saying", kind: "Phrase" },
  { emojis: "🐦✋>🐦🐦🌳", answer: "A Bird In The Hand", hint: "…is worth two in the bush", kind: "Phrase" },
  { emojis: "🍎📅➡️👨‍⚕️🚫", answer: "An Apple A Day Keeps The Doctor Away", hint: "Health saying", kind: "Phrase" },
  { emojis: "⏰➡️💰", answer: "Time Is Money", hint: "Common saying", kind: "Phrase" },
  { emojis: "🌙🍯", answer: "Honeymoon", hint: "After the wedding", kind: "Phrase" },
  { emojis: "🐱👅🤐", answer: "Cat Got Your Tongue", hint: "Why so quiet?", kind: "Phrase" },
  { emojis: "🍰🚶", answer: "Piece Of Cake", hint: "Very easy", kind: "Phrase" },
  { emojis: "🌧️🐱🐶", answer: "Raining Cats And Dogs", hint: "Heavy rain", kind: "Phrase" },
  { emojis: "🔨🎯🧠", answer: "Hit The Nail On The Head", hint: "Exactly right", kind: "Phrase" },
  { emojis: "🧊🎂", answer: "Icing On The Cake", hint: "A bonus", kind: "Phrase" },

  // Animals
  { emojis: "🐝🍯", answer: "Honey Bee", hint: "Buzzing insect", kind: "Animal" },
  { emojis: "🐻‍❄️", answer: "Polar Bear", hint: "Lives in the Arctic", kind: "Animal" },
  { emojis: "🐴🦓⬛⬜", answer: "Zebra", hint: "Striped horse", kind: "Animal" },
  { emojis: "🦒📏", answer: "Giraffe", hint: "Tallest animal", kind: "Animal" },
  { emojis: "🐙8️⃣🦵", answer: "Octopus", hint: "Eight arms", kind: "Animal" },
  { emojis: "🦋🐛➡️", answer: "Butterfly", hint: "Was a caterpillar", kind: "Animal" },
  { emojis: "🦘👶🎒", answer: "Kangaroo", hint: "Carries baby in a pouch", kind: "Animal" },
  { emojis: "🐧🤵🧊", answer: "Penguin", hint: "Tuxedo bird", kind: "Animal" },

  // Places
  { emojis: "🐭🏰🎡", answer: "Disney Land", hint: "Theme park", kind: "Place" },
  { emojis: "🗽🍎🌆", answer: "New York", hint: "The Big Apple", kind: "Place" },
  { emojis: "🗼🥐🇫🇷", answer: "Paris", hint: "City of the Eiffel Tower", kind: "Place" },
  { emojis: "🏜️🐫🔺", answer: "Egypt", hint: "Land of the pyramids", kind: "Place" },
  { emojis: "🐨🦘🏝️", answer: "Australia", hint: "Down under", kind: "Place" },
  { emojis: "🍕🍝🏛️", answer: "Italy", hint: "Boot-shaped country", kind: "Place" },

  // Brands
  { emojis: "🍎📱💻", answer: "Apple", hint: "Tech company", kind: "Brand" },
  { emojis: "🍔🤡🍟", answer: "McDonalds", hint: "Golden arches", kind: "Brand" },
  { emojis: "👟✔️", answer: "Nike", hint: "Just do it", kind: "Brand" },
  { emojis: "🎬🍿📺", answer: "Netflix", hint: "Streaming service", kind: "Brand" },

  // Food
  { emojis: "🔥🐔", answer: "Hot Wings", hint: "Spicy snack", kind: "Food" },
  { emojis: "🥶☕", answer: "Iced Coffee", hint: "Cold drink", kind: "Food" },
  { emojis: "🍞🧈🍓", answer: "Bread And Jam", hint: "Breakfast spread", kind: "Food" },
  { emojis: "🥔🍟", answer: "French Fries", hint: "Fast food side", kind: "Food" },
  { emojis: "🍫🍪", answer: "Chocolate Chip Cookie", hint: "Sweet treat", kind: "Food" },
  { emojis: "🧀🍕", answer: "Cheese Pizza", hint: "Everyone's favorite slice", kind: "Food" },
];

const ROUND_SECONDS = 30;
/** Number of puzzles per game — a fresh random subset each time. */
const ROUND_COUNT = 12;

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Fresh random subset of puzzles for a new game. */
function drawDeck(): Puzzle[] {
  return shuffle(PUZZLES).slice(0, ROUND_COUNT);
}

export function EmojiCipher() {
  const game = getGame("emoji-cipher")!;
  const { best, submit } = useBestScore("emoji-cipher", true);
  const [deck, setDeck] = useState(() => drawDeck());
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [solved, setSolved] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<"none" | "right" | "wrong">("none");
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const puzzle = deck[index];
  const isLast = index >= deck.length - 1;

  const reset = useCallback(() => {
    setDeck(drawDeck());
    setIndex(0);
    setGuess("");
    setSolved(0);
    setTimeLeft(ROUND_SECONDS);
    setShowHint(false);
    setFeedback("none");
    setOver(false);
  }, []);

  const nextPuzzle = useCallback(() => {
    if (isLast) {
      setOver(true);
      submit(solved);
      return;
    }
    setIndex((i) => i + 1);
    setGuess("");
    setTimeLeft(ROUND_SECONDS);
    setShowHint(false);
    setFeedback("none");
    inputRef.current?.focus();
  }, [isLast, solved, submit]);

  // Countdown timer.
  useEffect(() => {
    if (over || feedback === "right") return;
    if (timeLeft <= 0) {
      setFeedback("wrong");
      playFail();
      const t = setTimeout(nextPuzzle, 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, over, feedback, nextPuzzle]);

  function checkGuess() {
    if (feedback !== "none" || over) return;
    if (!guess.trim()) return;
    if (normalize(guess) === normalize(puzzle.answer)) {
      const gained = solved + 1;
      setSolved(gained);
      setFeedback("right");
      playSuccess();
      setTimeout(() => {
        if (isLast) {
          setOver(true);
          submit(gained);
        } else {
          nextPuzzle();
        }
      }, 1200);
    } else {
      setFeedback("wrong");
      playTone(220, 250, "sawtooth");
      setTimeout(() => setFeedback("none"), 600);
    }
  }

  const timePct = useMemo(() => (timeLeft / ROUND_SECONDS) * 100, [timeLeft]);
  const timeColor = timeLeft > 10 ? "var(--lime)" : timeLeft > 5 ? "var(--amber)" : "var(--coral)";

  if (over) {
    return (
      <GameShell game={game} best={best} onRestart={reset}>
        <div className="mx-auto max-w-sm py-8 text-center">
          <div className="text-6xl">🎬</div>
          <h2 className="mt-4 font-display text-3xl font-700">Round complete!</h2>
          <p className="mt-2 text-muted-foreground">
            You cracked <span className="font-700 text-foreground">{solved}</span> of {deck.length} ciphers.
          </p>
          <button
            onClick={reset}
            className="press mt-6 rounded-full bg-primary px-7 py-3 font-display font-600 text-primary-foreground"
          >
            Play again
          </button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell game={game} best={best} onRestart={reset}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-4 flex w-full items-center justify-between text-sm font-600">
          <span className="text-muted-foreground">
            Puzzle {index + 1}/{deck.length}
          </span>
          <span style={{ color: game.accent }}>Solved: {solved}</span>
        </div>

        {/* Timer bar */}
        <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: timeColor }}
            animate={{ width: `${timePct}%` }}
            transition={{ ease: "linear", duration: 0.9 }}
          />
        </div>

        <motion.div
          key={index}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: feedback === "wrong" ? [1, 1.05, 1] : 1,
            opacity: 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="mb-2 grid min-h-32 w-full place-items-center rounded-3xl border border-border/70 bg-muted/40 text-6xl sm:text-7xl"
        >
          <span className="tracking-widest">{puzzle.emojis}</span>
        </motion.div>

        <span
          className="mb-5 rounded-full px-3 py-1 text-xs font-600"
          style={{ color: game.accent, backgroundColor: `color-mix(in oklch, ${game.accent} 15%, var(--card))` }}
        >
          {puzzle.kind} · {timeLeft}s
        </span>

        <div className="flex w-full gap-2">
          <input
            ref={inputRef}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkGuess()}
            placeholder="Type your guess…"
            disabled={feedback === "right"}
            autoFocus
            className={
              "h-12 flex-1 rounded-2xl border-2 bg-card px-4 font-500 outline-none transition-colors " +
              (feedback === "right"
                ? "border-[var(--lime)]"
                : feedback === "wrong"
                  ? "border-[var(--coral)]"
                  : "border-border focus:border-primary")
            }
          />
          <button
            onClick={checkGuess}
            className="press grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Send className="size-5" />
          </button>
        </div>

        {feedback === "right" && (
          <div className="mt-3 font-display text-lg font-700 text-[var(--lime)]">
            Correct — {puzzle.answer}! 🎉
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowHint(true)}
            disabled={showHint}
            className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-600 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            <Lightbulb className="size-4" /> Hint
          </button>
          <button
            onClick={() => {
              setFeedback("none");
              nextPuzzle();
            }}
            className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-600 text-muted-foreground transition-colors hover:text-foreground"
          >
            <SkipForward className="size-4" /> Skip
          </button>
        </div>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-muted-foreground"
          >
            💡 {puzzle.hint}
          </motion.div>
        )}
      </div>
    </GameShell>
  );
}
