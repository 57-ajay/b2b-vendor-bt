# Firestore schema — Vendor Border-Tax Panel

Production data model for the vendor panel + customer intake, integrated with the
**suvidha** border-tax automation agent.

## Principles

- **Reads via realtime listeners.** The panel subscribes with `onSnapshot`,
  scoped by the vendor's `vendorId` custom claim. No polling.
- **Writes via callable Cloud Functions.** Browsers never write Firestore
  directly — `submit / start / intervene / cancel / settings / topup` are
  callables that validate, then write with the Admin SDK. This keeps wallet
  balances and the agent lifecycle tamper-proof. (`firestore.rules` therefore
  uses `allow write: if false` for clients; Admin-SDK writes bypass rules.)
- **The agent shares the request doc.** A dedicated suvidha instance is pointed
  at this project (Firestore + Storage) with
  `REQUEST_DOC_PATH_TEMPLATE = borderTaxRequests/{requestId}`. It writes only
  under the `aiAgentData.*` namespace (plus terminal top-level fields). It takes
  its inputs from the `POST /api/run` body — **not** by reading our doc — so the
  ownership split below is clean.
- **The agent API stays private.** Vendors/customers never call `/api/run` or
  `/intervene`. A Firestore trigger (`onStartRequested`) and the `intervene`
  callable hold the agent URL + `INTERNAL_API_KEY` server-side.

## Collections

```
vendors/{vendorId}                         vendor profile, branding, pricing, commission
vendors/{vendorId}/customers/{customerId}  vendor CRM; customerId doubles as the agent driverId
vendors/{vendorId}/stats/rollup            maintained dashboard counters (no scans at scale)
wallets/{vendorId}                         { balance, heldAmount, currency } — client read-only
wallets/{vendorId}/transactions/{txnId}    TOPUP | HOLD | COMMIT | RELEASE | REFUND ledger
borderTaxRequests/{requestId}              THE shared request doc (see below); requestId == agent jobId
loginIndex/{normalizedPhone}              { email } — phone→email login resolution, server-only
```

`borderTaxRequests` is a **flat top-level collection** (not nested under the
vendor) for two reasons: the agent's doc-path template only substitutes
`{requestId}`, and a flat collection with composite indexes scales to millions
of docs with constant-time vendor-scoped queries.

### `vendors/{vendorId}`

```ts
{
  vendorId: string;        // == doc id; mirrored to the Firebase Auth custom claim
  authUid: string;         // Firebase Auth uid
  businessName: string;
  email: string;           // login email (or synthetic, for phone-only vendors)
  phone: string;           // E.164, e.g. +9198XXXXXXXX
  subdomain: string;       // e.g. "saitransport" (future white-label)
  status: "active" | "suspended";
  brandLogoUrl: string;
  themeColor: string;
  pricing: { "border-tax": number; [service: string]: number };  // OUR fee (₹) per request
  commission: { mode: "percent" | "fixed"; value: number };      // vendor markup on the customer (tracking)
  notifyWebhook: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### `wallets/{vendorId}` (+ `transactions` subcollection)

```ts
// wallets/{vendorId}
{ vendorId: string; balance: number; heldAmount: number; currency: "INR"; updatedAt: Timestamp }

