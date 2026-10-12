import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function VideoModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 p-4 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl aspect-video max-h-[85vh] rounded-xl border border-cyan/30 bg-black shadow-[0_0_50px_rgba(0,184,255,0.25)] overflow-hidden flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/60 p-2 text-foreground backdrop-blur-md transition-all hover:bg-destructive hover:text-destructive-foreground hover:scale-110"
          aria-label="Close video"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="w-full h-full">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/0PjaBnW6fvI?autoplay=1&rel=0&modestbranding=1&playsinline=1&vq=hd1080&cc_load_policy=0"
            title="Warehouse Robot Path Planner - See It in Action"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
