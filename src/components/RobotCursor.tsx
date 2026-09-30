import { useEffect, useRef, useState } from "react";

type Trail = { x: number; y: number; id: number };

/** Small pixel-robot navigation pointer with a 4-particle trail. Desktop only. */
export function RobotCursor() {
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hot, setHot] = useState(false);
  const [click, setClick] = useState(false);
  const [trail, setTrail] = useState<Trail[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.style.cursor = "none";

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
        const target = e.target as HTMLElement | null;
        setHot(!!target?.closest("a,button,[data-cursor-hot]"));
        if (!reduced) {
          idRef.current += 1;
          const t = { x: e.clientX, y: e.clientY, id: idRef.current };
          setTrail((prev) => [t, ...prev].slice(0, 4));
        }
      });
    };
    const down = () => setClick(true);
    const up = () => setClick(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {trail.map((t, i) => (
        <span
          key={t.id}
          className="absolute h-[3px] w-[3px] rounded-[1px] bg-cyan"
          style={{
            left: t.x,
            top: t.y,
            opacity: 0.35 - i * 0.08,
            transform: "translate(-50%,-50%)",
          }}
        />
      ))}
      <div
        className="absolute transition-transform duration-150 ease-out"
        style={{
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%,-50%) scale(${click ? 0.85 : hot ? 1.35 : 1})`,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22">
          <rect
            x="6"
            y="6"
            width="10"
            height="10"
            fill="none"
            stroke={hot ? "var(--violet)" : "var(--cyan)"}
            strokeWidth="1.4"
          />
          <rect x="9.5" y="9.5" width="3" height="3" fill={hot ? "var(--violet)" : "var(--cyan)"} />
          <path
            d="M11 1v3M11 18v3M1 11h3M18 11h3"
            stroke={hot ? "var(--violet)" : "var(--cyan)"}
            strokeWidth="1.2"
            opacity="0.8"
          />
        </svg>
      </div>
    </div>
  );
}
