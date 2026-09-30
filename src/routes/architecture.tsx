import { createFileRoute } from "@tanstack/react-router";
import {
  Boxes,
  Bot,
  Coffee,
  Database,
  Flame,
  Grid3x3,
  PackageSearch,
  Radar,
  Route as RouteIcon,
  Sigma,
  Warehouse,
} from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { NodeNetwork, type NetNode } from "@/components/NodeNetwork";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "System Architecture — Warehouse Robot Path Planner" },
      {
        name: "description",
        content:
          "Warehouse, grid graph, historical data, Python congestion prediction, Java A* search, congestion penalty, final route, robot and shelf.",
      },
      { property: "og:title", content: "System Architecture" },
      {
        property: "og:description",
        content: "How data flows from the warehouse floor to the robot's final route.",
      },
    ],
  }),
  component: Architecture,
});

const nodes: NetNode[] = [
  { id: "warehouse", caption: "SOURCE", label: "WAREHOUSE", detail: "Physical aisles, shelves and robots on the floor.", x: 10, y: 14, tone: "cyan", icon: <Warehouse className="h-4 w-4" /> },
  { id: "grid", caption: "MODEL", label: "WAREHOUSE GRID", detail: "The floor mapped into a graph of walkable and blocked cells.", x: 32, y: 8, tone: "cyan", icon: <Grid3x3 className="h-4 w-4" /> },
  { id: "task", caption: "INPUT", label: "ROBOT TASK", detail: "Robot ID, start cell and target shelf.", x: 12, y: 42, tone: "cyan", icon: <Bot className="h-4 w-4" /> },
  { id: "data", caption: "INPUT", label: "HISTORICAL DATA", detail: "Recorded aisle traffic from previous shifts.", x: 66, y: 8, tone: "indigo", icon: <Database className="h-4 w-4" /> },
  { id: "python", caption: "LAYER", label: "PYTHON", detail: "Processes the movement records and scores each aisle.", x: 86, y: 24, tone: "warning", icon: <Radar className="h-4 w-4" /> },
  { id: "predict", caption: "OUTPUT", label: "CONGESTION PREDICTION", detail: "A congestion value per cell, from low to high.", x: 84, y: 54, tone: "warning", icon: <Flame className="h-4 w-4" /> },
  { id: "java", caption: "LAYER", label: "JAVA", detail: "Integration layer holding robot, task and grid classes.", x: 34, y: 34, tone: "violet", icon: <Coffee className="h-4 w-4" /> },
  { id: "astar", caption: "ENGINE", label: "A* SEARCH", detail: "Expands cells by f(n) = g(n) + h(n) over the grid graph.", x: 62, y: 44, tone: "violet", icon: <Sigma className="h-4 w-4" /> },
  { id: "penalty", caption: "COST", label: "CONGESTION PENALTY", detail: "Adds predicted traffic cost to every step entered.", x: 62, y: 72, tone: "warning", icon: <Flame className="h-4 w-4" /> },
  { id: "route", caption: "RESULT", label: "FINAL ROUTE", detail: "Lowest total-cost node sequence from start to shelf.", x: 36, y: 84, tone: "success", icon: <RouteIcon className="h-4 w-4" /> },
  { id: "robot", caption: "ACTUATOR", label: "ROBOT", detail: "Drives the route node by node with smooth motion.", x: 14, y: 70, tone: "cyan", icon: <Boxes className="h-4 w-4" /> },
  { id: "shelf", caption: "TARGET", label: "SHELF", detail: "The storage location the task was issued for.", x: 88, y: 86, tone: "success", icon: <PackageSearch className="h-4 w-4" /> },
];

const links = [
  { from: "warehouse", to: "grid" },
  { from: "grid", to: "task" },
  { from: "data", to: "python" },
  { from: "python", to: "predict" },
  { from: "grid", to: "java" },
  { from: "task", to: "java" },
  { from: "predict", to: "astar" },
  { from: "java", to: "astar" },
  { from: "astar", to: "penalty" },
  { from: "penalty", to: "route" },
  { from: "route", to: "robot" },
  { from: "robot", to: "shelf" },
];

function Architecture() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-16">
      <SectionHeading
        tag="SYSTEM ARCHITECTURE"
        title={
          <>
            DATA FLOW OF THE <span className="text-gradient">NAVIGATION SYSTEM</span>
          </>
        }
        lead="Every component of the project, wired as one network. Hover a node to see its role and highlight its connections."
      />

      <div className="panel corner-frame mt-10 p-4 sm:p-8">
        <NodeNetwork nodes={nodes} links={links} height={640} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { t: "PYTHON BRANCH", d: "Historical data → Python → congestion prediction." },
          { t: "JAVA BRANCH", d: "Grid graph + robot task → Java → A* search." },
          { t: "MERGE", d: "A* + congestion penalty → final route → robot → shelf." },
        ].map((b) => (
          <article key={b.t} className="panel p-5">
            <p className="label-tech text-cyan">{b.t}</p>
            <p className="mt-2 text-sm text-secondary-foreground/90">{b.d}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
