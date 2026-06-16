"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store/useAppStore";

// The funnel (CONTEXT.md sections 3.6 and 7.5): Total to Location to Match, with
// bars that animate to their widths.
export function Funnel() {
  const total = useAppStore((s) => s.total);
  const f = useAppStore((s) => s.funnel());
  const ref = useRef<HTMLDivElement>(null);

  const widths = [
    100,
    total ? Math.round((f.location / total) * 100) : 0,
    total ? Math.round((f.match / total) * 100) : 0,
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bars = Array.from(el.querySelectorAll<HTMLElement>(".bar i"));
    bars.forEach((b) => (b.style.width = "0%"));
    const id = requestAnimationFrame(() => {
      bars.forEach((b, i) => setTimeout(() => (b.style.width = widths[i] + "%"), 60 * i));
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.total, f.location, f.match]);

  const rows = [
    { label: "Total", value: f.total },
    { label: "Location", value: f.location },
    { label: "Match", value: f.match },
  ];

  return (
    <div className="grp">
      <div className="gl">Funnel</div>
      <div className="funnel" ref={ref}>
        {rows.map((r) => (
          <div key={r.label}>
            <div className="frow">
              <span>{r.label}</span>
              <span>{r.value.toLocaleString()}</span>
            </div>
            <div className="bar">
              <i />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
