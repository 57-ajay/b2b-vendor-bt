# Driver Panel — TaxFlow (Next.js migration)

A **1:1 migration** of the "Driver Panel" border-tax automation vendor console
from a single-file HTML/CSS/JS design-tool export (`Driver Panel.dc.html` +
`support.js`, the *dc-runtime*) to a modern **Next.js** application.

This is a source-code translation, **not** a redesign: the app is intended to be
visually, functionally, and behaviourally identical to the original.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** (design tokens via `@theme inline`; theme/keyframes in `app/globals.css`)
- **shadcn/ui** foundation (`components.json`, `cn()` in `lib/utils.ts`)
- **three.js r128** (loaded from the original CDN) for the dashboard chart

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
# npm run build && npm run start   # production
```

Demo login is pre-filled (`operator@taxflow.in` / `demo1234`); any email + a
password of 4+ characters signs in. All data is served by an in-memory mock
service that simulates the government-portal request lifecycle.

## Architecture

The original was one stateful component (`Component extends DCLogic`) whose
`renderVals()` produced a flat view-model that a template bound against. That
shape is preserved:

```
app/
  layout.tsx        Root layout; loads Poppins + JetBrains Mono (same CDN links)
  page.tsx          Renders <DriverPanel/>
  globals.css       Original <style> ported verbatim: theme variables
                    (:root / [data-theme=dark]), ambient body::before/::after,
                    scrollbar, all keyframes; Tailwind theme+utilities (no preflight)
components/
  DriverPanel.tsx   Stateful container (class component): mock service, state,
                    lifecycle (subscriptions / 1s tick / live-arrival), and the
                    full renderVals() that builds the ViewModel
  GrowthChart.tsx   three.js WebGL bar chart (initThree/teardownThree ported 1:1)
  Login, Sidebar, Topbar, ProfileMenu, Dashboard, Requests, RequestDetail,
  Wallet, Receipts, Settings, Pricing, ConfirmModal, ReceiptModal, Toasts
                    Presentational views — each binds to the ViewModel and keeps
                    the original inline styles exactly
lib/
  constants.ts      STATUS_META, STEP_DEFS, RANK, FAIL_REASON, fmtMoney, pad
  mock-service.ts   MockDriverPanelService (timers, subscriptions, lifecycle sim)
  month-data.ts     Shared per-day request curve for the chart + dashboard ticks
  utils.ts          shadcn cn()
types/
  index.ts          Domain types + the ViewModel interface
```

## Fidelity notes

- **Styling:** the source is almost entirely dynamic inline styles built on CSS
  custom properties, so the inline styles are preserved verbatim as React style
  objects. Tailwind carries the palette as tokens (`@theme inline`) and the two
  `style-hover="…"` effects from the dc-runtime become the `.hov-*` classes in
  `globals.css`. Tailwind preflight is intentionally **not** imported so the
  reset environment matches the original (which shipped no Tailwind reset).
- **Fonts** are loaded via the same Google Fonts stylesheet link as the original
  so the literal `Poppins` / `JetBrains Mono` family names resolve unchanged.
- **three.js** is the same r128 build from the original CDN; the shader,
  geometry, easing and theme reaction are ported unchanged.
- The original source files were removed from the working tree (they remain in
  git history) per the migration request.
