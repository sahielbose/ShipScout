# Contributing to ShipScout

Thanks for your interest. ShipScout is open source under the MIT license.

## Setup

```bash
npm install
npm run dev
```

The app runs with zero configuration on the seeded dataset. To work on the live
engine, copy `.env.example` to `.env.local` and add the keys you need (see the
README for what each tier enables).

## The green gate

Before every commit, keep `main` green:

```bash
npm run typecheck   # tsc --noEmit
npm run test        # unit tests for the engine math and determinism
npm run eval        # golden skill-detection and search cases (gated at 90 percent)
```

If you change detection or ranking, re-run `npm run eval`. A drop in pass rate
is a regression: fix it before committing.

## Conventions

- The api seam is the contract. The UI talks only to `lib/api-client`. Each
  method has one offline (seeded) implementation and one live one. Do not let
  the UI know which is active.
- Keep the zero-setup invariant: with no keys or database, everything must still
  work against the seeded dataset.
- Commit small and often, Conventional Commits style (feat, fix, test, docs,
  chore).
- Two hard writing rules everywhere (code, copy, docs, commit messages): no em
  dashes and no emojis. Use hyphens, colons, and parentheses.
- No pricing and no payment anywhere.
- Gate every side effect behind an explicit confirm step. Never auto-send.
- Ground capability claims, summaries, and outreach in real evidence. Present
  seniority and capability as derived signals, not verdicts.

## Where things live

See `CONTEXT.md` section 12 and `CLAUDE.md` for the repo map. In short: `app/`
holds the pages and the api route handlers, `components/` the UI, `lib/engine`
the engine, `lib/github` and `lib/ai` the integrations, `prisma/` the schema,
and `evals/` the golden cases.

## Reporting issues

Open an issue at https://github.com/sahielbose/ShipScout/issues. For security or
privacy concerns, see `SECURITY.md`.
