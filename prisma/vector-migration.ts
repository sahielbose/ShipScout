// Applies prisma/migrations/vector.sql to add the pgvector columns and indexes.
// Usage: npm run db:vector  (after db:migrate or db:push). Safe to re-run.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set. Nothing to migrate. ShipScout runs on seeded data without a database.");
    return;
  }
  const prisma = new PrismaClient();
  const sql = readFileSync(join(process.cwd(), "prisma/migrations/vector.sql"), "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt);
    console.log("ok: " + stmt.split("\n")[0].slice(0, 70));
  }
  await prisma.$disconnect();
  console.log("Vector columns and indexes are in place.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
