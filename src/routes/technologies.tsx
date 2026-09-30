import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Coffee, Grid3x3, Radar, Boxes } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { NodeNetwork, type NetNode } from "@/components/NodeNetwork";

export const Route = createFileRoute("/technologies")({
  head: () => ({
    meta: [
      { title: "Technologies — Warehouse Robot Path Planner" },
      {
        name: "description",
        content:
          "AI (A* search), ADSA (grid graph), OOPJ (robot and task classes), Python (congestion prediction) and Java (path planning integration).",
      },
      { property: "og:title", content: "Technology Ecosystem" },
      {
        property: "og:description",
        content: "The five subjects that power the warehouse path planning engine.",
      },
    ],
  }),
  component: Technologies,
});

const nodes: NetNode[] = [
  {
    id: "ai",
    caption: "AI",
    label: "A* SEARCH",
    detail: "Informed search that balances travelled cost with an estimate of the distance left.",
    x: 50,
    y: 10,
    tone: "violet",
    icon: <BrainCircuit className="h-4 w-4" />,
  },
  {
    id: "adsa",
    caption: "ADSA",
    label: "GRID GRAPH",
    detail: "Graph representation, priority queue and complexity analysis of the search.",
    x: 86,
    y: 38,
    tone: "cyan",
    icon: <Grid3x3 className="h-4 w-4" />,
  },
  {
    id: "oopj",
    caption: "OOPJ",
    label: "ROBOT / TASK CLASSES",
    detail: "Objects for Robot, Task, Cell and Shelf keep the simulation clean and extensible.",
    x: 76,
    y: 82,
    tone: "indigo",
    icon: <Boxes className="h-4 w-4" />,
  },
  {
    id: "python",
    caption: "PYTHON",
    label: "CONGESTION PREDICTION",
    detail: "Processes historical aisle traffic and produces a congestion value per cell.",
    x: 24,
    y: 82,
    tone: "warning",
    icon: <Radar className="h-4 w-4" />,
  },
  {
    id: "java",
    caption: "JAVA",
    label: "PATH PLANNING & INTEGRATION",
    detail: "Runs the planner, combines congestion data with the grid and drives the robot.",
    x: 14,
    y: 38,
    tone: "cyan",
    icon: <Coffee className="h-4 w-4" />,
  },
];

const links = [
  { from: "__center", to: "ai" },
  { from: "__center", to: "adsa" },
  { from: "__center", to: "oopj" },
  { from: "__center", to: "python" },
  { from: "__center", to: "java" },
  { from: "ai", to: "adsa" },
  { from: "python", to: "java" },
  { from: "oopj", to: "adsa" },
];

function Technologies() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-16">
      <SectionHeading
        tag="TECHNOLOGY ECOSYSTEM"
        title={
          <>
            ONE ENGINE, <span className="text-gradient">FIVE DISCIPLINES</span>
          </>
        }
        lead="Each subject contributes a part of the planner. Hover a technology to see how it connects to the core engine."
      />

      <div className="panel corner-frame mt-10 p-4 sm:p-8">
        <NodeNetwork
          nodes={nodes}
          links={links}
          height={600}
          center={{ label: "WAREHOUSE AI ENGINE", caption: "PATH PLANNING CORE" }}
        />
      </div>
    </div>
  );
}
