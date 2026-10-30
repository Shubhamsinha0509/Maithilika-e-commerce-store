import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration — migrations, introspection, studio.
 *
 * `datasource.url` is deliberately DIRECT_URL, not DATABASE_URL.
 *
 * Neon serves two connection strings: a pooled one (host contains
 * `-pooler`) and a direct one. Schema changes must not run through the
 * pooler — PgBouncer in transaction mode cannot hold the session state DDL
 * needs, so migrations hang or fail in ways that look like network faults.
 *
 * The runtime client is the mirror image: it uses the POOLED url, because
 * serverless functions open far more connections than Postgres will accept
 * directly. That wiring lives in src/lib/prisma.ts.
 *
 * Prisma 6 expressed this as `directUrl` inside the schema's datasource
 * block. In Prisma 7 that field does not exist — `@prisma/config@7.10.1`
 * types `datasource` as `{ url?, shadowDatabaseUrl? }` only. Prisma's own
 * v7 docs still show `directUrl` here; they are wrong for this release, and
 * adding it is a TypeScript error. Verified 2026-10-31.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env, not Prisma's env() helper: env() throws when the variable
    // is unset, which breaks `prisma generate` — a command that needs no
    // database at all. Commands that do need it fail clearly on their own.
    url: process.env["DIRECT_URL"],
  },
});
