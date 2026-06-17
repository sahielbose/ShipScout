"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/Logo";
import { useAppStore } from "@/lib/store/useAppStore";
import { GITHUB_URL } from "@/lib/constants";
import { exportCsv } from "@/components/app/csv";
import {
  IconPlus,
  IconClock,
  IconBookmark,
  IconUpload,
  IconGitHub,
  IconHelp,
  IconExit,
} from "@/components/app/Icons";

// The left icon rail (CONTEXT.md section 3.2): new search, history, shortlist,
// export, github, help, exit to site.
export function AppSidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const view = useAppStore((s) => s.view);
  const query = useAppStore((s) => s.query);
  const newSearch = useAppStore((s) => s.newSearch);
  const setView = useAppStore((s) => s.setView);
  const toast = useAppStore((s) => s.toast);

  return (
    <aside className="aside">
      <Logo size={26} className="logo" />
      <button
        className={`ab ${view === "search" ? "on" : ""}`}
        title="New search"
        aria-label="New search"
        onClick={() => newSearch()}
      >
        <IconPlus />
      </button>
      <button
        className={`ab ${view === "results" ? "on" : ""}`}
        title="History"
        aria-label="History"
        onClick={() => setView("search")}
      >
        <IconClock />
      </button>
      <button
        className={`ab ${view === "actions" ? "on" : ""}`}
        title="Shortlist"
        aria-label="Shortlist"
        onClick={() => (query ? setView("actions") : toast("Run a search to build a shortlist"))}
      >
        <IconBookmark />
      </button>
      <button
        className="ab"
        title="Export"
        aria-label="Export CSV"
        onClick={() => (query ? exportCsv() : toast("Run a search first"))}
      >
        <IconUpload />
      </button>
      <button
        className="ab"
        title="GitHub"
        aria-label="GitHub repository"
        onClick={() => window.open(GITHUB_URL, "_blank", "noopener")}
      >
        <IconGitHub />
      </button>
      <button className="ab" title="Help" aria-label="Help" onClick={() => toast("Describe a capability in plain English, then refine with filters and chips.")}>
        <IconHelp />
      </button>
      <div className="spacer" />
      <button
        className="ab"
        title={session ? "Sign out" : "Exit to site"}
        aria-label={session ? "Sign out" : "Exit to site"}
        onClick={() => (session ? signOut({ callbackUrl: "/" }) : router.push("/"))}
      >
        <IconExit />
      </button>
    </aside>
  );
}
