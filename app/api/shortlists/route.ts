import { ok, fail, readJson } from "@/lib/http";
import { createOrUpdateShortlist } from "@/lib/engine/shortlists";

// POST /api/shortlists -> create or update a shortlist (CONTEXT.md section 8).
// Without a database, shortlists live in the client store; this still returns a
// stable id so the UI flow works.
export async function POST(req: Request) {
  const body = await readJson<{ id?: string; name?: string; logins?: string[] }>(req);
  if (!body) return fail("Send a JSON body to save a shortlist.", 400);
  try {
    const result = await createOrUpdateShortlist({
      id: body.id,
      name: body.name?.trim() || "Shortlist",
      logins: Array.isArray(body.logins) ? body.logins : [],
    });
    return ok(result);
  } catch {
    return fail("We could not save that shortlist. Try again shortly.", 500);
  }
}
