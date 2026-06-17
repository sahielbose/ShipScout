# CLAUDE.md - ShipScout operating manual

You are working in the ShipScout repo (github.com/sahielbose/ShipScout): an open
source AI sourcing tool that finds engineers by what they ship in open source.
Read `CONTEXT.md` first; it is the single source of truth. Sections 3, 5, 6, 7,
8, and 16 are binding. This file is how to operate day to day.

## What we are building (10 second version)
Ingest public GitHub work, enrich it into structured capability profiles with
Claude, embed it into pgvector, and serve hybrid capability search (vector plus
SQL filters with the section 7.5 ranking). The UI is a Cursor-like workspace:
search, detected skills, results, filters, funnel, profile drawer, shortlist,
outreach, and chat, plus a public X-ray and a playground.

## Golden rules (do not violate)
1. Spec first. Code to the data model (section 6) and the api seam (section 8).
2. The api seam is the contract. The UI talks only to `lib/api-client`. Each
   method has one offline (seeded) implementation and one live one. Never let the
   UI know which is active.
3. Runs with zero setup. With no keys or database, everything resolves against
   the seeded dataset (lib/seed). Adding keys switches each part to live data
   with no UI changes. Keep that invariant.
4. Eval gated. Run `npm run eval` after changing detection or ranking. A drop in
   pass rate is a regression.
5. Green before commit: `npm run typecheck` (and `npm run eval` for engine
   changes) must pass.
6. Commit small and often, Conventional Commits style (feat, fix, test, docs,
   chore). Many small green commits, not a few big ones.
7. Secrets in `.env.local` only. Commit `.env.example` (keys, no values). Never
   print, log, or commit a real key.
8. Gate every side effect behind an explicit confirm step. Outreach is draft
   only; never auto send or auto submit.
9. No fabrication. Capability tags, summaries, and outreach must be grounded in
   real evidence; present seniority and capability as derived signals, not
   verdicts.
10. No pricing and no payment anywhere.
11. Clone the behavior, not anyone's brand. Our own name, copy, and identity
    (section 15).
12. Two hard writing rules everywhere (code, copy, docs, commit messages): no em
    dashes and no emojis. Use hyphens, colons, and parentheses.

## Commands
```bash
npm run dev          # Next.js app
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run eval         # golden evals (offline, gated at 90 percent)
npm run db:migrate   # prisma migrate dev
npm run db:vector    # apply the pgvector column and index migration
npm run db:seed      # seed the generated universe into Postgres
npm run seed -- --live   # ingest real top contributors (needs GITHUB_TOKEN)
npm run inngest      # Inngest dev server
```

## Repo map (see CONTEXT.md section 12 for the full tree)
- `app/` - marketing, the workspace, public pages, and the api route handlers.
- `components/` - marketing, app (workspace), public, ui.
- `lib/github/` - REST plus GraphQL clients and normalizers.
- `lib/ai/` - claude, embed (voyage), prompts.
- `lib/engine/` - detect, ingest, enrich, indexing, hybrid, search, outreach,
  filter, capabilities, developers, shortlists.
- `lib/inngest/` - client and functions (discover, ingest, enrich, embed,
  refresh cron).
- `lib/seed/` - domains, generator, dataset, seed script.
- `lib/store/` - the workspace store (zustand).
- `prisma/` - schema and the pgvector migration.
- `evals/` - golden cases and the runner.

## Honest weak spots (lean on the evals)
- Search ranking: the 7.5 weights are implemented but the normalizers are
  heuristic. The eval set is the guardrail.
- GitHub rate limits: ingestion batches via GraphQL and backs off, but heavy
  live seeding can still hit limits. Seed in small batches.
- Enrichment quality: Claude output is grounded by the prompt and validated
  defensively, with a deterministic fallback.
