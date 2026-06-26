import { type CallableRequest, HttpsError, onCall } from "firebase-functions/v2/https";

import { auth, db, FieldValue, now } from "./admin";
import {
  ADMIN_BOOTSTRAP_SECRET,
  DEFAULT_SERVICE_FEE,
  ENFORCE_APP_CHECK,
  INTERNAL_API_KEY,
} from "./config";
import { agentCancel, agentIntervene } from "./lib/agent";
import {
  isMobile,
  isVehicleNumber,
  normalizePhone,
  normalizeVehicleNumber,
  TAX_MODES_BY_STATE,
} from "./lib/util";
import { holdAndRetry, holdAndStart, topup } from "./lib/wallet";

/* ---- guards ---- */
function requireVendor(request: CallableRequest): string {
  const vid = request.auth?.token?.vendorId as string | undefined;
  if (!request.auth || !vid) {
    throw new HttpsError("unauthenticated", "Sign in as a vendor.");
  }
  return vid;
}
function requireAdmin(request: CallableRequest): void {
  if (!request.auth?.token?.admin) {
    throw new HttpsError("permission-denied", "Admin only.");
  }
}
async function loadRequestForVendor(requestId: string, vendorId: string) {
  if (!requestId) throw new HttpsError("invalid-argument", "Missing requestId.");
  const ref = db.doc(`borderTaxRequests/${requestId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Request not found.");
  const data = snap.data() as Record<string, unknown>;
  if (data.vendorId !== vendorId) {
    throw new HttpsError("permission-denied", "Not your request.");
  }
  return { ref, data };
}

/* ---- customer intake (public) ---- */
export const submitBorderTaxRequest = onCall(
  { enforceAppCheck: ENFORCE_APP_CHECK },
  async (request) => {
    const body = request.data as {
      vendorId?: string;
      customer?: { name?: string; mobile?: string };
      params?: Record<string, unknown>;
    };
    const vendorId = (body.vendorId || "").trim();
    if (!vendorId) throw new HttpsError("invalid-argument", "Missing vendorId.");
    const p = body.params || {};
    const stateCode = String(p.stateCode || "").toUpperCase();
    const modes = TAX_MODES_BY_STATE[stateCode];
    if (!modes) throw new HttpsError("invalid-argument", "Unsupported state.");
    const taxMode = String(p.taxMode || "").toUpperCase();
    if (!modes.includes(taxMode)) {
      throw new HttpsError("invalid-argument", `Invalid tax mode for ${stateCode}.`);
    }
    if (!isVehicleNumber(String(p.vehicleNumber || ""))) {
      throw new HttpsError("invalid-argument", "Invalid vehicle number.");
    }
    const mobile = String(body.customer?.mobile || p.mobileNumber || "");
    if (!isMobile(mobile)) {
      throw new HttpsError("invalid-argument", "Invalid mobile number.");
    }
    if (!p.taxFrom) throw new HttpsError("invalid-argument", "Missing tax-from date.");
    const name = String(body.customer?.name || "").trim();
    if (!name) throw new HttpsError("invalid-argument", "Missing customer name.");

    const vSnap = await db.doc(`vendors/${vendorId}`).get();
    if (!vSnap.exists) throw new HttpsError("not-found", "Unknown vendor.");
    const vendor = vSnap.data() as Record<string, unknown>;
    if (vendor.status === "suspended") {
      throw new HttpsError("failed-precondition", "This vendor is not active.");
    }

    const cleanMobile = mobile.replace(/[\s-]/g, "");
    const cleanVehicle = normalizeVehicleNumber(String(p.vehicleNumber));

    // Upsert the customer by mobile (the id doubles as the agent driverId).
    const custCol = db.collection(`vendors/${vendorId}/customers`);
    const existing = await custCol.where("mobile", "==", cleanMobile).limit(1).get();
    let customerId: string;
    if (!existing.empty) {
      customerId = existing.docs[0].id;
      await existing.docs[0].ref.set(
        { name, requestCount: FieldValue.increment(1), updatedAt: now() },
        { merge: true },
      );
    } else {
      const cRef = custCol.doc();
      customerId = cRef.id;
      await cRef.set({
        customerId,
        name,
        mobile: cleanMobile,
        requestCount: 1,
        createdAt: now(),
        updatedAt: now(),
      });
    }

    const pricing = (vendor.pricing as Record<string, number>) || {};
    const serviceFee = Number(pricing["border-tax"] ?? DEFAULT_SERVICE_FEE);
    const commission = vendor.commission || { mode: "percent", value: 0 };

    const reqRef = db.collection("borderTaxRequests").doc();
    const requestId = reqRef.id;
    const params: Record<string, unknown> = {
      stateCode,
      vehicleNumber: cleanVehicle,
      mobileNumber: cleanMobile,
      taxMode,
      taxFrom: String(p.taxFrom),
    };
    if (p.duration != null) params.duration = Number(p.duration);
    if (p.taxUpto) params.taxUpto = String(p.taxUpto);
    if (p.entryDistrict) params.entryDistrict = String(p.entryDistrict);
    if (p.entryCheckpoint) params.entryCheckpoint = String(p.entryCheckpoint);
    if (p.distance) params.distance = String(p.distance);

    await reqRef.set({
      requestId,
      vendorId,
      customerId,
      service: "border-tax",
      params,
      customer: { name, mobile: cleanMobile },
      serviceFee,
      commissionSnapshot: commission,
      start: { requested: false, attempt: 0 },
      displayStatus: "PENDING",
      needsAction: true,
      walletHeld: false,
      walletSettled: false,
      createdAt: now(),
      updatedAt: now(),
    });
    return { requestId };
  },
);

/* ---- vendor: start / retry / intervene / cancel ---- */
export const startRequest = onCall(async (request) => {
  const vendorId = requireVendor(request);
  const requestId = String((request.data as { requestId?: string })?.requestId || "");
  const { data } = await loadRequestForVendor(requestId, vendorId);
  if ((data.start as { requested?: boolean })?.requested) {
    return { jobId: requestId }; // already started
  }
  const fee = Number(data.serviceFee ?? DEFAULT_SERVICE_FEE);
  try {
    await holdAndStart(vendorId, requestId, fee, request.auth!.uid);
  } catch (e) {
    const m = (e as Error).message;
    if (m === "INSUFFICIENT") {
      throw new HttpsError("failed-precondition", "INSUFFICIENT wallet balance.");
    }
    throw new HttpsError("internal", "Could not start the request.");
  }
  return { jobId: requestId };
});

export const retryRequest = onCall(async (request) => {
  const vendorId = requireVendor(request);
  const requestId = String((request.data as { requestId?: string })?.requestId || "");
  const { data } = await loadRequestForVendor(requestId, vendorId);
  const fee = Number(data.serviceFee ?? DEFAULT_SERVICE_FEE);
  try {
    await holdAndRetry(vendorId, requestId, fee);
  } catch (e) {
    const m = (e as Error).message;
    if (m === "INSUFFICIENT") {
      throw new HttpsError("failed-precondition", "INSUFFICIENT wallet balance.");
    }
    if (m === "NOT_RETRYABLE") {
      throw new HttpsError("failed-precondition", "This request can’t be retried.");
    }
    throw new HttpsError("internal", "Could not retry the request.");
  }
  return { ok: true };
});

export const intervene = onCall({ secrets: [INTERNAL_API_KEY] }, async (request) => {
  const vendorId = requireVendor(request);
  const { requestId, input } = request.data as { requestId?: string; input?: string };
  await loadRequestForVendor(String(requestId || ""), vendorId);
  const r = await agentIntervene(String(requestId), String(input || ""));
  if (!r.ok) throw new HttpsError("internal", r.message || "Could not submit.");
  return { ok: true };
});

export const cancelRequest = onCall({ secrets: [INTERNAL_API_KEY] }, async (request) => {
  const vendorId = requireVendor(request);
  const { requestId } = request.data as { requestId?: string };
  await loadRequestForVendor(String(requestId || ""), vendorId);
  const r = await agentCancel(String(requestId));
  if (!r.ok) throw new HttpsError("internal", r.message || "Could not cancel.");
  return { ok: true };
});

/* ---- vendor: settings + wallet top-up request ---- */
export const updateVendorSettings = onCall(async (request) => {
  const vendorId = requireVendor(request);
  const patch = ((request.data as { patch?: Record<string, unknown> })?.patch) || {};
  const allowed: Record<string, unknown> = { updatedAt: now() };
  for (const k of ["businessName", "brandLogoUrl", "themeColor", "notifyWebhook", "subdomain"]) {
    if (k in patch) allowed[k] = String(patch[k]);
  }
  if (patch.pricing && typeof patch.pricing === "object") {
    allowed.pricing = patch.pricing;
  } else if (typeof patch.pricePerRequest === "number") {
    allowed.pricing = { "border-tax": patch.pricePerRequest };
  }
  if (patch.commission && typeof patch.commission === "object") {
    allowed.commission = patch.commission;
  }
  await db.doc(`vendors/${vendorId}`).set(allowed, { merge: true });

  const pub: Record<string, unknown> = {};
  if ("businessName" in allowed) pub.businessName = allowed.businessName;
  if ("brandLogoUrl" in allowed) pub.brandLogoUrl = allowed.brandLogoUrl;
  if ("themeColor" in allowed) pub.themeColor = allowed.themeColor;
  if (Object.keys(pub).length) {
    await db.doc(`vendorPublic/${vendorId}`).set(pub, { merge: true });
  }
  return { ok: true };
});

export const requestWalletTopup = onCall(async (request) => {
  const vendorId = requireVendor(request);
  const amount = Number((request.data as { amount?: number })?.amount || 0);
  if (!(amount > 0)) {
    throw new HttpsError("invalid-argument", "Enter a positive amount.");
  }
  const ref = db.collection(`vendors/${vendorId}/topupRequests`).doc();
  await ref.set({
    id: ref.id,
    vendorId,
    amount,
    status: "pending",
    createdAt: now(),
  });
  return { ok: true, id: ref.id };
});

/* ---- public: phone → login email ---- */
export const resolveLoginId = onCall(async (request) => {
  const loginId = String((request.data as { loginId?: string })?.loginId || "");
  const phone = normalizePhone(loginId);
  if (!phone) throw new HttpsError("invalid-argument", "Enter your phone number.");
  const snap = await db.doc(`loginIndex/${phone}`).get();
  const email = snap.exists ? (snap.data()!.email as string) : "";
  if (!email) throw new HttpsError("not-found", "No account for that number.");
  return { email };
});

/* ---- admin: provision a vendor + top up a wallet ---- */
export const provisionVendor = onCall(
  { secrets: [ADMIN_BOOTSTRAP_SECRET] },
  async (request) => {
    const d = request.data as Record<string, unknown>;
    const isAdmin = !!request.auth?.token?.admin;
    const secret = ADMIN_BOOTSTRAP_SECRET.value();
    const bootstrapOk =
      !!secret && typeof d.bootstrapSecret === "string" && d.bootstrapSecret === secret;
    if (!isAdmin && !bootstrapOk) {
      throw new HttpsError("permission-denied", "Admin only.");
    }
    const email = String(d.email || "").trim().toLowerCase();
    const password = String(d.password || "");
    const businessName = String(d.businessName || "").trim();
    const phone = String(d.phone || "").trim();
    if (!email || password.length < 6) {
      throw new HttpsError("invalid-argument", "Email + password (6+) required.");
    }
    if (!businessName) {
      throw new HttpsError("invalid-argument", "businessName required.");
    }

    let uid: string;
    try {
      const user = await auth.createUser({ email, password, displayName: businessName });
      uid = user.uid;
    } catch (e) {
      throw new HttpsError("already-exists", (e as Error).message || "Could not create user.");
    }
    const vendorId = uid;
    await auth.setCustomUserClaims(vendorId, { vendorId, role: "vendor" });

    const pricing =
      d.pricing && typeof d.pricing === "object"
        ? (d.pricing as Record<string, number>)
        : { "border-tax": DEFAULT_SERVICE_FEE, "state-tax": 120, "rc-mobile": 80 };
    const commission =
      d.commission && typeof d.commission === "object"
        ? d.commission
        : { mode: "percent", value: 0 };
    const themeColor = String(d.themeColor || "#FAC800");
    const brandLogoUrl = String(d.brandLogoUrl || "");

    const batch = db.batch();
    batch.set(db.doc(`vendors/${vendorId}`), {
      vendorId,
      authUid: vendorId,
      businessName,
      email,
      phone,
      subdomain: String(d.subdomain || ""),
      status: "active",
      brandLogoUrl,
      themeColor,
      pricing,
      commission,
      notifyWebhook: "",
      createdAt: now(),
      updatedAt: now(),
    });
    batch.set(db.doc(`wallets/${vendorId}`), {
      vendorId,
      balance: 0,
      heldAmount: 0,
      currency: "INR",
      updatedAt: now(),
    });
    batch.set(db.doc(`vendorPublic/${vendorId}`), {
      businessName,
      brandLogoUrl,
      themeColor,
      active: true,
    });
    if (phone) {
      batch.set(db.doc(`loginIndex/${normalizePhone(phone)}`), { email });
    }
    await batch.commit();
    return { vendorId };
  },
);

export const adminTopup = onCall(async (request) => {
  requireAdmin(request);
  const { vendorId, amount, note } = request.data as {
    vendorId?: string;
    amount?: number;
    note?: string;
  };
  if (!vendorId || !(Number(amount) > 0)) {
    throw new HttpsError("invalid-argument", "vendorId + positive amount required.");
  }
  await topup(String(vendorId), Number(amount), note ? String(note) : "Admin top-up");
  return { ok: true };
});
