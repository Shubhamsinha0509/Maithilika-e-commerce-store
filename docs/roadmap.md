# Development Roadmap

## Working agreement

- Work on one task at a time.
- Keep each task small enough to review and test.
- Do not start dependent work before its prerequisites are approved.
- Update this file as tasks change state.
- Use `TODO`, `IN PROGRESS`, `BLOCKED`, and `DONE`.
- Do not mark a task `DONE` without checking its acceptance criteria.

## Phase 0 — Repository audit and product decisions

Audit findings: [`docs/audit.md`](audit.md). Confirmed decisions: [`docs/project.md`](project.md) §9.

- [x] **DONE** Inspect repository structure, framework version, scripts, and dependencies. *No application exists: no `package.json`, no framework, no scripts, no git repository.*
- [x] **DONE** Inspect all existing pages, components, styles, assets, and responsive layouts. *13 `.dc.html` design-canvas files, 44-product catalogue, 68 design images, 56 exported images.*
- [x] **DONE** Map existing screens to the requirements in `project.md`. *11 design sections on the homepage; listing, product, header/cart, footer built. 14 promised flows have no screen, including checkout.*
- [x] **DONE** Identify existing backend, database, authentication, and integrations, if any. *None. The cart is a `localStorage` prototype.*
- [x] **DONE** Confirm guest checkout versus customer accounts. *Revised: both. Guest checkout kept, accounts optional.*
- [x] **DONE** Confirm inventory rules. *Every piece is one-of-a-kind: stock 0-or-1, no quantities.*
- [x] **DONE** Confirm whether WhatsApp ordering is a real channel. *No — removed from the design.*
- [x] **DONE** Confirm who designs the missing screens. *Designed in `Design/` first, approved, then built. See Phase 0B.*
- [ ] **BLOCKED** Confirm product types, SKU scheme, and whether subcategories are fixed. *Audit §8.3. Variants resolved by audit §5.3: one option group per product.*
- [x] **DONE** Confirm the authentication method. *Revised: Google sign-in. No passwords, no OTP codes stored.*
- [x] **DONE** Confirm login-wall placement and anonymous-cart merge. *Revised: no wall. Sign-in optional; guest checkout available; anonymous cart merges on sign-in.*
- [x] **DONE** Confirm the replacement for the WhatsApp custom-order path. *None — the custom-order section is removed.*
- [x] **DONE** Confirm whether wishlist is in scope. *No. Remove the header affordance.*
- [x] **DONE** Confirm whether the 4 made-to-order products are single-unit or repeatable. *Repeatable — two availability kinds. Schema written, migration prepared and verified.*
- [x] **DONE** ~~Choose an SMS provider and start DLT registration.~~ *Void — Google sign-in needs no SMS. This retired the only blocker with a multi-week external lead time.*
- [ ] **BLOCKED** Name the Google accounts that are administrators. *`project.md` §9 item 17. Role granted server-side, never by signing in.*
- [ ] **BLOCKED** Create the Google Cloud OAuth project under client ownership, and publish the consent screen to Production. *`project.md` §9 item 19. Testing mode caps sign-ins at ~100 accounts — a launch gotcha, not a coding task.*
- [ ] **BLOCKED** Confirm that an unverified delivery phone is acceptable. *`project.md` §9 item 20. Coupled to the COD decision: unverified phone plus COD is a fraud vector, and fixing it would reintroduce DLT.*
- [ ] **BLOCKED** Confirm whether a first sign-in claims past guest orders with the same email. *`project.md` §9 item 21.*
- [ ] **BLOCKED** Confirm the guest order-lookup mechanism. *`project.md` §9 item 22. Recommended: order number plus checkout email.*
- [ ] **BLOCKED** Confirm order confirmations go by email. *`project.md` §9 item 18. Largely resolved — Google supplies a verified email and guests supply one at checkout.*
- [ ] **BLOCKED** Confirm Razorpay account ownership and payment methods. *Audit §8.6.*
- [ ] **BLOCKED** Confirm shipping provider, account, serviceability, rates, and COD rules. *Audit §8.7, §8.8.*
- [ ] **BLOCKED** Confirm cancellation, return, refund, tax, and invoice policies. *Audit §8.9, §8.10.*
- [ ] **BLOCKED** Who supplies artist names, villages, bios, and lead times. *Audit §8.4. Blocks Phase 7, not Phase 1.*
- [x] **IN PROGRESS** Present audit findings and proposed architecture for approval. *Presented 2026-10-30; awaiting approval.*

