# ShipScout: Project Context

This is the single source of truth for building ShipScout. It is written to be read by Claude Code (and by you) before any work in this repo. It covers what we are building, why, the exact features, the full architecture, the data model, the engine, the API, the build and deploy steps, the brand guardrails, and a phased execution roadmap with paste-ready prompts.

ShipScout is a functional clone of SkillSync (YC W26) in product behavior only. We replicate what the product does and how it works. We do not copy their brand, name, logo, color, marketing copy, or their named customers.

---

## 0. How to use this doc

If you are Claude Code:
1. Read this whole file before writing code. Treat sections 3 (features), 5 (stack), 6 (data model), 7 (engine), and 16 (roadmap) as binding.
2. Work one phase at a time (section 16). Do not jump ahead. After each task, run the project and confirm it works before moving on.
3. Keep the brand guardrails in section 15 and section 18 in mind at all times.
4. Two hard writing rules across the entire codebase, all UI copy, all docs, and all commit messages: no em dashes anywhere, and no emojis anywhere. Use hyphens, colons, and parentheses instead.

Repo: https://github.com/sahielbose/ShipScout

The repo starts with two files that drive this whole build:
- `CONTEXT.md` (this file): the full spec and source of truth.
- `shipscout.html`: a complete, working single-file UI prototype of the entire product (marketing site plus the full dashboard). It already looks and behaves the way the finished app should. Treat it as the visual and interaction reference to port into the real app. Details in section 1.1.

Working style for this build:
- Operate autonomously. Move through the phases in section 16 without stopping to ask for confirmation unless something is genuinely blocking.
- Commit after every meaningful step (a component, a route, a migration, a job, a fix) with a short, clear message. Over the full build this should land around 50 to 60 commits. Small, frequent commits, not a few giant ones.
- After each phase, run the app and confirm it works before moving to the next.

Tip: Claude Code auto-loads a file named CLAUDE.md at the repo root. You can rename or symlink this file to CLAUDE.md so it loads automatically, or keep it as CONTEXT.md and reference it explicitly.

---

## 1. Product summary

ShipScout is an AI sourcing tool that finds engineers by what they have shipped in open source, not by their resume. A recruiter or hiring manager describes a capability in plain English (for example "engineers who built WASM compilers" or "low latency trading systems in Rust"). ShipScout reads real public GitHub work, turns it into structured capability profiles, and returns a ranked list of engineers who have demonstrably done that exact thing. The user can filter, open a full evidence-based profile, shortlist people, and generate personalized outreach grounded in each person's real contributions, all from a Cursor-like workspace.

Core thesis: resumes can be gamed, code cannot. The strongest engineers in hard domains (systems, infra, compilers, robotics, ML internals) often do not maintain LinkedIn, but they ship in public. ShipScout makes that hidden signal searchable.

Positioning sentence we use: ShipScout finds elite engineers by what they ship.

What makes it usable, not just a demo: the entire search to results to profile to shortlist to outreach loop works on real data, gated only by GitHub sign in. There is no pricing and no payment anywhere in this product.

---

## 1.1 Starting point: the prototype (shipscout.html)

`shipscout.html` is a finished, self-contained UI prototype of the entire product in one file (HTML, CSS, and vanilla JS, no build step). It is the reference you port from, not throwaway. It already implements:

- The full marketing site: nav, hero with an "open source on GitHub" badge, a trusted-by row, an auto-advancing product carousel, the three-step how-it-works sections, the build-in-public block, a GitHub username explorer, a final call to action, and a footer. ShipScout brand in blue and white, with scroll reveals and hover motion. No pricing anywhere.
- The full dashboard: capability search with suggestion chips and history, detected skill chips (add, remove, drag to reorder), results cards with shortlist toggles and a live candidate count, filters for seniority, location, and repositories with star counts, an animated funnel, a slide-in profile drawer with stats plus an About plus the insights grid plus Download PDF and share, an actions view with Refine shortlist, Draft outreach, and Email sequence, a chat thread, a shortlist sidebar, and CSV export.
- A clean service-layer seam: the entire UI talks only to a single `api` object (methods: `detectSkills`, `search`, `getProfile`, `draftOutreach`, `chat`). Today those methods return deterministic mock data so the prototype runs anywhere with zero setup. Outreach is draft-only (Copy and Open in email), and there is no auto-send.

How the two files combine into the real app:
1. Port the prototype's visual system (the design tokens, fonts, dark blue-and-white look) and every screen and interaction into the Next.js app as real React components (sections 3 and 12). The finished app should look and feel like the prototype.
2. Keep the `api` seam. The real backend is built by replacing each mock `api` method with a real call to a route handler (section 8), one method at a time. When all methods are real, the prototype's behavior is now running on live GitHub data.
3. Update the `GITHUB_URL` constant in the prototype (and all GitHub links) to https://github.com/sahielbose/ShipScout.

So the build is: stand up the app shell, port the prototype UI onto seeded data, then grow the backend (database, GitHub ingestion, enrichment, search, outreach, chat) until the `api` seam is fully real.

---

## 2. Research: the product we are cloning

This section exists so the agent knows the target precisely. Build to match these behaviors, not the brand.

### 2.1 Company and founders (for context only)
- SkillSync, YC Winter 2026, based in San Francisco. Positioned as "the LinkedIn for the AI era."
- Founders: Narayana Aaditya Ganeshkumar (Nars), CEO, product and organizational psychology background, ex-Deloitte, ex-Juspay. Nishant Joshi, CTO, strong Rust and systems engineer, ex-VWO, ex-Juspay, around three years building Rust payment infrastructure.
- Both came out of Juspay and the Hyperswitch open-source Rust payments project. They ran a large open-source project (hundreds of contributors, 20k+ stars) and found it painfully hard to identify and hire their best contributors. That pain is the origin of the product.
- Cited customers and proof (do not reuse these in our app): Ramp, Bun, Zed, with Bun reporting a large conversion improvement.

