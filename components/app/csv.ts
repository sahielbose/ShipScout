// Client-side CSV export of the current filtered list (CONTEXT.md section 3.5).
// Mirrors the prototype: builds a valid CSV and downloads it with no round trip.
import { useAppStore } from "@/lib/store/useAppStore";
import { slug } from "@/lib/utils";

export function exportCsv() {
  const s = useAppStore.getState();
  const list = s.filtered();
  const rows: string[][] = [["login", "name", "location", "seniority", "skills", "repos"]];
  for (const c of list) {
    rows.push([c.login, c.name, c.loc, c.seniority, c.skills.join(" | "), c.tags.join(" | ")]);
  }
  const csv = rows
    .map((r) => r.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shipscout-" + slug(s.query || "candidates") + ".csv";
  a.click();
  URL.revokeObjectURL(url);
  s.toast("Exported " + list.length + " candidates");
}