**Exit criteria:** Existing implementation is understood, unresolved business decisions are listed, and architecture is approved.

**Status:** Inspection complete; 4 of the 14 open decisions answered. Exit is held by architecture approval and by the decisions above. The authentication method is now the most urgent, because required accounts put it on the Phase 3 critical path.

## Phase 0B — Design extension

New phase. The store needs screens the design does not have, and the confirmed decisions force three corrections to screens it does. `Design/` is unfrozen for this phase only; it refreezes on approval. See `Design/CLAUDE.md`.

### Corrections to existing screens

- [ ] Remove "Order this bag on WhatsApp" from the `SiteHeader` cart drawer. *Confirmed: WhatsApp is not a channel.*
- [ ] Make the cart quantity stepper conditional: hidden for `UNIQUE` pieces (quantity is always 1), shown for `MADE_TO_ORDER` pieces (the artist can paint several). *Revised 2026-10-31. The earlier instruction was to remove the stepper outright, which the confirmed two-kind availability model makes wrong for 4 of the 44 products — see `project.md` §9 item 13.*
- [ ] Remove the homepage custom-order section. *Its only action was the WhatsApp link and no replacement was chosen. Reversible if the business still takes custom orders by phone or email.*
- [ ] Remove the wishlist affordance from `SiteHeader` and the `#wishlist` anchor. *Confirmed out of scope.*

### New screens — checkout path

- [ ] Checkout entry: a choice between "Sign in with Google" and "Continue as guest". *Neither path may be a dead end, and guest must not read as the lesser option.*
- [ ] Checkout: address entry, delivery, payment method, order review. *Works identically for guest and signed-in, except that a signed-in customer can pick a saved address.*
- [ ] Order confirmation / success.
- [ ] Order failure and payment-retry states.
- [ ] "This piece has just sold" state, for when a one-of-a-kind item in the cart is bought by someone else first. *Specific to one-of-a-kind stock; unavoidable and currently undesigned.*

### New screens — account path

Accounts are optional, so every one of these is a convenience path that
a guest must be able to do without. None exist today.

Google sign-in collapses what would have been two screens into one
button: there is no register screen and no password-reset flow, because
a first-time Google account is created on first sign-in.

- [ ] "Sign in with Google" button, following Google's branding requirements, placed at checkout entry and in the header.
- [ ] Sign-in failure and cancelled-consent states.
- [ ] Account home.
- [ ] Order history and order detail. *Signed-in customers only.*
- [ ] Guest order lookup — order number plus checkout email. *The guest equivalent of order history. Design links `#track`. Blocked on `project.md` §9 item 22.*
- [ ] Order tracking, reachable from both paths.
- [ ] Saved addresses. *Signed-in only; guests retype each time.*
- [ ] Signed-in and signed-out header states — the header currently has no account affordance at all.

### New screens — content and policy

- [ ] Artists index and artist detail. *Design links `#artists`, `#artist`; header nav includes `artists`.*
- [ ] Our story. *Header nav includes `story`.*
- [ ] Motifs explainer. *Design links `#motifs`.*
- [ ] Size guide and care. *Design links `#size`, `#care`.*
- [ ] Shipping, returns, FAQ, terms, privacy. *Design links all five; content blocked on policy decisions.*

### Review

- [ ] Add every new screen to `Mobile Views.dc.html` at 390px.
- [ ] Record all changes in `audit.md`.
- [ ] Present for approval, then refreeze `Design/`.

**Exit criteria:** No dead anchor remains in the design, every confirmed decision is reflected in it, and the whole set is approved at desktop and mobile widths.

**Note:** policy-page *content* is blocked on client decisions, but the page *layouts* are not. Design them with placeholder copy; Phase 7 fills them.

## Phase 1 — Foundation

