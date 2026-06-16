// Closing call to action. "Launch ShipScout" opens the app, "Star on GitHub"
// opens the repo. The large SHIPSCOUT watermark sits behind the footer seam.
import Link from "next/link";
import { GITHUB_URL } from "@/lib/constants";
import { Reveal } from "./Reveal";

export function FinalCta() {
  return (
    <section className="cta-final">
      <div className="wrap">
        <Reveal>
          <h2>Discover great engineers</h2>
        </Reveal>
        <Reveal delay="d1">
          <p>
            Join talent teams uncovering the hidden engineering talent already
            shipping in your domain.
          </p>
        </Reveal>
        <Reveal className="row" delay="d2">
          <Link className="btn btn-blue" href="/app">
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
        </Reveal>
        <Reveal className="watermark" delay="d3">
          SHIPSCOUT
        </Reveal>
      </div>
    </section>
  );
}