### 2.2 The thesis and messaging (paraphrased, do not copy verbatim)
- The best engineers are shipping code in open source, not maintaining resumes or LinkedIn.
- GitHub is huge and chaotic and was never searchable for hiring.
- Traditional metrics (raw commit counts, stars, lines of code) do not capture what an engineer is actually good at.
- ShipScout converts real contributions into capability profiles you can search, with no forms and no surveys.

### 2.3 Surfaces and features observed (this is the clone scope)
1. Marketing site: dark hero ("find elite engineers hidden in open source" type message), a credibility badge, a trusted-by logo row, a "see it in action" carousel of the product, a three-step "how it works" section (search by capability, filter and shortlist, personalize outreach), a build-in-public manifesto block, a public profile explorer input, a final call to action, and a footer. Their site funnels to "book a demo." Ours will funnel to an actual working app. No pricing.
2. The app workspace (Cursor-like):
   - Search home: a natural-language capability search box, example suggestion chips, search history, and a left icon rail (new search, history, shortlist, export, help, settings, sign out, collapse).
   - Detected skills: the query is parsed into capability chips that are editable, removable, reorderable, and addable.
   - Results: a candidate list of evidence-based cards (handle, location, an evidence blurb, repo tags, shortlist toggle), a candidate count, export to CSV, and bulk actions.
   - Filters: seniority (Any, Junior, Mid, Senior), location, and specific repositories with star counts. A funnel visual shows Total to Location to Seniority.
   - Profile drawer: avatar, name, handle, external and share actions, Download PDF, a short bio, stats (repos, followers, external PRs), an AI-written About paragraph, and an Insights grid (this year commits, PRs, issues, reviews; most active repositories as bars; top projects with language and stars; a languages bar; and signals such as external PRs merged).
   - Actions and chat: a "what would you like to do?" panel with Refine shortlist, Draft outreach, and Email sequence, a chat input, and a shortlist sidebar. Outreach references each candidate's specific contributions. The chat can refine the shortlist and draft messages.
3. Public profile X-ray: a no-login page that shows any GitHub user's capability profile (their version uses a "skills" + github URL trick). Ours: a clean public route per username.
4. Playground / domain explorer: a public surface to explore and map the top engineers in a given domain.

### 2.4 The engine (inferred, and standard for this product class)
SkillSync builds what one writeup called a dynamic skill graph from pull requests, reviews, and comments, with no surveys. The standard pipeline that produces the observed behavior:
1. Ingest public GitHub data: profile, repositories, languages, commit activity, authored PRs, externally merged PRs, reviews, issues, stars, and the contribution graph.
2. Use an LLM to convert raw contributions into structured capability tags with evidence (which repo or PR proves each skill), plus a seniority estimate and a human-readable summary.
3. Embed the evidence and the profile, and index it for vector search.
4. Serve capability search as a hybrid of vector similarity (semantic match to the query) plus structured filters, ranked by relevance and contribution depth.
5. Generate personalized outreach and run a chat agent over the search context.

We build this same pipeline.

---

## 3. Feature spec (page by page)

Each feature lists the route, the key components, the behavior, and a definition of done. Build the UI first against seeded data (phase 2), then wire to the real engine (phase 3 onward).

### 3.1 Marketing site
- Route: `/`
- Components: `Nav`, `Hero`, `TrustRow`, `DemoCarousel`, `HowItWorks` (three steps), `BuildInPublic`, `ProfileExplorer`, `FinalCta`, `Footer`.
- Behavior: dark theme, scroll-reveal animations, an auto-advancing product carousel with manual controls, hover micro-interactions on buttons and cards. Nav and all primary CTAs open the app (sign in or go to `/app`). The profile explorer input takes a GitHub username and routes to the public X-ray page. No pricing link, no pricing section, no payment.
- Copy: write our own. Do not paste SkillSync copy. Lead with the user problem (finding great engineers) before the mechanism.
- Definition of done: all sections render responsively down to mobile, animations respect `prefers-reduced-motion`, every CTA goes somewhere real, and there is zero pricing or payment surface.

### 3.2 App shell
- Route: `/app` (layout wrapping search, results, actions).
- Components: `AppSidebar` (icon rail), `TopBar` (back, title, right actions), `ViewRouter`.
- Behavior: single-page workspace feel. The sidebar switches between New search, History, and Shortlist. The top bar shows the active query as the title and context actions (for example a jump to Actions). Sign out returns to the marketing site.
- Definition of done: gated by GitHub auth, keyboard accessible, view switching is instant, and state survives navigation within the app.

### 3.3 Capability search
- Route: `/app` (search view) and `POST /api/search`.
- Components: `SearchBox` (textarea, enter to submit, shift+enter for newline), `SuggestionChips`, `SearchHistory`.
- Behavior: user submits a natural-language query. The system extracts detected capabilities (chips), retrieves and ranks candidates, returns a count and a funnel, and transitions to results. Show a fast skeleton while loading. Persist the query in history.
- Definition of done: a query returns detected skills plus a ranked candidate list plus a count, the empty state explains how to broaden, and errors are explained in the interface voice (never a raw stack trace).

### 3.4 Detected skills
- Components: `SkillChips` in the results filter panel.
- Behavior: chips are editable (remove with an x, add with a plus, reorder by drag). Changing the chips re-runs retrieval (chips are the retrieval anchors).
- Definition of done: add, remove, and reorder all work and visibly affect results.

