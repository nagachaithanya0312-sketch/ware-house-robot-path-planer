import { useEffect, useRef, useState } from "react";
import { congestionBand, key, type Cell, type Warehouse } from "@/lib/warehouse";

const S = 28; // cell size in svg units

export type ViewProps = {
  warehouse: Warehouse;
  congestion?: number[][] | null;
  explored?: Cell[];
  exploredCount?: number;
  /** open-set cells at the current search step — drawn as the live wavefront */
  frontier?: Cell[];
  /** cell expanded at the current step — emits the wave ripple */
  wavePulse?: Cell | null;
  path?: Cell[];
  pathProgress?: number; // 0..1 reveal of final route
  robot?: { x: number; y: number } | null;
  start?: Cell | null;
  goal?: Cell | null;
  goalLabel?: string | null;
  onPickShelf?: (label: string) => void;
  className?: string;
};


export function WarehouseView({
  warehouse,
  congestion = null,
  explored = [],
  exploredCount,
  path = [],
  pathProgress = 1,
  robot = null,
  start = null,
  goal = null,
  goalLabel = null,
  onPickShelf,
  className = "",
}: ViewProps) {
  const w = warehouse.cols * S;
  const h = warehouse.rows * S;
  const shown = exploredCount ?? explored.length;
  const exploredSlice = explored.slice(0, shown);

  const pathD = path.length
    ? path.map((c, i) => `${i === 0 ? "M" : "L"}${c.x * S + S / 2} ${c.y * S + S / 2}`).join(" ")
    : "";

  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [pathD]);

  const exploredSet = new Set(exploredSlice.map(key));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`h-auto w-full select-none ${className}`}
      role="img"
      aria-label="Warehouse grid with robot route"
    >
      <defs>
        <linearGradient id="wv-floor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-midnight)" />
          <stop offset="100%" stopColor="var(--background)" />
        </linearGradient>
        <linearGradient id="wv-route" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" />
          <stop offset="60%" stopColor="var(--electric)" />
          <stop offset="100%" stopColor="var(--violet)" />
        </linearGradient>
        <filter id="wv-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={w} height={h} fill="url(#wv-floor)" />

      {/* grid lines */}
      <g stroke="var(--color-grid)" strokeWidth="0.6">
        {Array.from({ length: warehouse.cols + 1 }).map((_, i) => (
          <line key={`v${i}`} x1={i * S} y1={0} x2={i * S} y2={h} />
        ))}
        {Array.from({ length: warehouse.rows + 1 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * S} x2={w} y2={i * S} />
        ))}
      </g>

      {/* congestion heat */}
      {congestion
        ? congestion.map((row, y) =>
            row.map((v, x) => {
              if (v < 0.08 || warehouse.blocked[y][x]) return null;
              const band = congestionBand(v);
              const fill =
                band === "HIGH" ? "var(--danger)" : band === "MEDIUM" ? "var(--warning)" : "var(--cyan)";
              return (
                <rect
                  key={`c${x}-${y}`}
                  x={x * S}
                  y={y * S}
                  width={S}
                  height={S}
                  fill={fill}
                  opacity={0.06 + v * 0.3}
                />
              );
            }),
          )
        : null}

      {/* explored nodes */}
      {exploredSlice.map((c) => (
        <rect
          key={`e${c.x}-${c.y}`}
          x={c.x * S + S * 0.3}
          y={c.y * S + S * 0.3}
          width={S * 0.4}
          height={S * 0.4}
          rx="1"
          fill="var(--indigo)"
          opacity="0.5"
        />
      ))}

      {/* shelves */}
      {warehouse.shelves.map((s) => {
        const top = s.cells[0];
        const isGoal = goalLabel === s.label;
        return (
          <g
            key={s.label}
            onClick={onPickShelf ? () => onPickShelf(s.label) : undefined}
            className={onPickShelf ? "cursor-none" : undefined}
            data-cursor-hot={onPickShelf ? "" : undefined}
          >
            <rect
              x={top.x * S + 1.5}
              y={top.y * S + 1.5}
              width={S - 3}
              height={S * 2 - 3}
              rx="2"
              fill={isGoal ? "var(--color-deepblue)" : "var(--color-shelf)"}
              stroke={isGoal ? "var(--success)" : "var(--cyan)"}
              strokeOpacity={isGoal ? 0.95 : 0.22}
              strokeWidth={isGoal ? 1.6 : 0.8}
            />
            <line
              x1={top.x * S + 4}
              y1={top.y * S + S}
              x2={top.x * S + S - 4}
              y2={top.y * S + S}
              stroke="var(--cyan)"
              strokeOpacity="0.18"
            />
            <text
              x={top.x * S + S / 2}
              y={top.y * S + S + 3.2}
              textAnchor="middle"
              fontSize="7"
              fontFamily="var(--font-mono)"
              fill={isGoal ? "var(--success)" : "var(--muted-foreground)"}
            >
              {s.label}
            </text>
          </g>
        );
      })}

      {/* standalone obstacles */}
      {warehouse.blocked.map((row, y) =>
        row.map((b, x) => {
          if (!b || warehouse.shelfByCell.has(key({ x, y }))) return null;
          return (
            <rect
              key={`o${x}-${y}`}
              x={x * S + 4}
              y={y * S + 4}
              width={S - 8}
              height={S - 8}
              fill="var(--danger)"
              opacity="0.35"
              stroke="var(--danger)"
              strokeOpacity="0.6"
            />
          );
        }),
      )}

      {/* final route */}
      {pathD ? (
        <>
          <path d={pathD} fill="none" stroke="var(--cyan)" strokeOpacity="0.15" strokeWidth="7" />
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="url(#wv-route)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wv-glow)"
            strokeDasharray={len || undefined}
            strokeDashoffset={len ? len * (1 - pathProgress) : undefined}
            style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
          />
          {path.map((c, i) =>
            i % 2 === 0 ? (
              <circle
                key={`p${i}`}
                cx={c.x * S + S / 2}
                cy={c.y * S + S / 2}
                r="1.9"
                fill="var(--foreground)"
                opacity={exploredSet.size ? 0.7 : 0.5}
              />
            ) : null,
          )}
        </>
      ) : null}

      {/* start marker */}
      {start ? (
        <g>
          <circle
            cx={start.x * S + S / 2}
            cy={start.y * S + S / 2}
            r={S * 0.4}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.4"
          />
          <text
            x={start.x * S + S / 2}
            y={start.y * S + S / 2 + 3}
            textAnchor="middle"
            fontSize="7.5"
            fontFamily="var(--font-mono)"
            fill="var(--cyan)"
          >
            S
          </text>
        </g>
      ) : null}

      {/* goal marker */}
      {goal ? (
        <g>
          <circle
            cx={goal.x * S + S / 2}
            cy={goal.y * S + S / 2}
            r={S * 0.42}
            fill="none"
            stroke="var(--success)"
            strokeWidth="1.6"
            className="animate-pulse-soft"
          />
          <text
            x={goal.x * S + S / 2}
            y={goal.y * S + S / 2 + 3}
            textAnchor="middle"
            fontSize="7.5"
            fontFamily="var(--font-mono)"
            fill="var(--success)"
          >
            G
          </text>
        </g>
      ) : null}

      {/* robot */}
      {robot ? <RobotSprite x={robot.x * S + S / 2} y={robot.y * S + S / 2} /> : null}
    </svg>
  );
}

