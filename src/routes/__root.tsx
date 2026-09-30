import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SystemBackground } from "@/components/SystemBackground";
import { RobotCursor } from "@/components/RobotCursor";
import { SiteNav } from "@/components/SiteNav";
import { IntroScene } from "@/components/IntroScene";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="panel corner-frame max-w-md px-8 py-10 text-center">
        <p className="label-tech text-warning">SECTOR NOT FOUND</p>
        <h1 className="mt-3 font-display text-6xl font-black">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This grid location is not part of the warehouse map.
        </p>
        <Link to="/" className="ctrl ctrl-primary mt-6">
          RETURN TO CONTROL CENTER
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="panel corner-frame max-w-md px-8 py-10 text-center">
        <p className="label-tech text-danger">SYSTEM FAULT</p>
        <h1 className="mt-3 font-display text-xl font-bold">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The navigation module stopped unexpectedly. Try reinitializing.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="ctrl ctrl-primary"
          >
            RETRY
          </button>
          <a href="/" className="ctrl">
            GO HOME
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Warehouse Robot Path Planner" },
      {
        name: "description",
        content:
          "Intelligent warehouse navigation system: A* search with congestion-aware path planning for warehouse robots.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [entered, setEntered] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const seen = window.sessionStorage.getItem("wrpp-entered") === "1";
    setEntered(seen);
    setReady(true);
  }, []);

  const handleEnter = () => {
    window.sessionStorage.setItem("wrpp-entered", "1");
    setEntered(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SystemBackground />
      <RobotCursor />
      {ready && !entered ? <IntroScene onEnter={handleEnter} /> : null}
      <div
        className={`flex min-h-screen flex-col transition-all duration-1000 ease-out ${
          ready && !entered ? "scale-[0.98] opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <SiteNav />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <footer className="border-t border-border/70 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
            <span className="label-tech">WAREHOUSE ROBOT PATH PLANNER — COLLEGE PROJECT</span>
            <span className="label-tech text-cyan">
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success align-middle" />
              SYSTEM ONLINE
            </span>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
