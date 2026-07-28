import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Delete, CornerDownLeft, Lightbulb } from "lucide-react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { useBestScore } from "@/hooks/use-best-score";
import { playSuccess, playFail, playTone } from "@/lib/sound";

type WordEntry = { word: string; hint: string };

const WORDS: WordEntry[] = [
  { word: "APPLE", hint: "A crunchy red or green fruit" },
  { word: "BEACH", hint: "Sandy shore by the sea" },
  { word: "CHAIR", hint: "You sit on it" },
  { word: "DANCE", hint: "Move to the music" },
  { word: "EAGLE", hint: "A large bird of prey" },
  { word: "FLAME", hint: "The visible part of a fire" },
  { word: "GRAPE", hint: "Small fruit that makes wine" },
  { word: "HONEY", hint: "Sweet stuff made by bees" },
  { word: "IGLOO", hint: "A house made of ice blocks" },
  { word: "JELLY", hint: "Wobbly sweet dessert" },
  { word: "KOALA", hint: "Sleepy Australian tree animal" },
  { word: "LEMON", hint: "A sour yellow citrus fruit" },
  { word: "MANGO", hint: "The king of tropical fruits" },
  { word: "NIGHT", hint: "The opposite of day" },
  { word: "OCEAN", hint: "A vast body of salt water" },
  { word: "PIANO", hint: "Instrument with black & white keys" },
  { word: "QUILT", hint: "A cozy padded bed cover" },
  { word: "RIVER", hint: "Water flowing to the sea" },
  { word: "SMILE", hint: "What a happy face does" },
  { word: "TIGER", hint: "A big striped cat" },
  { word: "UNITY", hint: "Being joined as one" },
  { word: "VOICE", hint: "The sound you speak with" },
  { word: "WATER", hint: "You drink it every day" },
  { word: "YACHT", hint: "A fancy sailing boat" },
  { word: "ZEBRA", hint: "A striped African animal" },
  { word: "BRAVE", hint: "Showing no fear" },
  { word: "CLOUD", hint: "Fluffy white thing in the sky" },
  { word: "DREAM", hint: "A story your mind tells while asleep" },
  { word: "EARTH", hint: "The planet we live on" },
  { word: "FRESH", hint: "Newly made or picked" },
  { word: "GLOWS", hint: "Gives off a soft light" },
  { word: "HEART", hint: "It beats in your chest" },
  { word: "LIGHT", hint: "The opposite of dark" },
  { word: "MUSIC", hint: "Sounds arranged to enjoy" },
  { word: "PEACE", hint: "Calm and no conflict" },
  { word: "SHINE", hint: "To give off bright light" },
  { word: "SWEET", hint: "Tastes like sugar" },
  { word: "TRUST", hint: "Firm belief in someone" },
  { word: "WORLD", hint: "Everywhere and everyone" },
  { word: "YOUTH", hint: "The time of being young" },
  { word: "PLANT", hint: "It grows in soil" },
  { word: "SUGAR", hint: "Makes things sweet" },
  { word: "TABLE", hint: "You eat your meals on it" },
  { word: "MONEY", hint: "You spend it to buy things" },
  { word: "HAPPY", hint: "Feeling full of joy" },
  { word: "LUCKY", hint: "Having good fortune" },
  { word: "MAGIC", hint: "Tricks and wonder" },
  { word: "PIXEL", hint: "A tiny dot on a screen" },
];

