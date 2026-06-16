import { requestSync } from "@/lib/engine/developers";
import { ok, fail } from "@/lib/http";

// POST /api/developers/[login]/sync -> enqueue ingestion and enrichment (Phase 3).
export async function POST(_req: Request, { params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  if (!login) return fail("No developer login provided.", 400);
  try {
    const result = await requestSync(login);
    return ok({
      login,
      ...result,
      message: result.queued
        ? `Refreshing @${login} from GitHub now.`
        : `Live ingestion is not configured. @${login} is served from the seeded dataset.`,
    });
  } catch {
    return fail("We could not queue that sync. Try again shortly.", 500);
  }
}
