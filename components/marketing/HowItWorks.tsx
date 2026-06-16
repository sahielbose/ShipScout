// Three-step "how it works" section. Each row is a Reveal that scrolls into
// view; the middle row uses the flipped layout. Copy matches the prototype.
import { Reveal } from "./Reveal";

export function HowItWorks() {
  return (
    <section className="how">
      <div className="wrap">
        <Reveal className="how-row">
          <div className="txt">
            <div className="num">01</div>
            <h3>Search by capability</h3>
            <p>
              Describe the expertise you need in plain language. ShipScout uses
              it to find people already building in your domain, then shows the
              exact skills it detected.
            </p>
          </div>
          <div className="mock">
            <div className="mock-bar">
              <span className="dots">
                <i />
                <i />
                <i />
              </span>{" "}
              shipscout / search
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
              <div className="mono-label" style={{ margin: "20px 0 11px" }}>
                Detected skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
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
              </div>
              <div
                style={{
                  textAlign: "right",
                  marginTop: 22,
                  color: "var(--muted)",
                }}
              >
                <b style={{ color: "var(--text)", fontWeight: 700 }}>805</b>{" "}
                candidates
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="how-row flip">
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
                    <span className="nm">Sarah Chen</span>
                    <span className="star on">starred</span>
                  </div>
                  <div className="at">@sarahchen</div>
                  <div className="bl">
                    tokio core contributor, async runtime internals and
                    lock-free data structures.
                  </div>
                  <div className="meta">Senior - Rust / Systems</div>
                </div>
                <div className="cand">
                  <div className="top">
                    <span className="nm">Marcus Rivera</span>
                    <span className="star">shortlist</span>
                  </div>
                  <div className="at">@mrivera</div>
                  <div className="bl">
                    Custom allocator specialist, zero-copy I/O and
                    high-performance networking.
                  </div>
                  <div className="meta">Senior - Rust / Infra</div>
                </div>
              </div>
            </div>
          </div>
          <div className="txt">
            <div className="num">02</div>
            <h3>Filter and shortlist</h3>
            <p>
              Narrow results by seniority, location and specific repositories.
              Every profile is built from real code, so you see what they have
              shipped, not what they claim.
            </p>
          </div>
        </Reveal>

        <Reveal className="how-row">
          <div className="txt">
            <div className="num">03</div>
            <h3>Personalize your outreach</h3>
            <p>
              Generate tailored emails that reference each candidate&apos;s
              specific contributions. No generic templates, every message shows
              you did your homework.
            </p>
          </div>
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
                <span className="hl">tokio runtime internals</span>. Your work on{" "}
                <span className="hl">lock-free concurrent data structures</span>{" "}
                is exactly the depth we need.
                <br />
                <br />
                Best,
                <br />
                Alex from Northwind
              </div>
              <span className="seq-pill">Personalized sequence 1 / 3</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
