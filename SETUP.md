# Setup & test — Vendor Border-Tax Panel

End-to-end vendor app on Firebase (project **`b2b-vendor-74ee9`**). The AI agent is
**mocked server-side** for now, so you can test the whole flow today; point it at
the real agent later by setting `SUVIDHA_API_URL`.

## 0. One-time project setup (Firebase console)

1. **Firestore** → *Create database* → **Native mode**. *(Required — not enabled yet.)*
2. **Authentication → Sign-in method** → enable **Email/Password**. *(done ✓)*
3. **Project settings (⚙) → General → Your apps**: if there's no **Web app**
   (`</>`), add one (any nickname, skip Hosting). Copy its `firebaseConfig` — you
   need **apiKey**, **messagingSenderId**, **appId**. (projectId / authDomain /
   storageBucket are already pre-filled in the env template.)
4. **Upgrade to the Blaze plan** — Cloud Functions require it.

## 1. Env & key (gitignored — keep `.env.local`, don't rename the example)

- Put the service-account key at the repo root as **`service-account.json`**
  (the JSON you downloaded from *Project settings → Service accounts → Generate
  new private key*).
- `cp .env.local.example .env.local`, then fill the three Web values from step 0.3:
  `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`,
  `NEXT_PUBLIC_FIREBASE_APP_ID`. Keep `NEXT_PUBLIC_USE_MOCK=0`.
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
npx firebase login
npx firebase use b2b-vendor-74ee9

# Functions declare two secrets, so they must EXIST before deploy or it fails.
# For the mock path any value is fine (INTERNAL_API_KEY is only used by the real
# agent). Run each and type a value at the prompt:
npx firebase functions:secrets:set INTERNAL_API_KEY        # e.g. "unused"
npx firebase functions:secrets:set ADMIN_BOOTSTRAP_SECRET  # e.g. "change-me"

npx firebase deploy --only firestore:rules,firestore:indexes,functions
```

(Alternatively run everything locally: `npx firebase emulators:start` and set
`NEXT_PUBLIC_FIREBASE_EMULATORS=1` in `.env.local` — no Blaze/secrets needed.)

## 4. Create a vendor (this *is* the onboarding flow)

Vendors don't self-register — you create their credentials and share them. The
`provisionVendor` callable does exactly this (Auth user + `vendorId` claim +
vendor/wallet/public docs); the seed script runs the same logic with the
service-account key:

```bash
cd functions
# quick demo vendor (vendor@demo.in / vendor123, ₹5000 wallet):
npm run seed

# a real vendor — share the printed creds with them:
VENDOR_EMAIL=ops@theirbiz.com VENDOR_PASSWORD='Strong#Pass1' \
  VENDOR_NAME='Their Business' VENDOR_PHONE='+9198XXXXXXXX' TOPUP=5000 npm run seed
cd ..
```

It prints the login (email **or** phone + password) and the **customer link
`/r/{vendorId}`**. Add `ADMIN_EMAIL=you@x.com` to also grant yourself an admin
claim. There's no admin web page yet — ask and I'll add a "create vendor" screen
so you can onboard without the CLI.

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
