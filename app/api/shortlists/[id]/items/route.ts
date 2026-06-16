import { ok, fail, readJson } from "@/lib/http";
import { setShortlistItem } from "@/lib/engine/shortlists";

// POST /api/shortlists/[id]/items -> add or remove an item (CONTEXT.md section 8).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await readJson<{ login?: string; action?: "add" | "remove" }>(req);
  const login = body?.login?.trim();
  if (!login) return fail("A developer login is required.", 400);
  try {
    const result = await setShortlistItem(id, login, body?.action ?? "add");
    return ok(result);
  } catch {
    return fail("We could not update that shortlist item. Try again shortly.", 500);
  }
}
