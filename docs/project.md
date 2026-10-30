# Project Specification

## 1. Product overview

Build a full-stack e-commerce website for a client who wants to list
products and sell online to customers across India.

The frontend design has already been prepared. The implementation must
preserve the approved design and connect it to real product, cart,
checkout, payment, order, shipping, and administration functionality.

## 2. Business objectives

-   Present the client's products clearly.
-   Make it easy for customers to browse and purchase products on mobile
    and desktop.
-   Accept online payments through an approved payment provider.
-   Offer Cash on Delivery only where the client and shipping provider
    support it.
-   Fulfil orders across India wherever courier serviceability is
    available.
-   Let the client manage catalogue, inventory, and orders without
    editing code.

## 3. Users and roles

### Customer

A visitor or customer who browses products and may place an order.
Whether checkout requires an account or supports guest checkout is an
open business decision.

### Administrator

An authorized person who manages products, categories, stock, orders,
and relevant store settings. Admin permissions must be enforced
server-side.

Additional roles, such as staff or fulfilment operators, should be added
only if the client requires them.

## 4. Customer-facing scope

### Storefront and catalogue

-   Product listing and product detail pages.
-   Product images and descriptions.
-   Categories and category navigation.
-   Search, filtering, and sorting where supported by the approved
    design.
-   Product availability and stock messaging.
-   Product variants (for example size or colour) only for products that
    need them.
-   SEO metadata and shareable product URLs.

### Cart

-   Add and remove products.
-   Change quantities.
-   Show item subtotal and order summary.
-   Persist the cart appropriately for the chosen guest/account model.
-   Revalidate price, availability, and stock on the server at checkout.

### Checkout

-   Collect customer name, mobile number, email, and delivery address as
    required.
-   Capture address line, locality, city, state, and PIN code.
-   Validate required fields and Indian PIN-code format.
-   Check delivery serviceability through the selected provider or an
    approved fallback process.
-   Show the customer the final payable amount before order placement.
-   Apply shipping, discount, and tax rules only after the client
    confirms them.

### Payments

-   Razorpay online payment integration, subject to the client's account
    and approval.
-   Cash on Delivery only if enabled by the client and supported for the
    destination/order.
-   Server-side payment order creation and signature verification.
-   Webhook-based payment reconciliation.
-   Clear handling of pending, successful, failed, and refunded
    payments.
-   No client-side-only payment success decisions.

### Orders

-   Unique order reference.
-   Order confirmation and order details.
-   Order status, payment status, and shipment status tracked
    separately.
-   Customer order history if accounts are enabled.
-   Cancellation, return, and refund flows according to client-approved
    policies.
-   Shipment tracking where supported.

## 5. Admin scope

### Product and catalogue management

-   Create, edit, archive, and publish products.
-   Manage product descriptions, prices, images, categories, and SKUs.
-   Manage variants where applicable.
-   Manage stock and low-stock visibility.
-   Validate product data before publishing.

### Order management

-   View and search orders.
-   Inspect customer, item, payment, and delivery details with
    appropriate access controls.
-   Update permitted order statuses.
-   View shipment and tracking details.
-   Record and manage cancellation/return/refund outcomes according to
    approved policy.

### Customer management

-   View customer information needed to fulfil orders.
-   View customer order history where appropriate.
-   Restrict access to personal information to authorized staff.

### Dashboard

Potential metrics include sales, order count, average order value,
customer count, and low-stock products. Define how each metric is
calculated before implementation.

## 6. India-specific considerations

-   Indian addresses and PIN codes.
-   INR currency and correct currency formatting.
-   Indian mobile number validation without rejecting legitimate
    formats.
-   Delivery serviceability by PIN code.
-   Shipping charges and COD rules based on client/provider
    configuration.
-   Tax and invoice requirements to be confirmed with the
    client/accountant.
-   Privacy-conscious handling of customer personal information.

Do not assume a tax rate, legal policy, delivery promise, or COD rule.
Obtain client-approved requirements.

## 7. Non-functional requirements

