/**
 * Cloud Functions for the vendor border-tax panel.
 *
 * Implemented in Phase 4. Planned surface:
 *
 *   Callables (browser → Functions, validated, Admin-SDK writes):
 *     - submitBorderTaxRequest  public + App Check; customer intake → request doc
 *     - startRequest            vendor; atomic wallet HOLD + flag start.requested
 *     - intervene               vendor; proxy POST /api/jobs/:id/intervene {input}
 *     - cancelRequest           vendor; proxy POST /api/jobs/:id/cancel
 *     - provisionVendor         admin;  Auth user + {vendorId} claim + vendor/wallet
 *     - resolveLoginId          public; phone → auth email for sign-in
 *     - adminTopup              admin;  wallet TOPUP
 *     - updateVendorSettings    vendor; whitelist profile/branding/pricing edits
 *
 *   Firestore triggers (keep the agent API private + money correct):
 *     - onStartRequested  borderTaxRequests onWrite → POST /api/run (compensate on fail)
 *     - onTerminal        terminal status → wallet COMMIT (completed) / RELEASE (cancelled|failed)
 *     - onStatusChange    maintain vendors/{id}/stats rollup counters
 *
 * The suvidha agent base URL + INTERNAL_API_KEY are read from Functions config /
 * env and never reach the browser.
 */
export {};
