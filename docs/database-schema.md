# Database Schema Proposal

## Status

**Conceptual proposal --- not an approved Prisma schema.**

Finalize this model only after the repository audit and answers to the
open business decisions in `project.md`. Avoid creating tables for
features the client does not need.

## Status update 2026-10-30

The audit (`audit.md` §5, §7) and the confirmed decisions
(`project.md` §9) change this proposal materially. The sections below are
**not yet revised** — read them against these constraints, which take
precedence:

- **No stock quantities.** Every piece is one-of-a-kind. Replace
  `stockQuantity` with an availability state: `available`, `reserved`,
  `sold`. Overselling prevention is a conditional single-unit claim
  (`UPDATE ... WHERE id = ? AND status = 'available'`, row count
  checked) inside the order transaction, not a decrement.
- **Reservations need an expiry**, so an abandoned payment does not lock
  a piece permanently.
- **`ProductVariant` is too heavy.** The design renders at most one
  option group per product (`optTitle` + `opts`), and most are
  single-value display labels. Model one option group per product; do
  not build a variant matrix.
- **`User` is optional.** Guest checkout is kept, so `Order.userId` and
  `Address.userId` stay **nullable** and the guest-order branch of the
  original proposal stands. *This reverses a decision taken earlier on
  2026-10-30 that would have made them non-nullable.* Every order
  therefore needs a contact snapshot of its own, not a join to `User`.
- **An `Artist` entity is missing entirely** and must be added — name,
  village, bio, portrait, active years. Every product references one,
  and the storefront has an Artists index and detail page.
- **Mithila-specific product attributes** the storefront filters and
  reads: `motif`, `motifHi`, `motifText`, `fabric`, `style`, `colour`,
  `medium`, `frame`, `edge`, `includes`, `sub`, plus per-product lead
  time in days.
- **Product dimensions** are needed to make the paintings `size` filter
  real; no product currently has them.
- **A `featured` or `position` column** is needed for the Featured sort,
  which today means nothing but catalogue order.
- **Drop the canvas geometry fields** (`iw`, `ih`, `ar`, `cardW`,
  `cardPos`) from `sarees.js`; they are rendering concerns.
- **Facet values should be derived** from real catalogue rows, never
  hardcoded, so no filter can offer a value that returns nothing.
- **No `Coupon` table yet** — promotions are out of scope unless
  approved.
- **No `Wishlist` table** — confirmed out of scope.

### Added by the Google sign-in decision (2026-10-30)

Supersedes a phone-OTP model recorded earlier the same day. The OTP
challenge table, its hashing and expiry columns, and its rate-limit
state are all **no longer needed**.

- **`User` keys on the Google account.** Store the Google subject
  identifier (`sub`) as the unique provider key, plus the email Google
  supplies, which is verified. **Store no password hash and no OTP** —
  there is no credential of ours to store, which is the main security
  benefit of delegating.
- **Treat email as verified for signed-in users, unverified for
  guests.** A guest types their own email at checkout. If guest-order
  claiming is adopted (`project.md` §9 item 21), match only on Google's
  verified email, never on a self-typed one, or orders can be claimed by
  guessing an address.
- **`phone` is a nullable delivery contact, not an identifier**, and is
  **not verified** — see `project.md` §9 item 20. Do not use it to
  identify or authenticate anyone.
- **`role` lives on `User`**, but signing in with Google must never by
  itself confer admin. The role comes from a server-side allowlist or an
  explicitly set flag — see `project.md` §9 item 17.
- **Carts exist before users do**, and may never get one. Either keep
  the cart client-side until checkout, or give `Cart` a nullable
  `userId` plus an opaque session token and merge on sign-in.
- **Order lookup needs an index** on order number plus email, for the
  guest path. Rate-limit it; without that, the lookup endpoint is an
  order-enumeration oracle.

### Proposed, not confirmed — product availability kind

Pending `project.md` §9 item 13. If approved, `Product` carries a `kind`
enum:

- `UNIQUE` (40 products) — availability state machine, reservation with
  expiry, retires when sold.
- `MADE_TO_ORDER` (4 products) — no availability state, no reservation,
  always purchasable, carries a lead time in days.

If rejected, drop the enum and treat all 44 as `UNIQUE`.

## 1. Candidate entities

### User

For customer accounts and administrators, if accounts are enabled. -
`id` - `name` - `email` (nullable if business rules permit) - `phone` -
`authProviderId` or password hash, depending on authentication
approach - `role` or linked role/permission model - `createdAt` -
`updatedAt`

Do not store passwords if authentication is delegated to a trusted
identity provider.

### Address

-   `id`
-   `userId` (nullable for guest checkout if required)
-   `recipientName`
-   `phone`
-   `addressLine1`
-   `addressLine2` (optional)
-   `landmark` (optional)
-   `city`
-   `state`
-   `postalCode`
-   `countryCode`
-   `createdAt`
-   `updatedAt`

Store an order-specific address snapshot as well, so later edits to a
saved address do not change historical orders.

### Category

-   `id`
-   `name`
-   `slug`
-   `description` (optional)
-   `isActive`
-   `createdAt`
-   `updatedAt`

### Product