### 3.5 Results and candidate cards
- Components: `ResultsHeader` (count, export CSV, bulk actions), `CandidateCard`, `CandidateList`.
- Behavior: each card shows handle, location, an evidence blurb derived from real contributions, repo tags, and a shortlist toggle. Clicking a card opens the profile drawer. Cards animate in with a small stagger.
- Definition of done: cards reflect real data, shortlist toggles persist, export downloads a valid CSV of the current filtered list.

### 3.6 Filters and funnel
- Components: `SeniorityToggle`, `LocationInput`, `RepoFilterList`, `Funnel`.
- Behavior: filtering by seniority, location, and repositories narrows the list and updates the funnel (Total to Location to Match). Repos show star counts and toggle on click.
- Definition of done: every filter changes the list and the funnel, and the funnel bars animate.

### 3.7 Developer profile drawer
- Route: drawer over `/app`, data from `GET /api/developers/[login]`.
- Components: `ProfileDrawer`, `ProfileHeader`, `ProfileStats`, `AboutBlock`, `InsightsGrid` (`ThisYear`, `MostActive`, `Projects`, `Languages`, `Signals`), `DownloadPdfButton`, `ShareButton`.
- Behavior: slides in from the right over the list. Shows stats, an AI-written About, and the insights grid. Download PDF exports the profile. Share copies a public X-ray link.
- Definition of done: drawer opens and closes smoothly, all insight panels populate from real data, PDF export works, and the share link resolves to a public profile.

### 3.8 Shortlist
- Components: `ShortlistSidebar`, shortlist state in the store, persisted via `POST /api/shortlists`.
- Behavior: starred candidates appear in the actions sidebar with a shortlisted badge. Shortlists persist per user or org.
- Definition of done: shortlist survives reloads and is scoped to the signed-in user or org.

### 3.9 Outreach
- Route: `POST /api/outreach`.
- Components: `ActionCards` (Draft outreach, Email sequence), `OutreachCard` (subject, body with key capability phrases highlighted, sequence step).
- Behavior: generate a personalized email per shortlisted candidate that references two or three of their specific capabilities and repos. Email sequence produces a three step series for a candidate. Optionally send via Resend (later).
- Definition of done: every draft references real, candidate-specific evidence and is copyable; the sequence produces three distinct steps.

### 3.10 Chat agent
- Route: `POST /api/chat` (streaming).
- Components: `ChatThread`, `ChatInput`, `ChatBubble`.
- Behavior: a Claude agent scoped to the current search and shortlist. It can refine filters, compare candidates, and draft outreach. Streams tokens. Falls back to a useful canned response if the model is unavailable.
- Definition of done: chat has the current query and shortlist in context, streams responses, and can trigger outreach drafting.

### 3.11 Public profile X-ray
- Route: `/u/[login]` (public, no auth).
- Components: reuse profile components in a public layout, plus a "scout more like this" CTA into the app.
- Behavior: enter a username on the marketing site or visit the URL directly to see that developer's capability profile. If the developer is not yet ingested, ingest on demand (with a loading state) then render.
- Definition of done: any valid public GitHub username produces a profile, on-demand ingestion works, and the page is shareable and indexable.

### 3.12 Playground (domain explorer)
- Route: `/playground` (public).
- Components: `DomainSearch`, `TalentMap` (ranked list or simple cluster view), `DomainStats`.
- Behavior: explore the top engineers in a domain (for example "rust async runtimes" or "zero knowledge proofs"). Backed by precomputed domain seeds.
- Definition of done: a domain query returns a ranked set of top contributors with evidence, computed from the seeded dataset.

---

## 4. System architecture

Text diagram of the MVP (single Next.js app plus a managed Postgres and an async job runner):

```
                         +-------------------------------+
                         |        Browser (Next.js)      |
                         |  Marketing  /  App workspace  |
                         |  /u/[login] /  /playground    |
                         +---------------+---------------+
                                         | HTTPS (fetch, SSE for chat)
                                         v
                         +-------------------------------+
                         |   Next.js Route Handlers (API)|
                         |  /api/search  /api/developers |
                         |  /api/outreach /api/chat ...  |
                         +----+-------------+------------+
                              |             |
            read/write        |             |  enqueue jobs
                              v             v
        +---------------------+--+     +----+---------------------------+
        |  PostgreSQL + pgvector |     |  Inngest (background jobs)     |
        |  developers, repos,    |     |  ingest.developer             |
        |  contributions,        |<----+  enrich.developer             |
        |  capabilities (vec),   |     |  embed.profile                |
        |  searches, shortlists, |     |  discover.domain (bulk seed)  |
        |  outreach, chat        |     +----+------------+-------------+
        +------------------------+          |            |
                                            v            v
                              +-------------+--+   +-----+----------------+
                              |  GitHub API     |   |  Claude + Voyage     |
                              |  REST + GraphQL  |   |  enrich, summarize,  |
                              |  (live profiles) |   |  embed, outreach,    |
                              +------------------+   |  chat                |
                                                     +----------------------+
        Bulk domain discovery (optional, for Playground and seeding):
        GH Archive on BigQuery  -->  discover.domain job  -->  ingest queue
```

Request flow for a search:
1. Browser posts the query to `/api/search`.
2. Handler calls Claude to extract detected capabilities, embeds them with Voyage, runs a hybrid query against pgvector plus SQL filters, ranks, and returns candidates, count, funnel, and a `searchId`.
3. If a candidate in scope is stale or missing, the handler enqueues `ingest.developer` and serves what it has; the row refreshes asynchronously.

Request flow for the X-ray:
1. Browser hits `/u/[login]`.
2. If the developer exists and is fresh, render. If not, enqueue `ingest.developer` plus `enrich.developer`, show a loading state, and render when ready.

