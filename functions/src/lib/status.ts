// Mirror of the app's lib/status.ts (server-side copy; functions are a separate
// CommonJS package and can't import the Next app's path-aliased modules).

export type AgentStatus =
  | "queued"
  | "aiAgentStarted"
  | "pendingTransaction"
  | "pendingTransactionCaptcha"
  | "captchaSolving"
  | "settingUpPaymentRequest"
  | "qrPaymentNeeded"
  | "verifyingPayment"
  | "verifyingPendingPayment"
  | "generatingReceipt"
  | "completed"
  | "cancelled"
  | "failed";

export type DisplayStatus =
  | "PENDING"
  | "QUEUED"
  | "PROCESSING"
  | "ACTION_CAPTCHA"
  | "GATEWAY"
  | "AWAITING_PAYMENT"
  | "VERIFYING"
  | "RECONCILING"
  | "GENERATING_RECEIPT"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

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

export function needsActionFor(d: DisplayStatus): boolean {
  return (
    d === "PENDING" ||
    d === "ACTION_CAPTCHA" ||
    d === "AWAITING_PAYMENT" ||
    d === "CANCELLED" ||
    d === "FAILED"
  );
}

export function isTerminal(d: DisplayStatus): boolean {
  return d === "COMPLETED" || d === "CANCELLED" || d === "FAILED";
}

/** Derive the display status for a request doc, accounting for dispatch failures. */
export function computeDisplay(req: {
  aiAgentData?: { status?: AgentStatus };
  start?: { requested?: boolean; dispatchError?: string };
  status?: "completed" | "cancelled" | "failed";
}): DisplayStatus {
  if (req.start?.dispatchError && !req.aiAgentData?.status) return "FAILED";
  return agentToDisplay(req.aiAgentData?.status, !!req.start?.requested, req.status);
}
