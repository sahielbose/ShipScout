// Capability detection (CONTEXT.md section 7.5 step 1). Claude extracts the 5
// capability phrases that become the chips and the retrieval anchors. Falls back
// to the deterministic lexical detector when no model key is set.

import { claudeJSON } from "@/lib/ai/claude";
import { DETECT_SYSTEM, detectUser } from "@/lib/ai/prompts";
import { seededDetect } from "@/lib/seed/dataset";

export async function detectCapabilities(query: string): Promise<string[]> {
  const fallback = seededDetect(query);
  const skills = await claudeJSON<string[]>(DETECT_SYSTEM, detectUser(query), fallback, 400);
  // Defensive: ensure we always return a clean array of short strings.
  if (!Array.isArray(skills) || skills.length === 0) return fallback;
  return skills
    .filter((s) => typeof s === "string" && s.trim().length > 0)
    .map((s) => s.trim().toLowerCase())
    .slice(0, 6);
}
