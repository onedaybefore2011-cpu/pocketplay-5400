import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setSoundEnabled } from "@/lib/sound";

export type Theme = "light" | "dark";

type Settings = {
  theme: Theme;
  sound: boolean;
  nickname: string;
};

const KEY = "pocketplay:settings";

const DEFAULTS: Settings = {
  theme: "light",
  sound: true,
  nickname: "",
};

function load(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Respect the OS preference on first visit.
      const prefersDark =
        window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      return { ...DEFAULTS, theme: prefersDark ? "dark" : "light" };
    }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

type Ctx = Settings & {
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setSound: (v: boolean) => void;
  setNickname: (n: string) => void;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  // Apply theme class + persist whenever settings change.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    setSoundEnabled(settings.sound);
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const setTheme = useCallback((theme: Theme) => setSettings((s) => ({ ...s, theme })), []);
  const toggleTheme = useCallback(
    () => setSettings((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    [],
  );
  const setSound = useCallback((sound: boolean) => setSettings((s) => ({ ...s, sound })), []);
  const setNickname = useCallback(
    (nickname: string) => setSettings((s) => ({ ...s, nickname })),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({ ...settings, setTheme, toggleTheme, setSound, setNickname }),
    [settings, setTheme, toggleTheme, setSound, setNickname],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
