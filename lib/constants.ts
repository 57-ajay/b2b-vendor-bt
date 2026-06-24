import type { RequestStatus, StatusMeta, StepDef } from "@/types";

/* ============================================================================
   Status / step metadata — ported 1:1 from the source <script>.
   ============================================================================ */

export const STATUS_META: Record<RequestStatus, StatusMeta> = {
  PENDING: { label: "Pending", text: "#6B7280", bg: "#F2F3F7", dot: "#9AA0B0" },
  PROCESSING: {
    label: "Processing",
    text: "var(--primary)",
    bg: "var(--primary-tint)",
    dot: "var(--primary)",
  },
  OPENING_PORTAL: {
    label: "Opening portal",
    text: "var(--primary)",
    bg: "var(--primary-tint)",
    dot: "var(--primary)",
  },
  ENTERING_DETAILS: {
    label: "Entering details",
    text: "var(--primary)",
    bg: "var(--primary-tint)",
    dot: "var(--primary)",
  },
  CALCULATING_TAX: {
    label: "Calculating tax",
    text: "var(--primary)",
    bg: "var(--primary-tint)",
    dot: "var(--primary)",
  },
  QR_GENERATED: {
    label: "QR generated",
    text: "var(--primary)",
    bg: "var(--primary-tint)",
    dot: "var(--primary)",
  },
  AWAITING_PAYMENT: {
    label: "Awaiting payment",
    text: "#7A5C00",
    bg: "#FFF7D1",
    dot: "#FAC800",
  },
  PAYMENT_SUCCESS: {
    label: "Payment success",
    text: "#0E7C5A",
    bg: "#E6F5EE",
    dot: "#0E9E6E",
  },
  RECEIPT_GENERATED: {
    label: "Receipt generated",
    text: "#0E7C5A",
    bg: "#E6F5EE",
    dot: "#0E9E6E",
  },
  COMPLETED: {
    label: "Completed",
    text: "#0E7C5A",
    bg: "#E6F5EE",
    dot: "#107A52",
  },
  FAILED: { label: "Failed", text: "#C0392B", bg: "#FCEBE9", dot: "#DC2626" },
  RECONCILING: {
    label: "Reconciling",
    text: "#B45309",
    bg: "#FBEFE0",
    dot: "#E0801F",
  },
};

export const TRANSIENT: RequestStatus[] = [
  "PROCESSING",
  "OPENING_PORTAL",
  "ENTERING_DETAILS",
  "CALCULATING_TAX",
  "QR_GENERATED",
  "PAYMENT_SUCCESS",
  "RECEIPT_GENERATED",
];

export const ATTENTION: RequestStatus[] = [
  "PENDING",
  "AWAITING_PAYMENT",
  "RECONCILING",
];

export const STEP_DEFS: StepDef[] = [
  { key: "PENDING", label: "Pending", gold: false },
  { key: "PROCESSING", label: "Processing", gold: false },
  { key: "OPENING_PORTAL", label: "Opening portal", gold: false },
  { key: "CALCULATING_TAX", label: "Calculating tax", gold: false },
  { key: "QR_GENERATED", label: "QR generated", gold: false },
  { key: "AWAITING_PAYMENT", label: "Awaiting payment", gold: true },
  { key: "PAYMENT_SUCCESS", label: "Payment success", gold: false },
  { key: "RECEIPT_GENERATED", label: "Receipt generated", gold: false },
  { key: "COMPLETED", label: "Completed", gold: false },
];

export const RANK: Record<string, number> = {
  PENDING: 0,
  PROCESSING: 1,
  OPENING_PORTAL: 2,
  ENTERING_DETAILS: 2,
  CALCULATING_TAX: 3,
  QR_GENERATED: 4,
  AWAITING_PAYMENT: 5,
  PAYMENT_SUCCESS: 6,
  RECEIPT_GENERATED: 7,
  COMPLETED: 8,
};

export const FAIL_REASON: Record<string, string> = {
  OPENING_PORTAL:
    "Government portal unavailable. The request was queued for automatic retry.",
  ENTERING_DETAILS:
    "Submitted vehicle details were rejected by the portal. Please verify and retry.",
  AWAITING_PAYMENT:
    "The payment QR expired before the driver completed payment.",
  PENDING: "Validation failed before processing could start.",
};

export function fmtMoney(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}
