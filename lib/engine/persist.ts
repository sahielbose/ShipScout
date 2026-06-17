// Optional persistence of searches and chat (CONTEXT.md sections 6 and 8). When
// a database is configured, searches and chat turns are stored so history and
// the search-to-chat linkage survive. A no-op without a database, so the seeded
// path stays zero-setup.

import { Prisma } from "@prisma/client";
import { prisma, hasDatabase } from "@/lib/db";
import type { SearchFilters } from "@/lib/types";

function json(v: unknown): Prisma.InputJsonValue {
  return v as Prisma.InputJsonValue;
}

// Returns the persisted Search id, or null when there is no database.
export async function persistSearch(input: {
  query: string;
  detectedSkills: string[];
  filters: SearchFilters;
  userId?: string;
}): Promise<string | null> {
  if (!hasDatabase()) return null;
  try {
    const search = await prisma.search.create({
      data: {
        query: input.query,
        detectedSkills: json(input.detectedSkills),
        filtersJson: json(input.filters),
        userId: input.userId ?? null,
      },
    });
    return search.id;
  } catch {
    return null;
  }
}

export async function persistChatMessage(
  searchId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  if (!hasDatabase() || !searchId || !content) return;
  try {
    // Only persist when the searchId is a real stored Search.
    const exists = await prisma.search.findUnique({ where: { id: searchId }, select: { id: true } });
    if (!exists) return;
    await prisma.chatMessage.create({ data: { searchId, role, content } });
  } catch {
    // best effort: chat still works without persistence
  }
}
