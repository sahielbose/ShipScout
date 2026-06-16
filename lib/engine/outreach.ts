// Outreach drafting (CONTEXT.md sections 3.9 and 7.6). Claude writes a short,
// evidence-grounded subject and body referencing two or three of the candidate's
// specific capabilities and repos. Falls back to a deterministic template when
// no model key is set. Draft only: nothing is ever sent here.

import type { Candidate, OutreachDraft } from "@/lib/types";
import { claudeJSON } from "@/lib/ai/claude";
import { OUTREACH_SYSTEM, outreachUser } from "@/lib/ai/prompts";
import { seededOutreach } from "@/lib/seed/dataset";

export async function draftOutreach(
  candidate: Candidate,
  query: string,
  step: number
): Promise<OutreachDraft> {
  const safeStep = step >= 1 && step <= 3 ? step : 1;
  const fallback = seededOutreach(candidate, query, safeStep);

  const result = await claudeJSON<{ subject: string; body: string }>(
    OUTREACH_SYSTEM,
    outreachUser({
      login: candidate.login,
      name: candidate.name,
      seniority: candidate.seniority,
      location: candidate.loc,
      capabilities: candidate.skills,
      repos: candidate.tags,
      query,
      step: safeStep,
    }),
    { subject: fallback.subject, body: fallback.body },
    600
  );

  if (!result || typeof result.subject !== "string" || typeof result.body !== "string") {
    return fallback;
  }
  return { subject: result.subject, body: result.body, sequenceStep: safeStep };
}
