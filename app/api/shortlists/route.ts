import { ok, fail, readJson } from "@/lib/http";
import { createOrUpdateShortlist } from "@/lib/engine/shortlists";
import { auth } from "@/lib/auth";

// POST /api/shortlists -> create or update a shortlist (CONTEXT.md section 8).
// Persists per signed-in user when a database is configured; otherwise the
// client store holds it. Returns a stable id either way.
export async function POST(req: Request) {
  const body = await readJson<{ id?: string; name?: string; logins?: string[] }>(req);
  if (!body) return fail("Send a JSON body to save a shortlist.", 400);
  const session = await auth();
  try {
    const result = await createOrUpdateShortlist({
      id: body.id,
      name: body.name?.trim() || "Shortlist",
      logins: Array.isArray(body.logins) ? body.logins : [],
      userId: session?.user?.id,
    });
    return ok(result);
  } catch {
    return fail("We could not save that shortlist. Try again shortly.", 500);
  }
}
