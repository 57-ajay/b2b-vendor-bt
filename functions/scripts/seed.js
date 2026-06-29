// One-off seed: create a demo vendor (Auth user + claim + vendor/wallet/public
// docs), top up the wallet, and optionally grant an admin claim. Run AFTER
// Firestore is enabled in the project.
//
//   cd functions && node scripts/seed.js
//
// Override via env: VENDOR_EMAIL, VENDOR_PASSWORD, VENDOR_NAME, VENDOR_PHONE,
// TOPUP, ADMIN_EMAIL (+ ADMIN_PASSWORD). Uses ../../service-account.json.

const path = require("path");
const admin = require("firebase-admin");

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  __dirname,
  "../../service-account.json",
);
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();
db.settings({ preferRest: true });
const auth = admin.auth();
const now = () => admin.firestore.Timestamp.now();

const VENDOR = {
  email: process.env.VENDOR_EMAIL || "vendor@demo.in",
  password: process.env.VENDOR_PASSWORD || "vendor123",
  businessName: process.env.VENDOR_NAME || "Sai Transport Services",
  phone: process.env.VENDOR_PHONE || "+919845011234",
  topup: Number(process.env.TOPUP || 5000),
};

function normalizePhone(s) {
  const d = (s || "").replace(/[^\d]/g, "");
  return d.length > 10 ? d.slice(-10) : d;
}

async function upsertUser(email, password, name) {
  try {
    return await auth.getUserByEmail(email);
  } catch {
    return await auth.createUser({ email, password, displayName: name });
  }
}

(async () => {
  const user = await upsertUser(VENDOR.email, VENDOR.password, VENDOR.businessName);
  const vendorId = user.uid;
  await auth.setCustomUserClaims(vendorId, { vendorId, role: "vendor" });

  const pricing = { "border-tax": 150, "state-tax": 120, "rc-mobile": 80 };
  const commission = { mode: "percent", value: 15 };

  await db.doc(`vendors/${vendorId}`).set(
    {
      vendorId,
      authUid: vendorId,
      businessName: VENDOR.businessName,
      email: VENDOR.email,
      phone: VENDOR.phone,
      subdomain: "",
      status: "active",
      brandLogoUrl: "",
      themeColor: "#FAC800",
      pricing,
      commission,
      notifyWebhook: "",
      createdAt: now(),
      updatedAt: now(),
    },
    { merge: true },
  );
  await db.doc(`wallets/${vendorId}`).set(
    { vendorId, balance: VENDOR.topup, heldAmount: 0, currency: "INR", updatedAt: now() },
    { merge: true },
  );
  const t = db.collection(`wallets/${vendorId}/transactions`).doc();
  await t.set({
    txnId: t.id,
    type: "TOPUP",
    amount: VENDOR.topup,
    balanceAfter: VENDOR.topup,
    createdAt: now(),
    note: "Seed top-up",
  });
  await db.doc(`vendorPublic/${vendorId}`).set({
    businessName: VENDOR.businessName,
    brandLogoUrl: "",
    themeColor: "#FAC800",
    active: true,
  });
  if (VENDOR.phone) {
    await db.doc(`loginIndex/${normalizePhone(VENDOR.phone)}`).set({ email: VENDOR.email });
  }

  if (process.env.ADMIN_EMAIL) {
    const a = await upsertUser(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD || "admin123",
      "Admin",
    );
    const claims = (await auth.getUser(a.uid)).customClaims || {};
    await auth.setCustomUserClaims(a.uid, { ...claims, admin: true });
    console.log("Admin granted:", process.env.ADMIN_EMAIL);
  }

  console.log("\n✓ Seeded vendor");
  console.log("  vendorId      :", vendorId);
  console.log("  login (email) :", VENDOR.email, "/", VENDOR.password);
  console.log("  login (phone) :", VENDOR.phone, "/", VENDOR.password);
  console.log("  wallet        : ₹" + VENDOR.topup);
  console.log("  customer link : /r/" + vendorId);
  process.exit(0);
})().catch((e) => {
  console.error("SEED ERROR:", e.code || "", e.message);
  process.exit(1);
});