- [x] **DONE** Confirm final technology choices based on the audit. *Next.js 16.4.3, React 19.3, TypeScript strict, Tailwind 4 — in use. The four `architecture.md` §1 proposals other than Tailwind are still unconfirmed.*
- [x] **DONE** Scaffold the Next.js App Router + TypeScript application. *`src/` layout; `Design/`, `docs/`, `site/` remain siblings at the root.*
- [x] **DONE** Initialise a git repository and commit the baseline. *Branch `main`, commit `5f74d11`, 198 files.*
- [x] **DONE** Add baseline lint, type-check, and build checks. *All three pass from clean. `Design/` and `site/` excluded from both ESLint and tsc — linting read-only reference code reported errors we are instructed not to fix.*
- [ ] **TODO** Add the test runner and a first passing test. *Vitest, per `architecture.md` §1 — still a proposal.*
- [x] **DONE** Configure environment variable validation. *Zod in `src/env.ts`. Lazy by design — a module-level parse would break `next build`, which imports modules without a populated `.env`.*
- [x] **DONE** Add or configure ORM. *Prisma 7.10.1, CLI and client pinned to the same exact version, with the `@prisma/adapter-pg` driver adapter v7 requires. Client singleton in `src/lib/prisma.ts`.*
- [ ] **IN PROGRESS** Configure PostgreSQL connection. *Wiring complete and verifiable: `scripts/setup-neon.sh` captures both URLs, `scripts/check-db.mjs` proves them. Waiting on the client to create the Neon project.*
- [x] **DONE** Write the schema and prepare the first migration. *15 models, 6 enums. `prisma/migrations/20261031033613_init` includes the raw `CHECK` constraint Prisma cannot express. Applied and verified against a local Postgres 17 — 6/6 constraint assertions passed, then torn down.*
- [ ] **IN PROGRESS** Apply the first migration to Neon. *Everything is ready: `npx prisma migrate deploy` once `DIRECT_URL` points at the real database. Waiting only on the Neon project.*
- [ ] **TODO** Implement shared validation and error conventions.
- [ ] **TODO** Establish module boundaries and logging approach. *Per `architecture.md` §3: create each area when something needs to live in it, not upfront.*

**Exit criteria:** Application starts, database connectivity works, migrations run safely, and baseline checks pass.

**Note:** scaffolding and git init were implicit in the original plan, which assumed an existing app. The audit found none, so they are explicit tasks.

## Phase 1B — Design port

The original roadmap assumed a frontend already existed in code; it does not. `Design/` is a specification that must be rebuilt as React components before any catalogue UI can be "connected to real data".

- [ ] Extract design tokens from `Design/Brand Board.dc.html` (colour, type, spacing, radius) into a single theme source.
- [ ] Set up the font loading strategy for Yatra One + Mukta.
- [ ] Build an optimised image pipeline from `Design/uploads` originals; decide local `public/` versus Cloudinary.
- [ ] Port `SiteHeader` including nav, dropdown, and cart drawer.
- [ ] Port `SiteFooter`.
- [ ] Port `ProductCard`.
- [ ] Port the `Motif` SVG set.
- [ ] Port the homepage, all 11 sections, against static data.
- [ ] Port the listing template with its filter and sort UI, against static data.
- [ ] Port the product detail page including gallery and option group, against static data.
- [ ] Port the Phase 0B screens against static data.
- [ ] Verify desktop and 390px parity against `Design/Mobile Views.dc.html` and `Design/screenshots/`.
- [ ] Record any deliberate deviation from the design and the reason.

**Exit criteria:** Every built screen is visually faithful to the design reference at desktop and mobile widths, still running on static data, with no database dependency.

**Rationale for static data first:** it separates "does it look right" from "does it read the right data", so a visual regression later in Phase 2 is unambiguous.

## Phase 2 — Catalogue and inventory

- [ ] Finalise the schema against audit §7 and the confirmed decisions.
- [ ] Implement category and subcategory data and admin management.
- [ ] Implement the `Artist` entity and admin management.
- [ ] Implement product data and admin management.
- [ ] Implement product image storage and upload validation.
- [ ] Migrate the 44 products from `Design/sarees.js` into the database as a seed.
- [ ] Implement product listing and detail data access.
- [ ] Swap the Phase 1B static data for real queries, with no visual change.
- [ ] Derive filter facets from real catalogue values rather than hardcoded lists. *Audit §6: three facets have no backing field and some offered values match nothing.*
- [ ] Implement single-unit availability: a product is `available`, `reserved`, or `sold`. No stock quantities.
- [ ] Decide and implement how a sold one-of-a-kind piece leaves the storefront — hidden, or shown as sold for SEO and provenance.
- [ ] Add catalogue and availability tests.

