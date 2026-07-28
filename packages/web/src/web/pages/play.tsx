import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { getGame } from "@/lib/games";
import { recordPlay } from "@/lib/stats";
import { WordPuzzle } from "@/components/games/word-puzzle";
import { EmojiCipher } from "@/components/games/emoji-cipher";
import { TicTacToe } from "@/components/games/tic-tac-toe";
import { EchoPattern } from "@/components/games/echo-pattern";
import { Snake } from "@/components/games/snake";
import { ShapeMaker } from "@/components/games/shape-maker";
import { MemoryMatch } from "@/components/games/memory-match";
import { ReactionTime } from "@/components/games/reaction-time";
import { SlidingPuzzle } from "@/components/games/sliding-puzzle";

const REGISTRY: Record<string, React.ComponentType> = {
  "word-puzzle": WordPuzzle,
  "emoji-cipher": EmojiCipher,
  "tic-tac-toe": TicTacToe,
  "echo-pattern": EchoPattern,
  snake: Snake,
  "shape-maker": ShapeMaker,
  "memory-match": MemoryMatch,
  "reaction-time": ReactionTime,
  "sliding-puzzle": SlidingPuzzle,
};

export default function PlayPage() {
  const { id } = useParams<{ id: string }>();
  const game = getGame(id);
  const Comp = id ? REGISTRY[id] : undefined;

  useEffect(() => {
    if (id && REGISTRY[id]) recordPlay(id);
  }, [id]);

  if (!game || !Comp) {
    return (
      <div className="py-24 text-center">
        <div className="text-6xl">🕹️</div>
        <h1 className="mt-4 font-display text-3xl font-700">Game not found</h1>
        <p className="mt-2 text-muted-foreground">That game rolled off the table.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-600 text-primary-foreground"
        >
          Back to games
        </Link>
      </div>
    );
  }

  return <Comp />;
}
