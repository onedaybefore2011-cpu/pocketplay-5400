import { useState } from "react";
import { motion } from "motion/react";
import { Sun, Moon, Volume2, VolumeX, User, Trash2, Check } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { resetProgress } from "@/lib/stats";
import { playSuccess } from "@/lib/sound";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)] sm:p-6">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme, sound, setSound, nickname, setNickname } = useSettings();
  const [savedName, setSavedName] = useState(nickname);
  const [confirmReset, setConfirmReset] = useState(false);
  const [didReset, setDidReset] = useState(false);

  return (
    <div className="py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-2xl"
      >
        <h1 className="font-display text-4xl font-700 tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Make Pocket Play feel like yours. Everything is saved on this device.
        </p>

        <div className="mt-8 space-y-5">
          {/* Theme */}
          <Card>
            <h2 className="font-display text-xl font-700">Theme</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a look that's easy on your eyes.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(
                [
                  { key: "light", label: "Light", icon: Sun },
                  { key: "dark", label: "Dark", icon: Moon },
                ] as const
              ).map(({ key, label, icon: Icon }) => {
                const active = theme === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={
                      "press flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 font-600 transition-all " +
                      (active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/70 bg-background text-muted-foreground hover:text-foreground")
                    }
                  >
                    <Icon className="size-5" /> {label}
                    {active && <Check className="size-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Sound */}
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-700">Sound effects</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Beeps, dings and little wins.
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !sound;
                  setSound(next);
                  if (next) playSuccess();
                }}
                aria-label="Toggle sound"
                className={
                  "press relative flex h-9 w-16 shrink-0 items-center rounded-full px-1 transition-colors " +
                  (sound ? "bg-primary" : "bg-muted")
                }
              >
                <span
                  className={
                    "grid size-7 place-items-center rounded-full bg-white text-foreground shadow transition-transform " +
                    (sound ? "translate-x-7" : "translate-x-0")
                  }
                >
                  {sound ? (
                    <Volume2 className="size-4 text-primary" />
                  ) : (
                    <VolumeX className="size-4 text-muted-foreground" />
                  )}
                </span>
              </button>
            </div>
          </Card>

          {/* Nickname */}
          <Card>
            <h2 className="font-display text-xl font-700">Player name</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll greet you on the home screen.
            </p>
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <User className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={savedName}
                  onChange={(e) => setSavedName(e.target.value.slice(0, 20))}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-border/70 bg-background py-3 pl-11 pr-3 font-500 outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => setNickname(savedName.trim())}
                className="press rounded-2xl bg-primary px-5 py-3 font-600 text-primary-foreground"
              >
                Save
              </button>
            </div>
            {nickname && (
              <p className="mt-3 text-sm text-muted-foreground">
                Saved as <span className="font-600 text-foreground">{nickname}</span>.
              </p>
            )}
          </Card>

          {/* Reset */}
          <Card>
            <h2 className="font-display text-xl font-700">Reset progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Clears your best scores, play counts and streak. This can't be undone.
            </p>
            {didReset ? (
              <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-lime/15 px-4 py-3 text-sm font-600 text-foreground">
                <Check className="size-4 text-[var(--lime)]" /> Progress cleared.
              </p>
            ) : confirmReset ? (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                    setDidReset(true);
                  }}
                  className="press rounded-2xl bg-destructive px-5 py-3 font-600 text-white"
                >
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="press rounded-2xl border border-border/70 bg-background px-5 py-3 font-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="press mt-4 inline-flex items-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-3 font-600 text-destructive"
              >
                <Trash2 className="size-4" /> Reset progress
              </button>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
