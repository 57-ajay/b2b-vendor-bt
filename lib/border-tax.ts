import type { StateCode, TaxMode } from "@/types/firestore";

/* ============================================================================
   Border-tax intake config — mirrors the suvidha per-state validators
   (api/src/validators/states/*). The customer supplies vehicleNumber, taxMode,
   taxFrom and (for DAYS mode) a duration; the server computes taxUpto with the
   correct per-state offset and fills every other field from its defaults, so
   the intake form stays short.
   ============================================================================ */

export interface StateIntakeConfig {
  code: StateCode;
  name: string;
  /** Tax modes the state's portal offers (drives the dropdown). */
  taxModes: TaxMode[];
  /** Default entry district (server default; shown as a placeholder override). */
  entryDistrictDefault: string;
  /** HR is the only state with a Distance field. */
  hasDistance: boolean;
}

export const STATE_CONFIGS: Record<StateCode, StateIntakeConfig> = {
  UP: {
    code: "UP",
    name: "Uttar Pradesh",
    taxModes: ["DAYS", "MONTHLY", "QUARTERLY", "YEARLY"],
    entryDistrictDefault: "GAUTAM BUDDHA NAGAR",
    hasDistance: false,
  },
  HR: {
    code: "HR",
    name: "Haryana",
    taxModes: ["DAYS", "MONTHLY", "QUARTERLY", "HALF YEARLY", "YEARLY"],
    entryDistrictDefault: "FARIDABAD",
    hasDistance: true,
  },
  MP: {
    code: "MP",
    name: "Madhya Pradesh",
    taxModes: ["DAYS"],
    entryDistrictDefault: "SHEOPUR",
    hasDistance: false,
  },
  PB: {
    code: "PB",
    name: "Punjab",
    taxModes: ["DAYS", "QUARTERLY"],
    entryDistrictDefault: "MOHALI",
    hasDistance: false,
  },
};

export const STATE_LIST: StateIntakeConfig[] = [
  STATE_CONFIGS.UP,
  STATE_CONFIGS.HR,
  STATE_CONFIGS.MP,
  STATE_CONFIGS.PB,
];

export const TAX_MODE_LABELS: Record<TaxMode, string> = {
  DAYS: "Days",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  "HALF YEARLY": "Half-yearly",
  YEARLY: "Yearly",
};

/* ---- vehicle number (mirrors api/src/validators/types.ts) ---- */
const VEHICLE_RE = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/;

export function normalizeVehicleNumber(s: string): string {
  return s.toUpperCase().replace(/[\s-]/g, "");
}
export function isVehicleNumber(s: string): boolean {
  return VEHICLE_RE.test(normalizeVehicleNumber(s));
}

/** Indian mobile: 10 digits starting 6-9, optionally +91 / 0 prefixed. */
export function isMobileNumber(s: string): boolean {
  return /^(?:\+?91|0)?[6-9]\d{9}$/.test(s.replace(/[\s-]/g, ""));
}

/* ---- the payload the intake form sends to submitBorderTaxRequest ---- */
export interface BorderTaxIntakeParams {
  stateCode: StateCode;
  vehicleNumber: string;
  mobileNumber: string;
  taxMode: TaxMode;
  taxFrom: string; // YYYY-MM-DD
  duration?: number; // DAYS mode → server computes taxUpto
  entryDistrict?: string;
  entryCheckpoint?: string;
  distance?: string; // HR only
}

export interface BorderTaxIntake {
  vendorId: string;
  customer: { name: string; mobile: string };
  params: BorderTaxIntakeParams;
}
