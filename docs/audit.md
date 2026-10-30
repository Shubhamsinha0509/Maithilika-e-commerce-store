# Phase 0 Audit — Findings

## Status

**Read-only audit complete. 2026-10-30.** No application code existed to modify; nothing was installed or changed except the documentation promotion described in section 1.

This document records what is actually in the repository, how it differs from the assumptions in `README.md`, `docs/architecture.md`, and `docs/database-schema.md`, and what must be decided before implementation.

## 1. Repository inventory

```text
.
├── CLAUDE.md, README.md, docs/     promoted to root on 2026-10-30
├── Design/                         READ-ONLY design reference
│   ├── *.dc.html                   13 Claude design-canvas files
│   ├── sarees.js                   product catalogue, 44 items
│   ├── support.js, image-slot.js, deck-stage.js   canvas runtime
│   ├── images/                     68 files, by category
│   ├── uploads/                    25 full-resolution source PNGs (~75 MB)
│   └── screenshots/                8 design review captures
└── site/
    └── images/                     56 web-optimised exports
```

### Correction to the stated status

`README.md` and `CLAUDE.md` both assume *"the existing frontend design is already implemented"* and that commands *"depend on the existing `package.json`"*. **That application does not exist.**

- No `package.json`, no `node_modules`, no `app/` or `src/`.
- No git repository anywhere under the project root.
- No backend, database, authentication, or integration code of any kind.
- No TypeScript, React, or Next.js source files.

The design exists only as `.dc.html` Claude design-canvas documents. These are not React components and cannot be imported into Next.js. They are a **visual and behavioural specification**, not a codebase.

**Consequence for the roadmap:** Phase 0 is not "audit an existing app". The frontend must be built from the design reference. This inserts a phase of work the original roadmap did not account for — see section 7.

### `site/`

Contains only images: the `Design/images` set minus the 12 presentation-only `deck/` files, with 8 PNGs converted to JPG. It is a partial, hand-made asset export with no code. Useful as the starting point for the media pipeline; not a site.

## 2. Screens that exist in the design

| Design file | Role | Notes |
|---|---|---|
| `Home.dc.html` | Homepage | The canonical homepage. 11 sections. |
| `Homepage.dc.html` | Earlier homepage | Superseded by `Home.dc.html`. |
| `Listing.dc.html` | Listing template | Parameterised by section. |
| `Clothing` / `HomeDecor` / `Paintings` / `Accessories.dc.html` | Listing routes | Thin wrappers importing `Listing`. |
| `Product.dc.html` | Product detail | Gallery, options, accordion detail panels. |
| `SiteHeader.dc.html` | Header + cart drawer | Nav, dropdown, search affordance, bag. |
| `SiteFooter.dc.html` | Footer | |
| `ProductCard.dc.html` | Product card | Shared by listing and homepage. |
| `Brand Board.dc.html` | Design system | Palette, type, components. |
| `Motif.dc.html` | Motif SVG set | Fish, lotus, peacock, sun. |
| `Mobile Views.dc.html` | 390px previews | Device frames over iframes. |

### Design system (to be preserved exactly)

- Indigo `#1B2F7A`, maroon `#6E1423`, gold `#C9A24B`, cream `#FBF6EA`, ink `#1A1410`, muted `#5A4A3E`.
- Yatra One (display) + Mukta (body), loaded from Google Fonts.
- Product imagery at 3:4 aspect ratio.

## 3. Screens the design promises but does not contain

Fourteen dead anchors in the design mark flows referenced in navigation and copy but having no screen:

`#checkout` · `#artists` · `#artist` · `#track` · `#wishlist` · `#size` · `#care` · `#details` · `#motifs` · `#shipping` · `#returns` · `#faq` · `#terms` · `#privacy`

The header's own navigation enum includes `artists` and `story` as destinations. Neither page exists.

**Checkout is the critical one.** The cart drawer's primary button points at `href="#checkout"`. There is no checkout design at all — no address form, no payment step, no order confirmation, no order-success screen. A checkout UI must be designed before it can be built.

## 4. The cart as it exists today

