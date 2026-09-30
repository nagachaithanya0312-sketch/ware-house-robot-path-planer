import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Cpu, Route as RouteIcon, ScanLine } from "lucide-react";
import heroImg from "@/assets/warehouse-hero.jpg";
import { WarehouseView, useRobotWalk } from "@/components/WarehouseView";
import {
  aStar,
  buildWarehouse,
  predictCongestion,
  shelfByLabel,
  type Cell,
} from "@/lib/warehouse";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Warehouse Robot Path Planner — Intelligent Navigation Control" },
      {
        name: "description",
        content:
          "Live warehouse control center: robot R01 plans a collision-free route to shelf B7 using A* search with congestion-aware cost.",
      },
      { property: "og:title", content: "Warehouse Robot Path Planner" },
      {
        property: "og:description",
        content:
          "A* search plus congestion prediction finds efficient, collision-free routes for warehouse robots.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const warehouse = useMemo(() => buildWarehouse(), []);
  const congestion = useMemo(() => predictCongestion(warehouse, "LOW", 11), [warehouse]);
  const start: Cell = { x: 1, y: 1 };
  const goalShelf = shelfByLabel(warehouse, "B7");
  const goal = goalShelf?.access ?? { x: 20, y: 10 };

  const plan = useMemo(
    () => aStar(warehouse, start, goal, congestion),
    [warehouse, congestion, goal.x, goal.y],
  );

  const [cycle, setCycle] = useState(0);
  const { pos, arrived } = useRobotWalk(plan.path, true, 3.4);

  useEffect(() => {
    if (!arrived) return;
    const t = window.setTimeout(() => setCycle((c) => c + 1), 2600);
    return () => clearTimeout(t);
  }, [arrived, cycle]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-16">
      {/* ---------- hero ---------- */}
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="animate-rise">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-cyan/60" />
            <span className="label-tech text-cyan">PATH PLANNING ENGINE / AI NAVIGATION</span>
          </div>
          <h1 className="mt-5 font-display text-[2rem] leading-[1.02] font-black tracking-tight sm:text-5xl lg:text-[3.4rem]">
            INTELLIGENT PATH PLANNING
            <span className="mt-2 block text-gradient">FOR WAREHOUSE ROBOTS</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-secondary-foreground/90 sm:text-lg">
            Find efficient, collision-free routes by combining A* search with congestion-aware path
            planning.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/demo" className="ctrl ctrl-primary">
              RUN LIVE DEMO <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link to="/how-it-works" className="ctrl ctrl-violet">
              EXPLORE SYSTEM
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {[
              { k: "ALGORITHM", v: "A*" },
              { k: "GRAPH", v: "GRID" },
              { k: "COST MODEL", v: "g + h + P" },
              { k: "MODE", v: "AUTONOMOUS" },
            ].map((s) => (
              <div key={s.k} className="border-l border-cyan/25 pl-3">
                <dt className="label-tech text-[0.58rem]">{s.k}</dt>
                <dd className="mt-1 font-display text-sm font-bold text-cyan">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* project image, integrated with perspective + scanlines */}
        <figure className="animate-rise relative" style={{ animationDelay: "0.15s" }}>
          <div
            className="scanline-overlay sweep-hover corner-frame overflow-hidden rounded-lg border border-cyan/25"
            style={{ transform: "perspective(1200px) rotateY(-5deg) rotateX(2deg)" }}
          >
            <img
              src={heroImg}
              width={1280}
              height={960}
              alt="Autonomous warehouse robot following a projected navigation path between storage racks"
              className="h-auto w-full"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,oklch(0.12_0.022_265/0.75),transparent_60%)]" />
            <figcaption className="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="label-tech text-cyan">WAREHOUSE FLOOR / LIVE FEED</span>
              <span className="label-tech text-[0.58rem]">AUTONOMOUS TRANSPORT UNIT</span>
            </figcaption>
          </div>
          <span
            className="pointer-events-none absolute -inset-4 -z-10 rounded-xl opacity-60 blur-2xl"
            style={{ background: "radial-gradient(circle at 70% 30%, var(--violet), transparent 65%)" }}
          />
        </figure>
      </section>

      {/* ---------- live robot visualization ---------- */}
      <section className="mt-16 lg:mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="label-tech text-cyan">WAREHOUSE GRID / LIVE ROBOT ACTIVITY</span>
            <h2 className="mt-3 font-display text-2xl font-black sm:text-3xl">
              START <span className="text-cyan">→</span> PATH <span className="text-violet">→</span>{" "}
              GOAL
            </h2>
          </div>
          <div className="label-tech flex items-center gap-2 text-[0.6rem]">
            <ScanLine className="h-3.5 w-3.5 text-cyan" />
            COST = PATH g(n) + ESTIMATE h(n) + CONGESTION PENALTY
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="panel corner-frame relative overflow-hidden p-2 sm:p-4">
            <WarehouseView
              warehouse={warehouse}
              congestion={congestion}
              path={plan.path}
              robot={pos}
              start={start}
              goal={goal}
              goalLabel="B7"
            />
            {arrived ? (
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
                <span
                  className="label-tech rounded-sm border border-success/60 px-3 py-1.5 text-success"
                  style={{ boxShadow: "var(--glow-success)" }}
                >
                  ROBOT ARRIVED AT TARGET
                </span>
              </div>
            ) : null}
          </div>

          {/* HUD integrated into the visualization column */}
          <div className="space-y-2.5">
            {[
              { k: "ROBOT ID", v: "R01", tone: "text-cyan" },
              { k: "STATUS", v: arrived ? "IDLE / DOCKED" : "ACTIVE", tone: "text-success" },
              { k: "START", v: "A1" },
              { k: "TARGET", v: "B7" },
              { k: "PATH", v: plan.found ? "FOUND" : "CALCULATING", tone: "text-success" },
              { k: "CONGESTION", v: "LOW", tone: "text-cyan" },
              { k: "ALGORITHM", v: "A*", tone: "text-violet" },
              { k: "MODE", v: "AUTONOMOUS" },
              { k: "ROUTE STEPS", v: String(plan.steps) },
              { k: "ROUTE COST", v: plan.cost.toFixed(1) },
            ].map((row, i) => (
              <div
                key={row.k}
                className="flex items-center justify-between border-b border-cyan/12 pb-2 last:border-0"
                style={{ animation: `rise-in 0.7s var(--ease-smooth) ${i * 0.05}s both` }}
              >
                <span className="label-tech text-[0.58rem]">{row.k}</span>
                <span className={`font-mono text-xs font-medium ${row.tone ?? "text-foreground"}`}>
                  {row.v}
                </span>
              </div>
            ))}
            <p className="pt-2 text-xs text-muted-foreground">
              Route recalculated by the A* engine in the browser — the robot follows every grid node.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- pipeline teaser ---------- */}
      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          {
            Icon: RouteIcon,
            t: "GRID GRAPH",
            d: "The warehouse floor becomes a graph of walkable cells, shelves and obstacles.",
          },
          {
            Icon: Cpu,
            t: "CONGESTION PREDICTION",
            d: "Historical movement data marks aisles that are likely to be busy.",
          },
          {
            Icon: ScanLine,
            t: "A* WITH PENALTY",
            d: "Search picks the route with the lowest total cost, not just the shortest one.",
          },
        ].map(({ Icon, t, d }, i) => (
          <article
            key={t}
            className="panel corner-frame p-5 transition-all duration-500 hover:border-cyan/50 hover:shadow-[var(--glow-cyan)]"
            style={{ animation: `rise-in 0.8s var(--ease-smooth) ${0.1 * i}s both` }}
          >
            <Icon className="h-5 w-5 text-cyan" />
            <h3 className="mt-3 font-display text-sm font-bold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
