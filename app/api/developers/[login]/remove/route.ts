import { removeDeveloper } from "@/lib/engine/developers";
import { ok, fail, readJson } from "@/lib/http";

// POST /api/developers/[login]/remove -> delist a developer (CONTEXT.md section
// 18). Gated behind an explicit confirm flag; never removes on a bare request.
export async function POST(req: Request, { params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  if (!login) return fail("No developer login provided.", 400);
  const body = await readJson<{ confirm?: boolean }>(req);
  if (!body?.confirm) {
    return fail("Set confirm to true to remove this developer's data.", 400);
  }
  try {
    const result = await removeDeveloper(login);
    return ok({
      login,
      ...result,
      message: result.removed
        ? `@${login} has been delisted and their ingested data removed.`
        : `No stored data for @${login} (nothing to remove).`,
    });
  } catch {
    return fail("We could not process that removal. Try again shortly.", 500);
  }
}
