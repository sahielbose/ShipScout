// Database-backed developer read and on-demand ingestion (CONTEXT.md sections
// 3.11, 7.2, 8). Returns null when the DB path is unavailable or the developer
// is not yet ingested, so callers fall back to seeded data.

import type { Candidate, Insights } from "@/lib/types";
import { prisma, hasDatabase } from "@/lib/db";
import { caps } from "@/lib/engine/capabilities";
import { inngest, EVENTS } from "@/lib/inngest/client";

const STALE_DAYS = 14;

// The shape we read from Prisma (Developer with its relations included).
export interface DbDeveloperFull {
  id: string;
  login: string;
  name: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followers: number;
  publicRepos: number;
  status: string;
  lastSyncedAt: Date | null;
  repos: { name: string; fullName: string; stars: number; primaryLanguage: string | null }[];
  capabilities: { label: string }[];
  profile: {
    seniority: string | null;
    summary: string | null;
    insightsJson: unknown;
  } | null;
}

function fallbackInsights(dev: DbDeveloperFull): Insights {
  return {
    repos: dev.publicRepos,
    followers: dev.followers,
    commits: 0,
    prs: 0,
    issues: 0,
    reviews: 0,
    ext: 0,
    active: [],
    projects: dev.repos.slice(0, 5).map((r) => ({ name: r.name, lang: r.primaryLanguage || "code", stars: r.stars })),
    langs: [],
    bar: [],
  };
}

export function dbDeveloperToCandidate(dev: DbDeveloperFull): Candidate {
  const insights = (dev.profile?.insightsJson as Insights | undefined) || fallbackInsights(dev);
  const skills = dev.capabilities.map((c) => c.label).slice(0, 4);
  const tags = dev.repos.slice(0, 4).map((r) => r.name);
  const seniority = (dev.profile?.seniority as Candidate["seniority"]) || "Mid";
  const senWord = seniority === "Senior" ? "Senior " : seniority === "Junior" ? "Early-career " : "";
  const blurb = `${senWord}engineer focused on ${skills[0] || "open source"}${
    skills[1] ? " and " + skills[1] : ""
  }, ${insights.commits}+ commits this year.`;
  const name = dev.name || dev.login;
  const parts = name.split(" ");
  return {
    login: dev.login,
    name,
    initials: ((parts[0]?.[0] || "S") + (parts[1]?.[0] || "")).toUpperCase(),
    avatarUrl: dev.avatarUrl,
    loc: dev.location || "On GitHub",
    seniority,
    blurb,
    tags,
    skills,
    about: dev.profile?.summary || `${name} ships in open source across ${tags.join(", ")}.`,
    insights,
  };
}

function isStale(lastSyncedAt: Date | null): boolean {
  if (!lastSyncedAt) return true;
  const ageMs = Date.now() - lastSyncedAt.getTime();
  return ageMs > STALE_DAYS * 24 * 60 * 60 * 1000;
}

export async function getDeveloperFromDb(login: string): Promise<Candidate | null> {
  if (!hasDatabase()) return null;
  const dev = (await prisma.developer.findUnique({
    where: { login },
    include: {
      repos: { orderBy: { stars: "desc" }, take: 12 },
      capabilities: { orderBy: { confidence: "desc" }, take: 15 },
      profile: true,
    },
  })) as unknown as DbDeveloperFull | null;

  if (!dev) {
    // Not ingested yet: enqueue ingestion so a later visit resolves live.
    await requestSync(login);
    return null;
  }

  // Refresh in the background if stale, but serve what we have now.
  if (isStale(dev.lastSyncedAt) && caps.hasInngest()) {
    await requestSync(login);
  }

  if (dev.status !== "ready" || !dev.profile) return null;
  return dbDeveloperToCandidate(dev);
}

export async function requestSync(login: string): Promise<{ queued: boolean }> {
  if (!caps.hasInngest()) return { queued: false };
  try {
    await inngest.send({ name: EVENTS.ingestDeveloper, data: { login } });
    return { queued: true };
  } catch {
    return { queued: false };
  }
}
