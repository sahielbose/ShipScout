// Pure filter, count, and funnel math (CONTEXT.md sections 3.6 and 7.5 step 5).
// Shared by the seeded path, the real engine, and the client (which recomputes
// counts and the funnel live as filters change, exactly like the prototype).

import type { Candidate, Funnel, SearchFilters } from "@/lib/types";

export function applyFilters(candidates: Candidate[], filters: SearchFilters): Candidate[] {
  let list = candidates.slice();
  if (filters.seniority !== "Any") list = list.filter((c) => c.seniority === filters.seniority);
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    list = list.filter((c) => c.loc.toLowerCase().includes(loc));
  }
  if (filters.repos.length) {
    list = list.filter((c) => filters.repos.some((rp) => c.tags.includes(rp)));
  }
  return list;
}

// Estimated pool size after filters (a derived signal, not a precise count).
export function estimateCount(total: number, filters: SearchFilters, filteredLen: number): number {
  let n = total;
  if (filters.location) n = Math.round(n * 0.61);
  if (filters.seniority === "Senior") n = Math.round(n * 0.53);
  else if (filters.seniority === "Mid") n = Math.round(n * 0.34);
  else if (filters.seniority === "Junior") n = Math.round(n * 0.18);
  if (filters.repos.length) n = Math.round(n * Math.pow(0.7, filters.repos.length));
  return Math.max(filteredLen, n);
}

export function computeFunnel(total: number, filters: SearchFilters, matchCount: number): Funnel {
  const location = filters.location ? Math.round(total * 0.61) : Math.round(total * 0.78);
  return { total, location, match: matchCount };
}