-   Responsive and accessible customer experience.
-   Secure authentication and authorization.
-   Server-side validation and trusted price calculation.
-   Safe inventory updates and transactional order creation.
-   Idempotent payment and webhook processing.
-   Useful error handling and operational logs.
-   Maintainable modular code.
-   Automated tests for critical business rules.
-   SEO fundamentals and performant product images.
-   Backup, monitoring, and deployment procedures appropriate to the
    hosting setup.

## 8. Out of scope unless approved

-   Multi-vendor marketplace functionality.
-   Loyalty points or wallet.
-   Subscription products.
-   Complex promotions or coupon stacking.
-   International sales.
-   Multiple warehouses.
-   Advanced analytics or marketing automation.
-   Native mobile applications.

## 9. Business decisions

### Confirmed 2026-10-30

- **Inventory: every piece is one-of-a-kind.** Stock is 0-or-1 per
  product. There are no stock quantities — a product is either available
  or sold. "Overselling" means two customers buying the same unique
  piece, and must be prevented by a conditional single-unit reservation.
  A consequence: cart line quantity is always 1, and a sold piece is
  retired from the catalogue rather than restocked.
- **Both guest checkout and customer accounts.** *Revised 2026-10-30,
  superseding "accounts required" taken earlier the same day.* A
  customer may complete an order without signing in. Signing in is
  optional everywhere, and buys order history and saved addresses.
  Consequences: `Order.userId` is nullable, a guest contact snapshot is
  stored on the order, and guests need an order-lookup path since they
  have no account to log into.
- **WhatsApp ordering is removed.** The cart drawer's "Order this bag on
  WhatsApp" action and the WhatsApp custom-order link are dropped from
  the design. Online checkout is the only order path.
- **Missing screens are designed in `Design/` first**, approved, then
  implemented. `Design/` is unfrozen for that purpose only.
- **Authentication is Google sign-in (OAuth).** *Revised 2026-10-30,
  superseding phone OTP taken earlier the same day.* Google is the only
  sign-in method. No passwords and no OTP codes are stored. Google
  supplies a verified email address; phone is collected at checkout as
  a delivery contact and is **not** verified. Login and registration
  remain a single action — a first-time Google account is created on
  first sign-in.
- **Sign-in is optional, never required.** Customers browse and build a
  cart anonymously and may check out as a guest. At checkout they choose
  "Sign in with Google" or "Continue as guest". An anonymous cart merges
  into the account on sign-in, revalidating availability as it does.

### Superseded decisions

Kept visible so the reasoning behind later work stays traceable.

| Date | Decision | Superseded by |
|---|---|---|
| 2026-10-30 | Accounts required, no guest checkout | Guest checkout kept alongside accounts |
| 2026-10-30 | Phone OTP authentication | Google sign-in |
| 2026-10-30 | Login wall at checkout | Sign-in optional; guest checkout available |

**Net effect of the reversal:** it removed more work than it added. DLT
registration and the SMS provider are no longer needed at all, which
retired the only blocker with a multi-week external lead time. OTP
issue, hashing, expiry, attempt limits and rate limiting all disappear.
What it adds is a Google Cloud OAuth project, a guest-order lookup path,
and a decision about linking past guest orders to a later account.
- **The custom-order path is removed.** Its only mechanism was the
  WhatsApp link, and no replacement was chosen, so the homepage
  "Have a motif painted just for you" section is removed. *Reverse this
  if the business still takes custom orders by phone or email — the
  section returns with that contact as its action.*
- **Wishlist is out of scope.** Remove the header affordance and the
  `#wishlist` anchor.

### Still open

Resolve these with the client before implementing dependent
functionality:

1.  ~~Is checkout guest-only, account-based, or both?~~ **Answered:
    both — guest checkout kept, accounts optional.**
2.  Which product types and variants are required?
3.  Who provides product descriptions, SKUs, prices, stock counts, and
    images?
4.  Is Cash on Delivery enabled? Are there order-value or PIN-code
    restrictions?
5.  Which shipping provider/account will be used? Is Shiprocket
    confirmed?
6.  Who decides shipping rates, free-shipping thresholds, and delivery
    estimates?
7.  What are the approved cancellation, return, exchange, and refund
    policies?
8.  What tax/invoice requirements has the client confirmed?
9.  Which staff members need admin access, and are different permission
    levels needed?
10. Who owns the Razorpay, shipping, storage, domain, and hosting
    accounts?