---

## 5. Tech stack (with rationale and alternatives)

End to end TypeScript, web first, single app to start. Chosen for speed, for one language across the stack, and for strong Claude Code ergonomics.

- Framework: Next.js (App Router) + React + TypeScript. Rationale: one codebase for marketing, app, public pages, and API; great Vercel deploy; server components for data-heavy pages.
- Styling: Tailwind CSS + shadcn/ui (Radix under the hood). Rationale: fast, consistent, accessible primitives. The look is dark and minimal, so precision in spacing and type matters more than many components.
- Animation: Framer Motion. Rationale: scroll reveals, the product carousel, the profile drawer slide, and funnel bars.
- Fonts: JetBrains Mono for UI chrome, labels, and data; Inter or Geist for big display headings.
- Database: PostgreSQL (Neon serverless or Supabase) with the pgvector extension. ORM: Prisma. Rationale: one database for relational data and embeddings; hybrid search without a separate vector service.
- Vector search: pgvector. Alternative at scale: Qdrant or Pinecone. Start with pgvector.
- Faceted filtering: Postgres for the MVP. Alternative at scale: Typesense or Meilisearch for fast facets.
- Background jobs: Inngest. Rationale: serverless-friendly, great local dev, durable steps, easy fan-out for ingestion. Alternative: BullMQ + Redis (Upstash).
- LLM: Anthropic Claude for capability extraction, profile summaries, outreach, and chat. Use the current Claude model string from the Anthropic docs at build time. Rationale: you are already in the Claude ecosystem and will drive this with Claude Code.
- Embeddings: Voyage AI (for example a current voyage text model) to pair with Claude. Alternative: OpenAI text-embedding-3-large.
- GitHub data: GitHub REST + GraphQL via a GitHub App (preferred) or a PAT for dev. Bulk domain discovery: GH Archive on BigQuery.
- Auth: Auth.js (NextAuth) with GitHub OAuth, or Clerk for speed. Orgs and seats, but no billing.
- Email (optional, later): Resend for sending outreach.
- Observability (optional): Sentry for errors, PostHog for product analytics.
- Hosting: Vercel (web + API), Neon or Supabase (DB), Inngest (jobs).

What we deliberately do not add for the MVP: a separate microservice, a separate vector DB, Kafka, or anything that slows the first working version. Add those only when scale demands it.

---

## 6. Data model (Prisma)

This is the target schema. Adjust field names as needed but keep the shape. Embeddings use pgvector via Prisma's `Unsupported("vector(...)")` or a raw migration.

```prisma
// schema.prisma (core models)

model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  name      String?
  image     String?
  githubId  String?  @unique
  orgId     String?
  org       Org?     @relation(fields: [orgId], references: [id])
  searches  Search[]
  shortlists Shortlist[]
  createdAt DateTime @default(now())
}

model Org {
  id      String  @id @default(cuid())
  name    String
  members User[]
  shortlists Shortlist[]
}

model Developer {
  id            String   @id @default(cuid())
  login         String   @unique          // github handle
  name          String?
  location      String?
  bio           String?
  avatarUrl     String?
  followers     Int      @default(0)
  publicRepos   Int      @default(0)
  hireable      Boolean?
  rawJson       Json?                      // raw github profile
  lastSyncedAt  DateTime?
  repos         Repo[]
  contributions Contribution[]
  capabilities  Capability[]
  profile       DeveloperProfile?
  createdAt     DateTime @default(now())
}

model Repo {
  id            String   @id @default(cuid())
  developerId   String
  developer     Developer @relation(fields: [developerId], references: [id])
  fullName      String                      // owner/name
  name          String
  description   String?
  stars         Int      @default(0)
  primaryLanguage String?
  languagesJson Json?
  isFork        Boolean  @default(false)
  @@index([developerId])
}

model Contribution {
  id            String   @id @default(cuid())
  developerId   String
  developer     Developer @relation(fields: [developerId], references: [id])
  type          String                      // commit | pr | review | issue
  repoFullName  String
  count         Int      @default(0)
  mergedExternal Boolean @default(false)     // PR merged into a repo they do not own
  year          Int
  rawJson       Json?
  @@index([developerId])
}

model Capability {
  id            String   @id @default(cuid())
  developerId   String
  developer     Developer @relation(fields: [developerId], references: [id])
  label         String                      // e.g. "tokio runtime internals"
  domain        String?                     // e.g. "rust async"
  confidence    Float    @default(0)
  evidenceJson  Json?                       // repos, PRs, snippets proving it
  // embedding stored via raw migration: ALTER TABLE add column embedding vector(1024)
  @@index([developerId])
}

model DeveloperProfile {
  id               String   @id @default(cuid())
  developerId      String   @unique
  developer        Developer @relation(fields: [developerId], references: [id])
  seniority        String?                  // Junior | Mid | Senior
  seniorityReason  String?
  summary          String?                  // AI-written About
  languagesBreakdown Json?                  // [{lang, pct}]
  signalsJson      Json?                    // {externalPrs, ...}
  // profileEmbedding vector(1024) via raw migration
  updatedAt        DateTime @updatedAt
}

model Search {
  id            String   @id @default(cuid())
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  query         String
  detectedSkills Json?                       // string[]
  filtersJson   Json?
  createdAt     DateTime @default(now())
  results       SearchResult[]
  chat          ChatMessage[]
}

model SearchResult {
  id          String   @id @default(cuid())
  searchId    String
  search      Search   @relation(fields: [searchId], references: [id])
  developerId String
  score       Float
  rank        Int
  @@index([searchId])
}

model Shortlist {
  id      String  @id @default(cuid())
  name    String  @default("Shortlist")
  userId  String?
  user    User?   @relation(fields: [userId], references: [id])
  orgId   String?
  org     Org?    @relation(fields: [orgId], references: [id])
  items   ShortlistItem[]
}

model ShortlistItem {
  id          String   @id @default(cuid())
  shortlistId String
  shortlist   Shortlist @relation(fields: [shortlistId], references: [id])
  developerId String
  status      String   @default("shortlisted")
  outreach    Outreach[]
  @@index([shortlistId])
}

model Outreach {
  id              String   @id @default(cuid())
  shortlistItemId String
  item            ShortlistItem @relation(fields: [shortlistItemId], references: [id])
  subject         String
  body            String
  sequenceStep    Int      @default(1)
  status          String   @default("draft") // draft | sent
  createdAt       DateTime @default(now())
}

model ChatMessage {
  id        String   @id @default(cuid())
  searchId  String
  search    Search   @relation(fields: [searchId], references: [id])
  role      String                          // user | assistant
  content   String
  createdAt DateTime @default(now())
}
```

