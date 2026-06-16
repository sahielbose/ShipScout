import type { Metadata } from "next";
import Link from "next/link";
import { getProfile } from "@/lib/engine/profile";
import { XrayProfile } from "@/components/public/XrayProfile";
import { Logo } from "@/components/Logo";

// Public X-ray route (CONTEXT.md section 3.11): any valid public GitHub username
// produces an evidence-based capability profile. Shareable and indexable. When a
// database is configured, missing developers are ingested on demand by the
// engine; the seeded path resolves any login instantly.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ login: string }>;
}): Promise<Metadata> {
  const { login } = await params;
  const clean = decodeURIComponent(login).replace(/^@/, "");
  return {
    title: `${clean} on ShipScout - capability X-ray`,
    description: `An evidence-based capability profile for @${clean}, built from public open-source activity.`,
  };
}

export default async function XrayPage({ params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  const clean = decodeURIComponent(login).replace(/^@/, "").trim();
  const candidate = await getProfile(clean);

  if (!candidate) {
    return (
      <div className="public-shell">
        <div className="wrap" style={{ textAlign: "center" }}>
          <Logo size={44} />
          <h1 className="disp" style={{ fontSize: 34, margin: "24px 0 12px" }}>
            No profile for @{clean}
          </h1>
          <p className="sub" style={{ margin: "0 auto 28px" }}>
            We could not find a public GitHub profile for that username. Check the spelling, or
            explore the workspace.
          </p>
          <Link className="btn btn-white" href="/app">
            Open ShipScout
          </Link>
        </div>
      </div>
    );
  }

  return <XrayProfile candidate={candidate} />;
}
