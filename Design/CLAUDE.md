# Design reference

This folder is the **approved design specification** for the Maithilika
store, and the single source of truth for how the application should look
and behave.

## Status: open for the Phase 0B design extension

As of 2026-10-30 this folder is **unfrozen for one specific purpose** —
designing the screens the store needs but does not yet have, plus three
corrections forced by confirmed business decisions. The work is listed in
`../docs/roadmap.md` under Phase 0B.

Outside that scope it is read-only.

## Rules

- **Only make changes that Phase 0B lists.** Anything else — a tweak you
  noticed in passing, a refactor, a "while I'm here" improvement — is out
  of scope. Ask first.
- Do not touch the shipped screens (`Home`, `Listing`, `Product`,
  `SiteHeader`, `SiteFooter`, `ProductCard`, `Brand Board`, `Motif`)
  except for the three corrections named in Phase 0B.
- New screens get their own `.dc.html` file, built from the existing
  tokens and components — import `SiteHeader`, `SiteFooter` and
  `ProductCard` rather than restyling from scratch.
- Match the design system exactly: indigo `#1B2F7A`, maroon `#6E1423`,
  gold `#C9A24B`, cream `#FBF6EA`, ink `#1A1410`, muted `#5A4A3E`;
  Yatra One for display, Mukta for body; product images at 3:4.
- Every new screen needs a 390px mobile layout, and should be added to
  `Mobile Views.dc.html` for review.
- Record each change in `../docs/audit.md` so the implementation can
  follow it.
- `sarees.js` is the real 44-product catalogue and the seed source for the
  database. Do not restructure it; content edits only, and note them.

## Once Phase 0B is approved

This folder refreezes. From that point: read from it freely, never write
to it. It is the reference the build is checked against — if it drifts,
there is nothing to check against.

## What this folder is

Claude design-canvas documents (`.dc.html`), not React. They render in the
design canvas and cannot be imported into the Next.js application. Treat
them as a visual and behavioural specification to rebuild from.

The application lives at the project root. See `../CLAUDE.md` for the
engineering instructions and `../docs/audit.md` for what this folder
contains and what it is missing.
