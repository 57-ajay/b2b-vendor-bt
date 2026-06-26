import { FAIL_REASON } from "@/lib/constants";
import type { DriverPanelService } from "@/lib/services/types";
import type {
  DriverRequest,
  Receipt,
  RequestStatus,
  Settings,
  Transaction,
  Wallet,
} from "@/types";

type ReqCb = (rs: DriverRequest[]) => void;
type OneCb = (r: DriverRequest) => void;
type WalletCb = (w: Wallet) => void;
type TxnCb = (t: Transaction[]) => void;
type Timer = ReturnType<typeof setTimeout>;

/* ============================================================================
   MockDriverPanelService — ported 1:1 from the source <script>.
   In-memory store with subscription fan-out and a timer-driven simulation of
   the government-portal request lifecycle.
   ============================================================================ */
export class MockDriverPanelService implements DriverPanelService {
  isMock = true;
  vendorId: string;
  requests: DriverRequest[];
  receipts: Record<string, Receipt>;
  wallet: Wallet;
  transactions: Transaction[];
  settings: Settings;

  private _reqSubs: ReqCb[];
  private _oneSubs: Record<string, OneCb[]>;
  private _walletSubs: WalletCb[];
  private _txnSubs: TxnCb[];
  private _timers: Timer[];
  private _txnSeq: number;
  private _authCb?: (vendorId: string | null) => void;

