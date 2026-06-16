"use client";

// github.com/ username input. Enter or Inspect routes to the public X-ray page
// at /u/<username>. Empty or whitespace-only input is ignored.
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileExplorer() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const inspect = () => {
    const username = value.trim();
    if (!username) return;
    router.push(`/u/${username}`);
  };

  return (
    <div className="url-box">
      <span className="u">github.com/</span>
      <input
        id="xrayInput"
        placeholder="github_username"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") inspect();
        }}
      />
      <button className="tn" id="xrayBtn" type="button" onClick={inspect}>
        Inspect
      </button>
    </div>
  );
}
