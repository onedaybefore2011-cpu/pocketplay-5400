let ctx: AudioContext | null = null;

// Global mute flag, driven by the settings store. Initialised from storage so
// the very first sound respects the saved preference before React mounts.
let enabled = true;
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem("pocketplay:settings");
    if (raw) {
      const parsed = JSON.parse(raw) as { sound?: boolean };
      if (typeof parsed.sound === "boolean") enabled = parsed.sound;
    }
  } catch {
    /* ignore */
  }
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Play a short tone. Used for Echo Pattern pads and simple feedback. */
export function playTone(freq: number, durationMs = 300, type: OscillatorType = "sine") {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = c.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}

export function playSuccess() {
  [523.25, 659.25, 783.99].forEach((f, i) =>
    setTimeout(() => playTone(f, 220, "triangle"), i * 110),
  );
}

export function playFail() {
  playTone(196, 400, "sawtooth");
}
