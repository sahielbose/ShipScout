// Ingestion (CONTEXT.md section 7.2): pull one developer's public footprint from
// GitHub and store raw plus normalized rows. A no-op without a database or a
// GitHub token. Enrichment and embedding run as later steps in the pipeline.

import { Prisma } from "@prisma/client";
import { prisma, hasDatabase } from "@/lib/db";
import { fetchDeveloper, isGitHubAvailable } from "@/lib/github";
import { buildInsights } from "@/lib/engine/enrich";
import type { EnrichmentResult, IngestedDeveloper } from "@/lib/types";

function json(v: unknown): Prisma.InputJsonValue {
  return v as Prisma.InputJsonValue;
}

export async function ingestDeveloper(
  login: string
): Promise<{ developerId: string; dev: IngestedDeveloper } | null> {
  if (!hasDatabase() || !isGitHubAvailable()) return null;
  const dev = await fetchDeveloper(login);
  if (!dev) return null;

  const common = {
    name: dev.name,
    location: dev.location,
    bio: dev.bio,
    avatarUrl: dev.avatarUrl,
    followers: dev.followers,
    publicRepos: dev.publicRepos,
    hireable: dev.hireable ?? undefined,
    rawJson: json(dev),
    status: "enriching",
    lastSyncedAt: new Date(),
  };
  const record = await prisma.developer.upsert({
    where: { login: dev.login },
    create: { login: dev.login, ...common },
    update: common,
  });

  // Replace normalized rows (idempotent re-ingest).
  await prisma.repo.deleteMany({ where: { developerId: record.id } });
  await prisma.contribution.deleteMany({ where: { developerId: record.id } });
  if (dev.repos.length) {
    await prisma.repo.createMany({
      data: dev.repos.map((r) => ({
        developerId: record.id,
        fullName: r.fullName,
        name: r.name,
        description: r.description,
        stars: r.stars,
        primaryLanguage: r.primaryLanguage,
        languagesJson: json(r.languages),
        isFork: r.isFork,
      })),
    });
  }
  if (dev.contributions.length) {
    await prisma.contribution.createMany({
      data: dev.contributions.map((c) => ({
        developerId: record.id,
        type: c.type,
        repoFullName: c.repoFullName,
        count: c.count,
        mergedExternal: c.mergedExternal,
        year: c.year,
      })),
    });
  }

  return { developerId: record.id, dev };
}

export async function persistEnrichment(
  developerId: string,
  dev: IngestedDeveloper,
  enrichment: EnrichmentResult
): Promise<void> {
  await prisma.capability.deleteMany({ where: { developerId } });
  if (enrichment.capabilities.length) {
    await prisma.capability.createMany({
      data: enrichment.capabilities.map((c) => ({
        developerId,
        label: c.label,
        domain: c.domain,
        confidence: c.confidence,
        evidenceJson: json(c.evidence),
      })),
    });
  }
  const insights = buildInsights(dev, enrichment);
  const profileData = {
    seniority: enrichment.seniority,
    seniorityReason: enrichment.seniorityReason,
    summary: enrichment.summary,
    languagesBreakdown: json(enrichment.languages),
    signalsJson: json(enrichment.signals),
    insightsJson: json(insights),
  };
  await prisma.developerProfile.upsert({
    where: { developerId },
    create: { developerId, ...profileData },
    update: profileData,
  });
  await prisma.developer.update({ where: { id: developerId }, data: { status: "ready" } });
}
