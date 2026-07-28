import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Circle, Square, Triangle, Eraser } from "lucide-react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { useBestScore } from "@/hooks/use-best-score";
import { playSuccess, playTone } from "@/lib/sound";

type Pt = { x: number; y: number };
type ShapeKind = "circle" | "square" | "triangle";

const SHAPES: { kind: ShapeKind; label: string; sides: number; icon: typeof Circle }[] = [
  { kind: "circle", label: "Circle", sides: 0, icon: Circle },
  { kind: "square", label: "Square", sides: 4, icon: Square },
  { kind: "triangle", label: "Triangle", sides: 3, icon: Triangle },
];

// radius of a regular n-gon (apothem = 1) at a given angle
function polyRadius(theta: number, n: number): number {
  const seg = (2 * Math.PI) / n;
  let a = ((theta % seg) + seg) % seg;
  a = a - seg / 2;
  return 1 / Math.cos(a);
}

function centroid(pts: Pt[]): Pt {
  const s = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: s.x / pts.length, y: s.y / pts.length };
}

/** Score how close the drawn stroke is to the target shape, 0-100. */
function scoreShape(pts: Pt[], kind: ShapeKind): number {
  if (pts.length < 12) return 0;
  const c = centroid(pts);
  const rel = pts.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
  const radii = rel.map((p) => Math.hypot(p.x, p.y));
  const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;
  if (meanR < 8) return 0;

  // closure: how far the start is from the end, relative to size
  const closeDist = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
  const closure = Math.max(0, 1 - closeDist / (meanR * 2.2));

  if (kind === "circle") {
    // consistency of radius = roundness
    const variance =
      radii.reduce((a, r) => a + (r - meanR) ** 2, 0) / radii.length;
    const cv = Math.sqrt(variance) / meanR; // coefficient of variation
    const round = Math.max(0, 1 - cv / 0.16);
    return Math.round(Math.min(100, round * 88 + closure * 12));
  }

  // polygon: normalize drawn radii to mean 1, compare to template with rotation search
  const n = kind === "square" ? 4 : 3;
  const angles = rel.map((p) => Math.atan2(p.y, p.x));
  const normDrawn = radii.map((r) => r / meanR);
  const seg = (2 * Math.PI) / n;
  const STEPS = 72;
  let bestResidual = Infinity;
  for (let s = 0; s < STEPS; s++) {
    const phi = (seg * s) / STEPS;
    let tSum = 0;
    const tVals: number[] = new Array(angles.length);
    for (let i = 0; i < angles.length; i++) {
      const v = polyRadius(angles[i] - phi, n);
      tVals[i] = v;
      tSum += v;
    }
    const tMean = tSum / tVals.length;
    let res = 0;
    for (let i = 0; i < tVals.length; i++) {
      const tn = tVals[i] / tMean;
      res += (normDrawn[i] - tn) ** 2;
    }
    res /= tVals.length;
    if (res < bestResidual) bestResidual = res;
  }
  const fit = Math.max(0, 1 - Math.sqrt(bestResidual) / 0.42);
  return Math.round(Math.min(100, fit * 88 + closure * 12));
}

function verdict(score: number): { text: string; emoji: string } {
  if (score >= 95) return { text: "Flawless!", emoji: "🏆" };
  if (score >= 85) return { text: "Amazing!", emoji: "🌟" };
  if (score >= 70) return { text: "Pretty great", emoji: "✨" };
  if (score >= 50) return { text: "Not bad", emoji: "🙂" };
  if (score >= 25) return { text: "Keep trying", emoji: "💪" };
  return { text: "Hmm, again?", emoji: "🎨" };
}

export function ShapeMaker() {
  const game = getGame("shape-maker")!;
  const [kind, setKind] = useState<ShapeKind>("circle");
  const { best, submit } = useBestScore(`shape-maker`, true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<Pt[]>([]);
  const drawing = useRef(false);
  const [score, setScore] = useState<number | null>(null);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  // Canvas can't read CSS vars — resolve the accent to a concrete color.
  const strokeColor = () => {
    const name = game.accent.replace(/var\((--[^)]+)\)/, "$1");
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val || "#f0a020";
  };

  const clear = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.current = [];
    setScore(null);
  }, []);

  useEffect(() => {
    clear();
  }, [clear, kind]);

  function pos(e: React.PointerEvent): Pt {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function down(e: React.PointerEvent) {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    points.current = [pos(e)];
    setScore(null);
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    const p = points.current[0];
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
  }

  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const p = pos(e);
    const last = points.current[points.current.length - 1];
    if (last && Math.hypot(p.x - last.x, p.y - last.y) < 2) return;
    points.current.push(p);
    const ctx = getCtx();
    if (!ctx) return;
    ctx.strokeStyle = strokeColor();
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    const s = scoreShape(points.current, kind);
    setScore(s);
    submit(s);
    if (s >= 85) playSuccess();
    else if (s >= 50) playTone(523, 200, "triangle");
    else playTone(300, 200, "triangle");
  }

  const v = score !== null ? verdict(score) : null;

  return (
    <GameShell game={game} best={best} bestLabel="Best %" onRestart={clear}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-5 flex gap-2 rounded-full bg-muted p-1">
          {SHAPES.map((s) => {
            const Icon = s.icon;
            const active = kind === s.kind;
            return (
              <button
                key={s.kind}
                onClick={() => setKind(s.kind)}
                className={
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-600 transition-all " +
                  (active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")
                }
              >
                <Icon className="size-4" /> {s.label}
              </button>
            );
          })}
        </div>

        <p className="mb-3 text-center text-sm text-muted-foreground">
          Draw the perfect <span className="font-600 text-foreground">{kind}</span> in one stroke ✏️
        </p>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={420}
            height={420}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
            className="w-[min(80vw,380px)] touch-none rounded-3xl border-2 border-dashed border-border bg-muted/30"
            style={{ cursor: "crosshair" }}
          />
          {score !== null && v && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className="pointer-events-none absolute inset-x-0 top-3 mx-auto flex w-fit flex-col items-center rounded-2xl bg-background/90 px-5 py-2 shadow-lg backdrop-blur"
            >
              <div className="font-display text-3xl font-700" style={{ color: game.accent }}>
                {score}%
              </div>
              <div className="text-sm font-600">
                {v.emoji} {v.text}
              </div>
            </motion.div>
          )}
        </div>

        <button
          onClick={clear}
          className="press mt-5 inline-flex items-center gap-2 rounded-full bg-muted px-6 py-2.5 font-600 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Eraser className="size-4" /> Clear canvas
        </button>
      </div>
    </GameShell>
  );
}
