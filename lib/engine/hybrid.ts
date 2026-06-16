// DB hybrid retrieval and ranking (CONTEXT.md section 7.5). Implemented in
// Phase 3 against Postgres plus pgvector. Returns null when the real path is not
// available or finds nothing usable, so callers fall back to the seeded path.

import type { SearchFilters, SearchResponse } from "@/lib/types";

export async function runHybridSearch(
  _query: string,
  _detectedSkills: string[],
  _filters: SearchFilters
): Promise<SearchResponse | null> {
  // Phase 3 fills this in: embed detected skills with Voyage, run vector
  // similarity against Capability.embedding, union candidates, apply SQL
  // filters, then rank with the weighted score from section 7.5.
  return null;
}
