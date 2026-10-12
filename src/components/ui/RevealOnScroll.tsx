import { useEffect, useRef, useState, ReactNode } from "react";

export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
  cascade = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  cascade?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { rootMargin: "0px 0px -50px 0px", threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} group ${isVisible ? 'is-revealed' : ''} ${
        cascade 
          ? "cascade-reveal" 
          : "scroll-reveal"
      }`}
      style={!cascade ? { transitionDelay: `${delay}ms` } : {}}
    >
      {children}
    </div>
  );
}
