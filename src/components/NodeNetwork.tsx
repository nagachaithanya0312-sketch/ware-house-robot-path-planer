import { useState, type ReactNode } from "react";

export type NetNode = {
  id: string;
  label: string;
  caption?: string;
  detail?: string;
  /** percentage position inside the canvas */
  x: number;
  y: number;
  tone?: "cyan" | "violet" | "indigo" | "warning" | "success";
  icon?: ReactNode;
};

export type NetLink = { from: string; to: string };

const toneColor: Record<string, string> = {
  cyan: "var(--cyan)",
  violet: "var(--violet)",
  indigo: "var(--indigo)",
  warning: "var(--warning)",
  success: "var(--success)",
};

/**
 * Spatial node network with curved connectors and travelling data pulses.
 * Desktop/tablet: absolute spatial layout. Mobile: vertical stack with rail.
 */
export function NodeNetwork({
  nodes,
  links,
  height = 520,
  center,
}: {
  nodes: NetNode[];
  links: NetLink[];
  height?: number;
  center?: { label: string; caption?: string };
}) {
  const [active, setActive] = useState<string | null>(null);
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const centerNode = { x: 50, y: 50 };
  const point = (id: string) =>
    id === "__center" ? centerNode : { x: byId.get(id)?.x ?? 50, y: byId.get(id)?.y ?? 50 };

  const curve = (l: NetLink) => {
    const a = point(l.from);
    const b = point(l.to);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.16 - 3;
    return `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
  };

  return (
    <div className="w-full">
      {/* spatial layout */}
      <div className="relative hidden md:block" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {links.map((l, i) => {
            const on = active === l.from || active === l.to;
            const tone = toneColor[byId.get(l.to)?.tone ?? "cyan"] ?? "var(--cyan)";
            return (
              <g key={i}>
                <path
                  d={curve(l)}
                  fill="none"
                  stroke={tone}
                  strokeOpacity={on ? 0.9 : 0.28}
                  strokeWidth={on ? 0.5 : 0.28}
                  vectorEffect="non-scaling-stroke"
                  style={{ transition: "stroke-opacity 0.35s, stroke-width 0.35s" }}
                />
                <circle r="0.55" fill={tone} opacity={on ? 1 : 0.7}>
                  <animateMotion dur={`${3 + (i % 4) * 0.7}s`} repeatCount="indefinite" path={curve(l)} />
                </circle>
              </g>
            );
          })}
        </svg>

        {center ? (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: 200 }}
          >
            <div className="panel glow-violet relative px-5 py-6 text-center">
              <span className="absolute inset-0 rounded-lg border border-violet/30 ring-spin" />
              <p className="font-display text-sm leading-tight font-black tracking-wide">
                {center.label}
              </p>
              {center.caption ? (
                <p className="label-tech mt-2 text-[0.6rem]">{center.caption}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {nodes.map((n, i) => {
          const on = active === n.id;
          const tone = toneColor[n.tone ?? "cyan"];
          return (
            <button
              key={n.id}
              type="button"
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              className="absolute w-[186px] -translate-x-1/2 -translate-y-1/2 text-left transition-transform duration-500 ease-out float-soft"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                animationDelay: `${i * 0.45}s`,
                zIndex: on ? 20 : 10,
              }}
            >
              <div
                className="panel px-4 py-3 transition-all duration-500"
                style={{
                  borderColor: on ? tone : undefined,
                  boxShadow: on ? `0 0 26px -8px ${tone}` : undefined,
                  transform: on ? "scale(1.05)" : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  {n.icon ? <span style={{ color: tone }}>{n.icon}</span> : null}
                  <span className="label-tech" style={{ color: on ? tone : undefined }}>
                    {n.caption}
                  </span>
                </div>
                <p className="mt-1 font-display text-[0.78rem] leading-snug font-bold">{n.label}</p>
                <p
                  className="overflow-hidden text-xs text-muted-foreground transition-all duration-500"
                  style={{ maxHeight: on ? 90 : 0, opacity: on ? 1 : 0 }}
                >
                  {n.detail}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* mobile stack */}
      <div className="relative space-y-3 md:hidden">
        <span className="absolute bottom-3 left-[13px] top-3 w-px bg-cyan/25" />
        {center ? (
          <div className="panel glow-violet relative ml-8 px-4 py-4">
            <p className="font-display text-sm font-black">{center.label}</p>
            {center.caption ? <p className="label-tech mt-1">{center.caption}</p> : null}
          </div>
        ) : null}
        {nodes.map((n) => {
          const tone = toneColor[n.tone ?? "cyan"];
          return (
            <div key={n.id} className="relative ml-8">
              <span
                className="absolute -left-8 top-5 h-2 w-2 -translate-x-1/2 rounded-sm"
                style={{ background: tone }}
              />
              <div className="panel px-4 py-3">
                <div className="flex items-center gap-2">
                  {n.icon ? <span style={{ color: tone }}>{n.icon}</span> : null}
                  <span className="label-tech" style={{ color: tone }}>
                    {n.caption}
                  </span>
                </div>
                <p className="mt-1 font-display text-sm font-bold">{n.label}</p>
                {n.detail ? <p className="mt-1 text-sm text-muted-foreground">{n.detail}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
