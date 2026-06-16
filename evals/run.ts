// ShipScout eval runner. Deterministic, offline golden cases that gate the
// search and skill-detection behavior (CONTEXT.md asks for "/evals folder with
// golden query-to-result cases for the search and skill-detection logic").
//
// What this validates: the SEEDED engine path. With no ANTHROPIC_API_KEY,
// detectCapabilities falls back to the deterministic lexical detector
// (lib/seed/generate.detectSkillsLocal via lib/engine/detect), and runSearch
// resolves against the in-memory seeded universe (lib/seed/dataset). That path
// is what we can run with no API keys, no database, and no network, and it is
// exactly what gates regressions to detection and to the ranking/funnel shape.
// It does not exercise live Claude or Voyage output (see evals/README.md).
//
// Run: npm run eval (or npx tsx evals/run.ts).
// Exit code: 1 if either suite's pass rate falls below its threshold, else 0.
// No em dashes, no emojis.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { detectCapabilities } from "@/lib/engine/detect";
import { runSearch } from "@/lib/engine/search";
import { domainFor } from "@/lib/seed/domains";
import type { SearchFilters } from "@/lib/types";

const HERE = dirname(fileURLToPath(import.meta.url));

// ----- Case shapes -----

interface SkillCase {
  query: string;
  expectDomain: string;
  expectAny: string[];
}

interface SearchCase {
  query: string;
  filters: SearchFilters;
  expect: {
    minCandidates: number;
    funnelMonotonic: boolean;
    reposIncludeAnyOf: string[];
  };
}

interface Thresholds {
  skillDetection: number;
  search: number;
}

interface CaseResult {
  name: string;
  pass: boolean;
  reason: string;
}

function loadJSON<T>(relPath: string): T {
  const raw = readFileSync(join(HERE, relPath), "utf8");
  return JSON.parse(raw) as T;
}

// ----- Skill-detection suite -----
// A case passes when domainFor(query) equals expectDomain AND the detected
// skills (joined, lowercased) contain at least 2 of the expectAny substrings.

async function runSkillCase(c: SkillCase): Promise<CaseResult> {
  const name = c.query;
  const detectedDomain = domainFor(c.query).id;
  const skills = await detectCapabilities(c.query);
  const joined = skills.join(" | ").toLowerCase();
  const hits = c.expectAny.filter((sub) => joined.includes(sub.toLowerCase()));

  const domainOk = detectedDomain === c.expectDomain;
  const overlapOk = hits.length >= 2;

  if (domainOk && overlapOk) {
    return { name, pass: true, reason: `domain=${detectedDomain}, matched ${hits.length} of ${c.expectAny.length} keywords` };
  }

  const reasons: string[] = [];
  if (!domainOk) reasons.push(`domain expected ${c.expectDomain} but got ${detectedDomain}`);
  if (!overlapOk) reasons.push(`only ${hits.length} of expectAny matched (need 2) in [${joined}]`);
  return { name, pass: false, reason: reasons.join("; ") };
}

// ----- Search suite -----
// A case passes when:
//   - candidates.length >= minCandidates
//   - the funnel is monotonic non-increasing within rounding
//     (total >= location >= match, allowing 1 unit of rounding slack)
//   - the returned repos facet includes at least one of reposIncludeAnyOf

function funnelMonotonic(funnel: { total: number; location: number; match: number }, slack = 1): boolean {
  return funnel.total + slack >= funnel.location && funnel.location + slack >= funnel.match;
}

async function runSearchCase(c: SearchCase): Promise<CaseResult> {
  const name = `${c.query} [seniority=${c.filters.seniority}${c.filters.location ? `, location=${c.filters.location}` : ""}]`;
  const res = await runSearch(c.query, c.filters);

  const candidatesOk = res.candidates.length >= c.expect.minCandidates;
  const monoOk = c.expect.funnelMonotonic ? funnelMonotonic(res.funnel) : true;
  const repoNames = res.repos.map((r) => r.name);
  const repoOk = c.expect.reposIncludeAnyOf.some((want) => repoNames.includes(want));

  if (candidatesOk && monoOk && repoOk) {
    return {
      name,
      pass: true,
      reason: `candidates=${res.candidates.length}, funnel=${res.funnel.total}/${res.funnel.location}/${res.funnel.match}, repos ok`,
    };
  }

  const reasons: string[] = [];
  if (!candidatesOk) reasons.push(`candidates ${res.candidates.length} < minCandidates ${c.expect.minCandidates}`);
  if (!monoOk) reasons.push(`funnel not monotonic: ${res.funnel.total}/${res.funnel.location}/${res.funnel.match}`);
  if (!repoOk) reasons.push(`repos [${repoNames.join(", ")}] include none of [${c.expect.reposIncludeAnyOf.join(", ")}]`);
  return { name, pass: false, reason: reasons.join("; ") };
}

// ----- Suite reporting -----

function printSuite(title: string, results: CaseResult[]): { rate: number; failures: CaseResult[] } {
  console.log("");
  console.log(`== ${title} ==`);
  for (const r of results) {
    const tag = r.pass ? "PASS" : "FAIL";
    console.log(`  [${tag}] ${r.name}`);
    console.log(`         ${r.reason}`);
  }
  const passed = results.filter((r) => r.pass).length;
  const rate = results.length ? passed / results.length : 0;
  console.log(`  ${title}: ${passed}/${results.length} passed (pass rate ${(rate * 100).toFixed(1)}%)`);
  return { rate, failures: results.filter((r) => !r.pass) };
}

async function main(): Promise<void> {
  console.log("ShipScout evals (deterministic seeded path)");
  console.log("Note: no network, no database, no API keys are used. This evaluates the");
  console.log("seeded/lexical engine path (skill detection plus search funnel and ranking");
  console.log("shape), which is what gates regressions to detection and ranking. It does");
  console.log("not exercise live Claude or Voyage output.");

  const thresholds = loadJSON<Thresholds>("thresholds.json");
  const skillCases = loadJSON<SkillCase[]>("cases/skill-detection.json");
  const searchCases = loadJSON<SearchCase[]>("cases/search.json");

  const skillResults: CaseResult[] = [];
  for (const c of skillCases) skillResults.push(await runSkillCase(c));

  const searchResults: CaseResult[] = [];
  for (const c of searchCases) searchResults.push(await runSearchCase(c));

  const skill = printSuite("skill-detection", skillResults);
  const search = printSuite("search", searchResults);

  console.log("");
  console.log("== summary ==");
  console.log(
    `  skill-detection: ${(skill.rate * 100).toFixed(1)}% (threshold ${(thresholds.skillDetection * 100).toFixed(0)}%)`
  );
  console.log(`  search: ${(search.rate * 100).toFixed(1)}% (threshold ${(thresholds.search * 100).toFixed(0)}%)`);

  const skillBelow = skill.rate < thresholds.skillDetection;
  const searchBelow = search.rate < thresholds.search;

  if (skillBelow || searchBelow) {
    console.log("");
    console.log("FAILED: a suite is below its threshold.");
    if (skillBelow) {
      console.log("  skill-detection failures:");
      for (const f of skill.failures) console.log(`    - ${f.name}: ${f.reason}`);
    }
    if (searchBelow) {
      console.log("  search failures:");
      for (const f of search.failures) console.log(`    - ${f.name}: ${f.reason}`);
    }
    process.exit(1);
  }

  console.log("");
  console.log("PASSED: both suites are at or above their thresholds.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Eval runner crashed:", err);
  process.exit(1);
});
