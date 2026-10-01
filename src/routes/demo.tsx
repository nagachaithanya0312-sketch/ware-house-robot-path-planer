import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsRight, Pause, Play, RotateCcw, Waves } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { WarehouseView, useRobotWalk } from "@/components/WarehouseView";
import {
  aStarTrace,
  buildWarehouse,
  predictCongestion,
  shelfByLabel,
  type Cell,
  type CongestionLevel,
} from "@/lib/warehouse";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Search Wave — Warehouse Robot Path Planner" },
      {
        name: "description",
        content:
          "Watch the A* search wavefront expand cell by cell across the warehouse grid, then follow the robot along the lowest-cost route.",
      },
      { property: "og:title", content: "Live A* Search Wave Demo" },
      {
        property: "og:description",
        content:
          "Step or play the expanding search wave, change congestion, and pick any shelf as the target.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

const LEVELS: CongestionLevel[] = ["LOW", "MEDIUM", "HIGH"];
const SPEEDS = [
  { label: "0.5x", ms: 220 },
  { label: "1x", ms: 110 },
  { label: "2x", ms: 55 },
  { label: "4x", ms: 24 },
];

function DemoPage() {
  const warehouse = useMemo(() => buildWarehouse(), []);
  const [level, setLevel] = useState<CongestionLevel>("MEDIUM");
  const [target, setTarget] = useState("C9");
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [step, setStep] = useState(0);

  const congestion = useMemo(() => predictCongestion(warehouse, level, 23), [warehouse, level]);
  const start: Cell = { x: 1, y: 1 };
  const goal = shelfByLabel(warehouse, target)?.access ?? { x: 20, y: 7 };

  const trace = useMemo(
    () => aStarTrace(warehouse, start, goal, congestion),
    [warehouse, congestion, goal.x, goal.y],
  );

  const total = trace.frames.length;
  const done = step >= total;
  const frame = done ? null : trace.frames[step];

  // reset the wave whenever the scenario changes
  useEffect(() => {
    setStep(0);
    setPlaying(true);
  }, [trace]);

  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!playing || done) return;
    timer.current = window.setInterval(
      () => setStep((s) => Math.min(total, s + 1)),
      SPEEDS[speed]!.ms,
    );
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, done, speed, total]);

  const path = done ? trace.result.path : [];
  const { pos, arrived } = useRobotWalk(path, done, 4);

  const exploredCount = done ? trace.result.explored.length : step + 1;
  const progress = total ? Math.min(1, (step + 1) / total) : 0;

  const stats = [
    { k: "WAVE STEP", v: `${Math.min(step + 1, total)} / ${total}`, tone: "text-cyan" },
    { k: "NODES SETTLED", v: String(exploredCount) },
    { k: "WAVE WIDTH", v: String(frame?.frontier.length ?? 0), tone: "text-cyan" },
    { k: "COST SO FAR g(n)", v: (frame?.g ?? trace.result.cost).toFixed(1) },
    { k: "PRIORITY f(n)", v: (frame?.f ?? trace.result.cost).toFixed(1), tone: "text-violet" },
    { k: "CONGESTION", v: level, tone: level === "HIGH" ? "text-danger" : "text-cyan" },
    { k: "ROUTE", v: done ? (trace.result.found ? "LOCKED" : "NO PATH") : "SEARCHING", tone: "text-success" },
    { k: "ROUTE STEPS", v: done ? String(trace.result.steps) : "—" },
    { k: "TOTAL COST", v: done ? trace.result.cost.toFixed(1) : "—", tone: "text-success" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-16">
      <SectionHeading
        tag="LIVE SEARCH WAVE"
        title={
          <>
            WATCH THE <span className="text-gradient">SEARCH WAVE</span> EXPAND
          </>
        }
        lead="A* spreads outward from the robot like a wave. Bright cells are the active wavefront, dim cells are already settled. When the wave touches the target, the final route locks in."
      />

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => (done ? (setStep(0), setPlaying(true)) : setPlaying((p) => !p))}
          className="ctrl ctrl-primary"
        >
          {done ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" /> REPLAY WAVE
            </>
          ) : playing ? (
            <>
              <Pause className="h-3.5 w-3.5" /> PAUSE
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" /> PLAY
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setStep((s) => Math.min(total, s + 1));
          }}
          className="ctrl"
        >
          <ChevronsRight className="h-3.5 w-3.5" /> STEP
        </button>
        <button type="button" onClick={() => setStep(0)} className="ctrl">
          <RotateCcw className="h-3.5 w-3.5" /> RESET
        </button>

        <span className="ml-1 flex items-center gap-1 rounded-sm border border-cyan/25 p-1">
          <Waves className="mx-1 h-3.5 w-3.5 text-cyan" />
          {SPEEDS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSpeed(i)}
              className={`rounded-sm px-2 py-1 font-mono text-[0.62rem] tracking-[0.12em] transition-colors ${
                speed === i ? "bg-cyan/20 text-cyan" : "text-secondary-foreground hover:text-cyan"
              }`}
            >
              {s.label}
            </button>
          ))}
        </span>

        <span className="flex items-center gap-1 rounded-sm border border-cyan/25 p-1">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-sm px-2 py-1 font-mono text-[0.62rem] tracking-[0.12em] transition-colors ${
                level === l ? "bg-violet/25 text-violet" : "text-secondary-foreground hover:text-cyan"
              }`}
            >
              {l}
            </button>
          ))}
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="panel corner-frame relative overflow-hidden p-2 sm:p-4">
          <WarehouseView
            warehouse={warehouse}
            congestion={congestion}
            explored={done ? trace.result.explored : trace.frames.map((f) => f.expanded)}
            exploredCount={exploredCount}
            frontier={frame?.frontier ?? []}
            wavePulse={frame?.expanded ?? null}
            path={path}
            robot={pos}
            start={start}
            goal={goal}
            goalLabel={target}
            onPickShelf={setTarget}
          />

          {/* wave progress bar */}
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-[var(--gradient-cyan-violet)] transition-[width] duration-150 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {arrived ? (
            <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2">
              <span
                className="label-tech rounded-sm border border-success/60 px-3 py-1.5 text-success"
                style={{ boxShadow: "var(--glow-success)" }}
              >
                ROBOT ARRIVED AT {target}
              </span>
            </div>
          ) : null}
        </div>

        <div className="space-y-2.5">
          {stats.map((row) => (
            <div
              key={row.k}
              className="flex items-center justify-between border-b border-cyan/12 pb-2 last:border-0"
            >
              <span className="label-tech text-[0.58rem]">{row.k}</span>
              <span className={`font-mono text-xs font-medium ${row.tone ?? "text-foreground"}`}>
                {row.v}
              </span>
            </div>
          ))}

          <div className="space-y-2 pt-3">
            <p className="label-tech text-cyan">WAVE LEGEND</p>
            {[
              { c: "var(--cyan)", t: "ACTIVE WAVEFRONT" },
              { c: "var(--electric)", t: "JUST SETTLED" },
              { c: "var(--indigo)", t: "SETTLED EARLIER" },
              { c: "var(--warning)", t: "PREDICTED CONGESTION" },
            ].map((l) => (
              <div key={l.t} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.c }} />
                <span className="font-mono text-[0.62rem] tracking-[0.12em] text-secondary-foreground">
                  {l.t}
                </span>
              </div>
            ))}
          </div>

          <p className="pt-2 text-xs text-muted-foreground">
            Click any shelf to send the wave toward a different target.
          </p>
        </div>
      </div>
    </div>
  );
}