Raw migration to add vector columns (run after `prisma migrate`):

```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "Capability" ADD COLUMN embedding vector(1024);
ALTER TABLE "DeveloperProfile" ADD COLUMN "profileEmbedding" vector(1024);
CREATE INDEX ON "Capability" USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON "DeveloperProfile" USING hnsw ("profileEmbedding" vector_cosine_ops);
```

Set the vector dimension to match the embedding model you choose.

---

## 7. The engine (pipeline, step by step)

This is the heart of the clone. It runs mostly as background jobs so requests stay fast.

### 7.1 Discovery and seeding (`discover.domain`)
Goal: build a starter universe of developers so search feels full from day one.
- Input: a domain (for example "rust async runtimes", "zero knowledge proofs", "database query optimizers").
- Method A (fast, recommended for MVP): for a curated set of anchor repos per domain, pull top contributors via the GitHub API and enqueue each for ingestion.
- Method B (scale, for the Playground): query GH Archive on BigQuery for PR, review, and commit events in the domain's repos over a time window, aggregate by author, take the top contributors, and enqueue them.
- Output: a queue of developer logins to ingest.

### 7.2 Ingestion (`ingest.developer`)
Goal: pull one developer's public footprint.
- GitHub data to fetch: profile (name, location, bio, followers, public repo count), owned repos (name, stars, primary language, language breakdown, description, fork flag), contribution counts for the last year (commits, PRs authored, PRs merged into external repos, reviews, issues), and a sample of notable PRs and READMEs for evidence.
- Respect rate limits (section 11). Cache aggressively. Store raw plus normalized rows.
- On completion, enqueue `enrich.developer`.

### 7.3 Enrichment (`enrich.developer`)
Goal: turn raw contributions into a structured, searchable profile using Claude.
- Produce capability tags: 5 to 15 short capability phrases, each with a domain, a confidence score, and evidence (the repos or PRs that prove it).
- Produce a seniority estimate (Junior, Mid, Senior) with a one line reason, derived from years active, ownership, review activity, and contribution complexity.
- Produce an About summary (two to four sentences, factual, recruiter-facing).
- Produce a languages breakdown and signals (for example external PRs merged).
- On completion, enqueue `embed.profile`.

### 7.4 Embedding and indexing (`embed.profile`)
Goal: make the profile semantically searchable.
- Embed each capability's evidence text and the overall profile summary with Voyage.
- Upsert vectors into the pgvector columns. Build or refresh HNSW indexes.

### 7.5 Search and ranking (`/api/search`)
Goal: turn a query into a ranked candidate list.
1. Detect capabilities: Claude extracts 5 capability phrases from the query (these become the chips).
2. Embed the detected capabilities with Voyage.
3. Retrieve: for each capability embedding, run a vector similarity query against `Capability.embedding`, union the candidate developers, and also apply structured filters (seniority, location, repos) in SQL.
4. Rank each candidate with a weighted score:

```
score =
    0.45 * semantic_similarity      // best match between query capabilities and candidate evidence
  + 0.20 * contribution_depth        // commits and PRs in relevant repos, normalized
  + 0.15 * external_pr_signal        // merged PRs into repos they do not own
  + 0.10 * relevant_repo_stars       // stars on the candidate's relevant projects, log-scaled
  + 0.10 * recency                   // activity recency, decayed
```

5. Return: detected skills, the ranked candidates (handle, location, evidence blurb, repo tags, seniority), a count, a funnel (Total to Location to Match), and a `searchId`.
6. Evidence blurb: generate or template a one line, candidate-specific blurb from the top matching capability and its evidence.

### 7.6 Outreach (`/api/outreach`)
Goal: a personalized, evidence-grounded email per candidate.
- Input: developer, the search query, and an optional sequence step.
- Claude writes a short subject and body referencing two or three of the candidate's specific capabilities and repos. Highlight those phrases in the UI.

### 7.7 Chat (`/api/chat`)
Goal: an agent over the current search and shortlist.
- System context: the active query, detected skills, and the shortlist (names plus top capabilities).
- Capabilities: refine filters, compare candidates, and draft outreach. Stream responses.

---

## 8. API surface (Route Handlers)

All under `app/api`. JSON in, JSON out, except chat which streams.

