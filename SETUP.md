# Setup & test — Vendor Border-Tax Panel

End-to-end vendor app on Firebase (project **`b2b-vendor-74ee9`**). The AI agent is
**mocked server-side** for now, so you can test the whole flow today; point it at
the real agent later by setting `SUVIDHA_API_URL`.

## 0. One-time project setup (Firebase console)

1. **Firestore** → create database (Native mode). *(Required — it isn't enabled yet.)*
2. **Authentication** → enable **Email/Password**.
3. **Project settings → Your apps** → add/copy the **Web app** SDK config
   (apiKey, messagingSenderId, appId).
4. Functions need the **Blaze** plan (pay-as-you-go).

## 1. Secrets & env (already gitignored — never committed)

- Place the service-account key at the repo root as **`service-account.json`**.
- `cp .env.local.example .env.local` and fill the three remaining Web values
  (`NEXT_PUBLIC_FIREBASE_API_KEY`, `…_MESSAGING_SENDER_ID`, `…_APP_ID`).
  Keep `NEXT_PUBLIC_USE_MOCK=0`.
- `cp functions/.env.example functions/.env`. Leave `SUVIDHA_API_URL` **blank**
  to use the built-in mock agent. (Region defaults to `us-central1`; if you
  change `FUNCTIONS_REGION`, set `NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION` to match.)

## 2. Install

```bash
npm install
cd functions && npm install && cd ..
```

## 3. Deploy rules, indexes & functions

```bash
npx firebase use b2b-vendor-74ee9
npx firebase deploy --only firestore:rules,firestore:indexes,functions
```

(Alternatively run everything locally: `npx firebase emulators:start` and set
`NEXT_PUBLIC_FIREBASE_EMULATORS=1` in `.env.local`.)

## 4. Seed a demo vendor

```bash
cd functions && npm run seed && cd ..
```

Prints a vendor login (`vendor@demo.in` / `vendor123`, or the phone) and the
**customer link `/r/{vendorId}`** with a ₹5000 wallet. Add `ADMIN_EMAIL=you@x.com`
to also grant yourself an admin claim (for `provisionVendor` / `adminTopup`).

## 5. Run & test the full flow

```bash
npm run dev   # http://localhost:3000
```

1. **Vendor**: sign in with the seeded email/phone + password.
2. **Customer**: open `/r/{vendorId}` (incognito), pick a state, fill vehicle +
   mobile + tax-from (+ days), submit. It appears live in the vendor's Requests.
3. **Vendor**: open the request → **Start process** (₹150 is held from the wallet).
4. Watch the mock agent: **Captcha needed** → type any code → **Submit**;
   then **Awaiting payment** shows a QR → **Simulate customer payment (test)** →
   **Verifying → Receipt → Completed**. The wallet hold is **committed** on
   completion (released on cancel/fail). The receipt is viewable/downloadable.

If you just wait instead of clicking, the `mockAgentSweeper` advances unattended
requests (~1 step/min). The interactive buttons make it instant.

## 6. Going live with the real agent (later)

- Deploy your suvidha agent pointed at this project's Firestore + Storage with
  `REQUEST_DOC_PATH_TEMPLATE=borderTaxRequests/{requestId}`.
- Set the agent URL + key on Functions:
  ```bash
  # functions/.env
  SUVIDHA_API_URL=https://your-agent.example.com
  # secret:
  npx firebase functions:secrets:set INTERNAL_API_KEY
  npx firebase deploy --only functions
  ```
  With `SUVIDHA_API_URL` set, the mock is bypassed and Functions call the real
  agent (`/api/run`, `/intervene`, `/cancel`); everything else is unchanged.
- Optional hardening: set `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` (reCAPTCHA v3)
  and `ENFORCE_APP_CHECK=1` to require App Check on the public intake.

See `docs/SCHEMA.md` for the data model and `functions/README.md` for the
callable/trigger surface.
