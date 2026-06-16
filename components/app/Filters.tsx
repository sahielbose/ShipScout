"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import type { SearchFilters } from "@/lib/types";

const SENIORITY: Array<SearchFilters["seniority"]> = ["Any", "Junior", "Mid", "Senior"];

// Filters (CONTEXT.md section 3.6): seniority, location, and repositories with
// star counts. Every filter narrows the list and updates the funnel.
export function Filters() {
  const filters = useAppStore((s) => s.filters);
  const repos = useAppStore((s) => s.repos);
  const setSeniority = useAppStore((s) => s.setSeniority);
  const setLocation = useAppStore((s) => s.setLocation);
  const toggleRepo = useAppStore((s) => s.toggleRepo);

  return (
    <>
      <div className="grp">
        <div className="gl">Seniority</div>
        <div className="toggle">
          {SENIORITY.map((s) => (
            <b key={s} className={filters.seniority === s ? "on" : ""} onClick={() => setSeniority(s)}>
              {s}
            </b>
          ))}
        </div>
      </div>

      <div className="grp">
        <div className="gl">Location</div>
        <input
          className="loc-input"
          placeholder="Anywhere"
          spellCheck={false}
          value={filters.location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="grp">
        <div className="gl">Repositories ({repos.length})</div>
        <div className="repo-list">
          {repos.map((rp) => {
            const key = rp.name.split("/").pop() as string;
            const on = filters.repos.includes(key);
            return (
              <div key={rp.name} className={`repo-chip ${on ? "on" : ""}`} onClick={() => toggleRepo(key)}>
                <span>{rp.name}</span>
                <span className="st">star {rp.stars}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
