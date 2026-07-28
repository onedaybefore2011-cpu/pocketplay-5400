import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "motion/react";
import { Shuffle, Sparkles, Flame, Gamepad2, Trophy, Star, Lock } from "lucide-react";
import { GAMES, CATEGORIES, type Category } from "@/lib/games";
import { GameCard } from "@/components/game-card";
import { useSettings } from "@/hooks/use-settings";
import { useStats } from "@/hooks/use-stats";
import { gameOfTheDay, ACHIEVEMENTS } from "@/lib/stats";

type Filter = "All" | Category;
const FILTERS: Filter[] = ["All", ...CATEGORIES];

function StatsStrip() {
  const stats = useStats();
  const unlocked = ACHIEVEMENTS.filter((a) => a.done(stats)).length;
  const items = [
    { icon: Gamepad2, label: "Games played", value: stats.total, color: "var(--sky)" },
    { icon: Flame, label: "Day streak", value: stats.streak, color: "var(--coral)" },
    { icon: Trophy, label: "Best scores", value: stats.bests, color: "var(--amber)" },
    { icon: Star, label: "Badges", value: `${unlocked}/${ACHIEVEMENTS.length}`, color: "var(--primary)" },
  ];
  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-border/70 bg-card p-4 text-center"
        >
          <it.icon className="mx-auto size-5" style={{ color: it.color }} />
          <div className="mt-2 font-display text-2xl font-700 leading-none">{it.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function GameOfTheDay() {
  const game = gameOfTheDay();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mt-8 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)]"
    >
      <div className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:p-7">
        <span
          className="grid size-20 shrink-0 place-items-center rounded-3xl text-5xl shadow-[0_6px_0_rgba(0,0,0,0.08)]"
          style={{ backgroundColor: `color-mix(in oklch, ${game.accent} 22%, var(--card))` }}
        >
          {game.emoji}
        </span>
        <div className="flex-1 text-center sm:text-left">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-700"
            style={{
              color: game.accent,
              backgroundColor: `color-mix(in oklch, ${game.accent} 16%, var(--card))`,
            }}
          >
            <Sparkles className="size-3.5" /> Game of the day
          </span>
          <h3 className="mt-2 font-display text-2xl font-700">{game.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{game.pitch}</p>
        </div>
        <Link
          to={`/play/${game.id}`}
          className="press rounded-full bg-primary px-7 py-3.5 font-display text-lg font-600 text-primary-foreground shadow-[0_5px_0_color-mix(in_oklch,var(--primary)_65%,black)]"
        >
          Play now
        </Link>
      </div>
    </motion.div>
  );
}

function Achievements() {
  const stats = useStats();
  return (
    <section className="mt-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-700">Achievements</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Little goals to chase while you play.
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const done = a.done(stats);
          return (
            <div
              key={a.id}
              className={
                "flex items-center gap-3 rounded-2xl border p-4 transition-all " +
                (done
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/70 bg-card opacity-70")
              }
            >
              <span
                className={
                  "grid size-12 shrink-0 place-items-center rounded-2xl text-2xl " +
                  (done ? "bg-primary/15" : "bg-muted")
                }
              >
                {done ? a.emoji : <Lock className="size-5 text-muted-foreground" />}
              </span>
              <div>
                <div className="font-display text-base font-700 leading-tight">{a.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Index() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<Filter>("All");
  const { nickname } = useSettings();

  const visible = useMemo(
    () => (filter === "All" ? GAMES : GAMES.filter((g) => g.category === filter)),
    [filter],
  );

  function surpriseMe() {
    const pick = GAMES[Math.floor(Math.random() * GAMES.length)];
    navigate(`/play/${pick.id}`);
  }

  return (
    <div className="py-10 sm:py-16">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-sm font-500 text-muted-foreground">
          <Sparkles className="size-4 text-primary" /> {GAMES.length} little games. Zero setup.
        </span>
        <h1 className="mt-5 font-display text-5xl font-700 leading-[1.05] tracking-tight sm:text-6xl">
          {nickname ? (
            <>
              Hey {nickname}, <span className="text-primary">let's play.</span>
            </>
          ) : (
            <>
              Take a <span className="text-primary">quick break.</span>
            </>
          )}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          Bite-sized games for every age. Pick one, or let us surprise you — no
          logins, no downloads, just play.
        </p>

        <button
          onClick={surpriseMe}
          className="press mt-7 inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-4 font-display text-lg font-600 text-primary-foreground shadow-[0_6px_0_color-mix(in_oklch,var(--primary)_65%,black)]"
        >
          <Shuffle className="size-5" /> Surprise me
        </button>

        <StatsStrip />
      </motion.section>

      <GameOfTheDay />

      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="no-scrollbar mx-auto mt-14 flex max-w-full items-center justify-start gap-2 overflow-x-auto sm:justify-center"
      >
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "shrink-0 rounded-full px-5 py-2.5 text-sm font-600 transition-all " +
                (active
                  ? "bg-foreground text-background shadow-[0_4px_0_rgba(0,0,0,0.15)]"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/70")
              }
            >
              {f}
            </button>
          );
        })}
      </motion.div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((game, i) => (
          <GameCard key={game.id} game={game} index={i} />
        ))}
      </div>

      <Achievements />

      {/* Feedback CTA */}
      <section className="mt-16 rounded-3xl border border-border/70 bg-gradient-to-br from-[var(--pink)]/10 to-[var(--sky)]/10 p-8 text-center">
        <h2 className="font-display text-2xl font-700">Got a game idea?</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">
          We build what players ask for. Tell us what you'd love to play next.
        </p>
        <Link
          to="/feedback"
          className="press mt-5 inline-block rounded-full bg-foreground px-7 py-3.5 font-600 text-background"
        >
          Share feedback
        </Link>
      </section>
    </div>
  );
}

export default Index;