- `POST /api/skills/detect` -> `{ query }` returns `{ skills: string[] }`.
- `POST /api/search` -> `{ query, filters }` returns `{ searchId, detectedSkills, candidates, count, funnel }`.
- `GET /api/developers/[login]` returns the full profile (stats, about, insights). Triggers on-demand ingestion if missing or stale.
- `POST /api/developers/[login]/sync` -> enqueue ingestion and enrichment.
- `POST /api/shortlists` -> create or update a shortlist. `POST /api/shortlists/[id]/items` -> add or remove an item.
- `POST /api/outreach` -> `{ developerId, query, sequenceStep }` returns `{ subject, body, sequenceStep }`.
- `POST /api/chat` -> `{ searchId, messages }` streams assistant tokens (SSE or Next streaming).
- `GET /api/playground?domain=...` returns the top developers in a domain from the seeded set.
- `GET /api/export?searchId=...` returns a CSV of the current results.

Every handler must return a clear, interface-voice error on failure, never a raw exception.

---

## 9. Background jobs (Inngest)

- `discover.domain` (input: domain): seed developer logins, fan out to ingestion.
- `ingest.developer` (input: login): pull GitHub data, store, then enqueue enrichment.
- `enrich.developer` (input: developerId): Claude capability extraction, seniority, summary, then enqueue embedding.
- `embed.profile` (input: developerId): Voyage embeddings, upsert vectors.
- `refresh.stale` (cron): re-ingest developers whose `lastSyncedAt` is older than a threshold.

Each job is idempotent and safe to retry. Use durable steps so a failure mid-pipeline resumes cleanly.

---

## 10. LLM usage and prompt templates

Use Claude for reasoning and text, Voyage for embeddings. Keep prompts in `lib/ai/prompts.ts`. Always instruct the model to return strict JSON where structure is needed, and parse defensively (strip code fences, then JSON.parse, with a fallback).

Capability detection (query to chips):
```
System: You map hiring queries to precise engineering capabilities. Output only valid JSON.
User: A recruiter is hiring for: "{query}".
List the 5 most specific, concrete technical capabilities to match engineers on.
Return a JSON array of short strings (each 2 to 4 words, lowercase, no trailing punctuation).
```

Capability extraction (contributions to skill profile):
```
System: You convert a developer's public GitHub work into a structured, evidence-based skill profile. Output only valid JSON.
User: Here is a developer's data: {profile, repos, top PRs, languages, contribution counts}.
Return JSON:
{
  "capabilities": [{ "label": "...", "domain": "...", "confidence": 0.0, "evidence": ["repo or PR refs"] }],
  "seniority": "Junior | Mid | Senior",
  "seniorityReason": "one line",
  "summary": "2 to 4 factual sentences for a recruiter",
  "languages": [{ "lang": "...", "pct": 0 }],
  "signals": { "externalPrsMerged": 0 }
}
```

Outreach drafting:
```
System: You write short, specific recruiting outreach that references a candidate's real open-source work. Warm, direct, under 110 words. Output only valid JSON.
User: Candidate @{login} ({name}), {seniority}, {location}. Known for: {capabilities}. Repos: {repos}. Hiring for: "{query}". Sequence step {step} of 3.
Return JSON: { "subject": "...", "body": "..." } with \n for line breaks. Reference 2 to 3 specific capabilities.
```

Chat agent (system):
```
You are ShipScout's hiring copilot. The recruiter is sourcing for: "{query}".
Current shortlist: {names and top capabilities, or "empty"}.
Be concise, concrete, and practical. Plain text, no markdown headings.
You can refine filters, compare candidates, and draft outreach.
```

Embeddings: embed each capability's evidence text and each profile summary. Use cosine distance in pgvector. Match the vector dimension in the schema to the model.

---

## 11. GitHub data and rate limits

- Auth: use a GitHub App (preferred) for higher limits and per-install tokens, or a PAT for local dev.
- REST limit: about 5000 requests per hour per token. GraphQL uses a points budget per query. Batch with GraphQL where possible (one query can fetch profile, repos, and contribution counts).
- Caching: store raw responses and a `lastSyncedAt`. Do not re-fetch fresh developers. Use conditional requests (ETags) where possible.
- Bulk: for domain discovery and the Playground, prefer GH Archive on BigQuery rather than crawling the API.
- Backoff: handle secondary rate limits with exponential backoff and jitter inside jobs.
- Only public data. Provide a removal path for any developer who asks to be delisted (section 18).

---

## 12. Directory structure

Single Next.js app. Keep the engine in `lib` so it can later be extracted into a package.

```
shipscout/
  app/
    (marketing)/
      page.tsx                  # landing
      u/[login]/page.tsx        # public X-ray profile
      playground/page.tsx       # domain explorer
    app/
      layout.tsx                # app shell (sidebar, topbar)
      page.tsx                  # search + results + actions views
    api/
      skills/detect/route.ts
      search/route.ts
      developers/[login]/route.ts
      developers/[login]/sync/route.ts
      shortlists/route.ts
      shortlists/[id]/items/route.ts
      outreach/route.ts
      chat/route.ts
      playground/route.ts
      export/route.ts
  components/
    marketing/                  # Nav, Hero, DemoCarousel, HowItWorks, ...
    app/                        # AppSidebar, TopBar, SearchBox, CandidateCard,
                                # Filters, Funnel, ProfileDrawer, Insights, Chat
    ui/                         # shadcn components
  lib/
    db.ts                       # prisma client
    github/                     # rest + graphql clients, normalizers
    ai/
      claude.ts                 # claude calls
      embed.ts                  # voyage calls
      prompts.ts                # prompt templates
    engine/
      detect.ts                 # query -> capabilities
      ingest.ts                 # github -> rows
      enrich.ts                 # rows -> skill profile
      index.ts                  # embeddings -> pgvector
      search.ts                 # hybrid retrieve + rank
      outreach.ts               # email drafting
    inngest/
      client.ts
      functions.ts              # discover, ingest, enrich, embed, refresh
    seed/
      domains.ts                # anchor repos per domain
      seed.ts                   # dev seeding script
    types.ts
  prisma/
    schema.prisma
    migrations/
  styles/
    globals.css
  CONTEXT.md                    # this file (or symlink to CLAUDE.md)
  .env.example
  package.json
```

