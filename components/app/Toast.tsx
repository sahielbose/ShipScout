"use client";

import { useAppStore } from "@/lib/store/useAppStore";

export function Toast() {
  const msg = useAppStore((s) => s.toastMsg);
  return (
    <div className={`toast ${msg ? "show" : ""}`} role="status" aria-live="polite">
      <span className="td" />
      <span>{msg}</span>
    </div>
  );
}
