/** Last-10-digits phone key (handles +91 / 0 prefixes) for the login index. */
export function normalizePhone(s: string): string {
  const d = (s || "").replace(/[^\d]/g, "");
  return d.length > 10 ? d.slice(-10) : d;
}

const VEHICLE_RE = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/;
export function normalizeVehicleNumber(s: string): string {
  return (s || "").toUpperCase().replace(/[\s-]/g, "");
}
export function isVehicleNumber(s: string): boolean {
  return VEHICLE_RE.test(normalizeVehicleNumber(s));
}
export function isMobile(s: string): boolean {
  return /^(?:\+?91|0)?[6-9]\d{9}$/.test((s || "").replace(/[\s-]/g, ""));
}

/** Tax modes the portal offers per state (mirrors the suvidha validators). */
export const TAX_MODES_BY_STATE: Record<string, string[]> = {
  UP: ["DAYS", "MONTHLY", "QUARTERLY", "YEARLY"],
  HR: ["DAYS", "MONTHLY", "QUARTERLY", "HALF YEARLY", "YEARLY"],
  MP: ["DAYS"],
  PB: ["DAYS", "QUARTERLY"],
};

export const STATE_NAMES: Record<string, string> = {
  UP: "UTTAR PRADESH",
  HR: "HARYANA",
  MP: "MADHYA PRADESH",
  PB: "PUNJAB",
};
