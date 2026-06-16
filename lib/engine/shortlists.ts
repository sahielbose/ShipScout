// Shortlist persistence (CONTEXT.md sections 3.8 and 8). With a database and a
// signed-in user, shortlists persist per user (scoped to their org when set).
// Without a database, the client store (localStorage) is the source of truth and
// these helpers return a stable synthetic id so the UI flow still works.

import { randomUUID } from "node:crypto";
import { prisma, hasDatabase } from "@/lib/db";

export interface ShortlistResult {
  id: string;
  name: string;
  logins: string[];
  persisted: boolean;
}

function canPersist(userId?: string): userId is string {
  return Boolean(hasDatabase() && userId);
}

export async function createOrUpdateShortlist(input: {
  id?: string;
  name: string;
  logins: string[];
  userId?: string;
}): Promise<ShortlistResult> {
  if (!canPersist(input.userId)) {
    return { id: input.id || randomUUID(), name: input.name, logins: input.logins, persisted: false };
  }

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  const orgId = user?.orgId ?? null;

  // Reuse the named shortlist for this user, or the one identified by id.
  let shortlist =
    (input.id ? await prisma.shortlist.findUnique({ where: { id: input.id } }) : null) ??
    (await prisma.shortlist.findFirst({ where: { userId: input.userId, name: input.name } }));

  if (!shortlist) {
    shortlist = await prisma.shortlist.create({
      data: { name: input.name, userId: input.userId, orgId },
    });
  }

  // Replace items with the provided logins (developerId holds the login).
  await prisma.shortlistItem.deleteMany({ where: { shortlistId: shortlist.id } });
  if (input.logins.length) {
    await prisma.shortlistItem.createMany({
      data: input.logins.map((login) => ({ shortlistId: shortlist!.id, developerId: login })),
    });
  }

  return { id: shortlist.id, name: shortlist.name, logins: input.logins, persisted: true };
}

export async function setShortlistItem(
  shortlistId: string,
  login: string,
  action: "add" | "remove",
  userId?: string
): Promise<{ id: string; login: string; action: string; persisted: boolean }> {
  if (!canPersist(userId)) {
    return { id: shortlistId, login, action, persisted: false };
  }
  const shortlist = await prisma.shortlist.findUnique({ where: { id: shortlistId } });
  if (!shortlist || shortlist.userId !== userId) {
    return { id: shortlistId, login, action, persisted: false };
  }
  if (action === "remove") {
    await prisma.shortlistItem.deleteMany({ where: { shortlistId, developerId: login } });
  } else {
    const existing = await prisma.shortlistItem.findFirst({ where: { shortlistId, developerId: login } });
    if (!existing) await prisma.shortlistItem.create({ data: { shortlistId, developerId: login } });
  }
  return { id: shortlistId, login, action, persisted: true };
}
