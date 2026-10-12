import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SystemBackground } from "@/components/SystemBackground";
import { SiteNav } from "@/components/SiteNav";
import { IntroScene } from "@/components/IntroScene";
import { Volume2, VolumeX } from "lucide-react";

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
  errorComponent: ErrorComponent as never,
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
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setReady(true);
    
    // Initialize audio subtly
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0;
      audio.loop = true;
      
      const fadeIn = () => {
        let vol = 0;
        const targetVol = 0.25;
        const steps = 60;
        const stepTime = 3000 / steps; // 3 seconds total
        
        audio.volume = 0;
        const fadeInterval = setInterval(() => {
          vol += (targetVol / steps);
          if (vol >= targetVol) {
            audio.volume = targetVol;
            clearInterval(fadeInterval);
          } else {
            audio.volume = vol;
          }
        }, stepTime);
      };

      const p = audio.play();
      if (p !== undefined) {
        p.then(() => fadeIn()).catch(() => {
          // Autoplay prevented by browser without interaction
          const onInteract = () => {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise.then(() => fadeIn()).catch(() => {});
            }
          };
          document.addEventListener('click', onInteract, { once: true, capture: true });
          document.addEventListener('keydown', onInteract, { once: true, capture: true });
        });
      }
    }
  }, []);

  const handleEnter = () => {
    setEntered(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (audioRef.current.paused && !entered) {
        audioRef.current.play().catch(() => {});
      }
      audioRef.current.muted = !audioRef.current.muted;
      setMuted(audioRef.current.muted);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SystemBackground />
      <audio ref={audioRef} src="/moon.mp3" preload="auto" muted={muted} />
      {ready && !entered ? <IntroScene onEnter={handleEnter} /> : null}
      <div
        className={`flex min-h-screen flex-col transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          ready && !entered ? "scale-[0.96] opacity-0 blur-[4px] pointer-events-none" : "scale-100 opacity-100 blur-none"
        }`}
      >
        <SiteNav onLogoClick={() => {
          setEntered(false);
          if (audioRef.current) {
            audioRef.current.volume = 0.25; // Resume at comfortable volume
            const p = audioRef.current.play();
            if (p !== undefined) p.catch(() => {});
          }
        }} />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <footer className="border-t border-border/70 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
            <span className="label-tech">WAREHOUSE ROBOT PATH PLANNER — COLLEGE PROJECT</span>
            <div className="flex items-center gap-6">
              {!entered && (
                <button 
                  onClick={toggleMute}
                  className="label-tech flex items-center gap-2 hover:text-cyan transition-colors"
                  title="Toggle Background Music"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span>{muted ? "AUDIO OFF" : "AUDIO ON"}</span>
                </button>
              )}
              <span className="label-tech text-cyan">
                <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success align-middle" />
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
