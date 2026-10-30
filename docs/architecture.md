# Technical Architecture

## Status

**Architecture confirmed 2026-10-31**, with four slots recorded as
proposals awaiting approval and five contingent on client-owned
accounts. Each is marked below.

The Phase 0 audit (`audit.md`) found **no existing application** — no
`package.json`, no framework, no database, no integrations. There is
therefore nothing to be compatible with, and no dependency inherited
from an earlier build constrains any choice here. The stack below is
chosen on merit rather than negotiated against legacy code.

Decisions that shaped it are recorded in `project.md` §9. The ones that
reach furthest into this document: Google sign-in with guest checkout
kept, and one-of-a-kind inventory.

## 1. Stack

### Confirmed

Proposed before the audit, and unblocked by it.

| Area | Choice | Notes |
|---|---|---|
| Web application | **Next.js**, App Router | Server Components by default; Client Components only where interaction requires |
| Language | **TypeScript**, strict | |
| Database | **PostgreSQL** on **Neon** | Confirm region, connection limits, and production setup |
| ORM | **Prisma** | No existing ORM to be compatible with |
| Validation | **Zod** | Validate untrusted input at every server boundary |
| Payments | **Razorpay** | Client-owned account; test mode before live mode |
| Money | **Integer paise** | Never floating point. Catalogue runs ₹650–₹16,500 |

### Proposed — awaiting approval

These four slots were opened by the authentication and checkout
decisions of 2026-10-30. `architecture.md` had no entry for any of them,
because the earlier plan did not need them. **Recorded as
recommendations, not confirmed choices.**

| Area | Recommendation | Why | Alternative |
|---|---|---|---|
| Authentication | **Auth.js (NextAuth v5)** with the Prisma adapter | Google provider built in, first-class App Router support, no credentials of ours to store | **better-auth** |
| Transactional email | **Resend** | Order confirmations are now email for both guests and signed-in customers, so this is required rather than optional | **AWS SES**, **Postmark** |
| Styling | **Tailwind**, with Brand Board tokens as theme config over CSS variables | The design is inline styles over a tight token set — 6 colours, 2 fonts — and leans on `clamp()` sizing that Tailwind's arbitrary values handle directly | **CSS Modules**, at noticeably more volume |
| Rate limiting | **Upstash Redis** | Needed for guest order lookup; unthrottled, that endpoint enumerates orders | A Postgres table, if adding a service is unwelcome |

Supporting choices in the same category, lower stakes:

| Area | Recommendation | Notes |
|---|---|---|
| Forms | **React Hook Form** + Zod resolver | Checkout and address entry |
| Cart client state | **Zustand** | React Context would also serve |
| Unit and integration tests | **Vitest** | §11 lists what to test but named no framework |
| End-to-end tests | **Playwright** | Needed for the two-identity-path and concurrency cases |

**The email provider is the one to settle first.** It is not a
preference — without it there is no way to confirm an order to a guest,
who by definition has no account to look at.

### Contingent on client-owned accounts

Not ours to confirm. Each is isolated behind an adapter or a single
module so that a late answer, or a changed one, stays cheap.

| Area | Status |
|---|---|
| Shipping | **Shiprocket**, unconfirmed. Behind an adapter regardless, so swapping providers is contained |
| Product media | **Cloudinary** versus local `public/` with `next/image`. Decide in Phase 1B — 44 products and ~75 MB of source PNGs may not justify a CDN |
| Monitoring | **Sentry**, "if appropriate". Gate on deciding what customer data is safe to transmit |
| Hosting | **Vercel** assumed, not confirmed |
| OAuth | Google Cloud project, **client-owned**. Consent screen must be published to Production — Testing mode caps sign-ins at roughly 100 accounts |

### Deliberately excluded

Recorded so these are not reintroduced by habit, and so the reasoning
survives the people who made the decision.

- **No SMS provider.** Dropped with phone OTP. This is what retired DLT
  registration, the only blocker with a multi-week external lead time.
  It returns only if phone verification is added later — which the COD
  decision could force. See `project.md` §9 items 16 and 20.
- **No password hashing, no OTP machinery.** Google holds the
  credential. The only credential handling we own is the OAuth exchange.
- **No variant-matrix library or table.** The design renders at most one
  option group per product, and most are single-value display labels.
- **No coupon or promotions engine.** Out of scope unless approved.
- **No wishlist.** Confirmed out of scope; the header affordance is
  being removed.
- **No cart-stored prices as authority.** Totals are recalculated
  server-side from trusted product records on every checkout.

## 2. High-level architecture

``` text
Customer Browser / Admin Browser
             |
             v
       Next.js App
   (UI + server boundary)
             |
     -------------------
     |        |        |
     v        v        v
  Catalog  Checkout  Admin
     |        |        |
     ---------|---------
             |
             v
       Domain Services
   (pricing, stock, orders)
             |
       ----------------
       |              |
       v              v
   PostgreSQL     Integrations
                  |    |    |
                  v    v    v
               Razorpay Shipping Media
```

This is a conceptual design. There is no existing codebase to reflect,
so the final module boundaries should follow actual project complexity
as it emerges — not be built out in advance.

## 3. Application boundaries

Suggested logical areas:

-   `catalog`: product and category reads, search, availability.
-   `cart`: cart state and cart item validation.
-   `checkout`: address validation, pricing, shipping quote, order
    placement.
