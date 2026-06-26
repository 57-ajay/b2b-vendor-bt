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
  /** True for the in-memory mock (demo-only controls render only then). */
  isMock: boolean;
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

  /** Submit a captcha answer to the agent. */
  intervene(id: string, input: string): Promise<void>;
  /** Ask the agent to cancel an in-progress request. */
  cancel(id: string): Promise<void>;

  /** Demo-only in the mock; no-op in Firestore (payment is auto-detected). */
  markPaid(id: string): void;
  /** Demo-only; no-op in Firestore. */
  setFailStage(id: string, stage: string): void;
  /** Demo-only; no-op in Firestore (real arrivals come via the listener). */
  scheduleLiveArrival(cb?: (r: DriverRequest) => void): void;

  dispose(): void;
}
