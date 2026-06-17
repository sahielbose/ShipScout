import { claudeStream } from "@/lib/ai/claude";
import { chatSystem } from "@/lib/ai/prompts";
import { seededChat } from "@/lib/seed/dataset";
import { persistChatMessage } from "@/lib/engine/persist";
import type { ChatMessageDTO, ShortlistCandidate } from "@/lib/types";

// POST /api/chat -> { query, messages, shortlist } streams assistant tokens.
// Scoped to the current search and shortlist (CONTEXT.md section 7.7). Falls
// back to a useful canned response if the model is unavailable.
export async function POST(req: Request) {
  let body: {
    query?: string;
    messages?: ChatMessageDTO[];
    shortlist?: ShortlistCandidate[];
    searchId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Send a JSON body with your message.", { status: 400 });
  }

  const query = (body.query || "").trim();
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const shortlist = Array.isArray(body.shortlist) ? body.shortlist : [];
  const searchId = body.searchId || "";
  const last = messages[messages.length - 1];
  const fallback = seededChat(last?.content || "", query, shortlist);

  // Persist the latest user turn (best effort, only when a DB is configured).
  if (searchId && last?.role === "user") {
    void persistChatMessage(searchId, "user", last.content);
  }

  const shortlistText = shortlist.length
    ? shortlist.map((c) => c.name).join(", ")
    : "empty";
  const system = chatSystem(query, shortlistText);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        for await (const token of claudeStream(
          system,
          messages.map((m) => ({ role: m.role, content: m.content })),
          fallback
        )) {
          full += token;
          controller.enqueue(encoder.encode(token));
        }
      } catch {
        full = fallback;
        controller.enqueue(encoder.encode(fallback));
      } finally {
        if (searchId && full) void persistChatMessage(searchId, "assistant", full);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
