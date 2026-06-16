"use client";

import { useAppStore } from "@/lib/store/useAppStore";
import { titleCase } from "@/lib/utils";
import { IconChevronLeft, IconArrowRight } from "@/components/app/Icons";

// The top bar (CONTEXT.md section 3.2): back action, active query title, and
// context actions (jump to Actions from results).
export function TopBar() {
  const view = useAppStore((s) => s.view);
  const query = useAppStore((s) => s.query);
  const setView = useAppStore((s) => s.setView);

  const showBack = view !== "search";
  const backLabel = view === "actions" ? "Candidates" : "Home";
  const onBack = () => (view === "actions" ? setView("results") : setView("search"));

  let title = "";
  if (view === "results") title = titleCase(query);
  else if (view === "actions") title = titleCase(query) + " search";

  return (
    <div className="topbar">
      <button className="back" style={{ visibility: showBack ? "visible" : "hidden" }} onClick={onBack}>
        <IconChevronLeft width={15} height={15} /> <span>{backLabel}</span>
      </button>
      <span className="ttl">{title}</span>
      <span className="ra">
        {view === "results" && (
          <button className="tb" onClick={() => setView("actions")}>
            Actions <IconArrowRight width={13} height={13} />
          </button>
        )}
      </span>
    </div>
  );
}