**Exit criteria:** Admin can manage products and customers can browse real catalogue data without visual regressions.

## Phase 3 — Customer accounts, address, and cart

Authentication is optional for customers, so the guest path is the
default and must be complete on its own. Admin authorization is not
optional and is the security-critical half of this phase.

- [ ] Implement Google OAuth sign-in and session handling. *Blocked on `project.md` §9 item 19 — the client-owned Google Cloud project and a consent screen published to Production.*
- [ ] Implement account creation on first sign-in. No registration path, no password reset.
- [ ] Implement sign-out and session invalidation.
- [ ] Implement server-side authorization and protected admin access, with the admin role granted from a server-side allowlist or database flag. *Signing in must never grant admin; self-registration must never create an admin. Blocked on `project.md` §9 item 17.*
- [ ] Implement the guest checkout identity: a contact snapshot on the order, with no account.
- [ ] Implement the anonymous-cart merge on sign-in, revalidating availability during the merge.
- [ ] Implement guest order lookup by order number plus checkout email, rate-limited so it cannot be used to enumerate orders.
- [ ] Implement past-guest-order claiming on first sign-in, if adopted. *Blocked on `project.md` §9 item 21.*
- [ ] Normalise and validate Indian mobile numbers without rejecting legitimate formats. *Delivery contact only — unverified, per §9 item 20.*
- [ ] Implement address validation and persistence, with saved addresses for signed-in customers only.
- [ ] Replace the `localStorage` cart prototype with the approved cart model, working for both guests and signed-in customers.
- [ ] Implement cart add/remove behavior, with quantity fixed at 1 per line.
- [ ] Re-validate availability server-side on every cart read, and surface the "just sold" state.
- [ ] Implement order history and order detail for signed-in customers.
- [ ] Add tests for authentication, admin authorization, the guest path, cart, and the just-sold path.

**Exit criteria:** A guest can reach checkout with a valid cart and a looked-up order; a signed-in customer additionally has history and saved addresses; admin access is enforced server-side and cannot be obtained by signing in.

**Test both paths for every order-touching change.** Two identity paths
is the main cost of keeping guest checkout: every flow has a signed-in
and an anonymous version, and a bug that only appears for guests is
easy to miss.

## Phase 4 — Checkout and payment

- [ ] **Prerequisite:** Phase 0B checkout designs approved.
- [ ] Implement server-side price and total calculation.
- [ ] Implement approved tax, discount, and shipping rules.
- [ ] Implement serviceability checks.
- [ ] Implement single-unit reservation: a conditional update that claims the piece only if still available, inside the order transaction, with the row count checked.
- [ ] Implement reservation expiry for abandoned payments, so a piece is not locked indefinitely.
- [ ] Implement pending order creation and order-item snapshots.
- [ ] Integrate Razorpay in test mode.
- [ ] Implement server-side payment verification.
- [ ] Implement signed, idempotent webhook processing.
- [ ] Implement COD only if approved.
- [ ] Test two concurrent buyers for one piece, and confirm exactly one wins.
- [ ] Test successful, failed, abandoned, duplicate, and delayed payment scenarios.

**Exit criteria:** End-to-end test checkout creates correct orders and payment states without trusting browser-supplied totals, and a one-of-a-kind piece can never be sold twice.

**Removed:** the WhatsApp order path, per the confirmed decision.

## Phase 5 — Orders and shipping

- [ ] Implement order status transitions.
- [ ] Integrate shipping provider test workflow.
- [ ] Implement shipment creation and tracking.
- [ ] Implement signed/idempotent shipping webhook processing where supported.
- [ ] Implement cancellation/return/refund workflow according to approved policy.
- [ ] Define what a return does to a one-of-a-kind piece: does it return to `available`, and at what point?
- [ ] Test provider failures and retry/reconciliation behavior.

**Exit criteria:** Admin can fulfil and track orders, and customers see accurate order and shipment information.

## Phase 6 — Admin operations

- [ ] Complete product and category management.
- [ ] Complete availability management and manual status corrections.
- [ ] Complete order search and detail views.
- [ ] Complete customer views with appropriate data access.
- [ ] Implement agreed dashboard metrics.
- [ ] Add admin audit trail for sensitive changes where required.
- [ ] Test all privileged operations server-side.

