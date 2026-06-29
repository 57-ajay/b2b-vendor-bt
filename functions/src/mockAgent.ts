import { onSchedule } from "firebase-functions/v2/scheduler";

import { db, FieldValue, now, Timestamp } from "./admin";

/**
 * Built-in MOCK agent. Used when SUVIDHA_API_URL is unset so the whole vendor
 * flow is testable end-to-end without the real browser agent. It drives
 * aiAgentData.status through the real lifecycle; the onRequestLifecycle trigger
 * then denormalizes displayStatus and settles the wallet exactly as in prod.
 *
 *   Normal (attended) path is snappy: mockStart runs queued→started→captcha
 *   inline; the vendor submits the captcha (any code) → gateway→QR; the
 *   "simulate payment" test action → verifying→receipt→completed.
 *   mockAgentSweeper is the unattended fallback (1 step/min) + crash recovery.
 *
 * Captcha/QR/receipt images are tiny inline SVG data-URIs (clearly demo).
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function svgDataUri(svg: string): string {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
function randomCode(len = 5): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
function portalAmount(): number {
  return 360 + Math.floor(Math.random() * 11) * 20; // ₹360–560
}
function captchaImage(code: string): string {
  return svgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='64'><rect width='200' height='64' fill='#f3f4f8'/><g stroke='#c9cce4' stroke-width='1'><line x1='0' y1='18' x2='200' y2='30'/><line x1='0' y1='50' x2='200' y2='38'/></g><text x='100' y='43' font-family='monospace' font-size='30' font-weight='700' letter-spacing='6' fill='#1b2150' text-anchor='middle'>${code}</text></svg>`,
  );
}
function qrImage(): string {
  let cells = "";
  for (let y = 0; y < 10; y++)
    for (let x = 0; x < 10; x++)
      if (Math.random() > 0.5)
        cells += `<rect x='${8 + x * 14}' y='${8 + y * 14}' width='14' height='14'/>`;
  return svgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='160' height='160' fill='#fff'/><g fill='#0a0f4d'>${cells}</g><rect x='66' y='66' width='28' height='28' fill='#fff'/><text x='80' y='85' font-family='sans-serif' font-size='11' font-weight='700' fill='#0a0f4d' text-anchor='middle'>DEMO</text></svg>`,
  );
}
function receiptImage(ref: string, amt: number): string {
  return svgDataUri(
    `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='200'><rect width='360' height='200' fill='#fff' stroke='#e3e6ee'/><text x='20' y='42' font-family='sans-serif' font-size='18' font-weight='700' fill='#0e7c5a'>Border Tax Receipt (DEMO)</text><text x='20' y='82' font-family='monospace' font-size='14' fill='#14151a'>Ref: ${ref}</text><text x='20' y='112' font-family='monospace' font-size='14' fill='#14151a'>Amount: Rs ${amt}</text><text x='20' y='142' font-family='monospace' font-size='12' fill='#6b7280'>Paid via UPI</text></svg>`,
  );
}

const TERMINAL = ["completed", "cancelled", "failed"];

async function statusOf(requestId: string): Promise<string | undefined> {
  const snap = await db.doc(`borderTaxRequests/${requestId}`).get();
  return snap.data()?.aiAgentData?.status as string | undefined;
}

async function setStatus(
  requestId: string,
  status: string,
  extra: Record<string, unknown> = {},
): Promise<void> {
  await db.doc(`borderTaxRequests/${requestId}`).update({
    "aiAgentData.status": status,
    "aiAgentData.statusUpdatedAt": now(),
    updatedAt: now(),
    ...extra,
  });
}

async function setCaptcha(requestId: string): Promise<void> {
  await setStatus(requestId, "captchaSolving", {
    "aiAgentData.captcha": {
      url: captchaImage(randomCode()),
      attempt: 1,
      maxAttempts: 3,
      lastResult: "awaiting_input",
      uploadedAt: now(),
      inputDeadline: Timestamp.fromMillis(Date.now() + 120000),
      resultAt: null,
    },
  });
}

async function setQr(requestId: string): Promise<void> {
  await setStatus(requestId, "qrPaymentNeeded", {
    "aiAgentData.qrCode": {
      url: qrImage(),
      uploadedAt: now(),
      expiredAt: Timestamp.fromMillis(Date.now() + 170000),
      notificationSent: false,
      notificationSentAt: null,
    },
    "aiAgentData.portalAmount": portalAmount(),
  });
}

async function complete(requestId: string): Promise<void> {
  const snap = await db.doc(`borderTaxRequests/${requestId}`).get();
  const amt = Number(snap.data()?.aiAgentData?.portalAmount) || portalAmount();
  const ref = "GOV-" + Math.floor(10000000 + Math.random() * 89999999);
  const url = receiptImage(ref, amt);
  await db.doc(`borderTaxRequests/${requestId}`).update({
    "aiAgentData.status": "completed",
    "aiAgentData.statusUpdatedAt": now(),
    "aiAgentData.receipt": {
      url,
      fields: {
        receiptNumber: ref,
        amount: amt,
        paymentDate: new Date().toISOString().slice(0, 10),
        bankRef: ref,
      },
      uploadedAt: now(),
    },
    "aiAgentData.receiptGenerated": true,
    "aiAgentData.paymentCompleted": true,
    status: "completed",
    receiptDocumentUrl: url,
    mockActive: false,
    updatedAt: now(),
  });
}

/** Advance exactly one lifecycle step (no delay). Used by the sweeper. */
async function advanceOne(requestId: string): Promise<string | null> {
  const snap = await db.doc(`borderTaxRequests/${requestId}`).get();
  const d = snap.data();
  if (!d || TERMINAL.includes(d.status)) return null;
  const st = d.aiAgentData?.status as string | undefined;
  switch (st) {
    case "queued":
      await setStatus(requestId, "aiAgentStarted");
      return "aiAgentStarted";
    case "aiAgentStarted":
      await setCaptcha(requestId);
      return "captchaSolving";
    case "captchaSolving":
    case "pendingTransactionCaptcha":
      await setStatus(requestId, "settingUpPaymentRequest", {
        "aiAgentData.captcha.lastResult": "accepted",
        "aiAgentData.captcha.resultAt": now(),
      });
      return "settingUpPaymentRequest";
    case "settingUpPaymentRequest":
      await setQr(requestId);
      return "qrPaymentNeeded";
    case "qrPaymentNeeded":
      await setStatus(requestId, "verifyingPayment");
      return "verifyingPayment";
    case "verifyingPayment":
      await setStatus(requestId, "generatingReceipt");
      return "generatingReceipt";
    case "generatingReceipt":
      await complete(requestId);
      return "completed";
    default:
      return null;
  }
}

