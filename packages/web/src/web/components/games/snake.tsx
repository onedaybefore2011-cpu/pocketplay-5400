import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play } from "lucide-react";
import { getGame } from "@/lib/games";
import { GameShell } from "@/components/game-shell";
import { useBestScore } from "@/hooks/use-best-score";
import { playTone, playFail } from "@/lib/sound";

const GRID = 17;
type Pt = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";
const DIRS: Record<Dir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPP: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

function randFood(snake: Pt[]): Pt {
  while (true) {
    const f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

type State = "idle" | "playing" | "over";

export function Snake() {
  const game = getGame("snake")!;
  const { best, submit } = useBestScore("snake", true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [state, setState] = useState<State>("idle");

  // mutable game refs (avoid re-renders in the loop)
  const snake = useRef<Pt[]>([{ x: 8, y: 8 }]);
  const dir = useRef<Dir>("right");
  const queued = useRef<Dir[]>([]);
  const food = useRef<Pt>({ x: 12, y: 8 });
  const raf = useRef<number>(0);
  const lastTick = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = canvas.width;
    const cell = size / GRID;

    // background checker
    ctx.clearRect(0, 0, size, size);
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#f3f6ee" : "#eef3e6";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    // food
    const f = food.current;
    ctx.fillStyle = "#ff6f61";
    ctx.beginPath();
    ctx.arc(f.x * cell + cell / 2, f.y * cell + cell / 2, cell * 0.34, 0, Math.PI * 2);
    ctx.fill();

    // snake
    const body = snake.current;
    body.forEach((s, i) => {
      const head = i === 0;
      ctx.fillStyle = head ? "#4faf3a" : `hsl(105 45% ${52 - Math.min(i, 12)}%)`;
      const pad = cell * (head ? 0.06 : 0.12);
      const r = cell * 0.28;
      roundRect(ctx, s.x * cell + pad, s.y * cell + pad, cell - pad * 2, cell - pad * 2, r);
      ctx.fill();
      if (head) {
        // eyes
        ctx.fillStyle = "#fff";
        const ex = s.x * cell + cell / 2;
        const ey = s.y * cell + cell / 2;
        ctx.beginPath();
        ctx.arc(ex - cell * 0.14, ey - cell * 0.1, cell * 0.08, 0, Math.PI * 2);
        ctx.arc(ex + cell * 0.14, ey - cell * 0.1, cell * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  const endGame = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setState("over");
    setScore((s) => {
      submit(s);
      return s;
    });
    playFail();
  }, [submit]);

  const step = useCallback(() => {
    // apply queued direction (prevents 180° turns within one tick)
    while (queued.current.length) {
      const d = queued.current.shift()!;
      if (d !== OPP[dir.current]) {
        dir.current = d;
        break;
      }
    }
    const head = snake.current[0];
    const mv = DIRS[dir.current];
    const nx = head.x + mv.x;
    const ny = head.y + mv.y;

    // wall or self collision
    if (
      nx < 0 || ny < 0 || nx >= GRID || ny >= GRID ||
      snake.current.some((s) => s.x === nx && s.y === ny)
    ) {
      endGame();
      return;
    }

    const newHead = { x: nx, y: ny };
    const ate = nx === food.current.x && ny === food.current.y;
    const body = [newHead, ...snake.current];
    if (!ate) body.pop();
    else {
      food.current = randFood(body);
      setScore((s) => s + 1);
      playTone(660, 90, "square");
    }
    snake.current = body;
    draw();
  }, [draw, endGame]);

  // main loop
  useEffect(() => {
    if (state !== "playing") return;
    const speed = () => Math.max(75, 150 - snake.current.length * 3);
    function loop(t: number) {
      if (t - lastTick.current >= speed()) {
        lastTick.current = t;
        step();
      }
      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [state, step]);

  const turn = useCallback((d: Dir) => {
    if (queued.current[queued.current.length - 1] !== d) queued.current.push(d);
  }, []);

  const start = useCallback(() => {
    snake.current = [{ x: 8, y: 8 }];
    dir.current = "right";
    queued.current = [];
    food.current = randFood(snake.current);
    lastTick.current = 0;
    setScore(0);
    setState("playing");
    draw();
  }, [draw]);

  const reset = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setState("idle");
    setScore(0);
    snake.current = [{ x: 8, y: 8 }];
    draw();
  }, [draw]);

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Dir> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
        W: "up", S: "down", A: "left", D: "right",
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        if (state === "playing") turn(d);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, turn]);

  // initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  // swipe
  const touchStart = useRef<Pt | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!touchStart.current || state !== "playing") return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? "right" : "left");
    else turn(dy > 0 ? "down" : "up");
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  return (
    <GameShell game={game} best={best} bestLabel="Best score" onRestart={reset}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-4 font-display text-4xl font-700" style={{ color: game.accent }}>
          {score}
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={510}
            height={510}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            className="w-[min(78vw,420px)] touch-none rounded-2xl border border-border/70 shadow-inner"
          />
          {state !== "playing" && (
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-background/70 backdrop-blur-sm">
              <div className="text-center">
                {state === "over" && (
                  <div className="mb-3 font-display text-2xl font-700">
                    Game over — {score} 🍎
                  </div>
                )}
                <button
                  onClick={start}
                  className="press inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-display text-lg font-600 text-primary-foreground shadow-[0_5px_0_color-mix(in_oklch,var(--primary)_65%,black)]"
                >
                  <Play className="size-5" /> {state === "over" ? "Play again" : "Start"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* On-screen d-pad (mobile friendly) */}
        <div className="mt-6 grid w-40 grid-cols-3 grid-rows-3 gap-2 sm:hidden">
          <span />
          <DPad onClick={() => turn("up")}><ArrowUp /></DPad>
          <span />
          <DPad onClick={() => turn("left")}><ArrowLeft /></DPad>
          <span />
          <DPad onClick={() => turn("right")}><ArrowRight /></DPad>
          <span />
          <DPad onClick={() => turn("down")}><ArrowDown /></DPad>
          <span />
        </div>
        <p className="mt-4 hidden text-sm text-muted-foreground sm:block">
          Use arrow keys or WASD to steer
        </p>
      </div>
    </GameShell>
  );
}

function DPad({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="press grid size-12 place-items-center rounded-2xl bg-muted text-foreground [&_svg]:size-5"
    >
      {children}
    </button>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
