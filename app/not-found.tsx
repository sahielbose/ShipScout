import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="public-shell">
      <div className="wrap" style={{ textAlign: "center" }}>
        <Logo size={44} />
        <h1 className="disp" style={{ fontSize: 40, margin: "24px 0 12px" }}>
          Page not found
        </h1>
        <p className="sub" style={{ margin: "0 auto 28px" }}>
          That page does not exist. Head back to the landing page or open the workspace.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn-white" href="/">
            Home
          </Link>
          <Link className="btn btn-ghost" href="/app">
            Launch ShipScout
          </Link>
        </div>
      </div>
    </main>
  );
}
