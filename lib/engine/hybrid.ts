// DB hybrid retrieval and ranking (CONTEXT.md section 7.5). Embeds the detected
// capabilities, runs vector similarity against Capability.embedding, unions the
// candidate developers, applies structured SQL filters, and ranks with the
// weighted score. Returns null when the real path is unavailable or finds
// nothing, so callers fall back to the seeded path.
//
// Honest note: the ranking weights below match section 7.5, but contribution
// depth, external-PR signal, stars, and recency are normalized heuristically.
// The eval set gates the ranking shape; tune the normalizers against real data.

import { randomUUID } from "node:crypto";
import type { Candidate, Funnel, RepoFacet, SearchFilters, SearchResponse } from "@/lib/types";
import { prisma } from "@/lib/db";
import { caps } from "@/lib/engine/capabilities";
import { embed, isVoyageAvailable } from "@/lib/ai/embed";
import { toVectorLiteral } from "@/lib/engine/indexing";
import { dbDeveloperToCandidate, type DbDeveloperFull } from "@/lib/engine/developers";
import { applyFilters } from "@/lib/engine/filter";

interface RankRow {
  developerId: string;
  sim: number;
}

interface DevWithExtras extends DbDeveloperFull {
  contributions: { type: string; count: number; mergedExternal: boolean }[];
  lastSyncedAt: Date | null;
}

function contributionCount(dev: DevWithExtras, type: string): number {
  return dev.contributions.filter((c) => c.type === type).reduce((a, c) => a + c.count, 0);
}

function externalPrs(dev: DevWithExtras): number {
  return dev.contributions.filter((c) => c.type === "pr" && c.mergedExternal).reduce((a, c) => a + c.count, 0);
}

function recencyScore(lastSyncedAt: Date | null): number {
  if (!lastSyncedAt) return 0.6;
  const ageDays = (Date.now() - lastSyncedAt.getTime()) / (24 * 60 * 60 * 1000);
  return Math.max(0.3, Math.exp(-ageDays / 60));
}

function score(dev: DevWithExtras, sim: number): number {
  const commits = contributionCount(dev, "commit");
  const prs = contributionCount(dev, "pr");
  const depth = Math.min(1, (commits + prs * 4) / 2000);
  const extSignal = Math.min(1, externalPrs(dev) / 50);
  const maxStars = dev.repos.reduce((m, r) => Math.max(m, r.stars), 0);
  const starScore = Math.min(1, Math.log10(maxStars + 1) / 5);
  const recency = recencyScore(dev.lastSyncedAt);
  return (
    0.45 * sim + 0.2 * depth + 0.15 * extSignal + 0.1 * starScore + 0.1 * recency
  );
}

function repoFacets(devs: DevWithExtras[]): RepoFacet[] {
  const counts = new Map<string, { stars: number; count: number }>();
  for (const d of devs) {
    for (const r of d.repos) {
      const cur = counts.get(r.fullName) || { stars: r.stars, count: 0 };
      cur.count++;
      cur.stars = Math.max(cur.stars, r.stars);
      counts.set(r.fullName, cur);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count || b[1].stars - a[1].stars)
    .slice(0, 4)
    .map(([name, v]) => ({ name, stars: (v.stars / 1000).toFixed(1) + "k" }));
}

export async function runHybridSearch(
  query: string,
  detectedSkills: string[],
  filters: SearchFilters
): Promise<SearchResponse | null> {
  if (!caps.hasDatabase() || !isVoyageAvailable()) return null;

  const anchors = detectedSkills.length ? detectedSkills : [query];
  const embeddings = await embed(anchors, "query");
  if (!embeddings) return null;

  // Vector retrieval: best cosine similarity per developer across all anchors.
  const simByDev = new Map<string, number>();
  for (const e of embeddings) {
    const lit = toVectorLiteral(e);
    const rows = await prisma.$queryRawUnsafe<RankRow[]>(
      'SELECT "developerId", 1 - (embedding <=> $1::vector) AS sim FROM "Capability" WHERE embedding IS NOT NULL ORDER BY embedding <=> $1::vector LIMIT 60',
      lit
    );
    for (const r of rows) {
      const prev = simByDev.get(r.developerId) ?? 0;
      if (r.sim > prev) simByDev.set(r.developerId, r.sim);
    }
  }
  if (simByDev.size === 0) return null;

  const ids = [...simByDev.keys()];
  const devs = (await prisma.developer.findMany({
    where: { id: { in: ids }, status: "ready" },
    include: {
      repos: { orderBy: { stars: "desc" }, take: 12 },
      capabilities: { orderBy: { confidence: "desc" }, take: 15 },
      profile: true,
      contributions: true,
    },
  })) as unknown as DevWithExtras[];

  if (devs.length === 0) return null;

  const ranked = devs
    .map((d) => ({ d, candidate: dbDeveloperToCandidate(d), s: score(d, simByDev.get(d.id) ?? 0) }))
    .sort((a, b) => b.s - a.s);

  const allCandidates: Candidate[] = ranked.map((r) => ({ ...r.candidate, score: r.s }));
  const visible = applyFilters(allCandidates, filters);

  const total = allCandidates.length;
  const afterLoc = filters.location
    ? allCandidates.filter((c) => c.loc.toLowerCase().includes(filters.location.toLowerCase())).length
    : total;
  const funnel: Funnel = { total, location: afterLoc, match: visible.length };

  return {
    searchId: randomUUID(),
    detectedSkills,
    candidates: visible,
    total,
    funnel,
    repos: repoFacets(devs),
  };
}
