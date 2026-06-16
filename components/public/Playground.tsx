"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GITHUB_URL } from "@/lib/constants";
import type { Candidate } from "@/lib/types";

const DOMAIN_CHIPS = [
  "rust async runtimes",
  "zero knowledge proofs",
  "database query optimizers",
  "ml inference and cuda",
  "distributed consensus",
  "wasm toolchains",
];

interface PlaygroundResponse {
  domain: string;
  skills: string[];
  count: number;
  developers: (Candidate & { rank: number })[];
}

// Domain explorer (CONTEXT.md section 3.12): explore the top engineers in a
// domain, backed by GET /api/playground over the seeded set.
export function Playground() {
  const [domain, setDomain] = useState("rust async runtimes");
  const [input, setInput] = useState("rust async runtimes");
  const [data, setData] = useState<PlaygroundResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/playground?domain=${encodeURIComponent(q)}`);
      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: "Could not map that domain." }));
        throw new Error(e.error || "Could not map that domain.");
      }
      setData((await res.json()) as PlaygroundResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run(domain);
  }, [domain, run]);

  const submit = (q: string) => {
    const v = q.trim();
    if (!v) return;
    setInput(v);
    setDomain(v);
  };

  return (
    <div className="public-shell">
      <div className="wrap">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <Link href="/" className="brand">
            <Logo size={21} />
            shipscout
          </Link>
          <div style={{ display: "flex", gap: 12 }}>
            <a className="btn btn-ghost" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <Link className="btn btn-white" href="/app">
              Launch ShipScout
            </Link>
          </div>
        </div>

        <div className="mono-label" style={{ marginBottom: 14 }}>
          Playground
        </div>
        <h1 className="disp" style={{ fontSize: "clamp(30px,5vw,52px)", marginBottom: 18 }}>
          Map the top engineers in a domain
        </h1>

        <div className="url-box" style={{ maxWidth: 620 }}>
          <input
            value={input}
            placeholder="rust async runtimes"
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit(input);
              }
            }}
          />
          <button className="tn" onClick={() => submit(input)}>
            Map domain
          </button>
        </div>

        <div className="chips" style={{ justifyContent: "flex-start", marginTop: 16 }}>
          {DOMAIN_CHIPS.map((c) => (
            <span key={c} className="chip" onClick={() => submit(c)}>
              {c}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 36 }}>
          {loading && <div style={{ color: "var(--faint)", fontSize: 13 }}>Mapping the domain...</div>}
          {error && <div style={{ color: "var(--faint)", fontSize: 13 }}>{error}</div>}
          {!loading && !error && data && (
            <>
              <div className="mono-label" style={{ marginBottom: 18 }}>
                {data.count} top contributors for {data.domain}
              </div>
              {data.skills.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 22 }}>
                  {data.skills.map((s) => (
                    <span key={s} className="lang-tag" style={{ fontSize: 12 }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="dom-list">
                {data.developers.map((d) => (
                  <Link key={d.login} href={`/u/${d.login}`} className="dom-row">
                    <span className="dom-rank">{d.rank}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: "var(--text)" }}>
                        {d.name} <span style={{ color: "var(--faint)", fontSize: 12 }}>@{d.login}</span>
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 4, lineHeight: 1.5 }}>
                        {d.blurb}
                      </div>
                    </div>
                    <span style={{ color: "var(--faint)", fontSize: 11.5, whiteSpace: "nowrap" }}>
                      {d.insights.ext}+ ext PRs
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
