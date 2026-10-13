# Urban Fresh — PRD

## Original Problem Statement
Develop a website for **Urban Fresh** where users can order fruit buckets/hampers. Design must exactly match the provided screenshots (desktop + mobile views). Fully responsive, fully functional, everything dynamic. Admin panel required to manage inventory, enquiries history and users.

## User Choices (confirmed)
- Order enquiries sent to **Slack via incoming webhook** (WhatsApp deferred; webhook URL editable in admin Settings)
- Admin panel: **JWT email/password** login
- Customers: **no login** — guest ordering, users auto-captured from enquiries
- Scope: Home + Hamper detail + Fruit detail/Custom builder + Cart/Checkout + Admin

## Architecture
- **Backend**: FastAPI (`/app/backend/server.py`), all routes under `/api`, MongoDB via motor. Seed catalog/content in `/app/backend/seed_data.py`. JWT (PyJWT) + bcrypt, admin seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` on startup. Slack notification via httpx POST to `settings.slack_webhook_url` (falls back to `SLACK_WEBHOOK_URL` env).
- **Frontend**: React 19 + React Router 7 + Tailwind, `@/` alias. Cart in localStorage via `CartContext`. Storefront and admin shells split in `App.js`.
- **Collections**: `hampers`, `fruits`, `enquiries`, `customers`, `settings`, `admins`. UUID string ids, no raw ObjectId ever returned.

## Design System
Mint `#eaf6e4` canvas, deep forest `#0f3d23`, orange accent `#e4601f`, cream cards `#fcfdf8`. Fraunces (display) + Outfit (UI). Pill chips, soft 2xl cards, hover-lift micro-interactions, noise overlay.

## User Personas
1. **Gift buyer** — orders a curated hamper for an occasion, wants premium presentation and fast delivery.
2. **Wellness/recovery buyer** — needs specific fruits, builds a custom bucket by weight.
3. **Corporate buyer** — bulk prestige hampers, needs invoice-style confirmation via call.
4. **Urban Fresh admin** — manages catalog stock, triages enquiries, tracks customers.

## Core Requirements (static)
- Dynamic catalog driven entirely by the database (no hardcoded products in the UI)
- Hamper ordering + custom fruit bucket builder with live capacity/total
- Guest checkout producing an enquiry + Slack notification
- Admin: inventory CRUD, enquiry history with status pipeline, user list, site settings
- Pixel-faithful match to screenshots, fully responsive incl. mobile sticky action bars

## Implemented (2026-06)
- **2026-06**: Home page — hero with live featured hamper, 8-curation rail, promise strip, hamper grid with curation filters, Urban Fresh Difference, custom-builder CTA, testimonials
- **2026-06**: Hamper detail — front/inside view toggle, produce manifest, qty selector, add-to-bucket + express buy, customization policy, related rail, mobile sticky bar
- **2026-06**: Custom fruit builder — variant selector, live hamper manifest with 4 kg capacity bar, harvest shelf add, nutrition/packaging tabs, review → checkout
- **2026-06**: Cart drawer + checkout enquiry form → `/api/enquiries` → Slack + customer capture, success screen with reference
- **2026-06**: Admin panel — JWT login, dashboard (5 stat cards, 7-day trend, top items, status breakdown, latest enquiries), inventory CRUD for hampers & fruits, enquiries history with status pipeline + details, users with search & block toggle, settings with Slack webhook + test send
- **2026-06**: QA iteration 1 — 21/21 backend tests, 12/12 frontend flows, mobile 390x844 verified, zero defects

## Backlog
- **P0**: Real Slack webhook URL to be pasted into admin Settings by owner
- **P1**: WhatsApp order handoff (wa.me deep link or Business API), image upload for catalog items (currently URL field), hamper gallery multi-image editor in admin
- **P1**: Pincode serviceability check on the live pincode selector
- **P2**: Customer accounts + order history, coupon codes, online payments, gourmet add-ons and gift-message step in the builder, CSV export of enquiries, email confirmations via Resend

## Next Tasks
1. Owner pastes the Slack incoming webhook URL in Admin → Settings and runs "Send Slack Test"
2. Add WhatsApp order handoff alongside Slack
3. Add object-storage image uploads for admin catalog management
