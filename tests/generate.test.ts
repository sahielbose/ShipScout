import { test } from "node:test";
import assert from "node:assert/strict";
import { genCandidates, genUniverse, detectSkillsLocal } from "@/lib/seed/generate";
import { DOMAINS } from "@/lib/seed/domains";

test("genCandidates is deterministic for the same query", () => {
  const skills = detectSkillsLocal("low latency trading systems");
  const a = genCandidates("low latency trading systems", skills).map((c) => c.login);
  const b = genCandidates("low latency trading systems", skills).map((c) => c.login);
  assert.deepEqual(a, b);
  assert.ok(a.length >= 9);
});

test("genUniverse produces one cohort per domain", () => {
  const u = genUniverse(30);
  assert.equal(u.length, DOMAINS.length * 30);
  const logins = new Set(u.map((c) => c.login));
  assert.equal(logins.size, u.length, "logins are unique");
});

test("built profiles have a language bar that sums to 100", () => {
  const u = genUniverse(5);
  for (const c of u.slice(0, 10)) {
    const sum = c.insights.bar.reduce((a, b) => a + b.pct, 0);
    assert.equal(sum, 100);
  }
});