/** Snappy lead-in: dispatch → queued → started → captcha (then wait for input). */
export async function mockStart(requestId: string): Promise<void> {
  await db.doc(`borderTaxRequests/${requestId}`).update({
    mockAgent: true,
    mockActive: true,
    "start.dispatchedAt": now(),
    "start.jobId": requestId,
    "start.dispatchError": FieldValue.delete(),
    "aiAgentData.status": "queued",
    "aiAgentData.statusUpdatedAt": now(),
    updatedAt: now(),
  });
  await sleep(2200);
  if ((await statusOf(requestId)) !== "queued") return;
  await setStatus(requestId, "aiAgentStarted");
  await sleep(2600);
  if ((await statusOf(requestId)) !== "aiAgentStarted") return;
  await setCaptcha(requestId);
}

/** Vendor submitted a captcha code (any code, mock) or simulated payment. */
export async function mockIntervene(
  requestId: string,
  input: string,
): Promise<void> {
  const st = await statusOf(requestId);
  if (st === "captchaSolving" || st === "pendingTransactionCaptcha") {
    if (!input || !input.trim()) return;
    await advanceOne(requestId); // → settingUpPaymentRequest
    await sleep(2200);
    if ((await statusOf(requestId)) === "settingUpPaymentRequest")
      await setQr(requestId);
  } else if (st === "qrPaymentNeeded") {
    await setStatus(requestId, "verifyingPayment");
    await sleep(2000);
    if ((await statusOf(requestId)) === "verifyingPayment")
      await setStatus(requestId, "generatingReceipt");
    await sleep(2600);
    if ((await statusOf(requestId)) === "generatingReceipt")
      await complete(requestId);
  }
}

export async function mockCancel(requestId: string): Promise<void> {
  const snap = await db.doc(`borderTaxRequests/${requestId}`).get();
  const d = snap.data();
  if (!d || TERMINAL.includes(d.status)) return;
  await db.doc(`borderTaxRequests/${requestId}`).update({
    "aiAgentData.status": "cancelled",
    "aiAgentData.statusUpdatedAt": now(),
    status: "cancelled",
    cancelledDetails: {
      cancelledAt: now(),
      cancelledBy: "ai_agent",
      reason: "Cancelled by the vendor.",
    },
    mockActive: false,
    updatedAt: now(),
  });
}

/** Unattended fallback + crash recovery: advance stuck mock requests 1 step/min. */
export const mockAgentSweeper = onSchedule(
  { schedule: "every 1 minutes", timeoutSeconds: 120 },
  async () => {
    const snap = await db
      .collection("borderTaxRequests")
      .where("mockActive", "==", true)
      .limit(25)
      .get();
    const nowMs = Date.now();
    for (const doc of snap.docs) {
      const d = doc.data();
      const st = d.aiAgentData?.status as string | undefined;
      const updatedMs = d.aiAgentData?.statusUpdatedAt?.toMillis
        ? d.aiAgentData.statusUpdatedAt.toMillis()
        : 0;
      const age = nowMs - updatedMs;
      const threshold =
        st === "captchaSolving" ? 120000 : st === "qrPaymentNeeded" ? 45000 : 90000;
      if (age < threshold) continue;
      try {
        await advanceOne(doc.id);
      } catch {
        // a later tick retries
      }
    }
  },
);
