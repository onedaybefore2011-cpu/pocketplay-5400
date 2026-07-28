import { Link } from "wouter";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { GameMeta } from "@/lib/games";

export function GameCard({ game, index }: { game: GameMeta; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/play/${game.id}`}
        className="press group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.4)]"
      >
        <div
          className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-70"
          style={{ backgroundColor: game.accent }}
        />
        <div
          className="mb-5 grid size-16 place-items-center rounded-3xl text-4xl shadow-[0_5px_0_rgba(0,0,0,0.07)]"
          style={{ backgroundColor: `color-mix(in oklch, ${game.accent} 22%, var(--card))` }}
        >
          {game.emoji}
        </div>

        <span
          className="mb-2 inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-600"
          style={{
            color: game.accent,
            backgroundColor: `color-mix(in oklch, ${game.accent} 16%, var(--card))`,
          }}
        >
          {game.category}
        </span>

        <h3 className="font-display text-2xl font-600 leading-tight">{game.title}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {game.pitch}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-600" style={{ color: game.accent }}>
          Play now
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}