// wallets/{vendorId}/transactions/{txnId}
{
  txnId: string;
  type: "TOPUP" | "HOLD" | "COMMIT" | "RELEASE" | "REFUND";
  amount: number;          // ₹, integer
  refRequestId?: string;
  balanceAfter: number;
  createdAt: Timestamp;
  note?: string;
}
```

Money flow: `startRequest` **HOLD**s the service fee → on terminal,
`completed` ⇒ **COMMIT** (charge), `cancelled`/`failed` ⇒ **RELEASE** (refund the
hold). "Charged only when a receipt is produced." The government border tax
itself is paid directly by the customer via the UPI QR and never touches the
wallet.

### `borderTaxRequests/{requestId}` — the shared doc

**OURS** — written by callables, read by the agent only via the `/api/run` body:

```ts
{
  requestId: string;       // == doc id, == agent jobId
  vendorId: string;        // attribution (indexed)
  customerId: string;      // vendor CRM ref; passed to the agent as driverId (indexed)
  service: "border-tax";

  params: {                // → POST /api/run params (per-state; see suvidha validators)
    stateCode: "UP" | "HR" | "MP" | "PB";
    vehicleNumber: string;
    mobileNumber: string;
    taxMode: "DAYS" | "MONTHLY" | "QUARTERLY" | "YEARLY";
    taxFrom: string;       // YYYY-MM-DD
    taxUpto?: string;      // required when taxMode == DAYS
    entryDistrict?: string;
    entryCheckpoint?: string;
    permitType?: string;
    serviceType?: string;
  };

  customer: { name: string; mobile: string };   // denormalized for the vendor's list/CRM

  serviceFee: number;                            // ₹ held/charged from the vendor wallet
  commissionSnapshot: { mode: "percent" | "fixed"; value: number };

  start: {
    requested: boolean;          // vendor pressed "Start" → triggers dispatch
    requestedAt?: Timestamp;
    requestedByUid?: string;
    dispatchedAt?: Timestamp;    // onStartRequested called /api/run
    jobId?: string;              // == requestId
    dispatchError?: string;
  };

  // Denormalized, maintained by triggers for indexed queries / rollups:
  displayStatus: DisplayStatus;  // mapped from agent status (see Status model)
  needsAction: boolean;          // true when the vendor must act (captcha / pay / retry)

  createdAt: Timestamp;
}
```

**AGENT-OWNED** — written by the suvidha Admin SDK; clients never write these:

```ts
{
  aiAgentData: {
    status: AgentStatus;                 // the 13-state lifecycle below
    statusUpdatedAt: Timestamp;
    source: string;
    captcha?: {
      url: string; attempt: number; maxAttempts: number | null;
      lastResult: "awaiting_input" | "rejected" | "accepted";
      uploadedAt: Timestamp; inputDeadline: Timestamp | null; resultAt: Timestamp | null;
    };
    qrCode?: {
      url: string; uploadedAt: Timestamp; expiredAt: Timestamp;
      notificationSent: boolean; notificationSentAt: Timestamp | null;
    };
    portalAmount?: number;               // ₹ border tax read from the portal
    receipt?: { url: string; fields: Record<string, unknown>; uploadedAt: Timestamp };
    receiptGenerated?: boolean; paymentCompleted?: boolean;
    error?: { isError: boolean; message: string };
    transactionId?: string;
  };
  status?: "completed" | "cancelled" | "failed";  // top-level, terminal only
  manualReview?: { required: boolean; reason: string; resolved: boolean; ... };  // on failed
  cancelledDetails?: { cancelledAt: Timestamp; cancelledBy: string; reason: string };  // on cancelled
  receiptDocumentUrl?: string;           // on completed
  nextRequestAllowed?: Timestamp;
  agentCost?: { totalCost: number; totalTokens: number; ... };
  updatedAt: Timestamp;
}
```

All `aiAgentData.*` timestamps are Firestore `Timestamp` — read on the client
with `.toDate()` / `.toMillis()`.

## Status model

The agent's lifecycle (`AgentStatus`) is the source of truth; the panel renders a
coarser `DisplayStatus`. The mapping is centralized in `lib/status.ts`.

| `aiAgentData.status` (AgentStatus) | DisplayStatus    | needsAction | Meaning |
|---|---|---|---|
| _(none, `start.requested=false`)_  | `PENDING`        | yes | created; vendor can Start |
| `queued`                           | `QUEUED`         | — | enqueued, waiting for a worker slot |
| `aiAgentStarted`                   | `PROCESSING`     | — | browser filling the portal |
| `pendingTransaction`               | `PROCESSING`     | — | clearing a stuck in-flight tx |
| `pendingTransactionCaptcha`        | `ACTION_CAPTCHA` | yes | human captcha to clear pending tx |
| `captchaSolving`                   | `ACTION_CAPTCHA` | yes | human captcha — see `aiAgentData.captcha` |
| `settingUpPaymentRequest`          | `GATEWAY`        | — | captcha accepted, reaching gateway |
| `qrPaymentNeeded`                  | `AWAITING_PAYMENT` | yes | show QR; customer pays the tax |
| `verifyingPayment`                 | `VERIFYING`      | — | payment signal seen, confirming |
| `verifyingPendingPayment`          | `RECONCILING`    | — | parked; awaiting bank confirmation |
| `generatingReceipt`                | `GENERATING_RECEIPT` | — | capturing the e-receipt |
| `completed`                        | `COMPLETED`      | — | receipt uploaded (terminal) |
| `cancelled`                        | `CANCELLED`      | yes | stopped before money moved (retryable) |
| `failed`                           | `FAILED`         | yes | payment attempted/unconfirmed → manual review |

**Money rule:** through `captchaSolving` a stop is `cancelled` (safe, no money
moved); from `settingUpPaymentRequest` onward a stop is `failed`/reconcile.

## Indexes

See `firestore.indexes.json`. Composite indexes on `borderTaxRequests`:

1. `(vendorId ASC, createdAt DESC)` — the main Requests list (paginated).
2. `(vendorId ASC, displayStatus ASC, createdAt DESC)` — status-filtered list.
3. `(vendorId ASC, customerId ASC, createdAt DESC)` — a customer's history.
4. `(vendorId ASC, needsAction ASC, updatedAt DESC)` — the attention queue.

## Security

`firestore.rules`: a vendor reads only documents whose `vendorId` matches their
`request.auth.token.vendorId` claim (set by `provisionVendor`). All client writes
are denied; mutations flow through callables and the agent (Admin SDK, which
bypasses rules). `loginIndex` is server-only to prevent account enumeration.

## Scale (100K+)

- Flat collection + the composite indexes above → vendor-scoped queries stay
  fast regardless of total volume.
- The Requests screen paginates (`limit` + `startAfter`); it never loads the
  whole collection.
- The dashboard reads `vendors/{id}/stats/rollup` counters maintained by the
  `onStatusChange` trigger, instead of scanning/counting requests.
- The real throughput ceiling is the suvidha browser-worker fleet (one Xvfb
  display per job), not Firestore — size the worker pool separately.
