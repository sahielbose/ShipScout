"use client";

// Fixed marketing nav. Brand scrolls to top, demo/login go to /app, Resources
// anchors to #bip, GitHub opens the repo in a new tab. The `scrolled` class is
// toggled on once the page is scrolled past 40px.
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { GITHUB_URL } from "@/lib/constants";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
      <button
        type="button"
        className="brand"
        id="brandTop"
        onClick={scrollToTop}
        aria-label="ShipScout, back to top"
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          color: "inherit",
          font: "inherit",
        }}
      >
        <Logo size={26} />
        shipscout
      </button>
      <div className="nav-links">
        <Link href="/app">Book a demo</Link>
        <span className="sep">/</span>
        <a href="#bip">Resources</a>
        <span className="sep">/</span>
        <a
          className="gh"
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
          </svg>
          GitHub
        </a>
        <span className="sep">/</span>
        <Link className="login" href="/app">
          Login
        </Link>
      </div>
      <Link className="menu-btn" href="/app">
        Menu
      </Link>
    </nav>
  );
}
