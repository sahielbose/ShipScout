import { Inngest } from "inngest";

// Inngest client (CONTEXT.md section 9). Background jobs run here: discovery,
// ingestion, enrichment, embedding, and stale refresh.
export const inngest = new Inngest({ id: "shipscout" });

// Event names, typed in one place so producers and consumers stay in sync.
export const EVENTS = {
  discoverDomain: "discover.domain",
  ingestDeveloper: "ingest.developer",
  enrichDeveloper: "enrich.developer",
  embedProfile: "embed.profile",
  refreshStale: "refresh.stale",
} as const;
