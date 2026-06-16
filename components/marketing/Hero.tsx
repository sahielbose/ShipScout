// Hero section. Badge and "Star on GitHub" open the repo; "Launch ShipScout"
// goes to the app. Copy is the prototype's original marketing copy.
import Link from "next/link";
import { GITHUB_URL } from "@/lib/constants";
import { Reveal } from "./Reveal";
import { TrustRow } from "./TrustRow";

export function Hero() {
  return (
    <section className="hero">
      <Reveal style={{ width: "100%" }}>
        <a
          className="badge"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
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
          </svg>{" "}
          <b>Open source</b> on GitHub
        </a>
      </Reveal>

      <Reveal delay="d1" style={{ width: "100%" }}>
        <h1>
          <span className="l1">Find elite engineers</span>
          <span className="l2">hidden in open source</span>
        </h1>
      </Reveal>

      <Reveal delay="d2" style={{ width: "100%" }}>
        <p className="sub">
          ShipScout reads real work, not resumes, to surface the engineers and
          scientists already shaping your domain.
        </p>
      </Reveal>

      <Reveal delay="d3" style={{ width: "100%" }}>
        <div className="hero-cta">
          <Link className="btn btn-white" href="/app">
            Launch ShipScout
          </Link>
          <a
            className="btn btn-ghost"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M12 17.3l-5.4 3 1-6-4.3-4.2 6-.9L12 4l2.7 5.2 6 .9-4.3 4.2 1 6z" />
            </svg>{" "}
            Star on GitHub
          </a>
        </div>
      </Reveal>

      <Reveal delay="d4" style={{ width: "100%" }}>
        <div className="trust">
          <span className="mono-label">Trusted by</span>
          <TrustRow />
        </div>
      </Reveal>

      <Reveal delay="d5" style={{ width: "100%" }}>
        <div className="explore">
          explore
          <svg
            className="chev"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </Reveal>
    </section>
  );
}
