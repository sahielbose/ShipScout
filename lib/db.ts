import { PrismaClient } from "@prisma/client";

// Single Prisma instance, reused across hot reloads in dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const hasDatabase = (): boolean => Boolean(process.env.DATABASE_URL);

// Lazily construct so importing this module never throws when DATABASE_URL is
// unset. The seeded data path (lib/seed) never touches the database.
function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? (hasDatabase() ? createClient() : (undefined as unknown as PrismaClient));

if (process.env.NODE_ENV !== "production" && hasDatabase()) {
  globalForPrisma.prisma = prisma;
}
