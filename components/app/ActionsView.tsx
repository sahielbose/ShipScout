"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useAppStore, type ChatItem, type EmailPayload } from "@/lib/store/useAppStore";
import { IconArrowUp, IconRefine, IconMail, IconSequence, IconCopy } from "@/components/app/Icons";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Escape, convert newlines to <br>, then highlight referenced capabilities.
function highlightHtml(body: string, skills: string[]): string {
  let html = escapeHtml(body).replace(/\n/g, "<br>");
  for (const sk of skills) {
    if (!sk) continue;
    const re = new RegExp(sk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    html = html.replace(re, (m) => `<span class="hl">${m}</span>`);
  }
  return html;
}

function nl2brNodes(content: string) {
  return content.split("\n").map((line, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {line}
    </span>
  ));
}

function EmailBubble({ email }: { email: EmailPayload }) {
  const toast = useAppStore((s) => s.toast);
  const plain = email.subject + "\n\n" + email.body;
  return (
    <div className="bubble">
      <div className="bub-av ai">S</div>
      <div className="bub-body">
        Drafted for <b>{email.candidateName}</b> (@{email.candidateLogin}):
        <div className="em-card">
          <div className="em-h">
            Subject &nbsp;<b>{email.subject}</b>
          </div>
          <div dangerouslySetInnerHTML={{ __html: highlightHtml(email.body, email.skills) }} />
          <div className="em-actions">
            <button
              className="em-btn"
              onClick={() => {
                if (navigator.clipboard?.writeText) navigator.clipboard.writeText(plain).catch(() => {});
                toast("Draft copied");
              }}
            >
              <IconCopy /> Copy draft
            </button>
            <button
              className="em-btn"
              onClick={() => {
                window.location.href =
                  "mailto:?subject=" +
                  encodeURIComponent(email.subject) +
                  "&body=" +
                  encodeURIComponent(email.body);
              }}
            >
              <IconMail /> Open in email
            </button>
          </div>
          <div className="em-note">
            Drafts only. Sending connects to email behind an explicit confirm step.
          </div>
          <span className="seq-pill" style={{ marginTop: 12 }}>
            Personalized sequence {email.step} / 3
          </span>
        </div>
      </div>
    </div>
  );
}

function Bubble({ item }: { item: ChatItem }) {
  if (item.email) return <EmailBubble email={item.email} />;
  return (
    <div className={`bubble ${item.role === "user" ? "user" : ""}`}>
      <div className={`bub-av ${item.role === "user" ? "me" : "ai"}`}>{item.role === "user" ? "You" : "S"}</div>
      <div className="bub-body">
        {item.typing ? (
          <span className="typing">
            <i />
            <i />
            <i />
          </span>
        ) : (
          nl2brNodes(item.content)
        )}
      </div>
    </div>
  );
}

// Actions and chat (CONTEXT.md sections 3.9 and 3.10) plus the shortlist sidebar.
export function ActionsView() {
  const chat = useAppStore((s) => s.chat);
  const sendChat = useAppStore((s) => s.sendChat);
  const runAction = useAppStore((s) => s.runAction);
  const shortlist = useAppStore((s) => s.shortlistCandidates());
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat]);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    setValue("");
    void sendChat(v);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="view on">
      <div className="act-layout">
        <div className="act-main">
          <div className="act-scroll" ref={scrollRef}>
            {chat.length === 0 ? (
              <div className="act-hello">
                <h3>What would you like to do?</h3>
                <div className="act-cards">
                  <button className="act-card" onClick={() => runAction("refine")}>
                    <IconRefine className="ci" />
                    <div className="ct">Refine shortlist</div>
                    <div className="cd">Narrow down candidates based on your criteria</div>
                  </button>
                  <button className="act-card" onClick={() => runAction("draft")}>
                    <IconMail className="ci" />
                    <div className="ct">Draft outreach</div>
                    <div className="cd">Write personalized emails for shortlisted candidates</div>
                  </button>
                  <button className="act-card" onClick={() => runAction("sequence")}>
                    <IconSequence className="ci" />
                    <div className="ct">Email sequence</div>
                    <div className="cd">Create a 3-step outreach sequence per candidate</div>
                  </button>
                </div>
              </div>
            ) : (
              chat.map((item, i) => <Bubble key={i} item={item} />)
            )}
          </div>
          <div className="msg-bar">
            <div className="msg-wrap">
              <textarea
                className="msg-input"
                placeholder="Message ShipScout"
                spellCheck={false}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKey}
              />
              <button className="msg-send" aria-label="Send" onClick={submit}>
                <IconArrowUp width={16} height={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="act-side">
          <div className="sl">Shortlist - {shortlist.length}</div>
          <div>
            {shortlist.length === 0 ? (
              <div className="sl-empty">
                Star candidates in the results view and they will appear here, ready for outreach.
              </div>
            ) : (
              shortlist.map((c) => {
                const parts = c.name.split(" ");
                return (
                  <div className="sl-item" key={c.login}>
                    <div className="sl-av">{c.initials}</div>
                    <div>
                      <div className="nm">
                        {parts[0]} {(parts[1] || "")[0] || ""}. <span className="badge-s">shortlisted</span>
                      </div>
                      <div className="at">{c.login}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
