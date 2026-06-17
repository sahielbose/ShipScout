import { test } from "node:test";
import assert from "node:assert/strict";
import { applyFilters, estimateCount, computeFunnel } from "@/lib/engine/filter";
import type { Candidate, SearchFilters } from "@/lib/types";

function cand(login: string, seniority: Candidate["seniority"], loc: string, tags: string[]): Candidate {
  return {
    login,
    name: login,
    initials: "XX",
    loc,
    seniority,
    blurb: "",
    tags,
    skills: [],
    about: "",
    insights: {
      repos: 0, followers: 0, commits: 0, prs: 0, issues: 0, reviews: 0, ext: 0,
      active: [], projects: [], langs: [], bar: [],
    },
  };
}

const list: Candidate[] = [
  cand("a", "Senior", "New York, NY", ["tokio", "rust"]),
  cand("b", "Mid", "Berlin, DE", ["rust"]),
  cand("c", "Junior", "New York, NY", ["wasmtime"]),
];

const base: SearchFilters = { seniority: "Any", location: "", repos: [] };

test("applyFilters: seniority", () => {
  const out = applyFilters(list, { ...base, seniority: "Senior" });
  assert.deepEqual(out.map((c) => c.login), ["a"]);
});

test("applyFilters: location is case-insensitive substring", () => {
  const out = applyFilters(list, { ...base, location: "york" });
  assert.deepEqual(out.map((c) => c.login).sort(), ["a", "c"]);
});

test("applyFilters: repos match any tag", () => {
  const out = applyFilters(list, { ...base, repos: ["tokio"] });
  assert.deepEqual(out.map((c) => c.login), ["a"]);
});

test("estimateCount: Any returns the larger of total and filtered length", () => {
  assert.equal(estimateCount(1000, base, 5), 1000);
});

test("estimateCount: seniority and location shrink the pool", () => {
  const senior = estimateCount(1000, { ...base, seniority: "Senior" }, 0);
  assert.equal(senior, 530);
  const both = estimateCount(1000, { seniority: "Senior", location: "x", repos: [] }, 0);
  assert.ok(both < senior, "adding a filter should not increase the estimate");
});

test("computeFunnel: monotonic non-increasing with a real filter", () => {
  const filters: SearchFilters = { seniority: "Senior", location: "york", repos: [] };
  const match = estimateCount(1000, filters, 3);
  const f = computeFunnel(1000, filters, match);
  assert.ok(f.total >= f.location, "total >= location");
  assert.ok(f.location >= f.match, "location >= match");
});
