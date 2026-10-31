# Maithilika

Online store for hand-painted Mithila (Madhubani) art: clothing, paintings,
home decor and accessories, sold across India.

**Plan and status:** [`docs/plan.md`](docs/plan.md)

## Stack

Next.js 16 (App Router, TypeScript), Tailwind 4, PostgreSQL on Neon via
Prisma 7, Razorpay for payments. Hosted on Vercel.

## Folders

```text
src/            the app
prisma/         database schema and migrations
scripts/        seed.mjs (loads products), check-db.mjs (tests the DB connection)
public/images/  web-optimised product and page images
Design/         the approved design, read-only reference (not app code)
docs/plan.md    what we're building and what's left
```

## Setup

Requires Node 22.

```bash
npm install
cp .env.example .env   # fill in the values; see comments in the file
npm run db:check       # confirms both database URLs work
npm run db:deploy      # creates the tables
npm run db:seed        # loads the 44 products from Design/sarees.js
npm run dev            # http://localhost:3000
```

Checks: `npm run lint`, `npm run typecheck`, `npm run build`.

`Design/` is excluded from lint and type checks. It is reference material
written for a design tool, not part of the app.
