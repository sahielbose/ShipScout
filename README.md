# ShipScout

Find elite engineers by what they ship.

ShipScout is an open-source AI sourcing tool that finds engineers by their real
open-source work, not their resume. Describe a capability in plain English (for
example "engineers who built WASM compilers" or "low-latency trading systems in
Rust"), and ShipScout reads public GitHub activity, turns it into structured
capability profiles, and returns a ranked list of engineers who have
demonstrably done that exact thing. Filter, shortlist, open an evidence-based
profile, and generate personalized outreach grounded in each person's real
contributions, all from a Cursor-like workspace.

Open source, MIT licensed. No pricing and no payment anywhere.

Repo: https://github.com/sahielbose/ShipScout

## Runs with zero setup

The entire product runs with no database and no API keys. With nothing
configured, every part of the engine resolves against a deterministic seeded
dataset (about 300 developers across ten domains), so the full loop (search,
detected skills, results, filters, funnel, profile, shortlist, outreach, chat)
works offline:

```bash
npm install
npm run dev
```

Open http://localhost:3000. Click "Launch ShipScout", run a search, open a
profile, shortlist a candidate, and draft outreach. The public X-ray
(`/u/<github-username>`) and the Playground (`/playground`) also work offline.

As you add keys, each part of the engine switches from the seeded path to live
data with no UI changes. That is the build: the UI talks only to a single `api`
seam, and each method has one offline implementation and one live one.

## What works at each tier

| You provide | What becomes live |
| --- | --- |
| Nothing | Full UI on the seeded dataset (search, profiles, outreach templates, chat fallback, X-ray, playground, CSV export, evals) |
| `ANTHROPIC_API_KEY` | Claude-powered skill detection, profile enrichment, outreach, and streaming chat |
| `VOYAGE_API_KEY` + `DATABASE_URL` | Embeddings into pgvector and hybrid vector search with the section 7.5 ranking |
| `GITHUB_TOKEN` | Real GitHub ingestion (profiles, repos, languages, contributions, notable PRs) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` / `AUTH_SECRET` | GitHub sign-in (Auth.js) |
| `INNGEST_*` | Background jobs (discover, ingest, enrich, embed, refresh cron) |

## Features

- Marketing site: hero, trusted-by row, auto-advancing product carousel, three
  step how-it-works, build-in-public block, a GitHub username explorer, and a
  final call to action. Dark blue-and-white, scroll reveals, reduced-motion
  aware. No pricing.
- Workspace: capability search with suggestions and history, detected skill
  chips (add, remove, drag to reorder, re-run retrieval), evidence-based
  candidate cards with shortlist toggles and a live count, filters for seniority,
  location, and repositories with star counts, an animated funnel, a slide-in
  profile drawer with the full insights grid, Download PDF and share, an actions
  view with Refine shortlist / Draft outreach / Email sequence, a streaming chat
  agent, a shortlist sidebar, and CSV export.
- Public profile X-ray at `/u/[login]` for any GitHub username, ingested on
  demand when a database is configured.
- Playground at `/playground` to map the top engineers in a domain.

## Architecture

A single Next.js app plus a managed Postgres (with pgvector) and an async job
runner.

```
Browser (Next.js)  ->  Route handlers (the api seam)  ->  Postgres + pgvector
                                       |                 (developers, repos,
                                       |                  contributions,
                                       v                  capabilities, ...)
                              Inngest background jobs
                                       |
                          GitHub API   |   Claude + Voyage
                          (REST/GraphQL)    (enrich, summarize, embed, outreach, chat)
```

The engine (CONTEXT.md section 7):

1. Discovery and seeding: pull top contributors for anchor repos per domain.
2. Ingestion: pull one developer's public footprint from GitHub.
3. Enrichment: Claude turns raw contributions into capability tags with
   evidence, a seniority estimate, an About summary, languages, and signals.
   A deterministic, grounded fallback runs when no model key is set.
4. Embedding and indexing: Voyage embeds capability evidence and the profile
   summary into pgvector.
5. Search and ranking: detect capabilities, embed them, run vector similarity
   plus SQL filters, and rank with a weighted score (semantic similarity,
   contribution depth, external PR signal, relevant repo stars, recency).

## Tech stack

Next.js (App Router) + React + TypeScript, Tailwind CSS, Framer Motion,
Postgres with pgvector via Prisma, Inngest for jobs, Anthropic Claude for
reasoning, Voyage for embeddings, GitHub REST + GraphQL via octokit, and Auth.js
(NextAuth v5) for GitHub OAuth.

## Environment

Copy `.env.example` to `.env.local` and fill in only what you want to enable.
Everything is optional for local dev. Never commit secrets.

Key variables: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`,
`GITHUB_TOKEN`, `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` / `AUTH_SECRET`,
`INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY`. See `.env.example` for the full list
and notes.

## Scripts

```bash
npm run dev          # start Next.js
npm run build        # prisma generate, then next build
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run db:migrate   # prisma migrate dev
npm run db:vector    # apply the pgvector column and index migration
npm run db:seed      # seed the generated universe into Postgres
npm run seed -- --live   # discover and ingest real top contributors (needs GITHUB_TOKEN)
npm run inngest      # run the Inngest dev server (npx inngest-cli dev)
npm run eval         # run the golden evals (offline, gated at 90 percent)
```

## Enabling the database and live engine

1. Provision Postgres with the pgvector extension (Neon or Supabase recommended)
   and set `DATABASE_URL`.
2. `npm run db:migrate` then `npm run db:vector` (adds the `vector(1024)` columns
   and HNSW indexes; match the dimension to your Voyage model).
3. `npm run db:seed` to fill the database with the generated starter set, or
   `npm run seed -- --live` with a `GITHUB_TOKEN` to ingest real developers.
4. With `VOYAGE_API_KEY` set, seeding also writes embeddings and the search path
   switches to hybrid vector search automatically.

## Evals

`/evals` holds golden query-to-result cases for skill detection and search. It
runs offline against the deterministic seeded path (no keys, no database, no
network), so it catches regressions to detection and ranking shape:

```bash
npm run eval
```

It is honest about scope: it validates the seeded/lexical path, not live Claude
or Voyage output. See `evals/README.md`.

## Project structure

```
app/
  (marketing)/        landing, u/[login] X-ray, playground
  app/                the workspace
  api/                the route handlers (the api seam)
components/
  marketing/  app/  public/  ui/
lib/
  github/   REST + GraphQL clients and normalizers
  ai/       claude, embed (voyage), prompts
  engine/   detect, ingest, enrich, indexing, hybrid, search, outreach, filter
  inngest/  client and functions
  seed/     domains, generator, dataset, seed script
  store/    the workspace store
prisma/     schema and the pgvector migration
evals/      golden cases and the runner
```

## Deploy

- Web and API: Vercel. Set the env vars you want live. The build runs
  `prisma generate`.
- Database: Neon or Supabase with pgvector enabled; run the migrations and the
  vector migration.
- Jobs: connect Inngest to the deployed `/api/inngest` endpoint.
- Smoke test: sign in, run a search, open a profile, shortlist, draft outreach,
  chat, and load `/u/<a known login>`.

## Honest notes on generated code

- Search ranking: the section 7.5 weights are implemented, but contribution
  depth, external-PR signal, stars, and recency are normalized heuristically.
  The eval set is the guardrail; tune the normalizers against real data.
- GitHub rate limits: ingestion batches via GraphQL and backs off on secondary
  rate limits, but heavy live seeding can still hit limits. Seed in small
  batches.
- Enrichment quality: Claude enrichment is grounded by the prompt and validated
  defensively, with a deterministic fallback. Capability claims should always be
  traceable to evidence; do not present them as verdicts.

## Privacy

ShipScout uses only public GitHub data. Profiles are derived from public
activity. There is a clear path to request removal or correction; honor it
promptly. Do not expose contact details that are not already public.

## License

MIT. See `LICENSE`.
