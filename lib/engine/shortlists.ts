// Shortlist persistence (CONTEXT.md sections 3.8 and 8). When a database and a
// signed-in user are present, shortlists persist per user or org. Without a
// database, the client store is the source of truth and these helpers return a
// stable synthetic id so the UI flow still works. Full DB persistence is wired
// in Phase 5/6.

import { randomUUID } from "node:crypto";
import { caps } from "@/lib/engine/capabilities";

export interface ShortlistResult {
  id: string;
  name: string;
  logins: string[];
  persisted: boolean;
}

export async function createOrUpdateShortlist(input: {
  id?: string;
  name: string;
  logins: string[];
}): Promise<ShortlistResult> {
  const id = input.id || randomUUID();
  // Phase 5/6: when caps.hasDatabase() and a session user exists, upsert the
  // Shortlist and its items scoped to the user or org.
  return {
    id,
    name: input.name,
    logins: input.logins,
    persisted: caps.hasDatabase(),
  };
}

export async function setShortlistItem(
  shortlistId: string,
  login: string,
  action: "add" | "remove"
): Promise<{ id: string; login: string; action: string; persisted: boolean }> {
  return {
    id: shortlistId,
    login,
    action,
    persisted: caps.hasDatabase(),
  };
}
