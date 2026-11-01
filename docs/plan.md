# Maithilika — launch plan

The goal is a working store: customers browse, pay online, and the owner
ships. Anything not needed for that is listed under "Later".

Earlier, longer planning docs (audit, architecture, schema proposal,
roadmap) were replaced by this file on 2026-10-31. They are in git history
(`git show cdea279:docs/roadmap.md`).

## How the store works

1. **Browse.** Home, four category pages (Clothing, Home Decor, Paintings,
   Accessories) with filters and sort, product pages. Built from the
   approved design in `Design/`.
2. **Cart.** Kept in the browser (localStorage). No account needed.
3. **Checkout.** One page: name, email, phone, address, PIN code. The
   server recalculates every price from the database. It never trusts the
   browser.
4. **Pay.** Razorpay (UPI, cards, netbanking). The server creates the
   Razorpay order, then verifies the payment signature before marking the
   order paid. A Razorpay webhook also marks it paid, in case the customer
   closes the tab right after paying. Both paths are safe to repeat.
5. **Confirmation.** The customer sees an order number. They can look the
   order up later with that number and their email.
6. **Fulfil.** The owner opens `/admin`, sees paid orders, books the
   courier themselves (for example, on the Shiprocket website), pastes the
   tracking link, and marks the order shipped, then delivered.

## Stock

- **One-of-a-kind pieces** (40 products) are marked `sold` when paid for,
  and disappear from the shop.
- **Made-to-order pieces** (4 products) never sell out.
- If two people pay for the same one-of-a-kind piece at the same moment,
  the second order is still recorded as paid, with a note telling the
  owner to refund it from the Razorpay dashboard. This is rare for a small
  shop, and much simpler than a reservation system.

## Database: 2 tables

`prisma/schema.prisma`

- **Product:** everything the storefront shows, plus `sold`,
  `madeToOrder` and `hidden`.
- **Order:** customer details, address, a snapshot of the items and
  prices, total, status (`PENDING_PAYMENT → PAID → SHIPPED → DELIVERED`, or
  `CANCELLED`), Razorpay IDs, tracking link.

Categories, motif meanings and store settings (shipping fee, free-shipping
threshold) are constants in code, not tables.

## Admin

`/admin`, protected by one password (`ADMIN_PASSWORD` in `.env`). The owner can:

- see and search orders, update status, add a tracking link and note
- edit a product's price, availability and visibility
- add a new product with a photo *(after launch if time is short; until
  then, products are added to `scripts/seed.mjs`)*

## Decisions (2026-10-31)

- Sold one-of-a-kind pieces stay visible with a "Sold" label and no
  "Add to bag" button.
- Online payment only (Razorpay). No Cash on Delivery.
- Shipping: a flat fee, free above an order value. Placeholders ₹99 and
  free above ₹2,999 until the owner sets real numbers.
- Placeholder details (artist name, painting days, address, phone, email,
  return window, year) are hidden until real values exist.
- The "Meet the artists" homepage section, WhatsApp links, the custom-order
  section and the wishlist are removed.
- Owner's admin can manage orders and edit price, sold/available and
  hidden. Adding products with photos comes later.
- Hosting: Vercel and Neon, Singapore region.

## Storefront preview (before checkout)

A private Vercel link for the owner to review. It goes public together
with checkout.

- The cart works; its Checkout button says "Checkout opens soon".
- Search covers product names, motifs and fabrics.
- Footer help and policy links are hidden until those pages exist.
- Search engines are told not to index the site (`noindex`).

## Build order

- [x] Next.js app, Prisma, simplified schema, first migration, seed script
- [x] Neon database created (Singapore), tables made, 44 products loaded
- [x] **1. Storefront:** port the design (header, cart drawer, footer, home,
      listing, product page, search), reading products from the database
- [x] Preview deployed: https://maithilika.vercel.app (developer's Vercel
      Hobby account for now; `DATABASE_URL` and `DIRECT_URL` set there;
      Singapore region in `vercel.json`)
- [x] **2. Checkout and payment:** checkout page, Razorpay, verify,
      webhook, confirmation page, order lookup (`/order`). Built and
      tested without Razorpay (validation; webhook signature, wrong amount,
      double delivery, sold marking). Switches on when the keys are set.
- [ ] **2b. Test a real payment in Razorpay test mode.** Needs the owner's
      test keys: add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and
      `RAZORPAY_WEBHOOK_SECRET` to `.env` and to Vercel, add the webhook
      (`https://<site>/api/razorpay/webhook`, event `payment.captured`),
      then redeploy
- [ ] **3. Admin:** login, orders, product edits
- [ ] **4. Launch:** Razorpay live keys, policy pages (Terms, Privacy and
      Refund are needed for Razorpay activation), real shipping numbers,
      remove `noindex`, connect the domain, move the Neon project and
      Vercel to the owner's account (Neon is on the developer's account
      for now), test one real order end to end

## Needed from the owner

| Needed for | What |
|---|---|
| Database | Create a free Neon project; send the two connection strings |
| Payments | Razorpay account (needs PAN and bank details; activation takes a few days, so start now). Test keys work immediately |
| Checkout | Shipping fee and free-shipping threshold |
| Policy pages | Return window, shipping time, contact email/phone, address |
| Product pages | Artist names, villages and painting days (pages hide these until filled), lead time for the 4 made-to-order pieces |
| Domain | Bought at GoDaddy, with business email included. Need the domain name and which address to show as the shop's contact email |

**Connecting the domain (at launch):** keep the domain at GoDaddy and add
only the website records Vercel asks for (an `A` record and a `CNAME` for
`www`). Do **not** switch the nameservers to Vercel, and do not touch the
existing `MX`/`TXT` records, or the GoDaddy business email stops working.

## Later (not needed to launch)

- Customer accounts and Google sign-in (order history, saved addresses)
- Order confirmation emails (Resend, free tier)
- Cash on Delivery
- Automatic Shiprocket integration and PIN-code serviceability check
- Wishlist, coupons, artist pages, invoices and GST breakdown
- Image upload to cloud storage (images live in `public/images` for now)
