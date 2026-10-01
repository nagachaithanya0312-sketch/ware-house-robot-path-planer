import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { WarehouseView } from "@/components/WarehouseView";
import {
  CONGESTION_WEIGHT,
  aStar,
  buildWarehouse,
  predictCongestion,
  shelfByLabel,
  type Cell,
} from "@/lib/warehouse";

export const Route = createFileRoute("/problem")({
  head: () => ({
    meta: [
      { title: "The Warehouse Challenge — Warehouse Robot Path Planner" },
      {
        name: "description",
        content:
          "Why the shortest route is not always the best route: comparing a short congested aisle against a slightly longer clear route.",
      },
      { property: "og:title", content: "The Warehouse Challenge" },
      {
        property: "og:description",
        content: "Distance plus congestion equals route cost — see how the chosen path changes.",
      },
    ],
  }),
  component: ProblemPage,
});

function ProblemPage() {
  const warehouse = useMemo(() => buildWarehouse(), []);
  const congestion = useMemo(() => predictCongestion(warehouse, "HIGH", 23), [warehouse]);
  const start: Cell = { x: 1, y: 7 };
  const goal = shelfByLabel(warehouse, "C9")?.access ?? { x: 20, y: 7 };

  const routeA = useMemo(() => aStar(warehouse, start, goal, null), [warehouse, goal.x, goal.y]);
  const routeB = useMemo(
    () => aStar(warehouse, start, goal, congestion),
    [warehouse, congestion, goal.x, goal.y],
  );

  const [view, setView] = useState<"A" | "B">("A");
  const active = view === "A" ? routeA : routeB;

  const congestionOf = (path: Cell[]) =>
    path.reduce((sum, c) => sum + (congestion[c.y]?.[c.x] ?? 0), 0);

  const rows = [
    {
      id: "A" as const,
      name: "ROUTE A",
      sub: "Shorter distance / high congestion",
      steps: routeA.steps,
      pen: CONGESTION_WEIGHT * congestionOf(routeA.path),
      tone: "var(--warning)",
    },
    {
      id: "B" as const,
      name: "ROUTE B",
      sub: "Slightly longer / low congestion",
      steps: routeB.steps,
      pen: CONGESTION_WEIGHT * congestionOf(routeB.path),
      tone: "var(--cyan)",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-16">
      <SectionHeading
        tag="PROBLEM STATEMENT"
        title={
          <>
            THE WAREHOUSE <span className="text-gradient">CHALLENGE</span>
          </>
        }
        lead="Warehouse robots must move quickly between storage locations while avoiding obstacles and inefficient routes. A shortest-distance route is not always the best practical route when an aisle is congested."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel corner-frame overflow-hidden p-2 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <span className="label-tech text-cyan">CONGESTION ANALYSIS / SAME START, SAME SHELF</span>
            <div className="flex gap-2">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setView(r.id)}
                  className="ctrl px-3 py-1.5 text-[0.62rem]"
                  style={
                    view === r.id
                      ? { borderColor: r.tone, boxShadow: `0 0 22px -8px ${r.tone}` }
                      : undefined
                  }
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
          <WarehouseView
            warehouse={warehouse}
            congestion={congestion}
            path={active.path}
            start={start}
            goal={goal}
            goalLabel="C9"
          />
        </div>

        <div className="space-y-4">
          {rows.map((r) => {
            const total = r.steps + r.pen;
            return (
              <article
                key={r.id}
                className="panel p-4 transition-all duration-500"
                style={
                  view === r.id
                    ? { borderColor: r.tone, boxShadow: `0 0 26px -10px ${r.tone}` }
                    : undefined
                }
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-display text-sm font-black" style={{ color: r.tone }}>
                    {r.name}
                  </h2>
                  <span className="label-tech text-[0.58rem]">{r.sub}</span>
                </div>
                <dl className="mt-3 space-y-2">
                  {[
                    ["DISTANCE (STEPS)", r.steps.toFixed(0)],
                    ["CONGESTION PENALTY", r.pen.toFixed(1)],
                    ["ROUTE COST", total.toFixed(1)],
                  ].map(([k, v], i) => (
                    <div key={k} className="flex items-center justify-between">
                      <dt className="label-tech text-[0.58rem]">{k}</dt>
                      <dd
                        className="font-mono text-xs"
                        style={i === 2 ? { color: r.tone } : undefined}
                      >
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (total / 80) * 100)}%`,
                      background: r.tone,
                    }}
                  />
                </div>
              </article>
            );
          })}

          <div className="panel p-4">
            <p className="label-tech text-violet">COST MODEL</p>
            <p className="mt-2 font-display text-sm font-bold">
              DISTANCE <span className="text-cyan">+</span> CONGESTION{" "}
              <span className="text-cyan">=</span> ROUTE COST
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Each step normally costs 1. Inside a busy aisle the same step costs 1 plus a penalty,
              so the planner may prefer a longer but clearer route.
            </p>
          </div>
        </div>
      </div>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            t: "COLLISIONS AND WAITING",
            d: "Several robots in one aisle block each other, so the shortest line becomes the slowest trip.",
          },
          {
            t: "STATIC MAPS ARE NOT ENOUGH",
            d: "Traffic changes during a shift. A fixed route ignores how busy an aisle actually is.",
          },
          {
            t: "MEASURABLE DECISIONS",
            d: "Turning congestion into a number lets the planner compare routes objectively.",
          },
        ].map((c, i) => (
          <article
            key={c.t}
            className="panel corner-frame p-5"
            style={{ animation: `rise-in 0.8s var(--ease-smooth) ${i * 0.08}s both` }}
          >
            <h3 className="font-display text-sm font-bold text-cyan">{c.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
