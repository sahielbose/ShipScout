"use client";

// Scroll-reveal wrapper. Replicates the prototype IntersectionObserver: adds the
// `in` class when the element scrolls into view (threshold 0.14) then unobserves.
// Reduced-motion handling already lives in globals.css.
import { useEffect, useRef } from "react";

type Delay = "d1" | "d2" | "d3" | "d4" | "d5";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: Delay;
  style?: React.CSSProperties;
}

export function Reveal({ children, className, delay, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (node.classList.contains("in")) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            // Animate any funnel bars within this element to their data-w widths.
            entry.target
              .querySelectorAll<HTMLElement>("[data-w]")
              .forEach((bar) => {
                bar.style.width = `${bar.dataset.w}%`;
              });
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, []);

  const classes = ["reveal", delay, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} style={style}>
      {children}
    </div>
  );
}
