"use client";

import { useEffect, useRef } from "react";
import type { Candidate } from "@/lib/types";
import { useAppStore } from "@/lib/store/useAppStore";

// Evidence-based candidate card (CONTEXT.md section 3.5): handle, location,
// evidence blurb, repo tags, shortlist toggle. Animates in with a small stagger.
export function CandidateCard({ candidate, index }: { candidate: Candidate; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const shortlisted = useAppStore((s) => s.shortlist.includes(candidate.login));
  const toggleShortlist = useAppStore((s) => s.toggleShortlist);
  const openProfile = useAppStore((s) => s.openProfile);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    const id = requestAnimationFrame(() => {
      el.style.transition = "opacity .4s, transform .4s";
      el.style.transitionDelay = index * 0.04 + "s";
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return () => cancelAnimationFrame(id);
  }, [index]);

  return (
    <div ref={ref} className="cand cand-card" onClick={() => openProfile(candidate.login)}>
      <div className="top">
        <span>
          <span className="nm">{candidate.login}</span>
        </span>
        <span
          className={`star ${shortlisted ? "on" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleShortlist(candidate.login);
          }}
        >
          {shortlisted ? "starred" : "shortlist"}
        </span>
      </div>
      <div className="at">{candidate.loc}</div>
      <div className="bl">{candidate.blurb}</div>
      <div>
        {candidate.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
