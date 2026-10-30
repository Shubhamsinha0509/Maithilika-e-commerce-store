# Client E-commerce Website

A full-stack e-commerce website for a client to list products, accept
customer orders, collect online payments or Cash on Delivery where
enabled, and deliver across India.

The store is **Maithilika**, selling hand-painted Mithila (Madhubani) art:
clothing, paintings, home decor, and accessories.

> **Current status (2026-10-30):** Phase 0 complete. The approved frontend
> **design** is ready as a specification in `Design/`, but **no application
> code exists yet** — no `package.json`, no framework, no database, no
> integrations. The design must be built as a Next.js application.
> See [`docs/audit.md`](docs/audit.md) for the full audit and
> [`docs/roadmap.md`](docs/roadmap.md) for the plan.

## Project goals

- Preserve the approved frontend design.
- Allow customers to discover and purchase products.
- Give the client a secure way to manage products, inventory, and orders.
- Support India-wide delivery subject to courier serviceability.
- Process payments securely and reconcile payment status reliably.
- Provide a maintainable codebase suitable for production operation.

## Intended technology

See [`docs/architecture.md`](docs/architecture.md). The proposed direction
is Next.js App Router, TypeScript, PostgreSQL (Neon), and Prisma. The audit
found no existing code constraining this choice, so the stack is
unconstrained — it needs confirmation, not compatibility checking.

## Repository structure

```text
.
├── CLAUDE.md                  engineering instructions
├── README.md
├── docs/
│   ├── audit.md               Phase 0 findings and open decisions
│   ├── project.md             business requirements and scope
│   ├── architecture.md        proposed technical design
│   ├── database-schema.md     proposed data model
│   └── roadmap.md             phased plan and progress tracker
├── Design/                    READ-ONLY approved design reference
│   ├── *.dc.html              13 design-canvas documents
│   ├── sarees.js              44-product catalogue (database seed source)
│   ├── images/                design image set
│   └── uploads/               full-resolution source images
└── site/
    └── images/                web-optimised image exports
```

The application itself does not exist yet. When scaffolded it will live at
the project root alongside these folders.

## Design reference

`Design/` is frozen and read-only — see `Design/CLAUDE.md`. It contains
Claude design-canvas documents, which are **not** React components and
cannot be imported. They are the visual and behavioural specification to
rebuild from. `Design/screenshots/` and `Design/Mobile Views.dc.html` are
the reference for verifying desktop and 390px parity.

## Local development

Requires Node 18.18+ (developed on 22.20).

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint; Design/ and site/ are ignored
npm run typecheck  # next typegen && tsc --noEmit
npm run build      # production build
```

All four verified passing on 2026-10-31. `typecheck` runs `next typegen`
first because Next 16 generates types such as `LayoutProps` into
`.next/types`; without it, a cold `tsc --noEmit` fails.

**`Design/` and `site/` are excluded from ESLint and TypeScript.** They
are read-only reference material, and linting them reports errors that
must not be fixed.

## Environment variables

Create a local `.env.example` containing variable names only. Never commit
real values.

The final list depends on the selected integrations. Likely categories:
database connection; authentication provider, if customer accounts are
enabled; Razorpay public and secret credentials; Razorpay webhook secret;
shipping provider credentials; product image storage credentials; Sentry
DSN.

See `docs/architecture.md` for integration notes.

## Project documentation

- [`docs/audit.md`](docs/audit.md): what is actually in the repository,
  deltas against the proposals, and the open decisions blocking each phase
- [`docs/project.md`](docs/project.md): business requirements and scope
- [`docs/architecture.md`](docs/architecture.md): proposed technical design
  and integration boundaries
- [`docs/database-schema.md`](docs/database-schema.md): proposed data model
- [`docs/roadmap.md`](docs/roadmap.md): phased implementation plan and
  progress tracker

## Important

This repository is a client project. Production credentials, payment
accounts, shipping accounts, domains, and hosting should be owned or
approved by the client. Do not deploy live payments until test-mode flows,
webhook verification, order reconciliation, and operational procedures have
been tested.
