import { draftOutreach } from "@/lib/engine/outreach";
import { getProfile } from "@/lib/engine/profile";
import { ok, fail, readJson } from "@/lib/http";
import type { Candidate } from "@/lib/types";

// POST /api/outreach -> { developerId | candidate, query, sequenceStep }
// returns { subject, body, sequenceStep }. Draft only, never sends.
export async function POST(req: Request) {
  const body = await readJson<{
    developerId?: string;
    candidate?: Candidate;
    query?: string;
    sequenceStep?: number;
  }>(req);

  const query = body?.query?.trim();
  if (!query) return fail("A search query is needed to ground the outreach.", 400);

  let candidate = body?.candidate ?? null;
  if (!candidate && body?.developerId) {
    candidate = await getProfile(body.developerId);
  }
  if (!candidate) {
    return fail("Provide a candidate to draft outreach for.", 400);
  }

  try {
    const draft = await draftOutreach(candidate, query, body?.sequenceStep ?? 1);
    return ok(draft);
  } catch {
    return fail("We could not draft that message. Try again in a moment.", 500);
  }
}