**Exit criteria:** Client can perform agreed daily store operations without developer intervention.

## Phase 7 — Content completion

Client-supplied content work, not engineering. It blocks launch independently of the code.

- [ ] Supply 44 artist names, villages, and bios; replace `[Artist name]`.
- [ ] Supply per-product lead times; replace `[N]` days.
- [ ] Fill the Artists and Our story pages.
- [ ] Supply shipping, returns, FAQ, terms, and privacy content.
- [ ] Set the free-shipping threshold; replace `[₹ threshold]`.
- [ ] Set the shipping and tax note in the cart.
- [ ] Supply gallery images for the 7 products that have none.
- [ ] Fill the size guide and care content.

**Exit criteria:** No placeholder text remains in any customer-facing screen.

## Phase 8 — Production readiness

- [ ] Run lint, type checks, tests, and production build.
- [ ] Perform security review of authentication, authorization, input validation, and secrets.
- [ ] Test single-unit concurrency and payment idempotency under load.
- [ ] Test responsive layouts and accessibility basics.
- [ ] Verify SEO metadata, sitemap, robots.txt, and product URLs.
- [ ] Decide and verify the SEO treatment of sold one-of-a-kind products.
- [ ] Configure production database and backups.
- [ ] Configure production media storage and monitoring.
- [ ] Configure payment and shipping production webhooks.
- [ ] Verify domain, HTTPS, and deployment settings.
- [ ] Complete end-to-end test purchase and client acceptance.
- [ ] Document deployment, support, and operational procedures.

**Exit criteria:** Client approves the tested application and all production integrations are configured with client-owned credentials.

## Current status

**Current phase:** Phase 0 — Repository audit and product decisions

**Completed:** Repository and design inspection. Findings in [`audit.md`](audit.md). Documentation promoted to the project root. Eight business decisions confirmed and recorded in [`project.md`](project.md) §9.

**Awaiting:**

1. Approval of the audit and architecture.
2. A client-owned **Google Cloud OAuth project**, with the consent screen published to Production (`project.md` §19). Quick to do — basic scopes need no Google review — but it gates Phase 3 and is easy to forget until sign-in fails for the 101st user.
3. The made-to-order availability rule (`project.md` §13). A proposed default is recorded; confirm or correct it before the Phase 2 schema.
4. The admin Google accounts (§17), the unverified-phone acceptance (§20), guest-order claiming (§21), and the guest lookup mechanism (§22).
5. Payment, shipping, tax, and returns decisions (audit §8.6–§8.10) — needed by Phase 4, not before. Note §20 is coupled to the COD decision.

**No blocker now has a multi-week external lead time.** Dropping phone OTP retired the DLT registration, which was the only one.

**Next task:** On approval, Phase 0B — design the missing screens. Phase 1 scaffolding can run in parallel, since it depends on no design decision. No application code before approval.

**Changes to the original plan, and why:**

1. **Phase 0B (design extension) added.** The design has 14 dead anchors and no checkout. Required accounts added 7 more screens. Confirmed decisions forced 3 corrections to existing screens.
2. **Phase 1B (design port) added.** The original Phase 2 task "connect existing catalogue UI to real data" presumed a frontend in code. There is none.
3. **Phase 7 (content completion) added.** Placeholder content is pervasive — every product's artist and lead time — and blocks launch on its own track.
4. **Phase 3 widened** from "customer identity" to full authentication, because accounts are required rather than optional.
5. **Inventory reworked throughout** from stock quantities to single-unit availability, with reservation, expiry, and just-sold handling.
6. **WhatsApp order path removed** from Phase 4.
7. **Scaffolding and git init made explicit** in Phase 1.
8. **Original Phase 7 renumbered to Phase 8.**
9. **Wishlist and the custom-order section removed** from Phase 0B per confirmed decisions.
10. **Phase 3 rewritten twice on 2026-10-30** — first for phone OTP, then for Google sign-in with guest checkout, as the decisions were revised. The net is simpler than either earlier version: no SMS adapter, no OTP issue/expiry/rate-limit work, no DLT dependency, no password reset, no registration screen. Added instead: a guest identity path, guest order lookup, and optional guest-order claiming.
11. **Phase 3 is now two identity paths, not one.** Guest and signed-in versions of every order-touching flow, both of which need testing.
