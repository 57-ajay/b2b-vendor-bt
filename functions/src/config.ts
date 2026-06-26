import { defineSecret, defineString } from "firebase-functions/params";

/** Deploy region. Must match NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION in the app. */
export const REGION = process.env.FUNCTIONS_REGION || "us-central1";

/** suvidha agent base URL (e.g. https://agent.example.com). Set via functions env. */
export const SUVIDHA_API_URL = defineString("SUVIDHA_API_URL", { default: "" });

/** Shared secret sent to the agent as X-Internal-Key (secret param). */
export const INTERNAL_API_KEY = defineSecret("INTERNAL_API_KEY");

/** One-time secret allowing provisionVendor to bootstrap the first admin/vendor. */
export const ADMIN_BOOTSTRAP_SECRET = defineSecret("ADMIN_BOOTSTRAP_SECRET");

/** Fallback per-request service fee (₹) when a vendor has no explicit pricing. */
export const DEFAULT_SERVICE_FEE = Number(process.env.BORDER_TAX_SERVICE_FEE || "150");

/** Enforce App Check on the public intake callable. */
export const ENFORCE_APP_CHECK = process.env.ENFORCE_APP_CHECK === "1";
