import { db, FieldValue, now } from "../admin";

/**
 * Wallet money rules. Balances are mutated only here (server-side, in Firestore
 * transactions) so they can never be tampered with from a client.
 *
 *   startRequest → HOLD the service fee.
 *   terminal     → COMMIT (completed, "charged only when a receipt is produced")
 *                  or RELEASE (cancelled / failed) the held amount.
 *   admin        → TOPUP.
 */

interface WalletData {
  balance?: number;
  heldAmount?: number;
  currency?: string;
}

function txnRef(vendorId: string) {
  return db.collection(`wallets/${vendorId}/transactions`).doc();
}

/** HOLD the fee and flag start in one atomic transaction. Throws INSUFFICIENT. */
export async function holdAndStart(
  vendorId: string,
  requestId: string,
  fee: number,
  uid: string,
): Promise<void> {
  await db.runTransaction(async (tx) => {
    const reqRef = db.doc(`borderTaxRequests/${requestId}`);
    const reqSnap = await tx.get(reqRef);
    const req = reqSnap.data();
    if (!req) throw new Error("NOT_FOUND");
    if (req.start?.requested) return; // already started — idempotent
    const wRef = db.doc(`wallets/${vendorId}`);
    const w = (await tx.get(wRef)).data() as WalletData | undefined;
    const balance = w?.balance ?? 0;
    const held = w?.heldAmount ?? 0;
    if (balance - held < fee) throw new Error("INSUFFICIENT");
    tx.set(
      wRef,
      {
        vendorId,
        balance,
        heldAmount: held + fee,
        currency: w?.currency ?? "INR",
        updatedAt: now(),
      },
      { merge: true },
    );
    const t = txnRef(vendorId);
    tx.set(t, {
      txnId: t.id,
      type: "HOLD",
      amount: fee,
      refRequestId: requestId,
      balanceAfter: balance,
      createdAt: now(),
    });
    tx.set(
      reqRef,
      {
        start: {
          requested: true,
          requestedAt: now(),
          requestedByUid: uid,
          attempt: 1,
        },
        walletHeld: true,
        walletSettled: false,
        displayStatus: "QUEUED",
        needsAction: false,
        updatedAt: now(),
      },
      { merge: true },
    );
  });
}

/** Re-HOLD + bump the attempt for a retryable (cancelled/failed) request. */
export async function holdAndRetry(
  vendorId: string,
  requestId: string,
  fee: number,
): Promise<void> {
  await db.runTransaction(async (tx) => {
    const reqRef = db.doc(`borderTaxRequests/${requestId}`);
    const req = (await tx.get(reqRef)).data();
    if (!req) throw new Error("NOT_FOUND");
    if (req.displayStatus !== "FAILED" && req.displayStatus !== "CANCELLED") {
      throw new Error("NOT_RETRYABLE");
    }
    const wRef = db.doc(`wallets/${vendorId}`);
    const w = (await tx.get(wRef)).data() as WalletData | undefined;
    const balance = w?.balance ?? 0;
    const held = w?.heldAmount ?? 0;
    if (balance - held < fee) throw new Error("INSUFFICIENT");
    const attempt = (req.start?.attempt ?? 1) + 1;
    tx.set(
      wRef,
      { vendorId, heldAmount: held + fee, updatedAt: now() },
      { merge: true },
    );
    const t = txnRef(vendorId);
    tx.set(t, {
      txnId: t.id,
      type: "HOLD",
      amount: fee,
      refRequestId: requestId,
      balanceAfter: balance,
      createdAt: now(),
    });
    tx.update(reqRef, {
      "start.requested": true,
      "start.attempt": attempt,
      "start.dispatchedAt": FieldValue.delete(),
      "start.dispatchError": FieldValue.delete(),
      walletHeld: true,
      walletSettled: false,
      displayStatus: "QUEUED",
      needsAction: false,
      updatedAt: now(),
    });
  });
}

/** COMMIT or RELEASE the held fee on a terminal. Idempotent via walletSettled. */
export async function settleTerminal(
  vendorId: string,
  requestId: string,
  outcome: "commit" | "release",
  amount: number,
): Promise<void> {
  await db.runTransaction(async (tx) => {
    const reqRef = db.doc(`borderTaxRequests/${requestId}`);
    const req = (await tx.get(reqRef)).data();
    if (!req || req.walletSettled) return;
    const wRef = db.doc(`wallets/${vendorId}`);
    const w = (await tx.get(wRef)).data() as WalletData | undefined;
    const held = Math.max(0, (w?.heldAmount ?? 0) - amount);
    const balance =
      outcome === "commit" ? (w?.balance ?? 0) - amount : (w?.balance ?? 0);
    tx.set(
      wRef,
      {
        vendorId,
        balance,
        heldAmount: held,
        currency: w?.currency ?? "INR",
        updatedAt: now(),
      },
      { merge: true },
    );
    const t = txnRef(vendorId);
    tx.set(t, {
      txnId: t.id,
      type: outcome === "commit" ? "COMMIT" : "RELEASE",
      amount,
      refRequestId: requestId,
      balanceAfter: balance,
      createdAt: now(),
    });
    tx.set(reqRef, { walletSettled: true }, { merge: true });
  });
}

/** Credit the wallet (admin top-up). */
export async function topup(
  vendorId: string,
  amount: number,
  note: string,
): Promise<void> {
  await db.runTransaction(async (tx) => {
    const wRef = db.doc(`wallets/${vendorId}`);
    const w = (await tx.get(wRef)).data() as WalletData | undefined;
    const balance = (w?.balance ?? 0) + amount;
    tx.set(
      wRef,
      {
        vendorId,
        balance,
        heldAmount: w?.heldAmount ?? 0,
        currency: w?.currency ?? "INR",
        updatedAt: now(),
      },
      { merge: true },
    );
    const t = txnRef(vendorId);
    tx.set(t, {
      txnId: t.id,
      type: "TOPUP",
      amount,
      balanceAfter: balance,
      createdAt: now(),
      note,
    });
  });
}
