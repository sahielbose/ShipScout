// Embedding and indexing (CONTEXT.md section 7.4): embed each capability's
// evidence text and the profile summary with Voyage, then upsert the vectors
// into the pgvector columns added by the raw migration. A no-op without a
// database or a Voyage key.

import { prisma, hasDatabase } from "@/lib/db";
import { embed, isVoyageAvailable } from "@/lib/ai/embed";

export function toVectorLiteral(v: number[]): string {
  return "[" + v.join(",") + "]";
}

export async function embedAndIndex(developerId: string): Promise<{ indexed: number }> {
  if (!hasDatabase() || !isVoyageAvailable()) return { indexed: 0 };

  const profile = await prisma.developerProfile.findUnique({ where: { developerId } });
  const capabilities = await prisma.capability.findMany({ where: { developerId } });

  const texts: string[] = [];
  const targets: { kind: "profile" | "cap"; id: string }[] = [];

  if (profile?.summary) {
    texts.push(profile.summary);
    targets.push({ kind: "profile", id: profile.id });
  }
  for (const c of capabilities) {
    const ev = Array.isArray(c.evidenceJson) ? (c.evidenceJson as string[]) : [];
    texts.push(`${c.label}. ${ev.join(" ")}`.trim());
    targets.push({ kind: "cap", id: c.id });
  }
  if (!texts.length) return { indexed: 0 };

  const vectors = await embed(texts, "document");
  if (!vectors) return { indexed: 0 };

  let indexed = 0;
  for (let i = 0; i < targets.length && i < vectors.length; i++) {
    const lit = toVectorLiteral(vectors[i]);
    const t = targets[i];
    if (t.kind === "profile") {
      await prisma.$executeRawUnsafe(
        'UPDATE "DeveloperProfile" SET "profileEmbedding" = $1::vector WHERE id = $2',
        lit,
        t.id
      );
    } else {
      await prisma.$executeRawUnsafe(
        'UPDATE "Capability" SET embedding = $1::vector WHERE id = $2',
        lit,
        t.id
      );
    }
    indexed++;
  }
  return { indexed };
}