  constructor() {
    const now = Date.now();
    const ago = (m: number) => new Date(now - m * 60000).toISOString();
    this.vendorId = "VND-001";
    this.requests = [
      {
        requestId: "REQ-1042",
        vendorId: "VND-001",
        vehicleNumber: "KA01AB1234",
        engineNumber: "ENG4471092",
        chassisNumber: "CHS889120",
        journeyDate: "12 Jun 2026",
        state: "Karnataka",
        border: "Hosur",
        mobile: "+91 98450 11234",
        status: "PENDING",
        createdAt: ago(7),
        updatedAt: ago(7),
      },
      {
        requestId: "REQ-1041",
        vendorId: "VND-001",
        vehicleNumber: "MH12CD5678",
        engineNumber: "ENG99204410",
        chassisNumber: "CHS771204",
        journeyDate: "12 Jun 2026",
        state: "Maharashtra",
        border: "Belgaum",
        mobile: "+91 99876 55432",
        status: "PENDING",
        isDuplicate: true,
        duplicateOf: "REQ-1009",
        createdAt: ago(19),
        updatedAt: ago(19),
      },
      {
        requestId: "REQ-1040",
        vendorId: "VND-001",
        vehicleNumber: "TN09GH3456",
        engineNumber: "ENG3320112",
        chassisNumber: "CHS552098",
        journeyDate: "11 Jun 2026",
        state: "Tamil Nadu",
        border: "Hosur",
        mobile: "+91 90031 22119",
        status: "AWAITING_PAYMENT",
        taxAmount: 420,
        qr: {
          payload: "upi://pay?am=420",
          expiresAt: new Date(now + 95000).toISOString(),
        },
        createdAt: ago(33),
        updatedAt: ago(5),
      },
      {
        requestId: "REQ-1039",
        vendorId: "VND-001",
        vehicleNumber: "GJ01NP4455",
        engineNumber: "ENG6612340",
        chassisNumber: "CHS220194",
        journeyDate: "11 Jun 2026",
        state: "Gujarat",
        border: "Zaheerabad",
        mobile: "+91 98250 77001",
        status: "RECONCILING",
        taxAmount: 380,
        createdAt: ago(58),
        updatedAt: ago(12),
      },
      {
        requestId: "REQ-1037",
        vendorId: "VND-001",
        vehicleNumber: "AP07LM2233",
        engineNumber: "ENG1190556",
        chassisNumber: "CHS660781",
        journeyDate: "10 Jun 2026",
        state: "Andhra Pradesh",
        border: "Zaheerabad",
        mobile: "+91 91776 33442",
        status: "FAILED",
        failure: { stage: "OPENING_PORTAL", reason: FAIL_REASON.OPENING_PORTAL },
        createdAt: ago(120),
        updatedAt: ago(96),
      },
      {
        requestId: "REQ-1035",
        vendorId: "VND-001",
        vehicleNumber: "KA05EF9012",
        engineNumber: "ENG7781200",
        chassisNumber: "CHS118822",
        journeyDate: "10 Jun 2026",
        state: "Karnataka",
        border: "Hosur",
        mobile: "+91 98860 44550",
        status: "COMPLETED",
        taxAmount: 450,
        receiptId: "RCPT-5021",
        createdAt: ago(180),
        updatedAt: ago(150),
      },
      {
        requestId: "REQ-1031",
        vendorId: "VND-001",
        vehicleNumber: "RJ14JK7788",
        engineNumber: "ENG2204881",
        chassisNumber: "CHS903311",
        journeyDate: "09 Jun 2026",
        state: "Rajasthan",
        border: "Bhilwara",
        mobile: "+91 94130 99220",
        status: "COMPLETED",
        taxAmount: 510,
        receiptId: "RCPT-5018",
        createdAt: ago(320),
        updatedAt: ago(300),
      },
      {
        requestId: "REQ-1028",
        vendorId: "VND-001",
        vehicleNumber: "KL08MN6611",
        engineNumber: "ENG5540021",
        chassisNumber: "CHS447120",
        journeyDate: "09 Jun 2026",
        state: "Kerala",
        border: "Hosur",
        mobile: "+91 97440 11900",
        status: "COMPLETED",
        taxAmount: 390,
        receiptId: "RCPT-5012",
        createdAt: ago(400),
        updatedAt: ago(380),
      },
    ];
    this.receipts = {
      "RCPT-5021": {
        receiptId: "RCPT-5021",
        requestId: "REQ-1035",
        storageUrl: "#",
        taxAmount: 450,
        govReference: "GOV-KA-88210045",
        generatedAt: ago(150),
      },
      "RCPT-5018": {
        receiptId: "RCPT-5018",
        requestId: "REQ-1031",
        storageUrl: "#",
        taxAmount: 510,
        govReference: "GOV-RJ-77120988",
        generatedAt: ago(300),
      },
      "RCPT-5012": {
        receiptId: "RCPT-5012",
        requestId: "REQ-1028",
        storageUrl: "#",
        taxAmount: 390,
        govReference: "GOV-KL-55012247",
        generatedAt: ago(380),
      },
    };
    this.wallet = {
      vendorId: "VND-001",
      balance: 11800,
      heldAmount: 150,
      currency: "INR",
    };
    this.transactions = [
      {
        txnId: "T-009",
        type: "RELEASE",
        amount: 150,
        refRequestId: "REQ-1037",
        createdAt: ago(96),
        balanceAfter: 11800,
      },
      {
        txnId: "T-008",
        type: "HOLD",
        amount: 150,
        refRequestId: "REQ-1037",
        createdAt: ago(120),
        balanceAfter: 11650,
      },
      {
        txnId: "T-007",
        type: "COMMIT",
        amount: 450,
        refRequestId: "REQ-1035",
        createdAt: ago(150),
        balanceAfter: 11800,
      },
      {
        txnId: "T-006",
        type: "HOLD",
        amount: 150,
        refRequestId: "REQ-1035",
        createdAt: ago(180),
        balanceAfter: 11500,
      },
      {
        txnId: "T-005",
        type: "TOPUP",
        amount: 5000,
        createdAt: ago(600),
        balanceAfter: 11650,
      },
      {
        txnId: "T-004",
        type: "TOPUP",
        amount: 5000,
        createdAt: ago(900),
        balanceAfter: 6650,
      },
    ];
    this.settings = {
      vendorId: "VND-001",
      businessName: "Sai Transport Services",
      subdomain: "saitransport.taxflow.in",
      brandLogoUrl: "",
      themeColor: "#FAC800",
      pricePerRequest: 150,
      notifyWebhook: "",
      pricing: { "border-tax": 150, "state-tax": 120, "rc-mobile": 80 },
    };
    this._reqSubs = [];
    this._oneSubs = {};
    this._walletSubs = [];
    this._txnSubs = [];
    this._timers = [];
    this._txnSeq = 10;
  }

  private _now(): string {
    return new Date().toISOString();
  }

  /** Observe auth. The mock starts signed-out so the login screen shows, then
      fires the vendorId on a successful demo login (matching the real flow). */
  init(onVendor: (vendorId: string | null) => void): () => void {
    this._authCb = onVendor;
    onVendor(null);
    return () => {
      this._authCb = undefined;
    };
  }

  login(email: string, password: string): Promise<{ vendorId: string }> {
    return new Promise((res, rej) =>
      setTimeout(() => {
        if (email && password && password.length >= 4) {
          this._authCb?.(this.vendorId);
          res({ vendorId: this.vendorId });
        } else rej(new Error("Invalid email or password."));
      }, 700),
    );
  }

