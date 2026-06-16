// Developer profile resolution (CONTEXT.md section 3.7 and 3.11). Returns the
// full evidence-based profile for a login. The DB path (Phase 3) reads the
// enriched developer and triggers on-demand ingestion when missing or stale.
// The seeded path builds a stable profile for any login so the X-ray works
// offline.

import type { Candidate } from "@/lib/types";
import { seededProfile } from "@/lib/seed/dataset";
import { caps } from "@/lib/engine/capabilities";
import { getDeveloperFromDb } from "@/lib/engine/developers";

export async function getProfile(login: string): Promise<Candidate | null> {
  const clean = login.trim().replace(/^@/, "");
  if (!clean) return null;

  if (caps.hasDatabase()) {
    const dev = await getDeveloperFromDb(clean);
    if (dev) return dev;
    // fall through to seeded if not yet ingested
  }

  return seededProfile(clean);
}
