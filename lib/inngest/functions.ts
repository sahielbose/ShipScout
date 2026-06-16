// Inngest functions (CONTEXT.md section 9). The pipeline: discover.domain fans
// out to ingest.developer, which chains enrich.developer and embed.profile. A
// refresh.stale cron re-ingests developers past the freshness threshold. Each
// job is idempotent and safe to retry.

import { inngest, EVENTS } from "@/lib/inngest/client";
import { prisma, hasDatabase } from "@/lib/db";
import { ingestDeveloper, persistEnrichment } from "@/lib/engine/ingest";
import { enrichDeveloper } from "@/lib/engine/enrich";
import { embedAndIndex } from "@/lib/engine/indexing";
import { fetchTopContributors } from "@/lib/github";
import { domainById, DOMAINS } from "@/lib/seed/domains";
import type { IngestedDeveloper } from "@/lib/types";

const STALE_MS = 14 * 24 * 60 * 60 * 1000;

const ingestDeveloperFn = inngest.createFunction(
  { id: "ingest-developer", retries: 3 },
  { event: EVENTS.ingestDeveloper },
  async ({ event, step }) => {
    const login = (event.data as { login: string }).login;
    const res = await step.run("ingest", () => ingestDeveloper(login));
    if (!res) return { skipped: true, login };
    await step.sendEvent("enqueue-enrich", {
      name: EVENTS.enrichDeveloper,
      data: { developerId: res.developerId },
    });
    return { developerId: res.developerId, login };
  }
);

const enrichDeveloperFn = inngest.createFunction(
  { id: "enrich-developer", retries: 3 },
  { event: EVENTS.enrichDeveloper },
  async ({ event, step }) => {
    const developerId = (event.data as { developerId: string }).developerId;
    const ok = await step.run("enrich", async () => {
      const rec = await prisma.developer.findUnique({ where: { id: developerId } });
      if (!rec?.rawJson) return false;
      const dev = rec.rawJson as unknown as IngestedDeveloper;
      const enrichment = await enrichDeveloper(dev);
      await persistEnrichment(developerId, dev, enrichment);
      return true;
    });
    if (!ok) return { skipped: true, developerId };
    await step.sendEvent("enqueue-embed", {
      name: EVENTS.embedProfile,
      data: { developerId },
    });
    return { developerId };
  }
);

const embedProfileFn = inngest.createFunction(
  { id: "embed-profile", retries: 3 },
  { event: EVENTS.embedProfile },
  async ({ event, step }) => {
    const developerId = (event.data as { developerId: string }).developerId;
    const result = await step.run("embed", () => embedAndIndex(developerId));
    return { developerId, ...result };
  }
);

const discoverDomainFn = inngest.createFunction(
  { id: "discover-domain", retries: 2 },
  { event: EVENTS.discoverDomain },
  async ({ event, step }) => {
    const domainId = (event.data as { domain: string }).domain;
    const domain = domainById(domainId) ?? DOMAINS[0];
    const logins = await step.run("top-contributors", async () => {
      const all: string[] = [];
      for (const repo of domain.repos) {
        const contributors = await fetchTopContributors(repo.fullName, 20);
        all.push(...contributors);
      }
      return [...new Set(all)];
    });
    if (logins.length) {
      await step.sendEvent(
        "fan-out-ingest",
        logins.map((login) => ({ name: EVENTS.ingestDeveloper, data: { login } }))
      );
    }
    return { domain: domain.id, queued: logins.length };
  }
);

const refreshStaleFn = inngest.createFunction(
  { id: "refresh-stale", retries: 1 },
  { cron: "0 6 * * *" },
  async ({ step }) => {
    if (!hasDatabase()) return { skipped: true };
    const stale = await step.run("find-stale", () =>
      prisma.developer.findMany({
        where: { lastSyncedAt: { lt: new Date(Date.now() - STALE_MS) } },
        select: { login: true },
        take: 50,
      })
    );
    if (stale.length) {
      await step.sendEvent(
        "requeue-ingest",
        stale.map((s) => ({ name: EVENTS.ingestDeveloper, data: { login: s.login } }))
      );
    }
    return { requeued: stale.length };
  }
);

export const functions = [
  ingestDeveloperFn,
  enrichDeveloperFn,
  embedProfileFn,
  discoverDomainFn,
  refreshStaleFn,
];
