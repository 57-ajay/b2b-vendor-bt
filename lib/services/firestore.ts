import {
  type Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  type Firestore,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { firebaseAuth, firebaseDb, firebaseFunctions } from "@/lib/firebase";
import { agentToDisplay, displayToLegacy, needsActionFor } from "@/lib/status";
import type {
  DriverRequest,
  Receipt,
  Settings,
  Transaction,
  Wallet,
} from "@/types";
import type {
  BorderTaxRequestDoc,
  DisplayStatus,
  TransactionDoc,
  VendorDoc,
  WalletDoc,
} from "@/types/firestore";
import type { DriverPanelService } from "@/lib/services/types";

/**
 * Bounded window for the live Requests listener (newest-first). This keeps reads
 * O(window) regardless of total volume; the dashboard + list bind to it. For a
 * very high-volume vendor, raise NEXT_PUBLIC_REQUESTS_WINDOW and/or wire the
 * `startAfter` "load more" + rollup-counter dashboard documented in
 * docs/PRODUCTION.md.
 */
const REQUESTS_WINDOW =
  Number(process.env.NEXT_PUBLIC_REQUESTS_WINDOW) || 200;
const TXN_WINDOW = 100;

const STATE_NAMES: Record<string, string> = {
  UP: "Uttar Pradesh",
  HR: "Haryana",
  MP: "Madhya Pradesh",
  PB: "Punjab",
};
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function tsToIso(t?: Timestamp | null): string {
  return t ? t.toDate().toISOString() : new Date().toISOString();
}

function fmtJourney(d?: string): string {
  if (!d) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  return `${parseInt(m[3], 10)} ${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

/** Normalize a Firebase callable error into a plain Error the UI understands. */
function callableError(e: unknown): Error {
  const err = e as { code?: string; message?: string; details?: unknown };
  const msg = err?.message || "Something went wrong.";
  // The startRequest callable signals an empty wallet with this token so the
  // panel can show its "top up to start" toast (matches the mock contract).
  if (
    err?.code === "functions/failed-precondition" &&
    /insufficient/i.test(msg)
  ) {
    return new Error("INSUFFICIENT");
  }
  if (/insufficient/i.test(msg)) return new Error("INSUFFICIENT");
  return new Error(msg);
}

/**
 * FirestoreDriverPanelService — the production data layer.
 * Reads are realtime (`onSnapshot`); writes go through callable Cloud Functions
 * so the agent API stays private and wallet/lifecycle writes stay server-side.
 */
export class FirestoreDriverPanelService implements DriverPanelService {
  isMock = false;
  vendorId = "";
  receipts: Record<string, Receipt> = {};

  private get auth(): Auth {
    return firebaseAuth();
  }
  private get db(): Firestore {
    return firebaseDb();
  }

  // ---- auth ----
  init(onVendor: (vendorId: string | null) => void): () => void {
    return onAuthStateChanged(this.auth, async (user) => {
      if (!user) {
        this.vendorId = "";
        onVendor(null);
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        const vid = (token.claims.vendorId as string | undefined) ?? "";
        this.vendorId = vid;
        onVendor(vid || null);
      } catch {
        onVendor(null);
      }
    });
  }

  async login(
    emailOrPhone: string,
    password: string,
  ): Promise<{ vendorId: string }> {
    const id = emailOrPhone.trim();
    if (!id || !password) throw new Error("Enter your email/phone and password.");
    const email = await this.resolveEmail(id);
    const cred = await signInWithEmailAndPassword(this.auth, email, password).catch(
      (e: { code?: string }) => {
        const code = e?.code || "";
        if (
          code === "auth/invalid-credential" ||
          code === "auth/wrong-password" ||
          code === "auth/user-not-found"
        ) {
          throw new Error("Invalid email/phone or password.");
        }
        if (code === "auth/too-many-requests") {
          throw new Error("Too many attempts. Try again in a few minutes.");
        }
        throw new Error("Could not sign in. Please try again.");
      },
    );
    const token = await cred.user.getIdTokenResult();
    const vid = (token.claims.vendorId as string | undefined) ?? "";
    if (!vid) {
      await signOut(this.auth).catch(() => {});
      throw new Error("This account isn't set up as a vendor. Contact support.");
    }
    this.vendorId = vid;
    return { vendorId: vid };
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.vendorId = "";
  }

  /** Resolve an email-or-phone login id to the account email (phone via callable). */
  private async resolveEmail(loginId: string): Promise<string> {
    if (loginId.includes("@")) return loginId;
    const fn = httpsCallable<{ loginId: string }, { email: string }>(
      firebaseFunctions(),
      "resolveLoginId",
    );
    const res = await fn({ loginId }).catch(() => {
      throw new Error("No account found for that phone number.");
    });
    const email = res.data?.email;
    if (!email) throw new Error("No account found for that phone number.");
    return email;
  }

  // ---- subscriptions ----
  subscribeToRequests(
    vendorId: string,
    cb: (rs: DriverRequest[]) => void,
  ): () => void {
    const q = query(
      collection(this.db, "borderTaxRequests"),
      where("vendorId", "==", vendorId),
      orderBy("createdAt", "desc"),
      limit(REQUESTS_WINDOW),
    );
    return onSnapshot(
      q,
      (snap) => {
        const receipts: Record<string, Receipt> = {};
        const rows: DriverRequest[] = [];
        snap.forEach((d) => {
          const data = d.data() as BorderTaxRequestDoc;
          const req = this.mapRequest(d.id, data);
          rows.push(req);
          const rc = this.mapReceipt(d.id, data);
          if (rc) receipts[rc.receiptId] = rc;
        });
        this.receipts = receipts;
        cb(rows);
      },
      () => cb([]),
    );
  }

  subscribeToWallet(vendorId: string, cb: (w: Wallet) => void): () => void {
    return onSnapshot(
      doc(this.db, "wallets", vendorId),
      (snap) => {
        const d = (snap.data() as WalletDoc | undefined) || undefined;
        cb({
          vendorId,
          balance: d?.balance ?? 0,
          heldAmount: d?.heldAmount ?? 0,
          currency: d?.currency ?? "INR",
        });
      },
      () => cb({ vendorId, balance: 0, heldAmount: 0, currency: "INR" }),
    );
  }

  subscribeToTransactions(
    vendorId: string,
    cb: (t: Transaction[]) => void,
  ): () => void {
    const q = query(
      collection(this.db, "wallets", vendorId, "transactions"),
      orderBy("createdAt", "desc"),
      limit(TXN_WINDOW),
    );
    return onSnapshot(
      q,
      (snap) => {
        const rows: Transaction[] = [];
        snap.forEach((d) => {
          const t = d.data() as TransactionDoc;
          rows.push({
            txnId: t.txnId || d.id,
            type: t.type,
            amount: t.amount,
            refRequestId: t.refRequestId,
            createdAt: tsToIso(t.createdAt),
            balanceAfter: t.balanceAfter,
          });
        });
        cb(rows);
      },
      () => cb([]),
    );
  }

  // ---- one-shot reads ----
  async getSettings(vendorId: string): Promise<Settings> {
    const snap = await getDoc(doc(this.db, "vendors", vendorId));
    const v = (snap.data() as VendorDoc | undefined) || undefined;
    const pricing = v?.pricing || {};
    return {
      vendorId,
      businessName: v?.businessName ?? "",
      subdomain: v?.subdomain ?? "",
      brandLogoUrl: v?.brandLogoUrl ?? "",
      themeColor: v?.themeColor ?? "#FAC800",
      pricePerRequest: pricing["border-tax"] ?? 150,
      notifyWebhook: v?.notifyWebhook ?? "",
      pricing: {
        "border-tax": pricing["border-tax"] ?? 150,
        "state-tax": pricing["state-tax"] ?? 120,
        "rc-mobile": pricing["rc-mobile"] ?? 80,
        ...pricing,
      },
      email: v?.email,
    };
  }

  async getReceipt(id: string): Promise<Receipt> {
    if (this.receipts[id]) return this.receipts[id];
    const snap = await getDoc(doc(this.db, "borderTaxRequests", id));
    const data = snap.data() as BorderTaxRequestDoc | undefined;
    const rc = data ? this.mapReceipt(id, data) : null;
    if (!rc) throw new Error("Receipt not found.");
    return rc;
  }

  // ---- actions (callables) ----
  async startProcess(id: string): Promise<{ jobId: string }> {
    const fn = httpsCallable<{ requestId: string }, { jobId: string }>(
      firebaseFunctions(),
      "startRequest",
    );
    try {
      const res = await fn({ requestId: id });
      return { jobId: res.data?.jobId || id };
    } catch (e) {
      throw callableError(e);
    }
  }

  async retryRequest(id: string): Promise<void> {
    const fn = httpsCallable<{ requestId: string }, { ok: boolean }>(
      firebaseFunctions(),
      "retryRequest",
    );
    try {
      await fn({ requestId: id });
    } catch (e) {
      throw callableError(e);
    }
  }

  async topUpWallet(_vendorId: string, amount: number): Promise<void> {
    const fn = httpsCallable<{ amount: number }, { ok: boolean }>(
      firebaseFunctions(),
      "requestWalletTopup",
    );
    try {
      await fn({ amount });
    } catch (e) {
      throw callableError(e);
    }
  }

  async updateSettings(
    _vendorId: string,
    patch: Partial<Settings>,
  ): Promise<void> {
    const fn = httpsCallable<{ patch: Partial<Settings> }, { ok: boolean }>(
      firebaseFunctions(),
      "updateVendorSettings",
    );
    try {
      await fn({ patch });
    } catch (e) {
      throw callableError(e);
    }
  }

  async intervene(id: string, input: string): Promise<void> {
    const fn = httpsCallable<{ requestId: string; input: string }, { ok: boolean }>(
      firebaseFunctions(),
      "intervene",
    );
    try {
      await fn({ requestId: id, input });
    } catch (e) {
      throw callableError(e);
    }
  }

  async cancel(id: string): Promise<void> {
    const fn = httpsCallable<{ requestId: string }, { ok: boolean }>(
      firebaseFunctions(),
      "cancelRequest",
    );
    try {
      await fn({ requestId: id });
    } catch (e) {
      throw callableError(e);
    }
  }

  // ---- demo-only no-ops (real flow is server-driven) ----
  markPaid(): void {}
  setFailStage(): void {}
  scheduleLiveArrival(): void {}
  dispose(): void {}

  // ---- mapping ----
  private mapRequest(id: string, data: BorderTaxRequestDoc): DriverRequest {
    const agentStatus = data.aiAgentData?.status;
    const display: DisplayStatus =
      data.displayStatus ??
      agentToDisplay(agentStatus, !!data.start?.requested, data.status);
    const legacy = displayToLegacy(display);
    const ai = data.aiAgentData;
    const failure =
      display === "FAILED" || display === "CANCELLED"
        ? {
            stage: agentStatus ?? "",
            reason:
              ai?.error?.message ||
              data.manualReview?.reason ||
              data.cancelledDetails?.reason ||
              "Processing could not be completed.",
          }
        : null;

    return {
      requestId: id,
      vendorId: data.vendorId,
      vehicleNumber: data.params?.vehicleNumber ?? "—",
      engineNumber: "",
      chassisNumber: "",
      journeyDate: fmtJourney(data.params?.taxFrom),
      state: STATE_NAMES[data.params?.stateCode] ?? data.params?.stateCode ?? "—",
      border: data.params?.entryDistrict || data.params?.entryCheckpoint || "—",
      mobile: data.customer?.mobile || data.params?.mobileNumber || "",
      status: legacy,
      createdAt: tsToIso(data.createdAt),
      updatedAt: tsToIso(data.updatedAt ?? ai?.statusUpdatedAt),
      taxAmount: ai?.portalAmount,
      qr: ai?.qrCode
        ? { payload: ai.qrCode.url, expiresAt: tsToIso(ai.qrCode.expiredAt) }
        : undefined,
      failure,
      receiptId: ai?.receipt ? id : undefined,
      // Extra fields carried for Phase 5 (captcha/QR UI) and indexed filters.
      agentStatus,
      displayStatus: display,
      needsAction: data.needsAction ?? needsActionFor(display),
      captchaUrl:
        display === "ACTION_CAPTCHA" && ai?.captcha?.lastResult !== "accepted"
          ? ai?.captcha?.url
          : undefined,
      qrUrl: ai?.qrCode?.url,
      mockAgent: data.mockAgent === true,
      captcha:
        display === "ACTION_CAPTCHA" && ai?.captcha
          ? {
              url: ai.captcha.url,
              attempt: ai.captcha.attempt,
              maxAttempts: ai.captcha.maxAttempts,
              lastResult: ai.captcha.lastResult,
              deadline: ai.captcha.inputDeadline
                ? ai.captcha.inputDeadline.toMillis()
                : null,
            }
          : undefined,
    };
  }

  private mapReceipt(id: string, data: BorderTaxRequestDoc): Receipt | null {
    const r = data.aiAgentData?.receipt;
    if (!r) return null;
    const fields = r.fields || {};
    const num = fields.receiptNumber ?? fields.bankRef ?? "";
    const amt = data.aiAgentData?.portalAmount ?? Number(fields.amount ?? 0);
    return {
      receiptId: id,
      requestId: id,
      storageUrl: r.url || data.receiptDocumentUrl || "#",
      taxAmount: amt,
      govReference: String(num),
      generatedAt: tsToIso(r.uploadedAt),
    };
  }
}