`Product.dc.html` writes to `localStorage` under the key `maithilika:cart` and dispatches a `maithilika:cart` event; the header drawer reads it and renders line items, quantity controls, remove, and a subtotal.

This is a **client-only prototype**. It has no server validation, no price re-verification, and no stock check. Per `CLAUDE.md` ("never trust prices, discounts, inventory quantities … supplied by the browser") the displayed subtotal must be treated as presentation only and recalculated server-side.

### WhatsApp ordering channel

The cart drawer carries a second, equally prominent action: **"Order this bag on WhatsApp"**, linking to a `[WhatsApp number]` placeholder. The homepage custom-order section does the same.

This implies a manual ordering channel alongside online checkout. It is not mentioned anywhere in `project.md`. **This needs a decision** — see section 8, item 5.

## 5. The catalogue (`Design/sarees.js`)

Real content, not placeholder text. 44 products across 4 sections.

| Section | Count | Subcategories |
|---|---|---|
| Clothing | 16 | Sarees 7, Stoles 6, Kurtas & Kurtis 2, Dupattas 1 |
| Paintings | 17 | On paper 12, On canvas 4, Framed 1 |
| Home decor | 6 | Bed linen 2, Cushion covers 2, Wall hangings 1, Table linen 1 |
| Accessories | 5 | Jewellery 2, Bags 1, Scarves 1, Handkerchiefs 1 |

### Per-product fields present

`id` `name` `motif` `motifHi` `fabric` `colour` `style` `price` `ready` `motifText` `section` `sub` `artist` `days` `img` `views` `opts` `optTitle` `defaultOpt` `includes` `medium` `frame` `edge` `priceLabel` `meta` `href` `iw` `ih` `ar` `cardW` `cardPos` `sizeLink`

The geometry fields (`iw`, `ih`, `ar`, `cardW`, `cardPos`) are canvas-rendering concerns and should **not** be carried into the database.

### Findings that shape the data model

1. **Prices:** ₹650 – ₹16,500, all 44 set. Store as integer paise.
2. **Availability:** 40 ready to ship, 4 made to order. `ready` is a boolean, not a stock count. **There are no stock quantities anywhere in the catalogue.**
3. **Variants are shallow.** Each product has *at most one* option group (`optTitle` + `opts`). Of the 37 products that have one, most are single-value display labels like `["As shown"]`. Only these are real multi-choice groups:
   - `Size` — XS S M L XL XXL — 4 clothing products
   - `Framing` — Framed / Unframed — paintings
   - `Edge` — With tassels / Plain hemmed
   - `Bed size` — Double / King
   - `Set` — Set of 2 / Single cover

   A full variant matrix is unnecessary. One option group per product is sufficient and is what the design actually renders.
4. **Artist is unresolved.** All 44 products carry the literal placeholder `[Artist name]`. The design has an Artists page in its navigation and artist attribution on every product. Artist is a real entity with real content still to be supplied.
5. **Lead time is unresolved.** All 44 carry `days: '[N]'`.
6. **Weak facets.** 35 of 44 products are `colour: Ivory`; 42 of 44 are `style: Bharni`. Filtering on these will feel broken until the catalogue grows.
7. **Gallery depth varies:** 7 products have no gallery views at all, 25 have 2, the rest 1–6.

## 6. Filters the design offers that the data cannot answer

`Listing.dc.html` defines per-section filter groups. Three facet keys have **no backing product field**:

| Facet | Used by | Problem |
|---|---|---|
| `size` | Paintings, Home decor | Paintings filter on Small (up to A4) / Medium (up to A3) / Large (up to A2) / Extra large; no product has dimensions. |
| `material` | Home decor, Accessories | Overlaps `fabric` but uses different values (`Silk`, `Linen`). |
| `type` | Home decor, Accessories | Appears to mean `sub`, but is a separate key. |

Several facet *values* also do not exist in the catalogue: fabric `Mulberry silk` and `Chanderi`, style `Kachni` (the catalogue has only `Bharni`, `Godna`, `Tantrik`).

The filter UI is therefore aspirational. Either the product model gains these attributes, or the facet lists must be derived from real catalogue values. **Recommendation: derive facets from the database**, so a filter can never offer a value that returns nothing.

