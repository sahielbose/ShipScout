// Hybrid search and ranking (CONTEXT.md section 7.5). Returns detected skills,
// a ranked candidate list, a count, a funnel, and a searchId.
//
// When a database and embeddings are configured, the DB hybrid path (added in
// Phase 3, lib/engine/hybrid.ts) runs vector similarity plus SQL filters with
// the weighted ranking. Without them, the seeded dataset path produces the same
// shaped response so the whole UI loop works offline.

import { randomUUID } from "node:crypto";
import type { SearchFilters, SearchResponse } from "@/lib/types";
import { detectCapabilities } from "@/lib/engine/detect";
import { applyFilters, computeFunnel, estimateCount } from "@/lib/engine/filter";
import { seededSearchData, seededRepos } from "@/lib/seed/dataset";
import { caps } from "@/lib/engine/capabilities";
import { runHybridSearch } from "@/lib/engine/hybrid";

export async function runSearch(query: string, filters: SearchFilters): Promise<SearchResponse> {
  const detectedSkills = await detectCapabilities(query);

  // Real path: Postgres plus pgvector hybrid retrieval and ranking.
  if (caps.hasDatabase()) {
    const hybrid = await runHybridSearch(query, detectedSkills, filters);
    if (hybrid) return hybrid;
    // fall through to seeded if the hybrid path returns nothing usable
  }

  // Seeded path (Phase 2). Deterministic, offline.
  const { candidates, total } = seededSearchData(query);
  const visible = applyFilters(candidates, filters);
  const match = estimateCount(total, filters, visible.length);
  const funnel = computeFunnel(total, filters, match);
  const repos = seededRepos(query);

  return {
    searchId: randomUUID(),
    detectedSkills,
    candidates: visible,
    total,
    funnel,
    repos,
  };
}