-   `id`
-   `name`
-   `slug`
-   `description`
-   `sku` (if one SKU per product)
-   `price`
-   `compareAtPrice` (optional)
-   `isActive`
-   `trackInventory`
-   `stockQuantity` (only if inventory is not variant-specific)
-   `weight` and dimensions if required for shipping
-   `seoTitle` (optional)
-   `seoDescription` (optional)
-   `createdAt`
-   `updatedAt`

Use an integer minor-unit or an appropriate exact decimal representation
for money. Do not use floating-point arithmetic for currency.

### ProductImage

-   `id`
-   `productId`
-   `url` or storage key
-   `altText`
-   `sortOrder`
-   `createdAt`

### ProductVariant

Only if the catalogue requires variants. - `id` - `productId` - `sku` -
`name` or structured option values - `price` override (optional) -
`stockQuantity` - `isActive`

Decide whether inventory is tracked at product or variant level; do not
maintain two competing sources of truth.

### Cart and CartItem

Only if a persisted server-side cart is needed. - `Cart`: `id`, `userId`
(nullable), guest/session reference (secure design required),
timestamps. - `CartItem`: `id`, `cartId`, `productId`, `variantId`
(optional), `quantity`, timestamps.

Cart prices should be recalculated from current trusted product data at
checkout; cart-stored display prices are not authoritative.

### Order

-   `id`
-   `orderNumber` (unique, non-sequential or otherwise safely generated)
-   `userId` (nullable for guest orders)
-   customer contact snapshot
-   shipping address snapshot
-   `subtotal`
-   `discountTotal`
-   `shippingTotal`
-   `taxTotal`
-   `grandTotal`
-   `currency`
-   `orderStatus`
-   `paymentStatus`
-   `shipmentStatus`
-   timestamps

Use explicit currency and a consistent money representation.

### OrderItem

-   `id`
-   `orderId`
-   `productId` (nullable if product is later deleted)
-   `variantId` (nullable)
-   product name snapshot
-   SKU snapshot
-   variant/options snapshot
-   unit price snapshot
-   quantity
-   discount/tax snapshot if applicable
-   line total

Historical order details must remain understandable even if catalogue
data changes.

### Payment

-   `id`
-   `orderId`
-   provider
-   provider order ID
-   provider payment ID (unique where present)
-   amount
-   currency
-   status
-   payment method (if supplied and safe to retain)
-   verified timestamp
-   timestamps

Do not store card numbers, CVVs, UPI PINs, or other sensitive payment
credentials.

### Shipment

-   `id`
-   `orderId`
-   provider
-   provider shipment/AWB identifiers
-   status
-   tracking URL
-   label reference
-   shipping charge
-   shipped/delivered timestamps
-   timestamps

### Coupon

Only if promotions are in scope. - `id` - `code` (unique, normalized) -
discount type and value - validity window - usage limits - minimum order
value - active status

Define stacking, per-customer limits, and refund behavior before
implementation.

### InventoryMovement

Recommended if the client needs an audit trail. - `id` - `productId` or
`variantId` - quantity delta - reason - reference to order or admin
action - actor/admin ID where applicable - timestamp

## 2. Relationship overview

``` text
User 1 --- many Address
User 1 --- many Order
Category many --- many Product (if products can belong to multiple categories)
Product 1 --- many ProductImage
Product 1 --- many ProductVariant (when variants are used)
User 1 --- many Cart (or one active cart, depending on design)
Cart 1 --- many CartItem
Order 1 --- many OrderItem
Order 1 --- many Payment
Order 1 --- many Shipment (if split shipments are possible)
Product/Variant 1 --- many InventoryMovement
```

Choose one-to-many versus many-to-many category relationships based on
actual catalogue needs.

## 3. Data integrity requirements

-   Use foreign keys and appropriate delete behavior.
-   Add unique constraints for slugs, SKUs, order numbers, and provider
    identifiers as appropriate.
-   Add indexes for common product, order, customer, and status queries.
-   Use transactions for order creation and inventory changes.
-   Make webhook event processing idempotent; consider a persisted
    provider event ID or deduplication record.
-   Do not hard-delete records needed for financial or order history.
-   Store snapshots for order address and order items.
-   Use consistent timezone-aware timestamps.
-   Define retention and access policies for customer personal data.

## 4. Decisions required before schema implementation

1.  ~~Guest checkout, customer accounts, or both?~~ **Answered: both.
    Guest checkout kept; accounts optional via Google sign-in. `userId`
    stays nullable on `Order` and `Address`.**
2.  ~~Are products variant-based?~~ **Answered by the audit: one option
    group per product, no variant matrix.**
3.  ~~Is stock tracked per product or per variant?~~ **Answered:
    neither. One-of-a-kind availability state per product.**
3a. Are the 4 made-to-order products single-unit or repeatable?
    (`project.md` §9 item 13.) If repeatable, they need a second
    availability rule.
3b. Which authentication method, and therefore does `User` store
    credentials at all? (`project.md` §9 item 11.)
4.  Can one order have multiple shipments?
5.  Are coupons required for launch?
6.  Are staff roles/permissions required?
7.  Which tax and invoice fields are required?
8.  What is the approved cancellation/refund data model?

The final Prisma schema and migrations must reflect confirmed
requirements rather than this illustrative proposal.
