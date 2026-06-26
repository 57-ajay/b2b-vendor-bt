# Cloud Functions — vendor border-tax panel

Server-side glue between the panel, Firestore, and the suvidha agent. Browsers
call **callables**; **Firestore triggers** keep the agent API private and the
wallet correct. All writes here use the Admin SDK (they bypass `firestore.rules`).

## Surface

**Callables**
| name | caller | purpose |
|---|---|---|
| `submitBorderTaxRequest` | public (App Check) | customer intake → creates the request doc |
| `startRequest` | vendor | atomic wallet **HOLD** + flag start (→ trigger dispatches) |
| `retryRequest` | vendor | re-HOLD + bump attempt for a failed/cancelled request |
| `intervene` | vendor | proxy `POST /api/jobs/:id/intervene {input}` (captcha) |
| `cancelRequest` | vendor | proxy `POST /api/jobs/:id/cancel` |
| `updateVendorSettings` | vendor | whitelist profile/branding/pricing edits (+ mirror to `vendorPublic`) |
| `requestWalletTopup` | vendor | record a pending top-up (admin fulfils) |
| `resolveLoginId` | public | phone → login email |
| `provisionVendor` | admin / bootstrap | Auth user + `{vendorId}` claim + vendor/wallet/public docs |
| `adminTopup` | admin | credit a wallet (TOPUP) |

**Triggers** (`borderTaxRequests/{requestId}`)
- `onStartRequested` — on a new `start.attempt`, `POST /api/run`; records `dispatchedAt`/`jobId` or `dispatchError`.
- `onRequestLifecycle` — denormalizes `displayStatus`/`needsAction`, settles the wallet on terminal (COMMIT/RELEASE, once), maintains `vendors/{id}/stats/rollup`.

## Config

`.env` (copy from `.env.example`): `FUNCTIONS_REGION`, `SUVIDHA_API_URL`,
`BORDER_TAX_SERVICE_FEE`, `ENFORCE_APP_CHECK`. Secrets via the CLI:

```bash
firebase functions:secrets:set INTERNAL_API_KEY
firebase functions:secrets:set ADMIN_BOOTSTRAP_SECRET
```

## Deploy

```bash
cd functions && npm install && npm run build
firebase deploy --only functions
firebase deploy --only firestore:rules,firestore:indexes
```

## Bootstrap the first vendor

With no admin yet, call `provisionVendor` once with the bootstrap secret:

```js
// in a browser console on the app origin, or via the Functions emulator
httpsCallable(functions, "provisionVendor")({
  bootstrapSecret: "<ADMIN_BOOTSTRAP_SECRET>",
  businessName: "Sai Transport", email: "ops@sai.example", password: "••••••",
  phone: "+9198XXXXXXXX",
});
```

To make someone an **admin**, set a custom claim `{ admin: true }` on their
Auth user (Firebase console or the Admin SDK), then they can call
`provisionVendor` / `adminTopup` without the bootstrap secret.
