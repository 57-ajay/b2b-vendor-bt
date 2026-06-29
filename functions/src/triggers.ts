import { onDocumentWritten } from "firebase-functions/v2/firestore";

import { db, FieldValue, now } from "./admin";
import { INTERNAL_API_KEY, SUVIDHA_API_URL } from "./config";
import { agentRun } from "./lib/agent";
import { mockStart } from "./mockAgent";
import {
  computeDisplay,
  type DisplayStatus,
  isTerminal,
  needsActionFor,
} from "./lib/status";
import { STATE_NAMES } from "./lib/util";
import { settleTerminal } from "./lib/wallet";

const DOC = "borderTaxRequests/{requestId}";

/** Build the POST /api/run params from our stored request doc. */
function buildRunParams(
  requestId: string,
  req: Record<string, unknown>,
): Record<string, string> {
  const p = (req.params as Record<string, unknown>) || {};
  const sc = String(p.stateCode || "");
  const out: Record<string, string> = {
    requestId,
    driverId: String(req.customerId || ""),
    stateCode: sc,
    state: STATE_NAMES[sc] || sc,
    vehicleNumber: String(p.vehicleNumber || ""),
    mobileNumber: String(p.mobileNumber || ""),
    taxMode: String(p.taxMode || ""),
    taxFrom: String(p.taxFrom || ""),
    paymentMethod: "UPI",
  };
  if (p.taxUpto) out.taxUpto = String(p.taxUpto);
  if (p.duration != null) out.duration = String(p.duration);
  if (p.entryDistrict) out.entryDistrict = String(p.entryDistrict);
  if (p.entryCheckpoint) out.entryCheckpoint = String(p.entryCheckpoint);
  if (p.distance) out.distance = String(p.distance);
  return out;
}

/**
 * Dispatch to the suvidha agent when the vendor presses Start (or Retry). Fires
 * only on a new attempt (start.attempt increment), so the agent's own lifecycle
 * writes — and our denormalization writes — never re-dispatch. Keeps the agent
 * API private: the URL + key live here, never in the browser.
 */
export const onStartRequested = onDocumentWritten(
  { document: DOC, secrets: [INTERNAL_API_KEY], timeoutSeconds: 120 },
  async (event) => {
    const after = event.data?.after.data();
    if (!after) return;
    const before = event.data?.before.data();
    const afterAttempt = Number(after.start?.attempt || 0);
    const beforeAttempt = Number(before?.start?.attempt || 0);
    if (!(after.start?.requested && afterAttempt > beforeAttempt)) return;

    const requestId = event.params.requestId;
    const reqRef = db.doc(`borderTaxRequests/${requestId}`);

    // No real agent configured → drive the built-in mock (testable e2e).
    if (!SUVIDHA_API_URL.value()) {
      try {
        await mockStart(requestId);
      } catch (e) {
        await reqRef.update({
          "start.dispatchError": (e as Error).message || "Mock start failed.",
          displayStatus: "FAILED",
          needsAction: true,
          updatedAt: now(),
        });
      }
      return;
    }

    try {
      const r = await agentRun(buildRunParams(requestId, after));
      if (r.ok) {
        await reqRef.update({
          "start.dispatchedAt": now(),
          "start.jobId": r.jobId || requestId,
          "start.dispatchError": FieldValue.delete(),
          updatedAt: now(),
        });
      } else {
        await reqRef.update({
          "start.dispatchError": r.message || r.error || "Agent rejected the request.",
          displayStatus: "FAILED",
          needsAction: true,
          updatedAt: now(),
        });
      }
    } catch (e) {
      await reqRef.update({
        "start.dispatchError": (e as Error).message || "Dispatch failed.",
        displayStatus: "FAILED",
        needsAction: true,
        updatedAt: now(),
      });
    }
  },
);

/**
 * Maintain the denormalized displayStatus / needsAction, settle the wallet on
 * terminal (COMMIT on completed, RELEASE on cancelled/failed — once, via
 * walletSettled), and keep the dashboard rollup counters. All transitions are
 * derived from computeDisplay(before) vs computeDisplay(after) so our own
 * writes converge to a no-op instead of looping.
 */
export const onRequestLifecycle = onDocumentWritten(DOC, async (event) => {
  const after = event.data?.after.data();
  if (!after) return; // deletion — ignore
  const before = event.data?.before.data();
  const requestId = event.params.requestId;
  const reqRef = db.doc(`borderTaxRequests/${requestId}`);

  const desired = computeDisplay(after);
  const desiredBefore = before ? computeDisplay(before) : undefined;

  if (
    isTerminal(desired) &&
    desired !== desiredBefore &&
    after.start?.requested &&
    after.walletHeld &&
    !after.walletSettled
  ) {
    await settleTerminal(
      String(after.vendorId),
      requestId,
      desired === "COMPLETED" ? "commit" : "release",
      Number(after.serviceFee || 0),
    );
  }

  if (desired !== desiredBefore) {
    await bumpRollup(String(after.vendorId), desiredBefore, desired);
  }

  const updates: Record<string, unknown> = {};
  if (after.displayStatus !== desired) updates.displayStatus = desired;
  const needs = needsActionFor(desired);
  if (after.needsAction !== needs) updates.needsAction = needs;
  if (Object.keys(updates).length) {
    updates.updatedAt = now();
    await reqRef.set(updates, { merge: true });
  }
});

async function bumpRollup(
  vendorId: string,
  prev: DisplayStatus | undefined,
  next: DisplayStatus,
): Promise<void> {
  const byStatus: Record<string, unknown> = { [next]: FieldValue.increment(1) };
  if (prev) byStatus[prev] = FieldValue.increment(-1);
  const upd: Record<string, unknown> = { updatedAt: now(), byStatus };
  if (!prev) upd.total = FieldValue.increment(1);
  await db.doc(`vendors/${vendorId}/stats/rollup`).set(upd, { merge: true });
}
