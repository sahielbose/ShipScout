"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { AppSidebar } from "@/components/app/AppSidebar";
import { TopBar } from "@/components/app/TopBar";
import { SearchView } from "@/components/app/SearchView";
import { ResultsView } from "@/components/app/ResultsView";
import { ActionsView } from "@/components/app/ActionsView";
import { Toast } from "@/components/app/Toast";

// The single-page workspace shell (CONTEXT.md section 3.2). View switching is
// instant and state survives navigation within the app.
export function Workspace() {
  const view = useAppStore((s) => s.view);
  return (
    <div className="app-shell">
      <AppSidebar />
      <div className="main">
        <TopBar />
        <div className="content">
          {view === "search" && <SearchView />}
          {view === "results" && <ResultsView />}
          {view === "actions" && <ActionsView />}
        </div>
      </div>
      <Toast />
    </div>
  );
}