  logout(): Promise<void> {
    this._authCb?.(null);
    return Promise.resolve();
  }

  /** No-op in the mock (the simulated lifecycle drives itself). */
  intervene(): Promise<void> {
    return Promise.resolve();
  }

  /** No-op in the mock. */
  cancel(): Promise<void> {
    return Promise.resolve();
  }

  subscribeToRequests(_v: string, cb: ReqCb): () => void {
    this._reqSubs.push(cb);
    cb(this.requests.slice());
    return () => {
      this._reqSubs = this._reqSubs.filter((c) => c !== cb);
    };
  }

  subscribeToRequest(id: string, cb: OneCb): () => void {
    (this._oneSubs[id] = this._oneSubs[id] || []).push(cb);
    const r = this.requests.find((x) => x.requestId === id);
    if (r) cb(Object.assign({}, r));
    return () => {
      this._oneSubs[id] = (this._oneSubs[id] || []).filter((c) => c !== cb);
    };
  }

  subscribeToWallet(_v: string, cb: WalletCb): () => void {
    this._walletSubs.push(cb);
    cb(Object.assign({}, this.wallet));
    return () => {
      this._walletSubs = this._walletSubs.filter((c) => c !== cb);
    };
  }

  subscribeToTransactions(_v: string, cb: TxnCb): () => void {
    this._txnSubs.push(cb);
    cb(this.transactions.slice());
    return () => {
      this._txnSubs = this._txnSubs.filter((c) => c !== cb);
    };
  }

  getReceipt(id: string): Promise<Receipt> {
    return Promise.resolve(this.receipts[id]);
  }

  getSettings(_v: string): Promise<Settings> {
    return Promise.resolve(Object.assign({}, this.settings));
  }

  private _notifyReq(): void {
    const c = this.requests.slice();
    this._reqSubs.forEach((cb) => cb(c));
  }

  private _notifyOne(id: string): void {
    const r = this.requests.find((x) => x.requestId === id);
    if (r) (this._oneSubs[id] || []).forEach((cb) => cb(Object.assign({}, r)));
  }

  private _notifyWallet(): void {
    this._walletSubs.forEach((cb) => cb(Object.assign({}, this.wallet)));
  }

  private _notifyTxn(): void {
    const c = this.transactions.slice();
    this._txnSubs.forEach((cb) => cb(c));
  }

  private _txn(
    type: Transaction["type"],
    amount: number,
    ref?: string,
  ): void {
    this._txnSeq++;
    this.transactions.unshift({
      txnId: "T-0" + this._txnSeq,
      type,
      amount,
      refRequestId: ref,
      createdAt: this._now(),
      balanceAfter: this.wallet.balance,
    });
    this._notifyTxn();
  }

  private _set(id: string, patch: Partial<DriverRequest>): void {
    const r = this.requests.find((x) => x.requestId === id);
    if (!r) return;
    Object.assign(r, patch, { updatedAt: this._now() });
    this._notifyReq();
    this._notifyOne(id);
  }

