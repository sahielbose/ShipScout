// Inngest functions (CONTEXT.md section 9). The pipeline is filled in during
// Phase 3: discover.domain, ingest.developer, enrich.developer, embed.profile,
// and a refresh.stale cron. Each job is idempotent and safe to retry.
import type { InngestFunction } from "inngest";

export const functions: InngestFunction.Any[] = [];
