"use client";

// "See it in action" carousel. Four mock app screens auto-advance every 4600ms,
// pause on hover, and manual Back/Next/dots restart the timer. Funnel bars in the
// filter slide animate to their data-w widths whenever that slide becomes active.
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

const SLIDE_COUNT = 4;
const INTERVAL = 4600;

const captions = [
  "Describe the role you are hiring for in plain English",
  "ShipScout turns a sentence into the exact capabilities to match on",
  "Narrow by seniority, location and the repos that prove the skill",
  "Every message references what they actually shipped",
];

export function DemoCarousel() {
  const [idx, setIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % SLIDE_COUNT);
    }, INTERVAL);
  }, []);

  const go = useCallback(
    (i: number) => {
      setIdx((i + SLIDE_COUNT) % SLIDE_COUNT);
      restart();
    },
    [restart],
  );

  useEffect(() => {
    restart();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restart]);

  // Animate funnel bars to their data-w widths on the active slide; reset others
  // to 0 so re-entering the slide re-runs the width transition.
  useEffect(() => {
    const root = carouselRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(".slide").forEach((slide, k) => {
      const active = k === idx;
      slide.querySelectorAll<HTMLElement>("[data-w]").forEach((bar) => {
        bar.style.width = active ? `${bar.dataset.w}%` : "0";
      });
    });
  }, [idx]);

  const pause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <section className="demo">
      <div className="wrap">
        <Reveal>
          <div className="mono-label eyebrow">See it in action</div>
        </Reveal>
        <Reveal delay="d1">
          <h2 className="disp">Your next hire, start to finish</h2>
        </Reveal>

        <Reveal className="carousel" delay="d2">
          <div ref={carouselRef} onMouseEnter={pause} onMouseLeave={restart}>
            <div className="slides">
              {/* Slide 1: search */}
              <div className={`slide${idx === 0 ? " active" : ""}`}>
                <div className="mock">
                  <div className="mock-bar">
                    <span className="dots">
                      <i />
                      <i />
                      <i />
                    </span>{" "}
                    shipscout / search
                  </div>
                  <div className="m-flex">
                    <div className="m-side">
                      <svg className="ico" viewBox="0 0 100 125">
                        <g fill="#cfcfd4">
                          <rect x="22" y="25" width="14" height="14" rx="3" />
                          <rect x="40" y="25" width="14" height="14" rx="3" />
                          <rect x="58" y="25" width="14" height="14" rx="3" />
                          <rect x="22" y="43" width="14" height="14" rx="3" />
                          <rect x="22" y="61" width="14" height="14" rx="3" />
                          <rect x="40" y="61" width="14" height="14" rx="3" />
                          <rect x="58" y="61" width="14" height="14" rx="3" />
                          <rect x="58" y="79" width="14" height="14" rx="3" />
                          <rect x="22" y="97" width="14" height="14" rx="3" />
                          <rect x="40" y="97" width="14" height="14" rx="3" />
                        </g>
                      </svg>
                      <span className="plus">+</span>
                      <svg
                        className="ico"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      <svg
                        className="ico"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M6 4h12v16l-6-4-6 4z" />
                      </svg>
                      <svg
                        className="ico"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    </div>
                    <div className="m-main">
                      <div className="s-center">
                        <svg
                          className="s-logo"
                          width="46"
                          height="58"
                          viewBox="0 0 100 125"
                        >
                          <g fill="#cfcfd4">
                            <rect x="22" y="25" width="14" height="14" rx="3" />
                            <rect x="40" y="25" width="14" height="14" rx="3" />
                            <rect x="58" y="25" width="14" height="14" rx="3" />
                            <rect x="22" y="43" width="14" height="14" rx="3" />
                            <rect x="22" y="61" width="14" height="14" rx="3" />
                            <rect x="40" y="61" width="14" height="14" rx="3" />
                            <rect x="58" y="61" width="14" height="14" rx="3" />
                            <rect x="58" y="79" width="14" height="14" rx="3" />
                            <rect x="22" y="97" width="14" height="14" rx="3" />
                            <rect x="40" y="97" width="14" height="14" rx="3" />
                          </g>
                          <rect
                            x="58"
                            y="97"
                            width="14"
                            height="14"
                            rx="3"
                            fill="#4f8bff"
                          />
                        </svg>
                        <div className="s-tag">
                          Find engineers and scientists shaping your domain
                        </div>
                        <div className="s-box">
                          <span className="ph">
                            Who are you looking for?
                            <span className="cursor" />
                          </span>
                          <div className="hint">
                            enter to search, shift + enter for new line
                          </div>
                          <span className="arrow">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.7"
                            >
                              <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                          </span>
                        </div>
                        <div className="chips">
                          <span className="chip">Cryptography specialists</span>
                          <span className="chip">
                            Quantum computing researchers
                          </span>
                          <span className="chip">
                            Database query optimizer experts
                          </span>
                          <span className="chip">
                            Low-latency trading engineers
                          </span>
                          <span className="chip">
                            Compiler frontend developers
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="car-cap">{captions[0]}</div>
              </div>

              {/* Slide 2: capability / detected skills */}
              <div className={`slide${idx === 1 ? " active" : ""}`}>
                <div className="mock">
                  <div className="mock-bar">
                    <span className="dots">
                      <i />
                      <i />
                      <i />
                    </span>{" "}
                    shipscout / capability
                  </div>
                  <div className="mock-body">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        border: "1px solid var(--line-2)",
                        borderRadius: 11,
                        padding: "13px 15px",
                        color: "var(--text)",
                        fontSize: 14,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--faint)"
                        strokeWidth="1.6"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M21 21l-4-4" />
                      </svg>{" "}
                      Senior Rust Systems Engineer
                    </div>
                    <div className="mono-label" style={{ margin: "22px 0 12px" }}>
                      Detected skills
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: 9 }}
                    >
                      <span className="skill">
                        unsafe Rust abstractions <span className="x">x</span>
                      </span>
                      <span className="skill">
                        custom allocators <span className="x">x</span>
                      </span>
                      <span className="skill">
                        lock-free concurrency <span className="x">x</span>
                      </span>
                      <span className="skill">
                        tokio runtime internals <span className="x">x</span>
                      </span>
                      <span className="skill">
                        zero-copy I/O <span className="x">x</span>
                      </span>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        marginTop: 24,
                        color: "var(--muted)",
                        fontSize: 14,
                      }}
                    >
                      <b style={{ color: "var(--text)", fontWeight: 700 }}>
                        805
                      </b>{" "}
                      candidates
                    </div>
                  </div>
                </div>
                <div className="car-cap">{captions[1]}</div>
              </div>

              {/* Slide 3: filter */}
              <div className={`slide${idx === 2 ? " active" : ""}`}>
                <div className="mock">
                  <div className="mock-bar">
                    <span className="dots">
                      <i />
                      <i />
                      <i />
                    </span>{" "}
                    shipscout / filter
                  </div>
                  <div className="mock-body fm">
                    <div className="fm-side">
                      <div className="lab">Seniority</div>
                      <div className="toggle">
                        <b>Junior</b>
                        <b>Mid</b>
                        <b className="on">Senior</b>
                      </div>
                      <div className="lab">Location</div>
                      <div className="repo-chip">United States</div>
                      <div className="lab">Repository</div>
                      <div className="repo-chip">tokio-rs/tokio</div>
                      <div className="repo-chip">rust-lang/rust</div>
                      <div className="funnel">
                        <div className="frow">
                          <span>Total</span>
                          <span>1,530</span>
                        </div>
                        <div className="bar">
                          <i data-w="100" />
                        </div>
                        <div className="frow">
                          <span>Location</span>
                          <span>936</span>
                        </div>
                        <div className="bar">
                          <i data-w="61" />
                        </div>
                        <div className="frow">
                          <span>Match</span>
                          <span>805</span>
                        </div>
                        <div className="bar">
                          <i data-w="53" />
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="cand">
                        <div className="top">
                          <span>
                            <span className="nm">Sarah Chen</span>
                          </span>
                          <span className="star on">starred</span>
                        </div>
                        <div className="at">@sarahchen</div>
                        <div className="bl">
                          Senior systems engineer, tokio core contributor with
                          2400+ commits, expert in async runtime internals.
                        </div>
                        <div className="meta">
                          Senior - Rust / Systems | San Francisco, CA
                        </div>
                      </div>
                      <div className="cand">
                        <div className="top">
                          <span>
                            <span className="nm">Marcus Rivera</span>
                          </span>
                          <span className="star">shortlist</span>
                        </div>
                        <div className="at">@mrivera</div>
                        <div className="bl">
                          Infrastructure engineer, custom allocator specialist
                          with deep experience in zero-copy I/O.
                        </div>
                        <div className="meta">Senior - Rust / Infra | Austin, TX</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="car-cap">{captions[2]}</div>
              </div>

              {/* Slide 4: outreach */}
              <div className={`slide${idx === 3 ? " active" : ""}`}>
                <div className="mock">
                  <div className="mock-bar">
                    <span className="dots">
                      <i />
                      <i />
                      <i />
                    </span>{" "}
                    shipscout / outreach
                  </div>
                  <div className="mock-body email">
                    <div className="erow">
                      <b>To</b> Sarah Chen
                    </div>
                    <div className="erow">
                      <b>Subject</b>{" "}
                      <span style={{ color: "var(--text)" }}>
                        Your tokio runtime work caught our eye
                      </span>
                    </div>
                    <div className="ebody">
                      Hi Sarah,
                      <br />
                      <br />I came across your{" "}
                      <span className="hl">
                        custom allocator for arena-based memory pools
                      </span>{" "}
                      and your contributions to{" "}
                      <span className="hl">tokio runtime internals</span>. Your
                      work on{" "}
                      <span className="hl">
                        lock-free concurrent data structures
                      </span>{" "}
                      is exactly the low-level systems depth we need.
                      <br />
                      <br />
                      We are rebuilding our distributed storage engine in Rust and
                      want someone who can push safe zero-copy I/O and async
                      performance. Open to a chat?
                      <br />
                      <br />
                      Best,
                      <br />
                      Alex from Northwind
                    </div>
                    <span className="seq-pill">Personalized sequence 1 / 3</span>
                  </div>
                </div>
                <div className="car-cap">{captions[3]}</div>
              </div>
            </div>

            <div className="car-nav">
              <button type="button" onClick={() => go(idx - 1)}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>{" "}
                Back
              </button>
              <span className="car-dots">
                {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                  <i
                    key={i}
                    className={i === idx ? "on" : undefined}
                    onClick={() => go(i)}
                  />
                ))}
              </span>
              <button type="button" onClick={() => go(idx + 1)}>
                Next{" "}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
