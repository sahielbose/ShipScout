// The client-side api seam (CONTEXT.md section 1.1). The UI talks ONLY to this
// object, exactly like the prototype. Each method calls a real route handler.
// Swapping these from mock to real is the whole backend build; the UI never
// changes. No em dashes, no emojis.

import type {
  Candidate,
  ChatMessageDTO,
  OutreachDraft,
  SearchFilters,
  SearchResponse,
  ShortlistCandidate,
} from "@/lib/types";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Something went wrong." }));
    throw new Error(data.error || "Request failed.");
  }
  return (await res.json()) as T;
}

export const api = {
  async detectSkills(query: string): Promise<string[]> {
    const data = await postJson<{ skills: string[] }>("/api/skills/detect", { query });
    return data.skills;
  },

  async search(
    query: string,
    filters: SearchFilters,
    skills?: string[]
  ): Promise<SearchResponse> {
    return postJson<SearchResponse>("/api/search", { query, filters, skills });
  },

  async getProfile(login: string): Promise<Candidate | null> {
    const res = await fetch(`/api/developers/${encodeURIComponent(login)}`);
    if (!res.ok) return null;
    return (await res.json()) as Candidate;
  },

  async draftOutreach(candidate: Candidate, query: string, step: number): Promise<OutreachDraft> {
    return postJson<OutreachDraft>("/api/outreach", { candidate, query, sequenceStep: step });
  },

  // Streams the assistant reply token by token via onToken, and resolves with
  // the full text. Falls back gracefully on any network error.
  async chat(
    history: ChatMessageDTO[],
    query: string,
    shortlist: ShortlistCandidate[],
    onToken?: (text: string) => void
  ): Promise<string> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, messages: history, shortlist }),
    });
    if (!res.ok || !res.body) {
      throw new Error("Chat is unavailable right now.");
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onToken?.(full);
    }
    return full;
  },
};
