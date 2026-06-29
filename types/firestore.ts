import type { Timestamp } from "firebase/firestore";

/* ============================================================================
   Raw Firestore document shapes for the vendor border-tax product.
   These are the on-the-wire types; the UI binds against the mapped view types
   in `types/index.ts` (DriverRequest, Wallet, …). See docs/SCHEMA.md.
   ============================================================================ */

/** The 13-state agent lifecycle (aiAgentData.status). Source of truth: suvidha. */
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

/** Coarser status the panel renders (denormalized to borderTaxRequests.displayStatus). */
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

export type StateCode = "UP" | "HR" | "MP" | "PB";
export type TaxMode =
  | "DAYS"
  | "MONTHLY"
  | "QUARTERLY"
  | "HALF YEARLY"
  | "YEARLY";

/** Border-tax intake params → POST /api/run params (per-state; see suvidha validators). */
export interface BorderTaxParams {
  stateCode: StateCode;
  vehicleNumber: string;
  mobileNumber: string;
  taxMode: TaxMode;
  taxFrom: string; // YYYY-MM-DD
  taxUpto?: string; // required when taxMode === "DAYS"
  entryDistrict?: string;
  entryCheckpoint?: string;
  permitType?: string;
  serviceType?: string;
}

export interface AiAgentCaptcha {
  url: string;
  attempt: number;
  maxAttempts: number | null;
  lastResult: "awaiting_input" | "rejected" | "accepted";
  uploadedAt?: Timestamp;
  inputDeadline?: Timestamp | null;
  resultAt?: Timestamp | null;
}

export interface AiAgentQr {
  url: string;
  uploadedAt?: Timestamp;
  expiredAt?: Timestamp;
  notificationSent?: boolean;
  notificationSentAt?: Timestamp | null;
}

export interface AiAgentReceipt {
  url: string;
  fields?: Record<string, unknown>;
  uploadedAt?: Timestamp;
}

/** Agent-owned namespace on the request doc (written via the suvidha Admin SDK). */
export interface AiAgentData {
  status: AgentStatus;
  statusUpdatedAt?: Timestamp;
  source?: string;
  captcha?: AiAgentCaptcha;
  qrCode?: AiAgentQr;
  portalAmount?: number;
  receipt?: AiAgentReceipt;
  receiptGenerated?: boolean;
  paymentCompleted?: boolean;
  error?: { isError: boolean; message: string };
  transactionId?: string;
}

/** The shared request doc at borderTaxRequests/{requestId}. */
export interface BorderTaxRequestDoc {
  requestId: string;
  vendorId: string;
  customerId: string;
  service: "border-tax";
  params: BorderTaxParams;
  customer: { name: string; mobile: string };
  serviceFee: number;
  commissionSnapshot: { mode: "percent" | "fixed"; value: number };
  start: {
    requested: boolean;
    requestedAt?: Timestamp;
    requestedByUid?: string;
    dispatchedAt?: Timestamp;
    jobId?: string;
    dispatchError?: string;
  };
  // Denormalized for indexed queries / rollups (maintained by triggers).
  displayStatus?: DisplayStatus;
  needsAction?: boolean;
  // Operational flags written by Functions.
  walletHeld?: boolean;
  walletSettled?: boolean;
  mockAgent?: boolean;
  mockActive?: boolean;
  // Agent-owned:
  aiAgentData?: AiAgentData;
  status?: "completed" | "cancelled" | "failed";
  manualReview?: { reason?: string } & Record<string, unknown>;
  cancelledDetails?: { reason?: string } & Record<string, unknown>;
  receiptDocumentUrl?: string;
  agentCost?: Record<string, unknown>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface VendorDoc {
  vendorId: string;
  authUid: string;
  businessName: string;
  email: string;
  phone: string;
  subdomain: string;
  status: "active" | "suspended";
  brandLogoUrl: string;
  themeColor: string;
  pricing: Record<string, number>;
  commission: { mode: "percent" | "fixed"; value: number };
  notifyWebhook: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface WalletDoc {
  vendorId: string;
  balance: number;
  heldAmount: number;
  currency: string;
  updatedAt?: Timestamp;
}

export interface TransactionDoc {
  txnId: string;
  type: "TOPUP" | "HOLD" | "COMMIT" | "RELEASE" | "REFUND";
  amount: number;
  refRequestId?: string;
  balanceAfter: number;
  createdAt?: Timestamp;
  note?: string;
}
