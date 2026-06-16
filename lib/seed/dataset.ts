// In-memory seeded dataset (CONTEXT.md Phase 2). When there is no database or
// API keys, every api method resolves against this offline data so the full
// search-to-outreach loop works with zero setup. Deterministic and stable.

import type { Candidate, OutreachDraft, RepoFacet } from "@/lib/types";
import { hash, rng, slug } from "@/lib/utils";
import { DOMAINS, domainFor } from "@/lib/seed/domains";
import { buildProfile, detectSkillsLocal, genCandidates, genUniverse } from "@/lib/seed/generate";

let _universe: Candidate[] | null = null;

// ~300 developers across the domains (10 domains x 30).
export function universe(): Candidate[] {
  if (!_universe) _universe = genUniverse(30);
  return _universe;
}

export function seededDetect(query: string): string[] {
  return detectSkillsLocal(query);
}

export function seededTotal(query: string): number {
  const r = rng(hash(query + "#total"));
  return 420 + Math.floor(r() * 1100);
}

export function seededSearchData(
  query: string,
  skillsOverride?: string[]
): {
  skills: string[];
  candidates: Candidate[];
  total: number;
} {
  const skills = skillsOverride && skillsOverride.length ? skillsOverride : detectSkillsLocal(query);
  const candidates = genCandidates(query, skills);
  const total = seededTotal(query);
  return { skills, candidates, total };
}

export function seededRepos(query: string): RepoFacet[] {
  const d = domainFor(query);
  const r = rng(hash(query + "#repo"));
  return d.repos.map((rp) => ({ name: rp.fullName, stars: (0.5 + r() * 9).toFixed(1) + "k" }));
}

// A stable profile for any login. Universe members return their generated
// profile; unknown logins (for example a direct X-ray) get a deterministic one.
export function seededProfile(login: string): Candidate {
  const found = universe().find((c) => c.login.toLowerCase() === login.toLowerCase());
  if (found) return found;
  const d = DOMAINS[0];
  const c = buildProfile({
    login,
    first: login,
    last: "",
    loc: "On GitHub",
    seniority: "Senior",
    blurb: "Public capability profile generated from open-source activity.",
    tags: d.repos.slice(0, 3).map((rp) => rp.fullName.split("/").pop() as string),
    skills: d.skills,
    domain: d,
    seed: hash(login),
  });
  c.name = login;
  c.initials = (login[0] || "S").toUpperCase();
  return c;
}

// Top developers for a domain, used by the Playground (CONTEXT.md section 3.12).
export function seededPlayground(domainQuery: string, limit = 12): Candidate[] {
  const d = domainFor(domainQuery);
  const members = universe().filter((c) => c.tags.some((t) => d.repos.some((rp) => rp.fullName.split("/").pop() === t)));
  const pool = members.length ? members : universe();
  return pool
    .map((c) => ({ c, score: c.insights.ext + c.insights.commits / 50 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

// Evidence-grounded outreach template (CONTEXT.md section 7.6 fallback).
export function seededOutreach(candidate: Candidate, query: string, step: number): OutreachDraft {
  const s = step || 1;
  const first = candidate.name.split(" ")[0] || candidate.login;
  const subject =
    s === 1
      ? `Your work on ${candidate.skills[0]} caught our eye`
      : s === 2
        ? `Following up on ${query.split(" ").slice(0, 3).join(" ")}`
        : `One more note for you, ${first}`;
  const body = `Hi ${first},\n\nI came across your work on ${candidate.skills[0]} and ${
    candidate.skills[1] || candidate.skills[0]
  } across ${candidate.tags.slice(0, 2).join(" and ")}. That depth is exactly what we need.\n\nWe are hiring for ${query.toLowerCase()} and would love to talk. Open to a short call?\n\nBest,\nThe ShipScout team`;
  return { subject, body, sequenceStep: s };
}

// Chat fallback scoped to the current search and shortlist (section 7.7 fallback).
export function seededChat(text: string, query: string, shortlist: { name: string }[]): string {
  if (/refine|narrow|filter/i.test(text)) {
    return `To tighten the pool for "${query}", set seniority to Senior and add the one or two repositories that best prove the skill. The funnel on the right shows how each filter cuts the candidate count.`;
  }
  if (shortlist.length) {
    return `You have ${shortlist.length} candidate${shortlist.length > 1 ? "s" : ""} shortlisted: ${shortlist
      .map((c) => c.name)
      .join(", ")}. I can draft personalized outreach for each, build a 3-step sequence, or compare their strengths. Which would help most?`;
  }
  return `Star a few candidates in the results view first, then I can draft outreach, compare their open-source work, or build an email sequence for "${query}".`;
}

export const _internal = { slug };
