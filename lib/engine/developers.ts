// Database-backed developer read and on-demand ingestion (CONTEXT.md sections
// 3.11, 7.2, 8). Implemented in Phase 3. Returns null when the DB path is not
// available or the developer is not yet ingested, so callers fall back to
// seeded data.

import type { Candidate } from "@/lib/types";

export async function getDeveloperFromDb(_login: string): Promise<Candidate | null> {
  // Phase 3: read Developer plus DeveloperProfile plus Capability plus Repo,
  // map to the Candidate shape, and enqueue ingest.developer when stale.
  return null;
}

export async function requestSync(_login: string): Promise<{ queued: boolean }> {
  // Phase 3: enqueue ingest.developer plus enrich.developer via Inngest.
  return { queued: false };
}
