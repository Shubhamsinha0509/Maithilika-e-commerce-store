import { z } from "zod";

/**
 * Server environment validation.
 *
 * Fails loudly at startup rather than surfacing as a confusing runtime error
 * three layers deep. Import this from any module that reads a secret.
 *
 * Server-only: this must never be imported from a Client Component, or the
 * values land in the browser bundle.
 */
const serverSchema = z.object({
  /** Pooled Neon connection (host contains `-pooler`). Runtime queries. */
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .startsWith("postgres", "DATABASE_URL must be a postgres:// connection string"),

  /** Direct Neon connection (no `-pooler`). Migrations only. */
  DIRECT_URL: z
    .string()
    .min(1, "DIRECT_URL is required")
    .startsWith("postgres", "DIRECT_URL must be a postgres:// connection string"),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /**
   * Razorpay. Optional: until both keys are set, checkout shows
   * "Checkout opens soon" instead of taking payment.
   */
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  /** Resend. Optional: until it is set, the site sends no emails. */
  RESEND_API_KEY: z.string().optional(),

  /** Google sign-in. Optional: until all three are set, customers can't sign in. */
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CUSTOMER_SESSION_SECRET: z.string().optional(),

  /** Admin login. Optional: until both are set, /admin cannot be signed into. */
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_SESSION_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

/**
 * Parses and caches the server environment.
 *
 * Deliberately a function rather than a top-level parse: a module-level throw
 * would break `next build`, which imports modules without a populated .env.
 * Call it where the values are actually used.
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid server environment:\n${problems}\n\n` +
        `Copy .env.example to .env and fill it in. See README.md.`,
    );
  }

  cached = parsed.data;
  return cached;
}
