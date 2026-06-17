import { test } from "node:test";
import assert from "node:assert/strict";
import { deterministicEnrich, buildInsights, assembleCandidate } from "@/lib/engine/enrich";
import type { IngestedDeveloper } from "@/lib/types";

const dev: IngestedDeveloper = {
  login: "octo",
  name: "Octo Cat",
  location: "San Francisco, CA",
  bio: "rust systems and tokio internals",
  avatarUrl: null,
  followers: 1200,
  publicRepos: 90,
  hireable: true,
  repos: [
    { fullName: "octo/runtime", name: "runtime", description: "async runtime in rust", stars: 4200, primaryLanguage: "Rust", languages: { Rust: 90000, C: 10000 }, isFork: false },
    { fullName: "octo/alloc", name: "alloc", description: "custom allocator", stars: 800, primaryLanguage: "Rust", languages: { Rust: 50000 }, isFork: false },
  ],
  contributions: [
    { type: "commit", repoFullName: "octo/runtime", count: 1800, mergedExternal: false, year: 2026 },
    { type: "pr", repoFullName: "tokio-rs/tokio", count: 40, mergedExternal: true, year: 2026 },
    { type: "review", repoFullName: "octo/runtime", count: 60, mergedExternal: false, year: 2026 },
  ],
  notablePullRequests: [
    { repoFullName: "tokio-rs/tokio", title: "fix scheduler", url: "https://github.com/tokio-rs/tokio/pull/1", mergedExternal: true },
  ],
  fetchedAt: "2026-01-01T00:00:00.000Z",
};

test("deterministicEnrich grounds capabilities and seniority in the data", () => {
  const e = deterministicEnrich(dev);
  assert.ok(e.capabilities.length >= 5);
  assert.ok(["Junior", "Mid", "Senior"].includes(e.seniority));
  assert.equal(e.seniority, "Senior");
  assert.ok(e.languages.length > 0);
  assert.ok(e.signals.externalPrsMerged >= 40);
});

test("buildInsights reflects real contribution counts", () => {
  const e = deterministicEnrich(dev);
  const ins = buildInsights(dev, e);
  assert.equal(ins.commits, 1800);
  assert.equal(ins.reviews, 60);
  assert.equal(ins.followers, 1200);
  assert.ok(ins.projects.length > 0);
});

test("assembleCandidate produces a UI-ready shape", () => {
  const e = deterministicEnrich(dev);
  const c = assembleCandidate(dev, e);
  assert.equal(c.login, "octo");
  assert.equal(c.seniority, "Senior");
  assert.ok(c.skills.length > 0);
  assert.ok(c.blurb.includes("commits"));
});
