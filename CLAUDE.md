# Claude Code Project Instructions

## Project

Build a production-ready e-commerce application for a client selling
products online to customers across India.

An approved frontend **design** exists in `Design/`, as read-only Claude
design-canvas documents. It is a specification, not code: there is no
application yet. The primary engineering goal is to build that design as a
Next.js application and connect it to reliable functionality while
preserving its visual appearance exactly.

`Design/` is frozen — read from it, never write to it. See
`Design/CLAUDE.md`.

## Start-of-task workflow

1.  Inspect the repository before changing files.
2.  Read `README.md` and the relevant files in `docs/`.
3.  Check the current implementation and installed dependencies before
    proposing replacements.
4.  Work on one small, reviewable task at a time.
5.  Before implementation, state the task, files likely to change,
    assumptions, and acceptance criteria.
6.  Do not begin the next task until the current task has been tested
    and its status reported.

## Non-negotiable rules

-   Preserve the existing UI, responsive behavior, assets, typography,
    spacing, and styling unless explicitly asked to change them.
-   Do not replace working code or dependencies without a clear reason.
-   Do not invent business rules. Ask when a decision affects payments,
    shipping, tax, refunds, inventory, customer accounts, or order
    lifecycle.
-   Do not implement fake integrations or pretend external API calls
    succeeded.
-   Never commit secrets, API keys, credentials, or customer data.
-   Never trust prices, discounts, inventory quantities, shipping fees,
    roles, or payment status supplied by the browser.
-   Validate all untrusted input on the server.
-   Enforce authorization on the server for every privileged operation.
-   Use database transactions for operations that must succeed or fail
    together.
-   Make payment and webhook processing idempotent.
-   Avoid logging sensitive personal, payment, or authentication data.
-   Prefer simple, maintainable solutions over unnecessary abstractions.

## Technical direction

The intended stack is documented in `docs/architecture.md`. First
inspect the existing repository and confirm compatibility before adding
or changing dependencies.

Preferred direction, subject to audit: - Next.js App Router and
TypeScript - PostgreSQL, hosted on Neon - Prisma ORM if no suitable ORM
is already in place - Zod for input validation - Razorpay for online
payments - Shiprocket for shipping, subject to the client's account and
business requirements - Cloudinary or suitable object storage for
product media - Sentry for error monitoring, if appropriate

Use Server Components by default. Use Client Components only where
browser interactivity requires them. Use Route Handlers or Server
Actions according to the use case and current Next.js conventions.

## E-commerce correctness

-   Recalculate totals on the server from trusted product and pricing
    records.
-   Recheck product status and stock at checkout.
-   Prevent overselling using appropriate transactional or
    concurrency-safe inventory updates.
-   Store immutable order-item snapshots (name, SKU/variant, unit price,
    quantity, and relevant tax/discount values) at purchase time.
-   Create payment orders on the server and verify Razorpay signatures
    server-side.
-   Treat verified webhooks as an important payment reconciliation
    mechanism.
-   Do not mark an order paid based only on a client-side callback.
-   Do not expose secret keys in client bundles.
-   Define and test idempotency behavior for payment callbacks and
    webhooks.
-   Clearly distinguish order status, payment status, and shipment
    status.
-   COD availability, shipping charges, delivery promises, taxes,
    cancellation, returns, and refunds must follow approved business
    rules.

## Quality gates

For each task: 1. Run relevant tests. 2. Run lint and type checks where
configured. 3. Build the application at appropriate milestones. 4. Fix
introduced errors before moving on. 5. Add or update tests for critical
business logic. 6. Update `docs/roadmap.md` and relevant documentation.

Do not claim a task is complete unless its acceptance criteria have been
checked. If a test cannot be run, state why.

## Documentation

Keep `README.md`, `docs/architecture.md`, `docs/database-schema.md`, and
`docs/roadmap.md` synchronized with the actual implementation. Clearly
mark proposals, confirmed decisions, and unresolved questions.

## Current task

The read-only audit is complete — see `docs/audit.md`. The plan is in
`docs/roadmap.md`.

Do not write application code or install dependencies until the audit and
plan are approved and the blocking decisions in `docs/audit.md` §8 are
answered. Items 1–4 of that section gate the database schema, and
therefore Phase 1.
