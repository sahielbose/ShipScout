# ShipScout evals

A small, deterministic, offline eval set with golden query-to-result cases for
the two pieces of engine behavior that are easiest to regress silently: skill
detection (query to capability chips) and search (the retrieve, filter, funnel,
and repo-facet shape). CONTEXT.md (section 0 and the engine in section 7) asks
for an `/evals` folder with golden cases for the search and skill-detection
logic; this is it.

## What it covers

Two suites, both run against the SEEDED engine path:

- `cases/skill-detection.json` (>= 12 cases): for each query, assert that
  `domainFor(query)` resolves to the expected domain and that the detected
  skills contain at least 2 of the expected keyword substrings. Covers every
  real domain in `lib/seed/domains.ts`: rust async runtimes, cryptography and
  zero-knowledge, compilers and LLVM, wasm, database query optimizers,
  low-latency and HFT, ML and CUDA inference, distributed consensus and raft,
  graphics and GPU, and robotics and SLAM. A couple of deliberately vague
  queries ("embedded kernel and low-level systems work") are included to confirm
  they still resolve to a sensible domain.

- `cases/search.json` (>= 8 cases): for each query plus filters, assert that the
  candidate list is non-empty, that the funnel is monotonic non-increasing
  within rounding (`total >= location >= match`), and that the returned repos
  facet includes at least one anchor repo for that query's domain.

## What it does NOT cover (be honest about this)

This validates the deterministic seeded path only. With no `ANTHROPIC_API_KEY`,
`detectCapabilities` falls back to the lexical detector in
`lib/seed/generate.ts` (`detectSkillsLocal`), and `runSearch` resolves against
the in-memory seeded universe in `lib/seed/dataset.ts`. There is no network, no
database, and no model call. So these cases gate the shape and stability of
detection and ranking (the thing that regresses when someone edits the domain
vocabulary, the filter math, or the funnel), not the quality of live Claude or
Voyage output. Evaluating the live model path would need API keys and a
non-deterministic, network-dependent harness, which is intentionally out of
scope here.

## Why the search cases set a seniority filter

In the seeded path, with `seniority: "Any"` and no location or repos, the
estimated match count equals the total, so the funnel is flat at the top
(`match == total > location`) rather than strictly non-increasing. That is
expected engine behavior, not a bug. The search cases therefore apply a real
seniority filter so the funnel is genuinely monotonic (`total >= location >=
match`), which is the property worth gating.

## How to run

```
npm run eval
```

or directly:

```
npx tsx evals/run.ts
```

The runner prints a PASS or FAIL line per case with a short reason, a pass rate
per suite, and a summary. It loads thresholds from `evals/thresholds.json`
(currently `{ "skillDetection": 0.9, "search": 0.9 }`) and exits with code 1 if
either suite's pass rate is below its threshold, listing which cases failed and
why. Otherwise it exits 0.

## How to add a case

Skill-detection case (append to `cases/skill-detection.json`):

```json
{
  "query": "engineers who wrote a borrow checker",
  "expectDomain": "compilers",
  "expectAny": ["trait", "type solving", "ssa", "parser"]
}
```

- `expectDomain` must be a domain `id` from `DOMAINS` in
  `lib/seed/domains.ts`.
- `expectAny` is a list of lowercase substrings. The case passes when at least 2
  of them appear in the detected skills (joined and lowercased). Pick substrings
  that appear in that domain's `skills` array so the case is meaningful rather
  than trivially true.

Search case (append to `cases/search.json`):

```json
{
  "query": "engineers who wrote a borrow checker",
  "filters": { "seniority": "Senior", "location": "", "repos": [] },
  "expect": {
    "minCandidates": 1,
    "funnelMonotonic": true,
    "reposIncludeAnyOf": ["llvm/llvm-project", "ziglang/zig"]
  }
}
```

- `reposIncludeAnyOf` should reference anchor repos from that query's domain
  (`DOMAINS[].repos[].fullName`).
- Keep a non-`Any` seniority if you assert `funnelMonotonic` (see the section
  above).

After adding cases, run `npm run eval` and confirm both suites stay at or above
the 0.9 thresholds. Tune the case expectations to match real seeded output
rather than lowering the thresholds.
