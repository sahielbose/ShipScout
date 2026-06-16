import { getProfile } from "@/lib/engine/profile";
import { ok, fail } from "@/lib/http";

// GET /api/developers/[login] returns the full profile (stats, about, insights).
// Triggers on-demand ingestion when missing or stale (Phase 3).
export async function GET(_req: Request, { params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  if (!login) return fail("No developer login provided.", 400);
  try {
    const profile = await getProfile(login);
    if (!profile) {
      return fail(`We could not find a public profile for @${login}.`, 404);
    }
    return ok(profile);
  } catch {
    return fail("We could not load that profile right now. Try again shortly.", 500);
  }
}
