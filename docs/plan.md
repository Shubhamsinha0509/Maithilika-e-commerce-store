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

## Database: 4 tables

`prisma/schema.prisma`

- **Product:** everything the storefront shows, plus `sold`,
  `madeToOrder` and `hidden`.
- **Order:** customer details, address, a snapshot of the items and
  prices, total, status (`PENDING_PAYMENT → PAID → SHIPPED → DELIVERED`, or
  `CANCELLED`), Razorpay IDs, tracking link.
- **Customer:** a Google account's name, email and mobile number.
- **CustomRequest:** a custom order request: type, fabric, description, name,
  phone, who sent it, and when the owner contacted them.

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
- The "Meet the artists" homepage section and WhatsApp links are removed.
- Custom orders (2026-11-07, at the owner's request; replaces the earlier
  decision to leave them out): the hero's "Custom order" button opens
  `/custom-order`, one question at a time: tap a round photo (Saree, then Silk
  or Cotton, or Painting), write the idea, sign in with Google, and give a
  mobile number the first time only. Requests are in `/admin/requests`. The thank-you message promises contact within 1-2 hours,
  so each request also emails `support@maithilika.com`, once Resend is set up.
- Customer accounts (2026-11-07, at the owner's request): Google sign-in with
  a profile at `/account` (name, email, mobile). Required only for custom
  orders; buying stays open to guests, and checkout fills in the details of
  anyone signed in. Orders aren't linked to accounts yet, so there's no order
  history. Off until the three Google variables are set; until then
  `/custom-order` can't take requests.
- Emails (2026-11-07, through Resend, from `orders@maithilika.com`): the
  customer gets one confirmation with a "Track your order" link when an order
  is first paid; the shop gets one alert for each custom request. No email
  goes out if a piece was sold to someone else (the owner refunds and explains).
  A failed confirmation adds a note to the order. Off until `RESEND_API_KEY`
  is set. GoDaddy gets Resend's extra records only; the existing `MX` and `TXT`
  records for the business email stay as they are.
- Heritage theme (2026-11-04, from the owner's reference image): shaded
  wine maroon, parchment with a fine grain, antique gold, lotus rules between
  sections and under centred titles, gold leaf sprigs in panel corners, and a
  dark promise strip with gold dividers. Fonts and logo unchanged. All of it
  is in `globals.css` ("Heritage ornaments" and the tokens at the top).
- Home hero (2026-11-06, owner's photo): full-width photo with the words on
  the wall at its left; on phones the words sit under it. The owner's image
  had a logo, menu and text painted in, so these were removed and it was
  AI-upscaled to 3200×1800 (`public/images/home/hero-saree-hd.jpg`). A larger
  original without text would be sharper. It looks AI-generated: confirm the
  saree is a real piece, or replace the photo with one that is.
- Images (2026-11-04): every photo goes through the image optimiser (AVIF,
  WebP fallback), including the product gallery's CSS backgrounds. Optimised
  copies are cached for 31 days, so **to replace a photo, upload it under a
  new file name** (the same name would keep showing the old copy).
- Wishlist (added 2026-11-04 at the owner's request): a heart on cards and
  product pages, `/wishlist`, and a header count. Saved in the browser like
  the bag (product ids only, no account), so it is per device.
- Mobile header (2026-11-04): the wishlist heart made a third 44px icon, so
  the mobile row uses 8px gaps and 12/8px padding instead of the design's
  12/16/12. Below 375px (from 2026-11-06) the logo badge, wordmark, gaps and
  icon widths shrink too, so the header fits down to 320px.
- Owner's admin can manage orders and edit price, sold/available and
  hidden. Adding products with photos comes later.
- Hosting: Vercel and Neon, Singapore region.
- Logo and header (2026-11-07, owner's request for a more modern look): the
  peacock M and the MAITHILIKA lettering are cut out of the owner's logo onto
  transparency (`public/brand/mark.png`, `wordmark.png`, `wordmark-gold.png`
  for the footer), with no round badge. The header is light paper with dark
  text; on the home page it floats over the hero photo with a soft wash. On
  phones the logo scales with the screen to fit beside the three icons down
  to 320px. The tab icon, link preview and emails still use the round badge.
- Scrollbars (2026-11-07, owner's request): hidden everywhere; every area
  still scrolls by wheel, trackpad, touch and keyboard.
- Logo (2026-11-01): the owner's peacock "M" logo. The full logo is in
  `public/brand/logo.jpg`. The cropped mark is the header/footer badge and
  the browser icon, and the full logo is the link-preview image
  (`src/app/opengraph-image.jpg`).
- Theme (2026-11-01): maroon (#6E1423) and white, replacing the design's
  indigo. The colour lives in the `--brand` tokens in `globals.css`.

## Storefront preview (before checkout)

A private Vercel link for the owner to review. It goes public together
with checkout.

- The cart works; its Checkout button says "Checkout opens soon".
- Search covers product names, motifs and fabrics.
- Policy pages (`/contact`, `/policies/shipping`, `/policies/refunds`,
  `/policies/terms`, `/policies/privacy`) are linked in the footer. Details
  the owner hasn't confirmed show a "to be confirmed" marker; fill them in
  `src/lib/policies.ts`.
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
- [x] **2b. Test a real payment in Razorpay test mode.** Done 2026-11-05 on
      the developer's machine with the owner's test keys (Razorpay account
      in the name Nilu Devi; developer is a team Admin). Netbanking test
      payment: order marked Paid with the Razorpay payment id, amount
      matched Razorpay (captured), piece marked Sold, tracking page showed
      Paid. Test order deleted and piece made available again. The test-mode
      webhook is created in Razorpay (`payment.captured`).
- [ ] **2c. Switch checkout on for the live site.** Add `RAZORPAY_KEY_ID`,
      `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (and the admin
      variables) to Vercel, redeploy, and check the webhook delivery in
      Razorpay. Test keys only take test payments, so do this together with
      the live keys, or briefly to test the webhook
- [x] **3. Admin:** `/admin` with one password. Orders by status with
      search; order detail (status, tracking link, note; unpaid orders can
      only be cancelled); products (price, sold, hidden). Tested end to end
      through the real forms. To switch on: set `ADMIN_PASSWORD` and
      `ADMIN_SESSION_SECRET` in `.env` and on Vercel
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
| Policy pages (built; blanks in `src/lib/policies.ts`) | Legal name (as given to Razorpay), address, phone, court city; dispatch and delivery time; days to report damage; which pieces can be returned, return window and who pays return shipping; until when an order can be cancelled. Contact email is done |
| Product pages | Artist names, villages and painting days (pages hide these until filled), lead time for the 4 made-to-order pieces |
| Domain | `maithilika.com`, bought at GoDaddy. Contact email `support@maithilika.com` (GoDaddy Professional Email Pro Light, created 2026-11-04 as a **trial ending about 2026-11-22**: renew it, or move the same address to Zoho Mail's free plan before then) |

**Domain connected 2026-11-04:** https://www.maithilika.com is the main
address (`maithilika.com` redirects to it). GoDaddy DNS: `A @ 216.198.79.1`,
`CNAME www a286f2b545c7ada3.vercel-dns-017.com`. Email records unchanged.

**Connecting the domain:** keep the domain at GoDaddy and add
only the website records Vercel asks for (an `A` record and a `CNAME` for
`www`). Do **not** switch the nameservers to Vercel, and do not touch the
existing `MX`/`TXT` records, or the GoDaddy business email stops working.

## Later (not needed to launch)

- Order history and saved addresses on the customer's account
- A "shipped" email with the tracking link, and a "new order" email to the owner
- Cash on Delivery
- Automatic Shiprocket integration and PIN-code serviceability check
- Wishlist synced across devices (needs customer accounts), coupons, artist
  pages, invoices and GST breakdown
- Image upload to cloud storage (images live in `public/images` for now)
