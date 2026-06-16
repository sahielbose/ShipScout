"use client";

import type { Candidate } from "@/lib/types";
import { IconDownload, IconExternal, IconShare } from "@/components/app/Icons";

// The evidence-based profile body (CONTEXT.md section 3.7). Presentational and
// reusable by the workspace drawer and the public X-ray page.
export function ProfileContent({
  c,
  onPdf,
  onShare,
  onGithub,
}: {
  c: Candidate;
  onPdf?: () => void;
  onShare?: () => void;
  onGithub?: () => void;
}) {
  const ins = c.insights;
  return (
    <div className="pf-pad">
      <div className="pf-top">
        <div className="pf-av">
          {c.avatarUrl ? <img src={c.avatarUrl} alt={c.name} /> : c.initials}
        </div>
        <div style={{ flex: 1 }}>
          <div className="pf-name">
            {c.name}
            {onGithub && (
              <span className="ic" role="button" aria-label="Open on GitHub" onClick={onGithub}>
                <IconExternal />
              </span>
            )}
            {onShare && (
              <span className="ic" role="button" aria-label="Copy profile link" onClick={onShare}>
                <IconShare />
              </span>
            )}
          </div>
          <div className="pf-at">
            @{c.login} - {c.loc}
          </div>
          <div className="pf-bio">{c.blurb}</div>
        </div>
        {onPdf && (
          <button className="pf-pdf" onClick={onPdf}>
            <IconDownload /> Download PDF
          </button>
        )}
      </div>

      <div className="pf-stats">
        <div>
          <div className="v">{ins.repos}</div>
          <div className="k">Repos</div>
        </div>
        <div>
          <div className="v">{ins.followers}</div>
          <div className="k">Followers</div>
        </div>
        <div>
          <div className="v">{ins.ext}+</div>
          <div className="k">Ext PRs</div>
        </div>
      </div>

      <div className="pf-box">
        <div className="bl">About</div>
        <p>{c.about}</p>
      </div>

      <div className="pf-sep">Insights</div>
      <div className="pf-ins">
        <div>
          <div className="ins-h">This year</div>
          <div className="ins-stat">
            <span className="num">{ins.commits}</span>
            <span className="lb">Commits</span>
          </div>
          <div className="ins-stat">
            <span className="num">{ins.prs}</span>
            <span className="lb">PRs</span>
          </div>
          <div className="ins-stat">
            <span className="num">{ins.issues}</span>
            <span className="lb">Issues</span>
          </div>
          <div className="ins-stat">
            <span className="num">{ins.reviews}</span>
            <span className="lb">Reviews</span>
          </div>
          <div className="ins-h" style={{ marginTop: 18 }}>
            Most active in
          </div>
          {ins.active.map((a, i) => (
            <div className="act-bar" key={a.name + i}>
              <span className="ab-name">{a.name}</span>
              <span className="ab-track">
                <i style={{ width: Math.min(100, a.val * 2) + "%" }} />
              </span>
              <span className="ab-v">{a.val}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="ins-h">Projects</div>
          {ins.projects.map((p, i) => (
            <div className="proj-row" key={p.name + i}>
              <span>{p.name}</span>
              <span className="pr-r">
                {p.lang} star {p.stars}
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className="ins-h">In public repos</div>
          <div>
            {ins.langs.map((l) => (
              <span className="lang-tag" key={l}>
                {l}
              </span>
            ))}
          </div>
          <div className="ins-h" style={{ marginTop: 18 }}>
            Signal
          </div>
          <div className="sig">
            <span className="sv">{ins.ext}+</span>
            <span className="sl">External PRs merged</span>
          </div>
          <div className="ins-h" style={{ marginTop: 18 }}>
            Languages
          </div>
          <div className="lang-bar">
            {ins.bar.map((b, i) => (
              <i key={b.lang + i} style={{ width: b.pct + "%", background: b.color }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
