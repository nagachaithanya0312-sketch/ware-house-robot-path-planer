import { useEffect, useState } from "react";

export function SystemBackground() {
  const [lit, setLit] = useState(false);

  useEffect(() => {
    // Fade in lights shortly after mount
    const t = setTimeout(() => setLit(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-drift" />

      {/* radial lighting pools */}
      <div
        className="absolute -left-40 top-[-10%] h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--electric), transparent 70%)" }}
      />
      <div
        className="absolute right-[-15%] top-1/3 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--violet), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-20%] left-1/3 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--cyan), transparent 70%)" }}
      />

      {/* warehouse floor grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.35]">
        <defs>
          <pattern id="bg-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0H0V56" fill="none" stroke="var(--color-grid)" strokeWidth="1" />
          </pattern>
          <linearGradient id="bg-grid-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="60%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0.5" />
          </linearGradient>
          <mask id="bg-grid-mask">
            <rect width="100%" height="100%" fill="url(#bg-grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-grid)" mask="url(#bg-grid-mask)" />
      </svg>

      {/* Global Warehouse Scene */}
      <div className="absolute inset-0 opacity-[0.25] mix-blend-screen">
        <WarehouseScene lit={lit} />
      </div>

      {/* tiny particles */}
      <svg className="absolute inset-0 h-full w-full">
        {Array.from({ length: 18 }).map((_, i) => {
          const x = (i * 137) % 100;
          const y = (i * 61) % 100;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r={i % 4 === 0 ? 1.6 : 1}
              fill={i % 3 === 0 ? "var(--violet)" : "var(--cyan)"}
              className="animate-pulse-soft"
              style={{ animationDelay: `${i * 0.37}s` }}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.12_0.022_265/0.85))]" />
    </div>
  );
}

function WarehouseScene({ lit }: { lit: boolean }) {
  const shelfRows = [
    { y: 300, scale: 1, x: 0 },
    { y: 350, scale: 1.25, x: -60 },
    { y: 420, scale: 1.6, x: -140 },
  ];

  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="is-lamp" cx="0.5" cy="0" r="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ceiling lights */}
      <g style={{ opacity: lit ? 1 : 0, transition: "opacity 1.4s ease" }}>
        {[200, 480, 760, 1040].map((x) => (
          <g key={x}>
            <rect x={x - 34} y="60" width="68" height="6" rx="3" fill="var(--cyan)" opacity="0.85" />
            <ellipse cx={x} cy="230" rx="150" ry="190" fill="url(#is-lamp)" />
          </g>
        ))}
      </g>

      {/* perspective floor lines */}
      <g stroke="var(--cyan)" strokeOpacity="0.16">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={i * 100} y1="700" x2={300 + i * 50} y2="260" />
        ))}
        {[300, 360, 430, 520, 620, 700].map((y) => (
          <line key={y} x1="0" y1={y} x2="1200" y2={y} />
        ))}
      </g>

      {/* shelving with depth */}
      {shelfRows.map((row, ri) => (
        <g
          key={ri}
          style={{
            opacity: lit ? 1 - ri * 0.08 : 0.18,
            transition: `opacity 1.6s ease ${ri * 0.2}s`,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => {
            const w = 86 * row.scale;
            const h = 70 * row.scale;
            const x = row.x + i * (w + 52 * row.scale);
            if (x > 1220) return null;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={row.y - h}
                  width={w}
                  height={h}
                  fill="var(--color-shelf)"
                  stroke="var(--cyan)"
                  strokeOpacity="0.3"
                />
                <line x1={x} y1={row.y - h / 2} x2={x + w} y2={row.y - h / 2} stroke="var(--cyan)" strokeOpacity="0.22" />
                <rect x={x + 8} y={row.y - h + 8} width={w * 0.3} height={h * 0.25} fill="var(--indigo)" opacity="0.5" />
                <rect x={x + w * 0.5} y={row.y - h / 2 + 8} width={w * 0.34} height={h * 0.28} fill="var(--electric)" opacity="0.4" />
              </g>
            );
          })}
        </g>
      ))}

      {/* glowing navigation paths */}
      <g style={{ opacity: lit ? 1 : 0, transition: "opacity 1.2s ease" }}>
        {[
          "M-40 620 C 300 600, 620 560, 1240 590",
          "M-40 500 C 340 470, 700 500, 1240 470",
          "M-40 390 C 360 400, 760 380, 1240 400",
        ].map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="var(--cyan)" strokeOpacity="0.2" strokeWidth="10" />
            <path
              d={d}
              fill="none"
              stroke={i === 1 ? "var(--violet)" : "var(--cyan)"}
              strokeWidth="2"
              strokeDasharray="22 26"
              opacity="0.9"
            >
              <animate attributeName="stroke-dashoffset" values="0;-96" dur={`${3 + i}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}
      </g>

      {/* robots gliding along aisles */}
      <SceneRobot path="M-40 620 C 300 600, 620 560, 1240 590" dur="17s" scale={1.5} visible={lit} />
      <SceneRobot path="M1240 470 C 700 500, 340 470, -40 500" dur="21s" scale={1.15} visible={lit} delay="-4s" />
      <SceneRobot path="M-40 390 C 360 400, 760 380, 1240 400" dur="25s" scale={0.85} visible={lit} delay="-9s" />

    </svg>
  );
}

function SceneRobot({ path, dur, scale, visible, delay = "0s" }: { path: string; dur: string; scale: number; visible: boolean; delay?: string }) {
  return (
    <g style={{ opacity: visible ? 1 : 0, transition: "opacity 1.6s ease 0.3s" }}>
      <g>
        <animateMotion dur={dur} begin={delay} repeatCount="indefinite" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
        <g transform={`scale(${scale})`}>
          <ellipse cy="16" rx="26" ry="6" fill="var(--cyan)" opacity="0.14" />
          <rect x="-24" y="-22" width="48" height="34" rx="6" fill="var(--color-deepblue)" stroke="var(--cyan)" strokeWidth="1.6" />
          <rect x="-16" y="-14" width="12" height="10" rx="2" fill="var(--cyan)" />
          <rect x="4" y="-14" width="12" height="10" rx="2" fill="var(--violet)" />
          <rect x="-18" y="0" width="36" height="6" rx="3" fill="var(--cyan)" opacity="0.6" />
          <rect x="-14" y="-38" width="28" height="16" rx="2" fill="var(--color-shelf)" stroke="var(--warning)" strokeOpacity="0.55" />
          <g>
            <circle cx="-14" cy="14" r="6" fill="var(--color-midnight)" stroke="var(--cyan)" strokeOpacity="0.7" strokeWidth="1.4" />
            <line x1="-14" y1="9" x2="-14" y2="19" stroke="var(--cyan)" strokeOpacity="0.6">
              <animateTransform attributeName="transform" type="rotate" from="0 -14 14" to="360 -14 14" dur="1.2s" repeatCount="indefinite" />
            </line>
          </g>
          <g>
            <circle cx="14" cy="14" r="6" fill="var(--color-midnight)" stroke="var(--cyan)" strokeOpacity="0.7" strokeWidth="1.4" />
            <line x1="14" y1="9" x2="14" y2="19" stroke="var(--cyan)" strokeOpacity="0.6">
              <animateTransform attributeName="transform" type="rotate" from="0 14 14" to="360 14 14" dur="1.2s" repeatCount="indefinite" />
            </line>
          </g>
          <circle cx="0" cy="-27" r="2.4" fill="var(--success)">
            <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
    </g>
  );
}