export function RobotSprite({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r="15" fill="var(--cyan)" opacity="0.12" />
      <rect x="-9" y="-8" width="18" height="16" rx="3" fill="var(--color-deepblue)" stroke="var(--cyan)" strokeWidth="1.3" />
      <rect x="-5.5" y="-4.5" width="4" height="4" fill="var(--cyan)" />
      <rect x="1.5" y="-4.5" width="4" height="4" fill="var(--violet)" />
      <rect x="-6" y="2.5" width="12" height="2.4" rx="1" fill="var(--cyan)" opacity="0.7" />
      <rect x="-10.5" y="-5" width="2" height="10" rx="1" fill="var(--color-shelf)" stroke="var(--cyan)" strokeOpacity="0.4" strokeWidth="0.6" />
      <rect x="8.5" y="-5" width="2" height="10" rx="1" fill="var(--color-shelf)" stroke="var(--cyan)" strokeOpacity="0.4" strokeWidth="0.6" />
      <path d="M0 -8v-4" stroke="var(--cyan)" strokeWidth="1" />
      <circle cx="0" cy="-13" r="1.6" fill="var(--cyan)" className="animate-pulse-soft" />
    </g>
  );
}

/**
 * Smoothly walks a robot along grid nodes with easing at both ends.
 * Returns the interpolated position and the arrival flag — never teleports.
 */
export function useRobotWalk(path: Cell[], running: boolean, speed = 4.2) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    if (!path.length) {
      setPos(null);
      setArrived(false);
      return;
    }
    setPos({ x: path[0].x, y: path[0].y });
    setArrived(false);
    if (!running || path.length < 2) return;

    let raf = 0;
    let t0 = 0;
    const total = (path.length - 1) / speed; // seconds
    const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const u = Math.min(1, (ts - t0) / (total * 1000));
      const d = ease(u) * (path.length - 1);
      const i = Math.min(path.length - 2, Math.floor(d));
      const f = d - i;
      const a = path[i];
      const b = path[i + 1];
      setPos({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
      if (u < 1) raf = requestAnimationFrame(tick);
      else setArrived(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [path, running, speed]);

  return { pos, arrived };
}
