// Marketing footer. App goes to /app, About anchors to #bip, GitHub opens the
// repo. The mark uses the muted footer fill from the prototype.
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GITHUB_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer>
      <div className="foot-l">
        <Logo size={18} fill="#cfcfd4" />
        ShipScout
      </div>
      <div className="foot-links">
        <Link href="/app">App</Link>
        <a href="#bip">About</a>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="6" cy="6" r="2.4" />
            <circle cx="6" cy="18" r="2.4" />
            <circle cx="18" cy="8" r="2.4" />
            <path d="M6 8.4v7.2M8.4 6h5.2a3 3 0 0 1 3 3v.6M18 10.4c0 4-3.5 4.6-6 5.2" />
          </svg>
          GitHub
        </a>
      </div>
      <div>(c) 2026 ShipScout</div>
    </footer>
  );
}
