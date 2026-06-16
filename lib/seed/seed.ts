// Seeding (CONTEXT.md sections 7.1 and 14). Two modes:
//
//   tsx lib/seed/seed.ts          seed the generated starter universe into the
//                                 database so the real search path feels full
//                                 without any external API.
//   tsx lib/seed/seed.ts --live   discover real top contributors per domain via
//                                 the GitHub API, then ingest, enrich, and embed
//                                 them (needs GITHUB_TOKEN).
//
// Without DATABASE_URL there is nothing to persist: the app already runs on the
// in-memory seeded dataset (lib/seed/dataset). No em dashes, no emojis.

import { Prisma } from "@prisma/client";
import { prisma, hasDatabase } from "@/lib/db";
import { isVoyageAvailable } from "@/lib/ai/embed";
import { isGitHubAvailable, fetchTopContributors } from "@/lib/github";
import { genUniverse } from "@/lib/seed/generate";
import { DOMAINS } from "@/lib/seed/domains";
import { ingestDeveloper, persistEnrichment } from "@/lib/engine/ingest";
import { enrichDeveloper } from "@/lib/engine/enrich";
import { embedAndIndex } from "@/lib/engine/indexing";
import type { Candidate } from "@/lib/types";

function json(v: unknown): Prisma.InputJsonValue {
  return v as Prisma.InputJsonValue;
}

async function upsertCandidate(c: Candidate): Promise<string> {
  const ins = c.insights;
  const common = {
    name: c.name,
    location: c.loc,
    bio: null,
    avatarUrl: c.avatarUrl ?? null,
    followers: ins.followers,
    publicRepos: ins.repos,
    rawJson: json(c),
    status: "ready",
    lastSyncedAt: new Date(),
  };
  const dev = await prisma.developer.upsert({
    where: { login: c.login },
    create: { login: c.login, ...common },
    update: common,
  });

  await prisma.repo.deleteMany({ where: { developerId: dev.id } });
  await prisma.contribution.deleteMany({ where: { developerId: dev.id } });
  await prisma.capability.deleteMany({ where: { developerId: dev.id } });

  if (ins.projects.length) {
    await prisma.repo.createMany({
      data: ins.projects.map((p) => ({
        developerId: dev.id,
        fullName: `${c.login}/${p.name}`,
        name: p.name,
        description: null,
        stars: Number(p.stars) || 0,
        primaryLanguage: p.lang,
        languagesJson: json({ [p.lang]: 1 }),
        isFork: false,
      })),
    });
  }
  if (c.skills.length) {
    await prisma.capability.createMany({
      data: c.skills.map((label, i) => ({
        developerId: dev.id,
        label,
        domain: null,
        confidence: Math.max(0.5, 0.9 - i * 0.08),
        evidenceJson: json(c.tags),
      })),
    });
  }
  const profileData = {
    seniority: c.seniority,
    seniorityReason: `${c.seniority} signal from public activity.`,
    summary: c.about,
    languagesBreakdown: json(ins.bar.map((b) => ({ lang: b.lang, pct: b.pct }))),
    signalsJson: json({ externalPrsMerged: ins.ext }),
    insightsJson: json(ins),
  };
  await prisma.developerProfile.upsert({
    where: { developerId: dev.id },
    create: { developerId: dev.id, ...profileData },
    update: profileData,
  });
  return dev.id;
}

async function seedUniverse() {
  const universe = genUniverse(30);
  console.log(`Seeding ${universe.length} generated developers across ${DOMAINS.length} domains...`);
  let done = 0;
  for (const c of universe) {
    const id = await upsertCandidate(c);
    if (isVoyageAvailable()) await embedAndIndex(id);
    done++;
    if (done % 30 === 0) console.log(`  ${done}/${universe.length}`);
  }
  console.log(
    isVoyageAvailable()
      ? "Done. Developers seeded and embedded into pgvector."
      : "Done. Developers seeded. Set VOYAGE_API_KEY and re-run to add embeddings for vector search."
  );
}

async function seedLive() {
  console.log("Live discovery: pulling top contributors per domain from GitHub...");
  const perRepo = 5;
  const logins = new Set<string>();
  for (const domain of DOMAINS) {
    for (const repo of domain.repos.slice(0, 3)) {
      const contributors = await fetchTopContributors(repo.fullName, perRepo);
      contributors.forEach((l) => logins.add(l));
      console.log(`  ${repo.fullName}: ${contributors.length} contributors`);
    }
  }
  const list = [...logins];
  console.log(`Ingesting ${list.length} developers...`);
  let done = 0;
  for (const login of list) {
    try {
      const res = await ingestDeveloper(login);
      if (res) {
        const enrichment = await enrichDeveloper(res.dev);
        await persistEnrichment(res.developerId, res.dev, enrichment);
        if (isVoyageAvailable()) await embedAndIndex(res.developerId);
      }
    } catch (err) {
      console.warn(`  skip ${login}:`, err instanceof Error ? err.message : err);
    }
    done++;
    if (done % 10 === 0) console.log(`  ${done}/${list.length}`);
  }
  console.log("Done. Live developers ingested, enriched, and indexed.");
}

async function main() {
  if (!hasDatabase()) {
    console.log(
      "No DATABASE_URL set. ShipScout already runs on the in-memory seeded dataset (lib/seed/dataset). Set DATABASE_URL and run prisma migrate plus the vector migration to persist."
    );
    return;
  }
  const live = process.argv.includes("--live");
  if (live) {
    if (!isGitHubAvailable()) {
      console.log("--live needs GITHUB_TOKEN. Falling back to the generated universe.");
      await seedUniverse();
    } else {
      await seedLive();
    }
  } else {
    await seedUniverse();
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
