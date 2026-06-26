import type { RequestStatus } from "@/types";
import type { AgentStatus, DisplayStatus } from "@/types/firestore";

/* ============================================================================
   Status model — maps the suvidha agent lifecycle (AgentStatus) onto the
   panel's DisplayStatus, and bridges that to the legacy UI RequestStatus so the
   ported components keep rendering unchanged in Phase 2. See docs/SCHEMA.md.
   ============================================================================ */

/** Pre-payment agent states: an unexpected stop here is a safe `cancelled`. */
export const PRE_PAYMENT: ReadonlySet<AgentStatus> = new Set<AgentStatus>([
  "queued",
  "aiAgentStarted",
  "pendingTransaction",
  "pendingTransactionCaptcha",
  "captchaSolving",
]);

/** Map the agent lifecycle to the panel DisplayStatus. */
export function agentToDisplay(
  agentStatus: AgentStatus | null | undefined,
  startRequested: boolean,
  terminalStatus?: "completed" | "cancelled" | "failed",
): DisplayStatus {
  if (terminalStatus === "completed") return "COMPLETED";
  if (terminalStatus === "cancelled") return "CANCELLED";
  if (terminalStatus === "failed") return "FAILED";
  if (!agentStatus) return startRequested ? "QUEUED" : "PENDING";
  switch (agentStatus) {
    case "queued":
      return "QUEUED";
    case "aiAgentStarted":
    case "pendingTransaction":
      return "PROCESSING";
    case "pendingTransactionCaptcha":
    case "captchaSolving":
      return "ACTION_CAPTCHA";
    case "settingUpPaymentRequest":
      return "GATEWAY";
    case "qrPaymentNeeded":
      return "AWAITING_PAYMENT";
    case "verifyingPayment":
      return "VERIFYING";
    case "verifyingPendingPayment":
      return "RECONCILING";
    case "generatingReceipt":
      return "GENERATING_RECEIPT";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    case "failed":
      return "FAILED";
    default:
      return "PROCESSING";
  }
}

/** True when the vendor must take an action (start / captcha / pay / retry). */
export function needsActionFor(d: DisplayStatus): boolean {
  return (
    d === "PENDING" ||
    d === "ACTION_CAPTCHA" ||
    d === "AWAITING_PAYMENT" ||
    d === "CANCELLED" ||
    d === "FAILED"
  );
}

/**
 * Bridge DisplayStatus → the legacy UI RequestStatus so the 1:1-ported
 * components keep working in Phase 2. Phase 5 migrates the UI to DisplayStatus
 * directly (adding dedicated captcha / cancelled treatments) and drops this.
 */
export function displayToLegacy(d: DisplayStatus): RequestStatus {
  switch (d) {
    case "PENDING":
      return "PENDING";
    case "QUEUED":
    case "PROCESSING":
      return "PROCESSING";
    case "ACTION_CAPTCHA":
      return "ENTERING_DETAILS";
    case "GATEWAY":
      return "CALCULATING_TAX";
    case "AWAITING_PAYMENT":
      return "AWAITING_PAYMENT";
    case "VERIFYING":
      return "PAYMENT_SUCCESS";
    case "RECONCILING":
      return "RECONCILING";
    case "GENERATING_RECEIPT":
      return "RECEIPT_GENERATED";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
    case "FAILED":
      return "FAILED";
  }
}