### Raised by the 2026-10-30 decisions

These are new questions created by the answers above, not pre-existing
ones. Each blocks work that the answers otherwise unblocked.

11. ~~Which authentication method?~~ **Answered: Google sign-in.**
12. ~~Where does the login wall sit?~~ **Answered: there is no wall —
    sign-in is optional and guest checkout is available.**
13. **Are the 4 made-to-order products single-unit too?** *Client
    undecided as of 2026-10-30.* See the proposed default below.
14. ~~With WhatsApp removed, how do custom orders work?~~ **Answered:
    the custom-order path is removed.**
15. ~~Is wishlist in scope?~~ **Answered: no, removed.**

### Proposed default for item 13 — awaiting confirmation

Not a confirmed decision. Recorded so work is not blocked, and marked so
it is not mistaken for an approved business rule.

**Proposal: two availability kinds, not one.**

- `UNIQUE` — the 40 ready-to-ship pieces. One physical object. Status
  `available` → `reserved` → `sold`. Retires from sale when sold.
- `MADE_TO_ORDER` — the 4 remaining pieces. The design exists, an artist
  paints one on demand. Always purchasable, carries a lead time in days,
  never retires.

**Why.** A made-to-order piece has not been painted yet, so there is no
single object to sell once. Treating these 4 as single-unit would mean a
popular design can be sold exactly once and then disappears, which is
not what "made to order" offers the customer.

It is also *less* code, not more: made-to-order items need no
reservation, no expiry timer, and no "just sold" state, because there is
nothing to contend over. The reservation machinery applies only to the
40 unique pieces.

**What it costs.** One `kind` enum on the product, one branch at
checkout, and the `[N]` days lead-time placeholder becomes required
content for those 4 products.

**If this is wrong**, the reversal is small: drop the enum, treat all 44
as `UNIQUE`. But the design argues against it — `Listing.dc.html`
implements a "Made to order first" sort and a "Ready to ship" filter, so
the distinction is already load-bearing in the approved UI.

**Must be settled before:** the Phase 2 schema is written.

### Raised by the authentication decisions

16. ~~Which SMS provider, and is DLT registration done?~~ **Void.**
    Google sign-in needs no SMS, so DLT registration is not required.
    *This retired the only blocker with a multi-week external lead
    time.* It returns only if phone verification is later added — see
    item 20.
17. **Which Google accounts are administrators?** Recommended approach:
    admins sign in with Google like everyone else, and the admin role is
    granted from a server-side allowlist or a database flag — never by
    signing in. Self-registration must never create an admin. Needs the
    client to name the accounts.
18. **Order confirmations by email — confirm.** Largely resolved by the
    change: Google supplies a verified email for signed-in customers,
    and guests supply one at checkout. Email is the natural channel and
    costs nothing. Confirm whether SMS delivery updates are wanted later
    as an addition, which would reintroduce item 16.
19. **Who owns the Google Cloud project and OAuth credentials?** The
    client should own it, as with every other production account.
    **Launch gotcha:** the OAuth consent screen must be published to
    Production — in Testing mode only about 100 accounts can sign in.
    Basic `email` and `profile` scopes need no Google verification
    review, so publishing is quick, but it is a step that must not be
    forgotten.
20. **Phone is now unverified. Is that acceptable?** Phone OTP would
    have guaranteed a working mobile number, which matters in India
    because couriers call before delivery. With Google sign-in the
    email is verified and the phone is not, so a mistyped number means a
    failed delivery. Recommended: format-validate only and accept the
    risk, which is normal practice. **But if COD is enabled, reconsider**
    — unverified phone plus COD is a known fraud vector, and adding
    phone verification would bring DLT registration back. This decision
    is therefore coupled to the COD decision in item 4.
21. **Should a first Google sign-in claim past guest orders** placed
    with the same email address? Convenient for customers and
    straightforward to implement, since Google's email is verified. If
    not, guest orders stay permanently outside account history.
22. **How do guests look up an order?** They have no account. The design
    already links `#track`. Recommended: order number plus the email
    used at checkout. Confirm, and note this screen is needed in Phase
    0B whether or not item 21 is adopted.

Record answers in this document or the relevant architecture section. Do
not silently assume them.
