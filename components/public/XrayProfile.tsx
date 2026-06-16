"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ProfileContent } from "@/components/app/ProfileContent";
import { GITHUB_URL } from "@/lib/constants";
import type { Candidate } from "@/lib/types";

// Public X-ray profile (CONTEXT.md section 3.11). Reuses the profile components
// in a public, no-login layout, with a CTA back into the app.
export function XrayProfile({ candidate }: { candidate: Candidate }) {
  const share = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).catch(() => {});
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
          Public capability X-ray
        </div>

        <div className="xray-card">
          <ProfileContent
            c={candidate}
            onPdf={() => window.print()}
            onShare={share}
            onGithub={() => window.open(`https://github.com/${candidate.login}`, "_blank", "noopener")}
          />
        </div>

        <div className="cta-final" style={{ paddingTop: 60 }}>
          <h2>Scout more engineers like this</h2>
          <p>
            This profile was built from public open-source activity. Search by capability to find
            others already shipping in this domain.
          </p>
          <div className="row">
            <Link className="btn btn-blue" href="/app">
              Open ShipScout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