---

## 13. Environment variables

Create `.env.local` from `.env.example`.

```
# Database
DATABASE_URL=postgres://...            # Neon or Supabase, with pgvector enabled

# Auth (GitHub OAuth)
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_SECRET=...                        # random string

# GitHub data access
GITHUB_APP_ID=...                      # or use a PAT for dev
GITHUB_APP_PRIVATE_KEY=...
GITHUB_TOKEN=...                       # PAT for local dev fallback

# LLM and embeddings
ANTHROPIC_API_KEY=...
VOYAGE_API_KEY=...

# Jobs
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Optional
RESEND_API_KEY=...                     # sending outreach (later)
SENTRY_DSN=...
NEXT_PUBLIC_POSTHOG_KEY=...

# Bulk discovery (optional)
GCP_PROJECT_ID=...                     # GH Archive on BigQuery
GOOGLE_APPLICATION_CREDENTIALS=...
```

Never commit secrets. Never put secrets or PII in URLs.

---

## 14. Local dev, build, and deploy

Local:
1. `pnpm install`
2. Set up Postgres with pgvector (Neon or Supabase, or local Postgres with the extension).
3. `pnpm prisma migrate dev` then run the vector migration SQL in section 6.
4. `pnpm dev` to start Next.js. Run the Inngest dev server alongside (`npx inngest-cli dev`).
5. Seed: `pnpm tsx lib/seed/seed.ts` to ingest a starter set across a few domains.

Build and deploy:
- Web and API: Vercel. Set all env vars. Run `prisma generate` on build.
- Database: Neon or Supabase with pgvector enabled.
- Jobs: Inngest connected to the deployed app.
- Smoke test after deploy: sign in, run a search, open a profile, shortlist, draft outreach, chat, and load `/u/[a known login]`.

---

## 15. Brand and design system (ShipScout)

We own our brand. Do not reuse any SkillSync identity.

Identity:
- Name: ShipScout. Wordmark in lowercase in the nav (shipscout).
- Logo: our own mark. Options: a small pixel "S" we design ourselves (do not copy theirs), or a simple ship or radar glyph. One accent square or element in blue.
- Voice: plain, confident, specific. Lead with the user problem, then the mechanism. No hype words, no emojis.

Tokens (dark theme, blue and white):
```
--bg: #000000
--panel: #0b0b0d
--card: #141417
--line: rgba(255,255,255,0.08)
--text: #f6f6f7
--muted: #8b8b92
--faint: #5a5a61
--accent (blue): #4f8bff
--accent-2: #79a4ff
--accent-dim: rgba(79,139,255,0.13)
```
Type:
- Display: Inter or Geist, weights 700 to 900, tight tracking, for big headings.
- UI and data: JetBrains Mono, for nav, labels, captions, chips, terminal-style chrome.

Motion:
- Scroll reveals on marketing sections, an auto-advancing product carousel, a profile drawer that slides from the right, funnel bars that animate width, button hover lifts, a loading skeleton for search. Respect `prefers-reduced-motion`.

Hard do-nots:
- Do not use the SkillSync name, their pixel mark, their green accent, or their exact copy.
- Do not claim Ramp, Bun, Zed, or any real company as a customer. Use clearly placeholder logos in the trusted-by row, or replace that row with real social proof only when we have it.
- Do not reproduce their marketing text. Write our own.

---

## 16. Execution roadmap (phased, with Claude Code prompts)

Build in order. Each phase ends with a working, runnable state. The paste-ready prompts assume Claude Code is operating in the repo with this file loaded.

### Phase 0: Scaffolding and brand system
Tasks: init Next.js + TypeScript + Tailwind + shadcn, add Prisma and the schema, connect Postgres with pgvector, add Auth.js with GitHub OAuth, set up the design tokens and fonts, add the icon rail and app shell, set `.env.example`.
Prompt:
```
Read CONTEXT.md. Scaffold the Phase 0 foundation: Next.js App Router with TypeScript, Tailwind, and shadcn/ui. Add Prisma with the schema in section 6 and a migration, plus the pgvector raw migration. Wire Auth.js with GitHub OAuth. Implement the design tokens and fonts from section 15 in globals.css. Create the app shell (AppSidebar icon rail and TopBar) per section 3.2. Add .env.example from section 13. Do not add pricing. No em dashes, no emojis anywhere. Then run the app and confirm it builds and the shell renders.
```

### Phase 1: Marketing site
Tasks: build all marketing sections (section 3.1) with our copy and brand, scroll animations, the product carousel, and CTAs that route into the app. No pricing.
Prompt:
```
Read CONTEXT.md sections 3.1 and 15. Build the marketing page at app/(marketing)/page.tsx with Nav, Hero, TrustRow (placeholder logos), DemoCarousel (auto-advance plus manual controls), HowItWorks (three steps), BuildInPublic, ProfileExplorer (username input that routes to /u/[login]), FinalCta, and Footer. Use Framer Motion for scroll reveals and the carousel. Write original copy that leads with the user problem. No pricing, no payment, no emojis, no em dashes. Make it responsive and respect prefers-reduced-motion.
```

