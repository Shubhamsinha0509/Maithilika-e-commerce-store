# Claude Code Project Instructions

## Project

Maithilika: an online store for hand-painted Mithila art, selling across
India. The plan, scope and status are in `docs/plan.md`. Read it first.

**Keep it simple.** Build just enough for a working store: browse, cart,
checkout, Razorpay payment, admin order handling. Anything in the plan's
"Later" list stays out unless asked for. Prefer fewer files, tables and
dependencies.

## Design

`Design/` holds the approved design as design-tool documents (`*.dc.html`)
plus the product catalogue (`sarees.js`). It is a read-only reference, not
importable code. Rebuild its look faithfully in the Next.js app: colours,
fonts (Yatra One + Mukta), spacing, borders and layout at desktop and
390px widths. Pages the design lacks (checkout, admin, policy pages) reuse
its existing styles. Do not edit `Design/`.

## Stack

Next.js 16 App Router + TypeScript, Tailwind 4, Prisma 7 + PostgreSQL on
Neon, Zod for input validation, Razorpay. Server Components by default;
Client Components only where interactivity needs them.

## Rules that matter

- Recalculate prices and totals on the server from the database. Never
  trust prices, stock or payment status sent by the browser.
- Create Razorpay orders on the server. Mark an order paid only after
  verifying the signature (checkout callback) or the webhook signature.
  Both paths must be safe to run twice for the same payment.
- Validate all form input on the server with Zod.
- Check the admin session on the server for every admin page and action.
- Never commit secrets or `.env`. Never expose secret keys to the browser.
- Do not invent business rules (shipping fee, return window, tax). Use the
  placeholders in the plan and ask.
- Do not pretend an external call succeeded.

## Before finishing a task

Run `npm run lint`, `npm run typecheck` and `npm run build`, and fix what
you broke. Tick the item in `docs/plan.md`. If something could not be
checked, say so.