  startProcess(id: string): Promise<{ jobId: string }> {
    const r = this.requests.find((x) => x.requestId === id);
    if (!r) return Promise.reject(new Error("not found"));
    const price = this.settings.pricePerRequest;
    if (this.wallet.balance - this.wallet.heldAmount < price)
      return Promise.reject(new Error("INSUFFICIENT"));
    this.wallet.heldAmount += price;
    this._notifyWallet();
    this._txn("HOLD", price, id);
    const failAt =
      r._failStage && r._failStage !== "NONE" ? r._failStage : null;
    const seq: Array<[RequestStatus, number]> = [
      ["PROCESSING", 1500],
      ["OPENING_PORTAL", 2000],
      ["ENTERING_DETAILS", 1800],
      ["CALCULATING_TAX", 2200],
      ["QR_GENERATED", 1500],
    ];
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        this._toAwaiting(id, failAt, price);
        return;
      }
      const [st, dur] = seq[i];
      i++;
      if (failAt === st) {
        this._fail(id, st, price);
        return;
      }
      const patch: Partial<DriverRequest> = { status: st };
      if (st === "CALCULATING_TAX") {
        patch.taxAmount = 380 + Math.round(Math.random() * 8) * 20;
      }
      this._set(id, patch);
      this._timers.push(setTimeout(step, dur));
    };
    this._timers.push(setTimeout(step, 400));
    return Promise.resolve({ jobId: "JOB-" + id });
  }

  private _toAwaiting(
    id: string,
    failAt: string | null,
    price: number,
  ): void {
    if (failAt === "AWAITING_PAYMENT") {
      // let QR sit then expire
      this._set(id, {
        status: "AWAITING_PAYMENT",
        qr: {
          payload: "upi://pay",
          expiresAt: new Date(Date.now() + 6000).toISOString(),
        },
      });
      this._timers.push(
        setTimeout(() => this._fail(id, "AWAITING_PAYMENT", price), 6500),
      );
      return;
    }
    this._set(id, {
      status: "AWAITING_PAYMENT",
      qr: {
        payload: "upi://pay?req=" + id,
        expiresAt: new Date(Date.now() + 90000).toISOString(),
      },
    });
    this._timers.push(
      setTimeout(() => {
        const r = this.requests.find((x) => x.requestId === id);
        if (r && r.status === "AWAITING_PAYMENT") this.markPaid(id);
      }, 4200),
    );
  }

  markPaid(id: string): void {
    const r = this.requests.find((x) => x.requestId === id);
    if (!r || r.status !== "AWAITING_PAYMENT") return;
    const price = this.settings.pricePerRequest;
    const failAt = r._failStage;
    this._set(id, { status: "PAYMENT_SUCCESS" });
    this._timers.push(
      setTimeout(() => {
        if (failAt === "PAYMENT_SUCCESS") {
          this._set(id, { status: "RECONCILING" });
          return;
        }
        this._set(id, { status: "RECEIPT_GENERATED" });
        this._timers.push(
          setTimeout(() => {
            const rid = "RCPT-" + (5100 + Math.floor(Math.random() * 800));
            const ref =
              "GOV-" +
              r.vehicleNumber.slice(0, 2) +
              "-" +
              (10000000 + Math.floor(Math.random() * 89999999));
            this.receipts[rid] = {
              receiptId: rid,
              requestId: id,
              storageUrl: "#",
              taxAmount: r.taxAmount ?? 0,
              govReference: ref,
              generatedAt: this._now(),
            };
            this.wallet.heldAmount = Math.max(0, this.wallet.heldAmount - price);
            this.wallet.balance -= price;
            this._notifyWallet();
            this._txn("COMMIT", price, id);
            this._set(id, { status: "COMPLETED", receiptId: rid });
          }, 1800),
        );
      }, 1500),
    );
  }

  private _fail(id: string, stage: string, price: number): void {
    this.wallet.heldAmount = Math.max(0, this.wallet.heldAmount - price);
    this._notifyWallet();
    this._txn("RELEASE", price, id);
    this._set(id, {
      status: "FAILED",
      failure: { stage, reason: FAIL_REASON[stage] || "Processing error." },
    });
  }

  retryRequest(id: string): Promise<void> {
    const r = this.requests.find((x) => x.requestId === id);
    if (r) {
      r.failure = null;
      r._failStage = "NONE";
      this._set(id, { status: "PENDING", failure: null });
    }
    return Promise.resolve();
  }

  setFailStage(id: string, stage: string): void {
    const r = this.requests.find((x) => x.requestId === id);
    if (r) {
      r._failStage = stage;
    }
  }

  topUpWallet(_v: string, amount: number): Promise<void> {
    this.wallet.balance += amount;
    this._notifyWallet();
    this._txn("TOPUP", amount);
    return Promise.resolve();
  }

  updateSettings(_v: string, patch: Partial<Settings>): Promise<void> {
    Object.assign(this.settings, patch);
    return Promise.resolve();
  }

  scheduleLiveArrival(cb?: (r: DriverRequest) => void): void {
    this._timers.push(
      setTimeout(() => {
        const nr: DriverRequest = {
          requestId: "REQ-1043",
          vendorId: "VND-001",
          vehicleNumber: "WB22XY8800",
          engineNumber: "ENG8810342",
          chassisNumber: "CHS664019",
          journeyDate: "13 Jun 2026",
          state: "West Bengal",
          border: "Hosur",
          mobile: "+91 98300 55120",
          status: "PENDING",
          createdAt: this._now(),
          updatedAt: this._now(),
          _isNew: true,
        };
        this.requests.unshift(nr);
        this._notifyReq();
        if (cb) cb(nr);
        this._timers.push(
          setTimeout(() => {
            nr._isNew = false;
            this._notifyReq();
          }, 1400),
        );
      }, 5500),
    );
  }

  dispose(): void {
    this._timers.forEach((t) => clearTimeout(t));
  }
}
