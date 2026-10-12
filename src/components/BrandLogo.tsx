/** Pixel-inspired robot / path logo with a slow scan + path sweep loop. */
export function BrandLogo({ size = 42 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      className="shrink-0 drop-shadow-[0_0_10px_oklch(0.79_0.14_195/0.45)] relative"
    >
      <defs>
        <linearGradient id="logo-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="var(--cyan)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <mask id="logo-mask">
          <rect x="2" y="2" width="36" height="36" rx="6" fill="white" />
        </mask>
      </defs>

      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="6"
        fill="var(--color-midnight)"
        stroke="var(--cyan)"
        strokeOpacity="0.45"
      />
      {/* robot head */}
      <rect x="11" y="12" width="18" height="13" rx="2" fill="var(--color-deepblue)" stroke="var(--cyan)" strokeWidth="1.2" />
      <rect x="15" y="16" width="3.4" height="3.4" fill="var(--cyan)">
        <animate attributeName="opacity" values="1;0.35;1" dur="5s" repeatCount="indefinite" />
      </rect>
      <rect x="21.6" y="16" width="3.4" height="3.4" fill="var(--violet)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="5s" repeatCount="indefinite" />
      </rect>
      <path d="M20 12V8M17 8h6" stroke="var(--cyan)" strokeWidth="1.2" />
      {/* path line sweep */}
      <path
        d="M7 31h8l5-4h13"
        fill="none"
        stroke="var(--violet)"
        strokeWidth="1.6"
        strokeDasharray="6 30"
      >
        <animate attributeName="stroke-dashoffset" values="36;0" dur="4.5s" repeatCount="indefinite" />
      </path>
      <path d="M7 31h8l5-4h13" fill="none" stroke="var(--cyan)" strokeOpacity="0.25" strokeWidth="1.2" />
      
      {/* Smooth traveling light sweep across logo */}
      <rect x="-40" y="0" width="20" height="40" fill="url(#logo-sweep)" mask="url(#logo-mask)" style={{ mixBlendMode: 'screen' }}>
        <animate attributeName="x" values="-40;60" dur="4s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}
