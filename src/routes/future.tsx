import { createFileRoute } from "@tanstack/react-router";
import { Activity, Bot, Cpu, ShieldAlert, Wifi } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { NodeNetwork, type NetNode } from "@/components/NodeNetwork";

export const Route = createFileRoute("/future")({
  head: () => ({
    meta: [
      { title: "Future Scope — Warehouse Robot Path Planner" },
      {
        name: "description",
        content:
          "Next steps: multiple robots, real-time data, dynamic obstacles, advanced prediction and real robot integration.",
      },
      { property: "og:title", content: "Future Warehouse Intelligence" },
      {
        property: "og:description",
        content: "Where the congestion-aware planner goes next.",
      },
    ],
  }),
  component: FuturePage,
});

const nodes: NetNode[] = [
  {
    id: "multi",
    caption: "SCALE",
    label: "MULTIPLE ROBOTS",
    detail: "Plan for a whole fleet at once, reserving cells in time so robots never meet head-on.",
    x: 50,
    y: 8,
    tone: "cyan",
    icon: <Bot className="h-4 w-4" />,
  },
  {
    id: "realtime",
    caption: "SENSING",
    label: "REAL-TIME DATA",
    detail: "Live aisle counters replace historical averages, so congestion updates every second.",
    x: 88,
    y: 40,
    tone: "violet",
    icon: <Wifi className="h-4 w-4" />,
  },
  {
    id: "dynamic",
    caption: "SAFETY",
    label: "DYNAMIC OBSTACLES",
    detail: "Replan mid-route when a pallet, person or stalled robot blocks the planned cells.",
    x: 76,
    y: 84,
    tone: "warning",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  {
    id: "predict",
    caption: "INTELLIGENCE",
    label: "ADVANCED PREDICTION",
    detail: "Learned models forecast congestion minutes ahead instead of scoring the present.",
    x: 24,
    y: 84,
    tone: "indigo",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    id: "hardware",
    caption: "DEPLOYMENT",
    label: "REAL ROBOT INTEGRATION",
    detail: "Send the planned route to physical robot controllers and read their telemetry back.",
    x: 12,
    y: 40,
    tone: "success",
    icon: <Cpu className="h-4 w-4" />,
  },
];

const links = [
  { from: "__center", to: "multi" },
  { from: "__center", to: "realtime" },
  { from: "__center", to: "dynamic" },
  { from: "__center", to: "predict" },
  { from: "__center", to: "hardware" },
  { from: "realtime", to: "predict" },
  { from: "multi", to: "dynamic" },
];

function FuturePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-16">
      <SectionHeading
        tag="FUTURE SCOPE"
        title={
          <>
            FUTURE WAREHOUSE <span className="text-gradient">INTELLIGENCE</span>
          </>
        }
        lead="The current planner handles one robot on predicted congestion. These are the directions that turn it into a full fleet control system."
      />

      <div className="panel corner-frame mt-10 p-4 sm:p-8">
        <NodeNetwork
          nodes={nodes}
          links={links}
          height={600}
          center={{ label: "FUTURE WAREHOUSE INTELLIGENCE", caption: "ROADMAP CORE" }}
        />
      </div>
    </div>
  );
}
