import { seededSearchData } from "@/lib/seed/dataset";
import { applyFilters } from "@/lib/engine/filter";
import { slug } from "@/lib/utils";
import { fail } from "@/lib/http";
import type { SearchFilters } from "@/lib/types";

// GET /api/export?query=...&seniority=...&location=...&repos=a,b returns a CSV of
// the current results (CONTEXT.md section 8). Regenerated from the seeded set so
// the link is shareable and stateless.
function csvCell(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").trim();
  if (!query) return fail("A query is needed to export results.", 400);

  const filters: SearchFilters = {
    seniority: (searchParams.get("seniority") as SearchFilters["seniority"]) || "Any",
    location: searchParams.get("location") || "",
    repos: (searchParams.get("repos") || "").split(",").map((s) => s.trim()).filter(Boolean),
  };

  const { candidates } = seededSearchData(query);
  const list = applyFilters(candidates, filters);

  const rows: string[][] = [["login", "name", "location", "seniority", "skills", "repos"]];
  for (const c of list) {
    rows.push([c.login, c.name, c.loc, c.seniority, c.skills.join(" | "), c.tags.join(" | ")]);
  }
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shipscout-${slug(query || "candidates")}.csv"`,
    },
  });
}
