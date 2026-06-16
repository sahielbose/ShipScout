// Deterministic developer/profile generation, ported and expanded from the
// prototype. Used to seed a realistic starter universe so the full search loop
// works offline. Everything is seeded by a stable hash so results are stable
// across runs (matches the demo feel). No em dashes, no emojis.

import type { Candidate, Insights, LangBar, Seniority } from "@/lib/types";
import { hash, rng, pick, slug } from "@/lib/utils";
import { DOMAINS, LANG_COLORS, domainFor, type Domain } from "@/lib/seed/domains";

const NAMES: [string, string][] = [
  ["Sarah", "Chen"], ["Marcus", "Rivera"], ["Priya", "Nair"], ["James", "Wu"],
  ["Lena", "Petrov"], ["Diego", "Santos"], ["Aisha", "Okafor"], ["Tom", "Berg"],
  ["Yuki", "Tanaka"], ["Noah", "Klein"], ["Grace", "Akello"], ["Omar", "Haddad"],
  ["Mei", "Lin"], ["Ravi", "Shah"], ["Anna", "Kowalski"], ["Leo", "Moretti"],
  ["Fatima", "Zahra"], ["Kai", "Nguyen"], ["Elena", "Costa"], ["Sam", "Ito"],
  ["Hassan", "Ali"], ["Nora", "Lund"], ["Theo", "Adeyemi"], ["Ivy", "Park"],
  ["Mateo", "Garcia"], ["Sofia", "Rossi"], ["Daniel", "Kim"], ["Zara", "Khan"],
  ["Felix", "Braun"], ["Maya", "Iyer"], ["Hugo", "Almeida"], ["Lin", "Zhao"],
  ["Oskar", "Nilsson"], ["Amara", "Diallo"], ["Pavel", "Novak"], ["Rin", "Sato"],
];

const LOCS = [
  "San Francisco, CA", "Austin, TX", "Seattle, WA", "New York, NY", "Berlin, DE",
  "London, UK", "Toronto, CA", "Stockholm, SE", "Amsterdam, NL", "Bangalore, IN",
  "Lisbon, PT", "Tokyo, JP", "Nairobi, KE", "Singapore", "Tel Aviv, IL", "Warsaw, PL",
  "Paris, FR", "Zurich, CH", "Seoul, KR", "Sydney, AU",
];

const SENIOR: Seniority[] = ["Senior", "Senior", "Senior", "Mid", "Mid", "Junior"];

// query -> capability chips (CONTEXT.md section 7.5 step 1, lexical fallback).
export function detectSkillsLocal(query: string): string[] {
  const d = domainFor(query);
  const ql = query.toLowerCase();
  let matched = 0;
  for (const k of d.keywords) if (ql.includes(k)) matched++;
  if (matched >= 1) return d.skills.slice(0, 5);

  const stop = new Set(
    "a an the of for and or with in on to who are you looking find me engineers engineer scientist scientists senior junior mid level experienced expert experts specialist specialists developer developers people best top".split(
      " "
    )
  );
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9 +#.]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !stop.has(w));
  const uniq = [...new Set(words)].slice(0, 4);
  if (!uniq.length) return d.skills.slice(0, 5);
  const suff = ["internals", "optimization", "architecture", "tooling", "at scale"];
  return uniq.map((w, i) => w + " " + suff[i % suff.length]);
}

interface BuildArgs {
  login: string;
  first: string;
  last: string;
  loc: string;
  seniority: Seniority;
  blurb: string;
  tags: string[];
  skills: string[];
  domain: Domain;
  seed: number;
  avatarUrl?: string | null;
}

