import { Link, useLocation } from "wouter";
import { Gamepad2, Moon, Sun, Settings, MessageSquareHeart } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

function ThemeToggle() {
  const { theme, toggleTheme } = useSettings();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light mode" : "Dark mode"}
      className="press grid size-10 place-items-center rounded-full border border-border/70 bg-card text-foreground transition-colors hover:bg-muted"
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [loc] = useLocation();
  const navItem = (to: string, label: string, active: boolean) => (
    <Link
      to={to}
      className={
        "rounded-full px-4 py-2 text-sm font-500 transition-colors " +
        (active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground")
      }
    >
      {label}
    </Link>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* background gradient-mesh blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[var(--pink)] opacity-20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-[var(--sky)] opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-[var(--lime)] opacity-20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-xl font-700 tracking-tight"
          >
            <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_0_rgba(0,0,0,0.1)]">
              <Gamepad2 className="size-5" />
            </span>
            <span>
              Pocket<span className="text-primary">Play</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <span className="hidden sm:flex items-center gap-1">
              {navItem("/", "Games", loc === "/")}
              {navItem("/feedback", "Feedback", loc === "/feedback")}
            </span>
            <Link
              to="/feedback"
              aria-label="Feedback"
              className="sm:hidden press grid size-10 place-items-center rounded-full border border-border/70 bg-card text-foreground hover:bg-muted"
            >
              <MessageSquareHeart className="size-5" />
            </Link>
            <Link
              to="/settings"
              aria-label="Settings"
              className="press grid size-10 place-items-center rounded-full border border-border/70 bg-card text-foreground transition-colors hover:bg-muted"
            >
              <Settings className="size-5" />
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 pb-20">{children}</main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-5">
          <Link to="/" className="hover:text-foreground">
            Games
          </Link>
          <Link to="/settings" className="hover:text-foreground">
            Settings
          </Link>
          <Link to="/feedback" className="hover:text-foreground">
            Feedback
          </Link>
        </div>
        <p className="mt-3">Made for quick breaks. Play a little, feel a lot. · Pocket Play</p>
      </footer>
    </div>
  );
}
