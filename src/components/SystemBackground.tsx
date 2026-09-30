/** Slow evolving warehouse-floor background: gradient drift, grid, radial light, scan marks. */
export function SystemBackground() {
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

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.12_0.022_265/0.75))]" />
    </div>
  );
}
