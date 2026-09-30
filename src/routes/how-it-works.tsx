import { createFileRoute } from "@tanstack/react-router";
import { Bot, Grid3x3, Flame, Radar, Route as RouteIcon, Sigma } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { NodeNetwork, type NetNode } from "@/components/NodeNetwork";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Warehouse Robot Path Planner" },
      {
        name: "description",
        content:
          "Six-stage pipeline: robot task, grid graph, Python congestion prediction, A* search, congestion penalty and final route.",
      },
      { property: "og:title", content: "How the Path Planning Pipeline Works" },
      {
        property: "og:description",
        content: "From robot task to final route — the six stages of congestion-aware A* planning.",
      },
    ],
  }),
  component: HowItWorks,
});

const nodes: NetNode[] = [
  {
    id: "task",
    caption: "01 ROBOT TASK",
    label: "TASK RECEIVED",
    detail: "A robot is told which shelf to reach. Start cell and target shelf are locked in.",
    x: 12,
    y: 20,
    tone: "cyan",
    icon: <Bot className="h-4 w-4" />,
  },
  {
    id: "grid",
    caption: "02 GRID GRAPH",
    label: "WAREHOUSE AS A GRAPH",
    detail: "The floor becomes a grid of cells. Shelves and pallets are blocked nodes.",
    x: 38,
    y: 12,
    tone: "cyan",
    icon: <Grid3x3 className="h-4 w-4" />,
  },
  {
    id: "python",
    caption: "03 PYTHON PREDICTION",
    label: "HISTORICAL DATA",
    detail: "Past movement records are processed to estimate how busy each aisle will be.",
    x: 66,
    y: 20,
    tone: "warning",
    icon: <Radar className="h-4 w-4" />,
  },
  {
    id: "astar",
    caption: "04 A* SEARCH",
    label: "f(n) = g(n) + h(n)",
    detail: "A* expands the most promising cells first, using distance travelled plus estimate.",
    x: 86,
    y: 52,
    tone: "violet",
    icon: <Sigma className="h-4 w-4" />,
  },
  {
    id: "penalty",
    caption: "05 CONGESTION PENALTY",
    label: "COST ADJUSTMENT",
    detail: "Entering a busy cell costs 1 + penalty, so crowded aisles become expensive.",
    x: 56,
    y: 74,
    tone: "warning",
    icon: <Flame className="h-4 w-4" />,
  },
  {
    id: "route",
    caption: "06 FINAL ROUTE",
    label: "ROUTE CALCULATED",
    detail: "The lowest total-cost route is selected and the robot drives it node by node.",
    x: 22,
    y: 66,
    tone: "success",
    icon: <RouteIcon className="h-4 w-4" />,
  },
];

const links = [
  { from: "task", to: "grid" },
  { from: "grid", to: "python" },
  { from: "python", to: "astar" },
  { from: "astar", to: "penalty" },
  { from: "penalty", to: "route" },
  { from: "grid", to: "astar" },
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-16">
      <SectionHeading
        tag="PROCESS PIPELINE"
        title={
          <>
            HOW THE SYSTEM <span className="text-gradient">THINKS</span>
          </>
        }
        lead="Hover any stage to see what happens there. Data pulses show the direction information travels through the planner."
      />

      <div className="panel corner-frame mt-10 p-4 sm:p-8">
        <NodeNetwork nodes={nodes} links={links} height={560} />
      </div>

      <div className="panel mt-8 p-6">
        <p className="label-tech text-cyan">SELECTION RULE</p>
        <p className="mt-3 font-display text-base font-bold sm:text-xl">
          TOTAL ROUTE COST = PATH COST <span className="text-cyan">g(n)</span> + ESTIMATED DISTANCE{" "}
          <span className="text-violet">h(n)</span> + CONGESTION PENALTY
        </p>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          g(n) is the cost already travelled, h(n) is the estimated remaining distance to the shelf
          (Manhattan distance on the grid), and the penalty makes predicted-busy cells more expensive
          to enter. The route with the lowest total is the one the robot drives.
        </p>
      </div>
    </div>
  );
}
