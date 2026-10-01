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
  Users,
  Workflow,
  X,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const items = [
  { to: "/", label: "HOME", Icon: LayoutGrid },
  { to: "/problem", label: "PROBLEM", Icon: AlertTriangle },
  { to: "/how-it-works", label: "HOW IT WORKS", Icon: Workflow },
  { to: "/demo", label: "DEMO", Icon: Play },
  { to: "/architecture", label: "ARCHITECTURE", Icon: Network },
  { to: "/technologies", label: "TECHNOLOGIES", Icon: Cpu },
  { to: "/future", label: "FUTURE", Icon: Target },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <BrandLogo />
          <span className="min-w-0">
            <span className="block truncate font-display text-[0.72rem] leading-tight font-black tracking-[0.18em] sm:text-sm">
              WAREHOUSE ROBOT PATH PLANNER
            </span>
            <span className="label-tech hidden text-[0.58rem] sm:block">
              INTELLIGENT WAREHOUSE NAVIGATION SYSTEM
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {items.map((it, i) => (
            <NavItem key={it.to} {...it} delay={i * 0.4} />
          ))}
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
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              activeProps={{ className: "text-cyan border-cyan/50" }}
              className="flex items-center gap-3 rounded-sm border border-transparent px-3 py-2.5 font-mono text-[0.7rem] tracking-[0.16em] text-secondary-foreground transition-colors hover:border-cyan/40 hover:text-cyan"
            >
              <it.Icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
        </nav>
      ) : null}
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
      activeProps={{ className: "text-cyan" }}
      className="group relative float-soft overflow-hidden rounded-sm px-2.5 py-2 font-mono text-[0.64rem] tracking-[0.14em] text-secondary-foreground/85 transition-colors duration-500 hover:text-cyan"
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="pointer-events-none absolute inset-x-1 bottom-1 h-px origin-left scale-x-0 bg-[var(--gradient-cyan-violet)] transition-transform duration-700 ease-out group-hover:scale-x-100" />
      <span className="relative flex items-center gap-1.5 transition-transform duration-500 group-hover:-translate-y-[1px]">
        <Icon className="h-3.5 w-3.5 transition-[filter] duration-500 group-hover:drop-shadow-[0_0_6px_oklch(0.79_0.14_195/0.9)]" />
        {label}
      </span>
    </Link>
  );
}
