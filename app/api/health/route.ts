import { ok } from "@/lib/http";
import { activeSources } from "@/lib/engine/capabilities";

export const dynamic = "force-dynamic";

// GET /api/health: reports which engine sources are live. Useful as a deploy
// smoke check (CONTEXT.md section 14).
export async function GET() {
  return ok({
    status: "ok",
    sources: activeSources(),
    time: new Date().toISOString(),
  });
}
