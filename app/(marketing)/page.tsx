// Placeholder landing. Replaced by the full marketing site in Phase 1.
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function MarketingPage() {
  return (
    <main className="hero">
      <Logo size={40} />
      <h1 className="disp" style={{ marginTop: 24, fontSize: 56 }}>
        ShipScout
      </h1>
      <p className="sub">Find elite engineers by what they ship.</p>
      <div className="hero-cta">
        <Link className="btn btn-white" href="/app">
          Launch ShipScout
        </Link>
      </div>
    </main>
  );
}
