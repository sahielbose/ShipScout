// Claude wrapper (CONTEXT.md sections 5 and 10). Uses the Anthropic SDK with
// the current model string. Every structured call parses JSON defensively
// (strip code fences, then JSON.parse, then fall back). No em dashes, no emojis.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

let _client: Anthropic | null = null;

export function isAnthropicAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function client(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

// Strip markdown code fences the model sometimes wraps JSON in.
function stripFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  return t.trim();
}

export async function claudeText(
  system: string,
  user: string,
  maxTokens = 1024
): Promise<string> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

// Returns parsed JSON of type T, or the fallback if the model is unavailable or
// the output cannot be parsed.
export async function claudeJSON<T>(
  system: string,
  user: string,
  fallback: T,
  maxTokens = 1500
): Promise<T> {
  if (!isAnthropicAvailable()) return fallback;
  try {
    const raw = await claudeText(system, user, maxTokens);
    const cleaned = stripFences(raw);
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

// Streaming text generator for the chat route. Yields text deltas. Falls back
// to yielding the provided fallback string if the model is unavailable.
export async function* claudeStream(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  fallback: string,
  maxTokens = 800
): AsyncGenerator<string> {
  if (!isAnthropicAvailable()) {
    yield fallback;
    return;
  }
  try {
    const stream = client().messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  } catch {
    yield fallback;
  }
}
