import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { serverEnv } from "@/env";

/**
 * Prisma client singleton.
 *
 * Uses the POOLED connection (DATABASE_URL). Migrations use the direct one —
 * see the note in prisma7.config.ts for why the two are split.
 *
 * Each PrismaClient opens its own connection pool, and Next dev hot-reload
 * re-evaluates modules on every edit, so a plain module-level `new
 * PrismaClient()` leaks a pool per reload until Postgres refuses connections.
 * Caching on globalThis survives reload; production gets a fresh process
 * anyway, so the global is development-only.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: serverEnv().DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
