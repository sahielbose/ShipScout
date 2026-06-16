import { detectCapabilities } from "@/lib/engine/detect";
import { ok, fail, readJson } from "@/lib/http";

// POST /api/skills/detect -> { query } returns { skills: string[] }
export async function POST(req: Request) {
  const body = await readJson<{ query?: string }>(req);
  const query = body?.query?.trim();
  if (!query) return fail("Enter a capability to detect skills for.", 400);
  try {
    const skills = await detectCapabilities(query);
    return ok({ skills });
  } catch {
    return fail("We could not detect skills for that query. Try rephrasing it.", 500);
  }
}
