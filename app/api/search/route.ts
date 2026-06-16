import { runSearch } from "@/lib/engine/search";
import { ok, fail, readJson } from "@/lib/http";
import type { SearchFilters } from "@/lib/types";

// POST /api/search -> { query, filters } returns
// { searchId, detectedSkills, candidates, count, funnel, repos }
export async function POST(req: Request) {
  const body = await readJson<{
    query?: string;
    filters?: Partial<SearchFilters>;
    skills?: string[];
  }>(req);
  const query = body?.query?.trim();
  if (!query) {
    return fail("Describe who you are looking for to run a search.", 400);
  }
  const filters: SearchFilters = {
    seniority: body?.filters?.seniority ?? "Any",
    location: body?.filters?.location ?? "",
    repos: body?.filters?.repos ?? [],
  };
  const skillsOverride = Array.isArray(body?.skills) ? body?.skills : undefined;
  try {
    const res = await runSearch(query, filters, skillsOverride);
    return ok({ ...res, count: res.funnel.match });
  } catch {
    return fail("The search engine hit a snag. Try again in a moment.", 500);
  }
}
