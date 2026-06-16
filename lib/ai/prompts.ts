// Prompt templates (CONTEXT.md section 10). Always instruct the model to return
// strict JSON where structure is needed; callers parse defensively. No em
// dashes, no emojis in any generated copy.

export const DETECT_SYSTEM =
  "You map hiring queries to precise engineering capabilities. Output only valid JSON.";

export function detectUser(query: string): string {
  return `A recruiter is hiring for: "${query}".
List the 5 most specific, concrete technical capabilities to match engineers on.
Return a JSON array of short strings (each 2 to 4 words, lowercase, no trailing punctuation). Output only the JSON array.`;
}

export const ENRICH_SYSTEM =
  "You convert a developer's public GitHub work into a structured, evidence-based skill profile. Output only valid JSON. Never invent facts; ground every capability in the provided data.";

export function enrichUser(data: unknown): string {
  return `Here is a developer's public data as JSON:
${JSON.stringify(data, null, 2)}

Return JSON with this exact shape:
{
  "capabilities": [{ "label": "short phrase", "domain": "short domain", "confidence": 0.0, "evidence": ["repo or PR refs"] }],
  "seniority": "Junior | Mid | Senior",
  "seniorityReason": "one line, factual",
  "summary": "2 to 4 factual sentences for a recruiter, no hype",
  "languages": [{ "lang": "name", "pct": 0 }],
  "signals": { "externalPrsMerged": 0 }
}
Produce 5 to 15 capabilities. Output only the JSON object.`;
}

export const OUTREACH_SYSTEM =
  "You write short, specific recruiting outreach that references a candidate's real open-source work. Warm, direct, under 110 words. No em dashes, no emojis. Output only valid JSON.";

export function outreachUser(args: {
  login: string;
  name: string;
  seniority: string;
  location: string;
  capabilities: string[];
  repos: string[];
  query: string;
  step: number;
}): string {
  return `Candidate @${args.login} (${args.name}), ${args.seniority}, ${args.location}.
Known for: ${args.capabilities.join(", ")}.
Repos: ${args.repos.join(", ")}.
Hiring for: "${args.query}". Sequence step ${args.step} of 3.
Return JSON: { "subject": "...", "body": "..." } with \\n for line breaks. Reference 2 to 3 specific capabilities. Output only the JSON object.`;
}

export function chatSystem(query: string, shortlist: string): string {
  return `You are ShipScout's hiring copilot. The recruiter is sourcing for: "${query}".
Current shortlist: ${shortlist || "empty"}.
Be concise, concrete, and practical. Plain text, no markdown headings, no em dashes, no emojis.
You can refine filters, compare candidates, and draft outreach.`;
}
