#!/usr/bin/env node
/**
 * Verifies both Neon connection strings.
 *
 * Run after scripts/setup-neon.sh, or any time the database seems unreachable:
 *   node scripts/check-db.mjs
 *
 * Checks each URL separately, because they fail in different ways: the app can
 * work fine while migrations hang, or the reverse, if the two are swapped.
 */
import "dotenv/config";
import pg from "pg";

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

/** Redacts the password so a connection string can be printed safely. */
function safeHost(url) {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`;
  } catch {
    return "(unparseable URL)";
  }
}

async function check(label, url, { expectPooler }) {
  if (!url) {
    console.log(`${RED}✗ ${label}${RESET} not set in .env`);
    return false;
  }

  const pooled = safeHost(url).includes("-pooler");
  if (pooled !== expectPooler) {
    console.log(
      `${YELLOW}! ${label}${RESET} looks like the wrong string — ` +
        `expected ${expectPooler ? "a pooled" : "a direct"} connection ` +
        `(host ${expectPooler ? "should" : "should not"} contain "-pooler"), ` +
        `got ${safeHost(url)}`,
    );
  }

  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    const { rows } = await client.query("select version()");
    const version = rows[0].version.split(" ").slice(0, 2).join(" ");
    console.log(`${GREEN}✓ ${label}${RESET} ${version} ${DIM}${safeHost(url)}${RESET}`);
    return true;
  } catch (error) {
    console.log(`${RED}✗ ${label}${RESET} ${error.message}`);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

const results = [
  await check("DATABASE_URL (pooled, runtime)", process.env.DATABASE_URL, {
    expectPooler: true,
  }),
  await check("DIRECT_URL  (direct, migrations)", process.env.DIRECT_URL, {
    expectPooler: false,
  }),
];

if (results.every(Boolean)) {
  console.log(`\n${GREEN}Both connections work.${RESET}`);
  process.exit(0);
}

console.log(`\n${RED}Database check failed.${RESET} See .env.example for what each URL should be.`);
process.exit(1);