### Phase 2: App workspace on seeded data
Tasks: build the entire dashboard (search, detected skills, results, filters, funnel, profile drawer, shortlist, actions, chat) wired to a local seeded JSON dataset so the full loop works instantly. This is the demoable milestone.
Prompt:
```
Read CONTEXT.md sections 3.3 to 3.10. Build the app workspace at app/app/page.tsx against a local seeded dataset (a JSON file of ~300 developers with capabilities, repos, and insights). Implement SearchBox, SuggestionChips, SearchHistory, detected SkillChips (add, remove, drag reorder), CandidateCard list with shortlist toggle, SeniorityToggle, LocationInput, RepoFilterList, Funnel, ProfileDrawer with the full Insights grid, Download PDF (print), CSV export, ShortlistSidebar, ActionCards, and a ChatThread with a local stub responder. Everything must visibly work end to end. No em dashes, no emojis.
```

### Phase 3: Real engine
Tasks: implement GitHub ingestion, Claude enrichment, Voyage embeddings, pgvector indexing, and hybrid search and ranking. Replace the seeded data path with the real one. Add the Inngest jobs.
Prompt:
```
Read CONTEXT.md sections 7 to 11. Implement lib/github clients (REST plus GraphQL) and normalizers, lib/ai (claude, embed, prompts), and lib/engine (detect, ingest, enrich, index, search). Add the Inngest functions in section 9. Implement POST /api/skills/detect, POST /api/search (hybrid pgvector plus SQL filters with the ranking formula in 7.5), GET /api/developers/[login] (with on-demand ingestion), and POST /api/developers/[login]/sync. Add lib/seed to seed a starter set across the domains in lib/seed/domains.ts. Swap the app to use the real API. Handle GitHub rate limits with backoff. No em dashes, no emojis.
```

### Phase 4: Public X-ray and Playground
Tasks: build the public profile page and the domain explorer.
Prompt:
```
Read CONTEXT.md sections 3.11, 3.12, and 7.1. Build /u/[login] (public, on-demand ingestion, shareable, reuses profile components) and /playground (domain explorer backed by GET /api/playground over the seeded set). Add a CTA from the X-ray into the app. No em dashes, no emojis.
```

### Phase 5: Outreach and chat on real data
Tasks: wire outreach drafting and the chat agent to Claude and real candidate data, persist shortlists, and finalize CSV export.
Prompt:
```
Read CONTEXT.md sections 3.9, 3.10, 7.6, and 7.7. Implement POST /api/outreach (Claude, evidence-grounded, with sequence steps) and POST /api/chat (streaming, scoped to the search and shortlist). Persist shortlists via POST /api/shortlists and items. Finalize GET /api/export CSV. Highlight referenced capabilities in outreach. No em dashes, no emojis.
```

### Phase 6: Polish, auth and orgs, hardening, deploy
Tasks: orgs and seats (no billing), rate-limit and caching hardening, empty and error states in interface voice, accessibility pass, then deploy to Vercel plus Neon plus Inngest and run the smoke test.
Prompt:
```
Read CONTEXT.md sections 13, 14, and 18. Add orgs and seats (no billing). Harden GitHub caching and backoff and add refresh.stale cron. Audit every empty and error state to use interface voice. Do an accessibility pass (focus states, reduced motion, keyboard nav). Prepare for deploy on Vercel with Neon and Inngest, then run the section 14 smoke test. No em dashes, no emojis.
```

---

## 17. Definition of done (acceptance checklist)

- Marketing site renders all sections, animates, is responsive, has zero pricing or payment, and every CTA reaches a real destination.
- A natural-language search returns detected skills, a ranked candidate list, a count, and a funnel.
- Detected skill chips can be added, removed, and reordered and they affect results.
- Candidate cards reflect real GitHub-derived evidence and can be shortlisted.
- Filters (seniority, location, repos) narrow the list and update the funnel.
- The profile drawer shows real stats, an AI About, and the full insights grid, and PDF export and share work.
- Outreach drafts reference each candidate's specific real contributions, and a three step sequence works.
- The chat agent has the search and shortlist in context and streams useful responses.
- The public X-ray page resolves any valid public GitHub username, ingesting on demand if needed.
- The Playground returns top developers for a domain.
- Sign in works via GitHub. Shortlists persist per user or org. No billing exists.
- The whole app is deployed and passes the smoke test.

---

## 18. Risks, legal, and privacy

- Clone behavior, not brand. Replicate features and flows. Never copy the SkillSync name, logo, color system, marketing copy, or named customers. Write original copy and design our own identity (section 15).
- GitHub data: use only public data, respect the GitHub API terms and rate limits, and prefer GH Archive for bulk. Do not store private repo data.
- Privacy and PII: profiles are derived from public activity. Provide a clear path for any developer to request removal or correction, and honor it promptly. Do not expose contact details that are not already public. Do not compile sensitive personal data.
- LLM grounding: capability tags, summaries, and outreach must be grounded in real evidence. Avoid fabricated claims about a person. Show the evidence behind a capability where possible.
- Accuracy and fairness: seniority and capability are estimates. Present them as derived signals, not verdicts. Avoid filters that could encode bias beyond legitimate job-relevant criteria.
- Outreach sending: if and when we send email, comply with anti-spam rules (clear sender, unsubscribe, no harvesting beyond public professional context).
- Rate and cost control: cache GitHub and LLM results, batch where possible, and put guardrails on per-user search and ingestion volume.

---

## 19. Glossary

- Capability: a specific, evidence-backed skill phrase for a developer (for example "lock-free concurrency"), with the repos or PRs that prove it.
- Detected skills: the capability phrases extracted from a search query; they are both the chips shown to the user and the retrieval anchors.
- Evidence blurb: the one line, candidate-specific summary on a result card, derived from the top matching capability.
- Funnel: the Total to Location to Match counts that show how filters narrow the pool.
- Hybrid search: vector similarity (semantic match) combined with structured SQL filters.
- Skill profile: the structured output of enrichment for one developer (capabilities, seniority, summary, languages, signals, embeddings).
- X-ray: the public, no-login capability profile for any GitHub username.
