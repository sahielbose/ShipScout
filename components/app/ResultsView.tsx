"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { applyFilters, estimateCount } from "@/lib/engine/filter";
import { CandidateCard } from "@/components/app/CandidateCard";
import { SkillChips } from "@/components/app/SkillChips";
import { Filters } from "@/components/app/Filters";
import { Funnel } from "@/components/app/Funnel";
import { ProfileDrawer } from "@/components/app/ProfileDrawer";
import { exportCsv } from "@/components/app/csv";
import { IconDownload } from "@/components/app/Icons";

function Skeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="skel" key={i}>
          <div className="ln" style={{ width: "38%" }} />
          <div className="ln" style={{ width: "20%" }} />
          <div className="ln" style={{ width: "90%" }} />
          <div className="ln" style={{ width: "70%" }} />
        </div>
      ))}
    </>
  );
}

// Results, filters, funnel, and the profile drawer (CONTEXT.md sections 3.5 to 3.7).
export function ResultsView() {
  const loading = useAppStore((s) => s.loading);
  const candidates = useAppStore((s) => s.candidates);
  const filters = useAppStore((s) => s.filters);
  const total = useAppStore((s) => s.total);
  const list = useMemo(() => applyFilters(candidates, filters), [candidates, filters]);
  const count = useMemo(
    () => estimateCount(total, filters, list.length),
    [total, filters, list.length]
  );

  return (
    <div className="view on">
      <div className="res-layout">
        <div className="res-main">
          <div className="res-head">
            <span className="cc">
              <b>{count.toLocaleString()}</b> candidates
            </span>
            <button className="csv" onClick={() => exportCsv()}>
              <IconDownload /> Export CSV
            </button>
          </div>
          <div>
            {loading ? (
              <Skeleton />
            ) : list.length === 0 ? (
              <div style={{ color: "var(--faint)", fontSize: 13.5, padding: "30px 4px", lineHeight: 1.7 }}>
                No candidates match these filters. Loosen the seniority, location, or repository
                filters to widen the pool.
              </div>
            ) : (
              list.map((c, i) => <CandidateCard key={c.login} candidate={c} index={i} />)
            )}
          </div>
        </div>

        <div className="res-side">
          <div className="sh">
            <span className="mono-label" style={{ letterSpacing: ".2em" }}>
              Sort and filter
            </span>
          </div>
          <SkillChips />
          <Filters />
          <Funnel />
        </div>
      </div>

      <ProfileDrawer />
    </div>
  );
}