-   `inventory`: stock checks and concurrency-safe stock updates.
-   `orders`: order lifecycle and immutable order-item snapshots.
-   `payments`: payment order creation, verification, webhook
    processing, refunds.
-   `shipping`: serviceability, shipment creation, labels, tracking,
    webhooks.
-   `admin`: protected catalogue, inventory, order, and store
    operations.
-   `shared`: validation schemas, errors, logging, configuration.

These are conceptual boundaries, not a mandate to create folders. The
audit is complete; create each area when something needs to live in it.

## 4. Rendering and server/client strategy

-   Prefer Server Components for catalogue and content pages where
    possible.
-   Use Client Components for interactive UI such as cart controls,
    filters, and payment checkout launch.
-   Keep secrets and privileged operations on the server.
-   Use Route Handlers or Server Actions based on the interaction and
    integration requirements.
-   Revalidate cached catalogue data after admin changes.
-   Never expose database access or privileged credentials to the
    browser.

## 5. Checkout and order flow

Proposed sequence:

1.  Receive checkout intent.
2.  Validate customer input and address on the server.
3.  Load current product prices, variants, and stock from the database.
4.  Calculate discounts, tax, and shipping using confirmed business
    rules.
5.  Confirm destination serviceability where required.
6.  Create a pending order and reserve/decrement inventory using a
    transaction and concurrency-safe strategy.
7.  For online payment, create a Razorpay order on the server and
    associate it with the internal order.
8.  Verify payment signature server-side and process provider webhooks
    idempotently.
9.  Mark payment and order states based on verified events and the
    agreed order lifecycle.
10. Initiate shipment only at the appropriate business-approved point.
11. Reconcile failures, abandoned payments, expired reservations, and
    webhook retries.

The precise inventory reservation and order state machine must be
designed and tested before implementation. Avoid holding database
transactions open while waiting for external payment or shipping APIs.

## 6. Payment integration

-   Create Razorpay orders on the server.
-   Store internal order ID and provider order/payment IDs.
-   Verify checkout signatures on the server.
-   Verify webhook signatures using the raw request body as required by
    the provider.
-   Make event handling idempotent.
-   Handle out-of-order and duplicate webhook events.
-   Reconcile uncertain states using provider APIs where appropriate.
-   Keep secret credentials server-only.
-   Use test credentials and test transactions before production
    activation.

Never treat a browser redirect or client callback as authoritative proof
of payment.

## 7. Shipping integration

Create an internal shipping interface that separates business logic from
Shiprocket-specific request/response formats.

Potential operations: - Check serviceability. - Obtain shipping quote. -
Create shipment. - Generate label. - Request pickup, if required. -
Retrieve tracking information. - Process shipment webhooks.

Confirm account access, API availability, COD support, pricing, pickup
configuration, and operational workflow with the client. Provide a clear
manual fallback if the integration is not yet available.

## 8. Authentication and authorization

**Resolved 2026-10-30:** Google sign-in (OAuth) as the only
authentication method, with guest checkout kept alongside it. Sign-in is
optional for customers; authorization is mandatory for admin. We store
no passwords and no OTP codes — the only credential handling is the
OAuth exchange itself.

Two consequences for the design:

- **Every order-touching flow has two identity paths.** A guest has no
  account, so order lookup, confirmation, and address entry each need an
  anonymous version. Treat guest as the default path, not the fallback.
- **The admin role never comes from the identity provider.** Google
  tells us who someone is, never what they may do. Grant the role from a
  server-side allowlist or an explicitly set database flag, and check it
  server-side on every privileged operation.

See `project.md` §9 for the full decision record.

Regardless of provider: - Enforce admin authorization on the server. -
Do not rely on hiding admin UI links. - Protect every privileged
mutation and data read. - Use secure session/cookie settings. - Apply
least privilege. - Keep admin account provisioning controlled. - Avoid
collecting customer account data that the business does not need.

## 9. Configuration and secrets

-   Keep secrets in environment variables or the hosting provider's
    secret manager.
-   Commit only placeholder variable names in `.env.example`.
-   Validate required environment variables at startup or at the
    integration boundary.
-   Separate development, test, and production credentials.
-   Never print secret values in logs or error messages.

## 10. Reliability and observability

-   Use structured, useful logs with correlation IDs where practical.
-   Track checkout, payment, order, and shipping failures.
-   Avoid logging full addresses, phone numbers, tokens, or payment
    secrets.
-   Add Sentry only after deciding what data is safe to transmit.
-   Define retry and idempotency behavior for external calls.
-   Plan database backups and restore testing before launch.

## 11. Testing strategy

Prioritize tests for: - Price and total calculation. - Discount and
shipping rules. - PIN-code and address validation. - Stock availability
and concurrent purchase behavior. - Order creation and state
transitions. - Payment signature verification. - Duplicate and
out-of-order webhook handling. - Admin authorization. - Shipping
provider error handling.

Use provider test modes and sandbox workflows wherever available.

## 12. Deployment

Choose hosting against client constraints alone — there is no existing
app whose requirements need accommodating.
If using Vercel and Neon, document: - Production and preview environment
variables. - Database migration process. - Domain and DNS ownership. -
Webhook URLs and provider dashboard configuration. - Image storage
configuration. - Monitoring and alert ownership. - Rollback and backup
procedures.

Do not switch live payment credentials or publish production checkout
until end-to-end tests and client acceptance are complete.
