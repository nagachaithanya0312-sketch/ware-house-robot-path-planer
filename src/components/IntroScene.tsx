import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";


/**
 * Cinematic warehouse opening scene.
 * Timeline: environment -> lighting/robots -> nav paths -> title -> labels -> welcome -> button.
 */
export function IntroScene({ onEnter }: { onEnter: () => void }) {
  const [stage, setStage] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStage(7);
      return;
    }
    const marks = [200, 1000, 2000, 3000, 4000, 5000, 6000];
    const timers = marks.map((ms, i) => window.setTimeout(() => setStage(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  const enter = () => {
    setLeaving(true);
    window.setTimeout(onEnter, 1000);
  };

  const show = (n: number) => (stage >= n ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3");

  return (
    <div
      className={`fixed inset-0 z-[90] overflow-hidden bg-background transition-all duration-1000 ease-out ${
        leaving ? "scale-[1.08] opacity-0 pointer-events-none" : "scale-100 opacity-100"
      }`}
    >
      <style>{`
        @keyframes inner-light-sweep {
          0% { transform: translateX(-150%); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(150%); opacity: 0; }
        }
      `}</style>
      {/* warehouse environment */}
      <div
        className={`absolute inset-0 transition-opacity duration-[1500ms] ${
          stage >= 1 ? "opacity-100" : "opacity-0"
        }`}
      >
        <WarehouseScene lit={stage >= 2} paths={stage >= 3} />
      </div>

      {/* light sweep on exit */}
      <div
        className={`pointer-events-none absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,oklch(0.79_0.14_195/0.25),transparent)] transition-transform duration-1000 ease-out ${
          leaving ? "translate-x-[320%]" : "-translate-x-full"
        }`}
      />

      <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
        <p
          className={`label-tech mb-5 text-cyan transition-all duration-1000 ${show(4)}`}
        >
          SYSTEM ONLINE — AI NAVIGATION CORE
        </p>

        <h1
          className={`font-display text-[2.1rem] leading-[0.95] font-black cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:tracking-[0.08em] hover:scale-[1.01] sm:text-6xl lg:text-7xl group ${show(4)}`}
        >
          <span className="block drop-shadow-[0_0_15px_oklch(0.79_0.14_195/0.3)] text-premium-sweep">WAREHOUSE</span>
          <span className="block text-gradient drop-shadow-[0_0_20px_oklch(0.79_0.14_195/0.5)] text-premium-sweep">ROBOT PATH</span>
          <span className="block drop-shadow-[0_0_15px_oklch(0.79_0.14_195/0.3)] text-premium-sweep">PLANNER</span>
        </h1>

        <div
          className={`mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 transition-all duration-1000 ${stage >= 5 ? 'opacity-100' : 'opacity-0'}`}
        >
          {["GRID GRAPH", "A* SEARCH", "CONGESTION PREDICTION", "AUTONOMOUS ROUTING"].map((t, i) => (
            <span 
               key={t} 
               className={`label-tech text-[0.6rem] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${stage >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
               style={{ transitionDelay: `${i * 120}ms` }}
            >
              {t}
            </span>
          ))}
        </div>

        <p
          className={`mt-7 max-w-xl text-sm tracking-[0.06em] text-secondary-foreground transition-all duration-1000 sm:text-base ${show(6)}`}
        >
          WELCOME TO THE INTELLIGENT WAREHOUSE NAVIGATION SYSTEM
        </p>

        <div className={`mt-9 transition-all duration-1000 ${show(7)} relative group`}>
          {/* Soft ambient background shadow */}
          <div className="absolute inset-0 -z-10 pointer-events-none rounded-full bg-[var(--cyan)] opacity-10 blur-[12px] transition-all duration-500 group-hover:opacity-30 group-hover:blur-xl" />
          
          <button
            type="button"
            onClick={enter}
            disabled={stage < 7}
            className="relative overflow-hidden rounded-full p-[1px] transition-transform duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-0 group-hover:scale-[1.02] bg-background"
          >
            {/* Animated Border Gradient with multiple traveling lights */}
            <span 
               className="absolute inset-0 animate-[spin_1.8s_linear_infinite] opacity-80 group-hover:opacity-100 transition-opacity duration-500"
               style={{
                 background: "conic-gradient(from 0deg, transparent 0%, #FFFFFF 5%, #87CEFA 10%, #22D3EE 15%, #3B82F6 20%, #C4B5FD 25%, #FFFFFF 30%, transparent 35%, transparent 50%, #FFFFFF 55%, #87CEFA 60%, #22D3EE 65%, #3B82F6 70%, #C4B5FD 75%, #FFFFFF 80%, transparent 85%)"
               }}
            />
            
            {/* Inner Button Content */}
            <div className="relative flex items-center justify-center gap-3 rounded-full bg-background/95 px-10 py-3.5 backdrop-blur-sm transition-colors group-hover:bg-background/90 overflow-hidden shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] group-hover:shadow-[inset_0_0_20px_rgba(56,189,248,0.15)]">
               {/* Colorful Moving Light */}
               <div className="absolute inset-0 opacity-40 group-hover:opacity-85 mix-blend-screen pointer-events-none transition-opacity duration-500">
                  <div className="absolute top-0 left-0 h-full w-[100%] animate-[inner-light-sweep_2.5s_linear_infinite] bg-[linear-gradient(90deg,transparent_0%,rgba(173,216,230,0.15)_20%,rgba(135,206,250,0.3)_40%,rgba(34,211,238,0.4)_60%,rgba(255,255,255,0.4)_75%,rgba(59,130,246,0.2)_90%,transparent_100%)]" />
               </div>
               
               <span className="relative z-10 font-mono text-[0.78rem] tracking-[0.2em] text-secondary-foreground transition-colors duration-500 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(125,211,252,0.6)]">
                 ENTER APPLICATION
               </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function WarehouseScene({ lit, paths }: { lit: boolean; paths: boolean }) {
  const shelfRows = [
    { y: 300, scale: 1, x: 0 },
    { y: 350, scale: 1.25, x: -60 },
    { y: 420, scale: 1.6, x: -140 },
  ];

  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="is-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-midnight)" />
          <stop offset="55%" stopColor="var(--color-deepblue)" />
          <stop offset="100%" stopColor="var(--background)" />
        </linearGradient>
        <radialGradient id="is-lamp" cx="0.5" cy="0" r="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="700" fill="url(#is-floor)" />

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
                <line
                  x1={x}
                  y1={row.y - h / 2}
                  x2={x + w}
                  y2={row.y - h / 2}
                  stroke="var(--cyan)"
                  strokeOpacity="0.22"
                />
                <rect
                  x={x + 8}
                  y={row.y - h + 8}
                  width={w * 0.3}
                  height={h * 0.25}
                  fill="var(--indigo)"
                  opacity="0.5"
                />
                <rect
                  x={x + w * 0.5}
                  y={row.y - h / 2 + 8}
                  width={w * 0.34}
                  height={h * 0.28}
                  fill="var(--electric)"
                  opacity="0.4"
                />
              </g>
            );
          })}
        </g>
      ))}

      {/* glowing navigation paths */}
      <g style={{ opacity: paths ? 1 : 0, transition: "opacity 1.2s ease" }}>
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

      {/* robots gliding along aisles with easing */}
      <SceneRobot path="M-40 620 C 300 600, 620 560, 1240 590" dur="17s" scale={1.5} visible={lit} />
      <SceneRobot path="M1240 470 C 700 500, 340 470, -40 500" dur="21s" scale={1.15} visible={lit} delay="-4s" />
      <SceneRobot path="M-40 390 C 360 400, 760 380, 1240 400" dur="25s" scale={0.85} visible={lit} delay="-9s" />

      <rect width="1200" height="700" fill="var(--background)" opacity="0.35" />
    </svg>
  );
}

function SceneRobot({
  path,
  dur,
  scale,
  visible,
  delay = "0s",
}: {
  path: string;
  dur: string;
  scale: number;
  visible: boolean;
  delay?: string;
}) {
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
          {/* carried crate */}
          <rect x="-14" y="-38" width="28" height="16" rx="2" fill="var(--color-shelf)" stroke="var(--warning)" strokeOpacity="0.55" />
          {/* wheels */}
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
