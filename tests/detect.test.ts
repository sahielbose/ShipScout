import { test } from "node:test";
import assert from "node:assert/strict";
import { detectSkillsLocal } from "@/lib/seed/generate";
import { domainFor } from "@/lib/seed/domains";

test("domainFor maps known queries to the right domain", () => {
  assert.equal(domainFor("zero knowledge proofs cryptography").id, "cryptography");
  assert.equal(domainFor("senior rust systems engineer tokio").id, "rust-systems");
  assert.equal(domainFor("llvm compiler backend codegen").id, "compilers");
  assert.equal(domainFor("raft consensus distributed replication").id, "distributed");
});

test("detectSkillsLocal returns up to five concrete capabilities", () => {
  const skills = detectSkillsLocal("Senior Rust Systems Engineer");
  assert.ok(skills.length >= 5);
  assert.ok(skills.includes("tokio runtime internals"));
});

test("detectSkillsLocal falls back to derived phrases for unknown queries", () => {
  const skills = detectSkillsLocal("kubernetes operator controller patterns");
  assert.ok(skills.length > 0);
  assert.ok(skills.every((s) => typeof s === "string" && s.length > 0));
});