export function buildProfile(args: BuildArgs): Candidate {
  const { login, first, last, loc, seniority, blurb, tags, skills, domain, seed } = args;
  const r = rng(seed);
  const langs = [...new Set([...domain.langs])].slice(0, 5);
  const repos = 70 + Math.floor(r() * 120);
  const followers = 40 + Math.floor(r() * 900);
  const commits = 200 + Math.floor(r() * 1700);
  const prs = 8 + Math.floor(r() * 40);
  const issues = Math.floor(r() * 12);
  const reviews = 10 + Math.floor(r() * 50);
  const ext = 20 + Math.floor(r() * 60);

  const an = ["nvim-config", "ci-toolkit", "core-runtime", "bench-suite", "proto-defs", tags[0] || "toolkit"];
  const active = [];
  for (let i = 0; i < 3; i++) {
    active.push({ name: an[Math.floor(r() * an.length)] + (i ? "-" + i : ""), val: 18 + Math.floor(r() * 30) });
  }
  const pn = ["shelgon", "dith", "sidekick", "waypoint", "flux", "arena", "probe", "relay", "forge", "ledger"];
  const projects = [];
  for (let i = 0; i < 5; i++) {
    projects.push({ name: pn[(Math.floor(r() * pn.length) + i) % pn.length], lang: pick(r, langs), stars: 5 + Math.floor(r() * 300) });
  }
  let rem = 100;
  const bar: LangBar[] = langs.map((l, i) => {
    const p = i === langs.length - 1 ? rem : Math.max(6, Math.floor((r() * (rem - (langs.length - i - 1) * 6)) / 1.4));
    rem -= p;
    return { lang: l, pct: p, color: LANG_COLORS[l] || "#4f8bff" };
  });

  const about = `${first} ${last} works across ${langs.slice(0, 3).join(", ")} and ${langs[3] || "more"}, with public repositories spanning ${skills[0]} and ${
    skills[1] || skills[0]
  }. Has shipped production projects in ${domain.langs[0]} and contributed ${ext} merged external pull requests, with sustained activity over the last year.`;

  const insights: Insights = { repos, followers, commits, prs, issues, reviews, ext, active, projects, langs, bar };

  return {
    login,
    name: (first + " " + last).trim(),
    initials: ((first[0] || "S") + (last[0] || "")).toUpperCase(),
    avatarUrl: args.avatarUrl ?? null,
    loc,
    seniority,
    blurb,
    tags,
    skills: skills.slice(0, 4),
    about,
    insights,
  };
}

// Generate a cohort of candidates for one query (ported from the prototype).
export function genCandidates(query: string, skills: string[]): Candidate[] {
  const d = domainFor(query);
  const r = rng(hash(query));
  const repoPool = [...new Set([...skills.map(slug).map((s) => "oss/" + s), ...d.repos.map((rp) => rp.fullName)])];
  const n = 9 + Math.floor(r() * 4);
  const used = new Set<string>();
  const out: Candidate[] = [];
  for (let i = 0; i < n; i++) {
    let nm: [string, string];
    do {
      nm = pick(r, NAMES);
    } while (used.has(nm.join()) && used.size < NAMES.length);
    used.add(nm.join());
    const first = nm[0];
    const last = nm[1];
    const login = (first + last).toLowerCase().replace(/[^a-z]/g, "") + (r() < 0.4 ? String(Math.floor(r() * 90) + 10) : "");
    const seniority = pick(r, SENIOR);
    const loc = pick(r, LOCS);
    const s1 = skills[i % skills.length];
    const s2 = skills[(i + 2) % skills.length];
    const commits = 400 + Math.floor(r() * 2400);
    const senWord = seniority === "Senior" ? "Senior " : seniority === "Junior" ? "Early-career " : "";
    const blurb = `${senWord}engineer focused on ${s1} and ${s2}, ${commits}+ commits this year.`;
    const tags: string[] = [];
    const tagCount = 2 + Math.floor(r() * 3);
    const tp = [...repoPool];
    for (let t = 0; t < tagCount && tp.length; t++) {
      const idx = Math.floor(r() * tp.length);
      const popped = tp.splice(idx, 1)[0].split("/").pop();
      if (popped) tags.push(popped);
    }
    out.push(buildProfile({ login, first, last, loc, seniority, blurb, tags, skills, domain: d, seed: hash(login + query) }));
  }
  return out;
}

// Build a full universe across all domains for the seeded dataset.
export function genUniverse(perDomain = 30): Candidate[] {
  const all: Candidate[] = [];
  const seen = new Set<string>();
  for (const d of DOMAINS) {
    const r = rng(hash("universe:" + d.id));
    for (let i = 0; i < perDomain; i++) {
      const nm = NAMES[(Math.floor(r() * NAMES.length) + i) % NAMES.length];
      const first = nm[0];
      const last = nm[1];
      let login = (first + last).toLowerCase().replace(/[^a-z]/g, "") + d.id.replace(/[^a-z]/g, "").slice(0, 3) + i;
      while (seen.has(login)) login = login + "x";
      seen.add(login);
      const seniority = pick(r, SENIOR);
      const loc = pick(r, LOCS);
      const skills = d.skills;
      const s1 = skills[i % skills.length];
      const s2 = skills[(i + 2) % skills.length];
      const commits = 400 + Math.floor(r() * 2400);
      const senWord = seniority === "Senior" ? "Senior " : seniority === "Junior" ? "Early-career " : "";
      const blurb = `${senWord}engineer focused on ${s1} and ${s2}, ${commits}+ commits this year.`;
      const tags = d.repos.slice(0, 2 + Math.floor(r() * 2)).map((rp) => rp.fullName.split("/").pop() as string);
      all.push(buildProfile({ login, first, last, loc, seniority, blurb, tags, skills, domain: d, seed: hash(login) }));
    }
  }
  return all;
}