function randomWord(): WordEntry {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

const ROWS = 6;
const COLS = 5;

type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

function scoreGuess(guess: string, answer: string): LetterState[] {
  const res: LetterState[] = Array(COLS).fill("absent");
  const answerArr = answer.split("");
  const used = Array(COLS).fill(false);
  // first pass: correct
  for (let i = 0; i < COLS; i++) {
    if (guess[i] === answerArr[i]) {
      res[i] = "correct";
      used[i] = true;
    }
  }
  // second pass: present
  for (let i = 0; i < COLS; i++) {
    if (res[i] === "correct") continue;
    const idx = answerArr.findIndex((ch, j) => ch === guess[i] && !used[j]);
    if (idx >= 0) {
      res[i] = "present";
      used[idx] = true;
    }
  }
  return res;
}

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const STATE_STYLE: Record<LetterState, string> = {
  correct: "bg-[var(--lime)] text-white border-transparent",
  present: "bg-[var(--amber)] text-white border-transparent",
  absent: "bg-muted-foreground/70 text-white border-transparent",
  empty: "bg-card border-border",
  tbd: "bg-card border-foreground/30",
};

export function WordPuzzle() {
  const game = getGame("word-puzzle")!;
  const { best, submit } = useBestScore("word-puzzle", false); // fewer guesses = better
  const [entry, setEntry] = useState<WordEntry>(() => randomWord());
  const answer = entry.word;
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [showHint, setShowHint] = useState(false);

  const reset = useCallback(() => {
    setEntry(randomWord());
    setGuesses([]);
    setCurrent("");
    setStatus("playing");
    setMessage("");
    setShowHint(false);
  }, []);

  // Per-key coloring for the keyboard.
  const keyStates = useMemo(() => {
    const map: Record<string, LetterState> = {};
    const rank: Record<LetterState, number> = { absent: 1, present: 2, correct: 3, empty: 0, tbd: 0 };
    for (const g of guesses) {
      const s = scoreGuess(g, answer);
      for (let i = 0; i < COLS; i++) {
        const prev = map[g[i]];
        if (!prev || rank[s[i]] > rank[prev]) map[g[i]] = s[i];
      }
    }
    return map;
  }, [guesses, answer]);

  const commit = useCallback(() => {
    if (status !== "playing") return;
    if (current.length !== COLS) {
      setMessage("Need 5 letters");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      playFail();
      return;
    }
    const next = [...guesses, current];
    setGuesses(next);
    setCurrent("");
    setMessage("");
    if (current === answer) {
      setStatus("won");
      submit(next.length);
      playSuccess();
    } else if (next.length >= ROWS) {
      setStatus("lost");
      playFail();
    } else {
      playTone(440, 120, "triangle");
    }
  }, [current, guesses, answer, status, submit]);

  const press = useCallback(
    (key: string) => {
      if (status !== "playing") return;
      if (key === "ENTER") return commit();
      if (key === "DEL") return setCurrent((c) => c.slice(0, -1));
      if (/^[A-Z]$/.test(key) && current.length < COLS) setCurrent((c) => c + key);
    },
    [commit, current.length, status],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") press("ENTER");
      else if (e.key === "Backspace") press("DEL");
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <GameShell game={game} best={best} bestLabel="Best (guesses)" onRestart={reset}>
      <div className="mx-auto flex max-w-sm flex-col items-center">
        {message && (
          <div className="mb-3 rounded-full bg-foreground px-4 py-1.5 text-sm font-600 text-background">
            {message}
          </div>
        )}

        <div className="grid gap-1.5">
          {Array.from({ length: ROWS }).map((_, r) => {
            const guessed = r < guesses.length;
            const isCurrent = r === guesses.length && status === "playing";
            const letters = guessed ? guesses[r] : isCurrent ? current : "";
            const states = guessed ? scoreGuess(guesses[r], answer) : null;
            return (
              <motion.div
                key={r}
                className="grid grid-cols-5 gap-1.5"
                animate={isCurrent && shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {Array.from({ length: COLS }).map((_, c) => {
                  const ch = letters[c] ?? "";
                  const st: LetterState = states
                    ? states[c]
                    : ch
                      ? "tbd"
                      : "empty";
                  return (
                    <motion.div
                      key={c}
                      initial={false}
                      animate={states ? { rotateX: [0, 90, 0] } : {}}
                      transition={{ delay: c * 0.12, duration: 0.4 }}
                      className={
                        "grid size-14 place-items-center rounded-xl border-2 font-display text-2xl font-700 uppercase " +
                        STATE_STYLE[st]
                      }
                    >
                      {ch}
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        {status === "playing" && (
          <div className="mt-4 flex flex-col items-center">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-600 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Lightbulb className="size-4" /> Need a hint?
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-600"
                style={{
                  color: game.accent,
                  backgroundColor: `color-mix(in oklch, ${game.accent} 14%, var(--card))`,
                }}
              >
                <Lightbulb className="size-4" /> {entry.hint}
              </motion.div>
            )}
          </div>
        )}

        {status !== "playing" && (
          <div className="mt-5 text-center">
            <div className="font-display text-2xl font-700">
              {status === "won" ? "Nice! 🎉" : "So close!"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              The word was <span className="font-700 text-foreground">{answer}</span>
            </div>
            <button
              onClick={reset}
              className="press mt-4 rounded-full bg-primary px-6 py-2.5 font-600 text-primary-foreground"
            >
              Play again
            </button>
          </div>
        )}

        {/* On-screen keyboard */}
        <div className="mt-6 flex w-full flex-col items-center gap-1.5">
          {KEYS.map((row, i) => (
            <div key={i} className="flex gap-1.5">
              {i === 2 && (
                <KeyBtn onClick={() => press("ENTER")} wide>
                  <CornerDownLeft className="size-4" />
                </KeyBtn>
              )}
              {row.split("").map((k) => (
                <KeyBtn key={k} onClick={() => press(k)} state={keyStates[k]}>
                  {k}
                </KeyBtn>
              ))}
              {i === 2 && (
                <KeyBtn onClick={() => press("DEL")} wide>
                  <Delete className="size-4" />
                </KeyBtn>
              )}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}

function KeyBtn({
  children,
  onClick,
  state,
  wide,
}: {
  children: React.ReactNode;
  onClick: () => void;
  state?: LetterState;
  wide?: boolean;
}) {
  const bg =
    state === "correct"
      ? "bg-[var(--lime)] text-white"
      : state === "present"
        ? "bg-[var(--amber)] text-white"
        : state === "absent"
          ? "bg-muted-foreground/60 text-white"
          : "bg-muted text-foreground";
  return (
    <button
      onClick={onClick}
      className={
        "press grid h-12 place-items-center rounded-lg font-600 " +
        (wide ? "px-3" : "w-8 sm:w-9") +
        " " +
        bg
      }
    >
      {children}
    </button>
  );
}