### Sorts implemented

`Featured` · `Newest first` · `Ready to ship first` · `Made to order first` · `Price: low to high` · `Price: high to low`.

`Featured` has no backing field and currently means catalogue order — it needs an explicit position column.

## 7. Deltas against the existing proposals

### `docs/architecture.md`

The proposed stack (Next.js App Router, TypeScript, PostgreSQL/Neon, Prisma, Zod, Razorpay, Shiprocket, Cloudinary, Sentry) is **sound and unconstrained** — there is no existing app to be compatible with, so nothing blocks it. Recommend confirming as-is.

One addition required: the design must be ported to React components, so the architecture needs a stated approach for the design system (tokens, primitives, and the shared `ProductCard` / `SiteHeader` / `SiteFooter`).

### `docs/database-schema.md`

Needs revision against the real catalogue once decisions are answered:

- `ProductVariant` as proposed is heavier than needed. Replace with a single option group (label + values) per product, matching the design.
- Add the Mithila-specific attributes the storefront filters and reads: `motif`, `motifHi`, `motifText`, `fabric`, `style`, `colour`, `medium`, `frame`, `edge`, `includes`, `sub`.
- Add an **`Artist`** entity (name, village, bio, portrait, year) — the design requires it and the schema proposal omits it entirely.
- Add product dimensions, to make the paintings `size` filter real.
- Decide the stock model: the catalogue has a ready/made-to-order boolean, not quantities. If pieces are genuinely one-of-a-kind, stock is 0-or-1 per product and "overselling" means two customers buying the same unique painting.
- Add a `featured` / `position` column for the Featured sort.

### `docs/roadmap.md`

Phase 2 says *"Connect existing catalogue UI to real data"*. There is no UI in code to connect. A phase is required between Foundation and Catalogue: **port the design reference into Next.js components**.

## 8. Open decisions, ordered by what they block

> **Update 2026-10-30:** items 1, 2, 5, and 11 below are now answered —
> see `project.md` §9 "Confirmed". Those four answers raised five new
> decisions, recorded as items 11–15 in `project.md` §9, and added
> Phase 0B to the roadmap. The list below is kept as the original audit
> record.

### Blocking the data model (needed before Phase 1)

1. **Is every piece one-of-a-kind?** The ready/made-to-order boolean suggests unique hand-painted items. If so, stock is 0-or-1 and the concurrency problem is "two buyers, one painting". If items are repeatable, we need real stock counts — which the catalogue does not have. *This single answer changes the inventory model, the checkout reservation strategy, and the admin UI.*
2. **Guest checkout, accounts, or both?** Determines whether `User`, sessions, and order history exist at all.
3. **Are the 15 subcategories fixed**, and can a product belong to more than one?
4. **Who supplies the 44 artist names, villages, lead times, and the Artists page content?** Every product currently reads `[Artist name]`.

### Blocking checkout (needed before Phase 4)

5. **Is WhatsApp ordering a real channel or design decoration?** If real, it is a parallel order path with its own lifecycle and needs a decision on how those orders enter the system.
6. **Razorpay account ownership** and which methods are enabled.
7. **COD** — enabled at all? Order-value or PIN-code limits?
8. **Shipping** — Shiprocket confirmed? Who sets rates, the free-shipping threshold (`[₹ threshold]` in the header), and delivery promises?
9. **Tax and invoice requirements** — the cart shows a `[Shipping and tax note]` placeholder.
10. **Cancellation, return, exchange, refund policy** — the design links `#returns` with no content.

### Blocking design work (needed before Phase 3–4 UI)

11. **Checkout, order confirmation, order tracking, Artists, Our story, and the policy pages have no design.** Who designs them, and does `Design/` remain the source of truth for new screens?
12. **Is wishlist in scope?** It is in the header with a dead link. `project.md` does not mention it.

### Operational

13. Who owns the Razorpay, shipping, media storage, domain, and hosting accounts?
14. Which staff need admin access, and are permission levels required?

Nothing in sections 1–7 has been assumed. Record answers in `project.md` and in this section as they are confirmed.
