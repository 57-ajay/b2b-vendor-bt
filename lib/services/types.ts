import type {
  DriverRequest,
  Receipt,
  Settings,
  Transaction,
  Wallet,
} from "@/types";

/* ============================================================================
   DriverPanelService — the contract the panel binds to. Two implementations:
   MockDriverPanelService (in-memory demo) and FirestoreDriverPanelService
   (real backend). The factory in `./index.ts` picks one.
   ============================================================================ */
export interface DriverPanelService {
  /** Set after a successful login; "" while logged out. */
  vendorId: string;
  /** Receipts keyed by receiptId, kept in sync with the requests stream. */
  receipts: Record<string, Receipt>;

  /**
   * Observe auth. Fires the vendorId when signed in (claims resolved), or null
   * when signed out. Returns an unsubscribe. The panel starts/stops its
   * Firestore subscriptions in response, so reads never run before auth.
   */
  init(onVendor: (vendorId: string | null) => void): () => void;

  login(emailOrPhone: string, password: string): Promise<{ vendorId: string }>;
  logout(): Promise<void>;

  subscribeToRequests(
    vendorId: string,
    cb: (rs: DriverRequest[]) => void,
  ): () => void;
  subscribeToWallet(vendorId: string, cb: (w: Wallet) => void): () => void;
  subscribeToTransactions(
    vendorId: string,
    cb: (t: Transaction[]) => void,
  ): () => void;

  getSettings(vendorId: string): Promise<Settings>;
  getReceipt(id: string): Promise<Receipt>;

  /** Vendor presses Start → server holds the fee and dispatches the agent. */
  startProcess(id: string): Promise<{ jobId: string }>;
  retryRequest(id: string): Promise<void>;
  topUpWallet(vendorId: string, amount: number): Promise<void>;
  updateSettings(vendorId: string, patch: Partial<Settings>): Promise<void>;

  /** Submit a captcha answer / "paid" nudge to the agent (Phase 5 UI). */
  intervene(id: string, input: string): Promise<void>;

  /** Demo-only in the mock; no-op in Firestore (payment is auto-detected). */
  markPaid(id: string): void;
  /** Demo-only; no-op in Firestore. */
  setFailStage(id: string, stage: string): void;
  /** Demo-only; no-op in Firestore (real arrivals come via the listener). */
  scheduleLiveArrival(cb?: (r: DriverRequest) => void): void;

  dispose(): void;
}
