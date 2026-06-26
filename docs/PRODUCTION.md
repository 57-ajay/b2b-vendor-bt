# Production go-live checklist

End-to-end steps to take the vendor border-tax panel live, plus the scale
guidance for 100K+ requests. See `docs/SCHEMA.md` for the data model and
`functions/README.md` for the function surface.

## 1. Firebase project

- [ ] Create the new Firebase project (the "vendor DB").
- [ ] Enable **Firestore** (Native mode) and **Cloud Storage**.
- [ ] Enable **Authentication → Email/Password**.
- [ ] (Recommended) Enable **App Check** with reCAPTCHA v3; note the site key.

## 2. App config

- [ ] Copy `.env.local.example` → `.env.local`; fill `NEXT_PUBLIC_FIREBASE_*`
      from Project settings → Your apps.
- [ ] Set `NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION` (e.g. `asia-south1` for India).
      **This must match** the functions' `FUNCTIONS_REGION`.
- [ ] Set `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` if using App Check.
- [ ] Build/host the Next app (`npm run build`) on your platform of choice.

## 3. Rules, indexes, functions

```bash
firebase deploy --only firestore:rules,firestore:indexes
cd functions && npm install && npm run build && cd ..
firebase deploy --only functions
```

- [ ] `functions/.env`: `FUNCTIONS_REGION`, `SUVIDHA_API_URL`,
      `BORDER_TAX_SERVICE_FEE`, `ENFORCE_APP_CHECK=1` (once App Check is live).
- [ ] Secrets: `firebase functions:secrets:set INTERNAL_API_KEY` and
      `... ADMIN_BOOTSTRAP_SECRET`.
- [ ] Confirm the composite indexes from `firestore.indexes.json` finished building.

## 4. suvidha agent (dedicated instance)

Follow `suvidhaAutomation/VENDOR_DEPLOYMENT.md`:

- [ ] Deploy a dedicated agent instance pointed at this project
      (`REQUEST_DOC_PATH_TEMPLATE=borderTaxRequests/{requestId}`, the new
      `GCS_BUCKET`/`GCS_PREFIX`, the new project's service account).
- [ ] Set the agent's `PUBLIC_API_KEY` = the functions' `INTERNAL_API_KEY` secret.
- [ ] Set the functions' `SUVIDHA_API_URL` = the agent's public HTTPS URL.
- [ ] Restrict the agent's GET routes + `/api/dashboard` at the proxy.

## 5. Bootstrap & verify

- [ ] Create the first vendor: call `provisionVendor` with `bootstrapSecret`
      (see `functions/README.md`). Grant yourself `{ admin: true }` for ongoing
      admin actions.
- [ ] Top up the vendor wallet (`adminTopup`) so `startRequest` can hold a fee.
- [ ] Open `/r/{vendorId}`, submit a test request; confirm it appears in the
      panel, Start dispatches, captcha/QR surface, and a receipt lands.

## Security checklist

- Firestore rules: clients read only their own `vendorId`-scoped docs; **all**
  writes go through callables / the agent (Admin SDK). Verify with the emulator.
- App Check on `submitBorderTaxRequest` (`ENFORCE_APP_CHECK=1`) to stop intake spam.
- The agent API is never called from the browser; the URL + key live in functions.
- `loginIndex` is server-only (no account enumeration).
- Rotate `INTERNAL_API_KEY` / `ADMIN_BOOTSTRAP_SECRET` periodically.

## Scale to 100K+

What already scales:
- Flat `borderTaxRequests` collection + composite indexes → vendor-scoped queries
  stay O(result), not O(total).
- Reads bound to a newest-first **window** (`NEXT_PUBLIC_REQUESTS_WINDOW`, default
  200), so the panel never loads the whole collection.
- `onRequestLifecycle` maintains `vendors/{id}/stats/rollup` counters.
- The real throughput ceiling is the browser-worker fleet (one display per job),
  **not** Firestore — size the worker pool / `MAX_SLOTS` for your concurrency.

Remaining work for very high-volume vendors (designed, not yet wired, so it can
be validated against a live project rather than shipped blind):

1. **Requests pagination.** Add `subscribeToRequestsPage(vendorId, { status?,
   cursor? })` using `startAfter(cursor)` + a "Load more" control on the Requests
   screen. Keep the bounded window for the dashboard/attention; paginate only the
   full list. Query uses the `(vendorId, displayStatus, createdAt)` index already
   present.
2. **Rollup-backed dashboard.** Add `subscribeToStats(vendorId)` reading
   `vendors/{id}/stats/rollup`; drive the headline metric counts from it (exact
   at any volume) instead of counting the in-memory window. Fall back to the
   window for the mock.
3. **Search.** For server-side search beyond the window (vehicle / mobile),
   add a denormalized lowercase field + index, or an external search index
   (Algolia / Typesense) fed by a trigger.
