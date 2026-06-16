// Enrichment (CONTEXT.md section 7.3): turn raw contributions into a structured,
// searchable profile using Claude, with a deterministic fallback grounded in the
// ingested data so enrichment never fabricates and always produces a result.

import type {
  Candidate,
  EnrichmentResult,
  IngestedDeveloper,
  Insights,
  LangBar,
  Seniority,
} from "@/lib/types";
import { claudeJSON, isAnthropicAvailable } from "@/lib/ai/claude";
import { ENRICH_SYSTEM, enrichUser } from "@/lib/ai/prompts";
import { LANG_COLORS, domainFor } from "@/lib/seed/domains";

// Aggregate language bytes across repos into ranked percentages.
function languageBreakdown(dev: IngestedDeveloper): { lang: string; pct: number }[] {
  const totals: Record<string, number> = {};
  for (const r of dev.repos) {
    for (const [lang, bytes] of Object.entries(r.languages || {})) {
      totals[lang] = (totals[lang] || 0) + bytes;
    }
    if (r.primaryLanguage && !r.languages?.[r.primaryLanguage]) {
      totals[r.primaryLanguage] = (totals[r.primaryLanguage] || 0) + Math.max(1, r.stars);
    }
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang, bytes]) => ({ lang, pct: Math.round((bytes / sum) * 100) }));
}

function contributionCount(dev: IngestedDeveloper, type: string): number {
  return dev.contributions.filter((c) => c.type === type).reduce((a, c) => a + c.count, 0);
}

function externalPrs(dev: IngestedDeveloper): number {
  const fromContrib = dev.contributions
    .filter((c) => c.type === "pr" && c.mergedExternal)
    .reduce((a, c) => a + c.count, 0);
  return Math.max(fromContrib, dev.notablePullRequests.filter((p) => p.mergedExternal).length);
}

function estimateSeniority(dev: IngestedDeveloper): { seniority: Seniority; reason: string } {
  const commits = contributionCount(dev, "commit");
  const reviews = contributionCount(dev, "review");
  const ext = externalPrs(dev);
  const score =
    commits / 800 + reviews / 30 + ext / 25 + dev.followers / 400 + dev.publicRepos / 80;
  if (score >= 3) {
    return {
      seniority: "Senior",
      reason: `Sustained ownership: ${commits} commits, ${reviews} reviews, ${ext} external PRs merged.`,
    };
  }
  if (score >= 1.4) {
    return { seniority: "Mid", reason: `Steady contributor: ${commits} commits and ${ext} external PRs.` };
  }
  return { seniority: "Junior", reason: `Early-career signal: ${commits} commits this year.` };
}

// Deterministic enrichment from the ingested footprint (no model required).
export function deterministicEnrich(dev: IngestedDeveloper): EnrichmentResult {
  const text = dev.repos.map((r) => `${r.name} ${r.description || ""}`).join(" ");
  const domain = domainFor(text + " " + (dev.bio || ""));
  const evidenceRepos = dev.repos.slice(0, 4).map((r) => r.fullName);
  const capabilities = domain.skills.slice(0, 6).map((label, i) => ({
    label,
    domain: domain.id,
    confidence: Math.max(0.5, 0.9 - i * 0.07),
    evidence: evidenceRepos.length ? evidenceRepos : [domain.repos[0]?.fullName].filter(Boolean) as string[],
  }));
  const { seniority, reason } = estimateSeniority(dev);
  const languages = languageBreakdown(dev);
  const ext = externalPrs(dev);
  const langNames = languages.map((l) => l.lang).slice(0, 3);
  const summary = `${dev.name || dev.login} works across ${
    langNames.join(", ") || domain.langs.slice(0, 3).join(", ")
  }, with public repositories spanning ${capabilities[0]?.label || domain.skills[0]} and ${
    capabilities[1]?.label || domain.skills[1]
  }. Contributed ${ext} merged external pull requests over the last year.`;
  return {
    capabilities,
    seniority,
    seniorityReason: reason,
    summary,
    languages,
    signals: { externalPrsMerged: ext },
  };
}

