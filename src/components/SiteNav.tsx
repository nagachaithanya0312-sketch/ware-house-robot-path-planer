import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertTriangle,
  Cpu,
  LayoutGrid,
  Menu,
  Network,
  Play,
  Target,
  Video,
  Workflow,
  X,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { VideoModal } from "./VideoModal";

const items = [
  { to: "/", label: "HOME", Icon: LayoutGrid },
  { to: "/problem", label: "PROBLEM", Icon: AlertTriangle },
  { to: "/how-it-works", label: "HOW IT WORKS", Icon: Workflow },
  { to: "/demo", label: "DEMO", Icon: Play },
  { to: "/architecture", label: "ARCHITECTURE", Icon: Network },
  { to: "/technologies", label: "TECHNOLOGIES", Icon: Cpu },
  { to: "/future", label: "FUTURE", Icon: Target },
] as const;

export function SiteNav({ onLogoClick }: { onLogoClick?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-2xl">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <Link to="/" className="flex min-w-0 items-center gap-3 transition-all duration-[600ms] ease-out hover:scale-[1.02] group" onClick={(e) => {
          setOpen(false);
          if (onLogoClick) onLogoClick();
        }}>
          <BrandLogo />
          <span className="min-w-0">
            <span className="block truncate font-display text-[0.72rem] leading-tight font-black tracking-[0.18em] sm:text-sm text-premium-sweep transition-all duration-[600ms] ease-out group-hover:tracking-[0.24em]">
              WAREHOUSE ROBOT PATH PLANNER
            </span>
            <span className="label-tech hidden text-[0.58rem] transition-colors duration-[600ms] group-hover:text-cyan sm:block">
              INTELLIGENT WAREHOUSE NAVIGATION SYSTEM
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {items.map((it, i) => (
            <NavItem key={it.to} {...it} delay={i * 0.4} />
          ))}
          <button
            onClick={() => setVideoOpen(true)}
            className="group relative float-soft overflow-hidden rounded-md border border-cyan/40 px-3 py-2 font-mono text-[0.68rem] tracking-[0.15em] text-cyan transition-all duration-500 hover:bg-cyan/15 hover:border-cyan hover:shadow-[0_0_20px_oklch(0.79_0.14_195/0.3)] hover:-translate-y-[2px] ml-1"
            style={{ animationDelay: `${items.length * 0.4}s` }}
          >
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 bg-[var(--gradient-cyan-violet)] opacity-90 transition-transform duration-500 ease-out group-hover:scale-x-100" />
            <span className="relative flex items-center gap-2 transition-transform duration-300">
              <Video className="h-4 w-4 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_oklch(0.79_0.14_195/0.9)]" />
              SEE IT IN ACTION
            </span>
          </button>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="ctrl px-3 py-2 xl:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open ? (
        <nav className="grid gap-1 border-t border-border/70 px-4 pb-4 pt-3 sm:grid-cols-2 sm:px-6 xl:hidden">
          {items.map((it, i) => (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "text-cyan border-cyan/50" }}
              className="flex items-center gap-3 rounded-sm border border-transparent px-3 py-2.5 font-mono text-[0.7rem] tracking-[0.16em] text-secondary-foreground transition-all hover:border-cyan/40 hover:text-cyan animate-slide-in-stagger"
              style={{ animationDelay: `${i * 60}ms`, opacity: 0, animationFillMode: "forwards" }}
            >
              <it.Icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              setVideoOpen(true);
            }}
            className="flex items-center gap-3 rounded-sm border border-cyan/30 px-3 py-2.5 font-mono text-[0.7rem] tracking-[0.16em] text-cyan transition-all hover:bg-cyan/10 animate-slide-in-stagger"
            style={{ animationDelay: `${items.length * 60}ms`, opacity: 0, animationFillMode: "forwards" }}
          >
            <Video className="h-4 w-4" />
            SEE IT IN ACTION
          </button>
        </nav>
      ) : null}

      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </header>
  );
}

function NavItem({
  to,
  label,
  Icon,
  delay,
}: {
  to: string;
  label: string;
  Icon: typeof LayoutGrid;
  delay: number;
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: "active text-white bg-cyan/10 border-cyan/40 shadow-[0_0_15px_oklch(0.79_0.14_195/0.3)]" }}
      className="group relative float-soft overflow-hidden rounded-md border border-transparent px-3 py-2 font-mono text-[0.68rem] tracking-[0.15em] text-secondary-foreground/80 transition-all duration-500 hover:bg-cyan/15 hover:border-cyan/30 hover:text-cyan hover:shadow-[0_0_20px_oklch(0.79_0.14_195/0.2)] hover:-translate-y-[2px]"
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 bg-[var(--gradient-cyan-violet)] opacity-90 transition-transform duration-500 ease-out group-hover:scale-x-100 group-[.active]:scale-x-100" />
      <span className="relative flex items-center gap-2 transition-transform duration-300">
        <Icon className="h-4 w-4 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_oklch(0.79_0.14_195/0.9)] group-[.active]:scale-110 group-[.active]:drop-shadow-[0_0_8px_oklch(0.79_0.14_195/0.9)] group-[.active]:text-cyan" />
        {label}
      </span>
    </Link>
  );
}
