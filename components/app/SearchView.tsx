"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Logo } from "@/components/Logo";
import { useAppStore } from "@/lib/store/useAppStore";
import { SUGGESTION_CHIPS } from "@/lib/constants";
import { IconArrowRight } from "@/components/app/Icons";

// Capability search home (CONTEXT.md section 3.3): textarea (enter to submit,
// shift+enter for newline), suggestion chips, and search history.
export function SearchView() {
  const [value, setValue] = useState("");
  const submitSearch = useAppStore((s) => s.submitSearch);
  const history = useAppStore((s) => s.history);
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = (q: string) => {
    if (!q.trim()) return;
    submitSearch(q);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(value);
    }
  };

  return (
    <div className="view on">
      <div className="search-home">
        <Logo size={50} className="sl" />
        <div className="tg">Find engineers and scientists shaping your domain</div>
        <div className="search-area">
          <div className="search-wrap">
            <textarea
              ref={ref}
              className="search-input"
              placeholder="Who are you looking for?"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
            />
            <button className="search-send" aria-label="Search" onClick={() => submit(value)}>
              <IconArrowRight width={18} height={18} />
            </button>
          </div>
          <div className="chips">
            {SUGGESTION_CHIPS.map((c) => (
              <span
                key={c}
                className="chip"
                onClick={() => {
                  setValue(c);
                  submit(c);
                }}
              >
                {c}
              </span>
            ))}
          </div>
          {history.length > 0 && (
            <div className="hist">
              recent:{" "}
              {history.map((q) => (
                <span key={q} className="hitem" onClick={() => submit(q)}>
                  {q}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