function validateEnrichment(
  result: EnrichmentResult | null,
  fallback: EnrichmentResult
): EnrichmentResult {
  if (!result || !Array.isArray(result.capabilities) || result.capabilities.length === 0) {
    return fallback;
  }
  const seniority: Seniority = ["Junior", "Mid", "Senior"].includes(result.seniority)
    ? result.seniority
    : fallback.seniority;
  return {
    capabilities: result.capabilities.slice(0, 15),
    seniority,
    seniorityReason: result.seniorityReason || fallback.seniorityReason,
    summary: result.summary || fallback.summary,
    languages: Array.isArray(result.languages) && result.languages.length ? result.languages : fallback.languages,
    signals: result.signals || fallback.signals,
  };
}

// A compact projection of the developer for the prompt (keeps tokens reasonable).
function compactForPrompt(dev: IngestedDeveloper) {
  return {
    login: dev.login,
    name: dev.name,
    location: dev.location,
    bio: dev.bio,
    followers: dev.followers,
    publicRepos: dev.publicRepos,
    topRepos: dev.repos.slice(0, 12).map((r) => ({
      fullName: r.fullName,
      stars: r.stars,
      language: r.primaryLanguage,
      description: r.description,
    })),
    contributions: dev.contributions,
    notablePRs: dev.notablePullRequests.slice(0, 5),
  };
}

export async function enrichDeveloper(dev: IngestedDeveloper): Promise<EnrichmentResult> {
  const fallback = deterministicEnrich(dev);
  if (!isAnthropicAvailable()) return fallback;
  const result = await claudeJSON<EnrichmentResult>(
    ENRICH_SYSTEM,
    enrichUser(compactForPrompt(dev)),
    fallback,
    2000
  );
  return validateEnrichment(result, fallback);
}

// Build the Insights object the profile drawer renders, from real ingested data.
export function buildInsights(dev: IngestedDeveloper, enrichment: EnrichmentResult): Insights {
  const commits = contributionCount(dev, "commit");
  const prs = contributionCount(dev, "pr");
  const issues = contributionCount(dev, "issue");
  const reviews = contributionCount(dev, "review");
  const ext = enrichment.signals.externalPrsMerged;
  const sorted = dev.repos.slice().sort((a, b) => b.stars - a.stars);
  const active = sorted.slice(0, 3).map((r) => ({
    name: r.name,
    val: Math.min(50, 18 + Math.round(Math.log2(r.stars + 2) * 3)),
  }));
  const projects = sorted.slice(0, 5).map((r) => ({
    name: r.name,
    lang: r.primaryLanguage || "code",
    stars: r.stars,
  }));
  const langs = enrichment.languages.map((l) => l.lang).slice(0, 5);
  let rem = 100;
  const bar: LangBar[] = enrichment.languages.slice(0, 5).map((l, i, arr) => {
    const pct = i === arr.length - 1 ? rem : Math.min(rem, Math.max(6, l.pct));
    rem -= pct;
    return { lang: l.lang, pct, color: LANG_COLORS[l.lang] || "#4f8bff" };
  });
  return {
    repos: dev.publicRepos,
    followers: dev.followers,
    commits,
    prs,
    issues,
    reviews,
    ext,
    active: active.length ? active : [{ name: "core", val: 24 }],
    projects,
    langs: langs.length ? langs : ["code"],
    bar: bar.length ? bar : [{ lang: "code", pct: 100, color: "#4f8bff" }],
  };
}

// Assemble the full Candidate the UI consumes from ingestion + enrichment.
export function assembleCandidate(dev: IngestedDeveloper, enrichment: EnrichmentResult): Candidate {
  const insights = buildInsights(dev, enrichment);
  const skills = enrichment.capabilities.map((c) => c.label).slice(0, 4);
  const tags = dev.repos.slice(0, 4).map((r) => r.name);
  const senWord = enrichment.seniority === "Senior" ? "Senior " : enrichment.seniority === "Junior" ? "Early-career " : "";
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
    seniority: enrichment.seniority,
    blurb,
    tags,
    skills,
    about: enrichment.summary,
    insights,
  };
}
