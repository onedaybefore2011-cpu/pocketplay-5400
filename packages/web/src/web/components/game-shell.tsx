import { Link } from "wouter";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import type { GameMeta } from "@/lib/games";

export function GameShell({
  game,
  best,
  bestLabel,
  onRestart,
  children,
}: {
  game: GameMeta;
  best?: number | null;
  bestLabel?: string;
  onRestart?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="py-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-500 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to games
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-14 place-items-center rounded-3xl text-3xl shadow-[0_5px_0_rgba(0,0,0,0.08)]"
            style={{ backgroundColor: `color-mix(in oklch, ${game.accent} 22%, var(--card))` }}
          >
            {game.emoji}
          </span>
          <div>
            <h1 className="font-display text-3xl font-700 leading-none">{game.title}</h1>
            <span
              className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-600"
              style={{
                color: game.accent,
                backgroundColor: `color-mix(in oklch, ${game.accent} 16%, var(--card))`,
              }}
            >
              {game.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {best !== undefined && best !== null && (
            <div
              className="flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-600"
              style={{
                color: game.accent,
                backgroundColor: `color-mix(in oklch, ${game.accent} 14%, var(--card))`,
              }}
            >
              <Trophy className="size-4" />
              {bestLabel ?? "Best"}: {best}
            </div>
          )}
          {onRestart && (
            <button
              onClick={onRestart}
              className="press flex items-center gap-1.5 rounded-2xl bg-foreground px-4 py-2 text-sm font-600 text-background shadow-[0_4px_0_rgba(0,0,0,0.15)]"
            >
              <RotateCcw className="size-4" /> Restart
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] sm:p-8">
        {children}
      </div>

      <div className="mx-auto mt-5 max-w-2xl rounded-3xl bg-muted/60 p-5 text-center text-sm leading-relaxed text-muted-foreground">
        <span className="font-600 text-foreground">How to play — </span>
        {game.howto}
      </div>
    </div>
  );
}
