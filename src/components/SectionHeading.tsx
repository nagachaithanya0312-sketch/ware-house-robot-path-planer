import type { ReactNode } from "react";

export function SectionHeading({
  tag,
  title,
  lead,
  align = "left",
}: {
  tag: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <header className={`animate-rise ${align === "center" ? "text-center" : ""}`}>
      <div
        className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="h-px w-8 bg-cyan/60" />
        <span className="label-tech text-cyan">{tag}</span>
      </div>
      <h1 className="mt-4 text-3xl leading-tight font-black tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {lead ? (
        <p
          className={`mt-4 max-w-2xl text-base text-secondary-foreground/85 sm:text-lg ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}
