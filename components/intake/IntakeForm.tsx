"use client";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import {
  firebaseDb,
  firebaseFunctions,
  isFirebaseConfigured,
} from "@/lib/firebase";
import {
  type BorderTaxIntake,
  isMobileNumber,
  isVehicleNumber,
  normalizeVehicleNumber,
  STATE_CONFIGS,
  STATE_LIST,
  TAX_MODE_LABELS,
} from "@/lib/border-tax";
import type { StateCode, TaxMode } from "@/types/firestore";

interface VendorBrand {
  businessName: string;
  brandLogoUrl: string;
  themeColor: string;
  active: boolean;
}

const labelStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: "7px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: "44px",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "0 14px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  background: "var(--surface, #fff)",
  color: "var(--text, #14151A)",
};

const fieldWrap: CSSProperties = { marginTop: "16px" };

export default function IntakeForm({ vendorId }: { vendorId: string }) {
  const [brand, setBrand] = useState<VendorBrand | null>(null);
  const [brandLoaded, setBrandLoaded] = useState(!isFirebaseConfigured);

  const [stateCode, setStateCode] = useState<StateCode>("UP");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [taxMode, setTaxMode] = useState<TaxMode>("DAYS");
  const [taxFrom, setTaxFrom] = useState("");
  const [duration, setDuration] = useState("1");
  const [entryDistrict, setEntryDistrict] = useState("");
  const [distance, setDistance] = useState("");
  const [advanced, setAdvanced] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ requestId: string } | null>(null);

  const cfg = STATE_CONFIGS[stateCode];
  const isDays = taxMode === "DAYS";
  const theme = brand?.themeColor || "#FAC800";

  // Vendor branding for the header (public, display-safe doc).
  useEffect(() => {
    let alive = true;
    if (!isFirebaseConfigured) return;
    getDoc(doc(firebaseDb(), "vendorPublic", vendorId))
      .then((snap) => {
        if (!alive) return;
        setBrand(snap.exists() ? (snap.data() as VendorBrand) : null);
        setBrandLoaded(true);
      })
      .catch(() => alive && setBrandLoaded(true));
    return () => {
      alive = false;
    };
  }, [vendorId]);

  const linkInvalid = useMemo(
    () => isFirebaseConfigured && brandLoaded && (!brand || brand.active === false),
    [brandLoaded, brand],
  );

  function validate(): string | null {
    if (!name.trim()) return "Enter the customer name.";
    if (!isMobileNumber(mobile)) return "Enter a valid 10-digit mobile number.";
    if (!isVehicleNumber(vehicle))
      return "Enter a valid vehicle number (e.g. UP80AB1234).";
    if (!taxFrom) return "Choose the tax-from date.";
    if (isDays) {
      const d = parseInt(duration, 10);
      if (!d || d < 1) return "Enter the number of days (1 or more).";
    }
    return null;
  }

  async function submit() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    if (!isFirebaseConfigured) {
      setError("Submissions aren’t available in this preview.");
      return;
    }
    setSubmitting(true);
    const cleanMobile = mobile.replace(/[\s-]/g, "");
    const payload: BorderTaxIntake = {
      vendorId,
      customer: { name: name.trim(), mobile: cleanMobile },
      params: {
        stateCode,
        vehicleNumber: normalizeVehicleNumber(vehicle),
        mobileNumber: cleanMobile,
        taxMode,
        taxFrom,
        ...(isDays ? { duration: parseInt(duration, 10) } : {}),
        ...(entryDistrict.trim()
          ? { entryDistrict: entryDistrict.trim() }
          : {}),
        ...(cfg.hasDistance && distance.trim()
          ? { distance: distance.trim() }
          : {}),
      },
    };
    try {
      const fn = httpsCallable<BorderTaxIntake, { requestId: string }>(
        firebaseFunctions(),
        "submitBorderTaxRequest",
      );
      const res = await fn(payload);
      setDone({ requestId: res.data?.requestId || "" });
    } catch (e) {
      setError(
        (e as { message?: string })?.message ||
          "Could not submit your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 18px",
        fontFamily: "Poppins, system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Brand header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "22px",
          }}
        >
          {brand?.brandLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.brandLogoUrl}
              alt=""
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: theme,
                color: "#1b1b1b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {(brand?.businessName || "Border Tax").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>
              {brand?.businessName || "Border Tax Payment"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              State border tax — pay in minutes
            </div>
          </div>
        </div>

        {linkInvalid ? (
          <Card>
            <div style={{ fontWeight: 600, fontSize: 17 }}>Link unavailable</div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              This payment link is invalid or no longer active. Please ask your
              operator for an up-to-date link.
            </p>
          </Card>
        ) : done ? (
          <Card>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "#E6F5EE",
                color: "#0E9E6E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginBottom: 14,
              }}
            >
              ✓
            </div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Request submitted</div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              Your operator will start the process shortly. Keep the vehicle and
              this mobile number handy — you’ll get a UPI QR to pay the
              government tax when it’s ready.
            </p>
            {done.requestId && (
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "var(--text-secondary)",
                }}
              >
                Reference: {done.requestId}
              </div>
            )}
            <button
              onClick={() => {
                setDone(null);
                setVehicle("");
                setName("");
                setMobile("");
              }}
              style={{
                marginTop: 20,
                height: 44,
                width: "100%",
                border: "1px solid var(--border)",
                background: "transparent",
                borderRadius: 11,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                color: "var(--text, #14151A)",
              }}
            >
              Submit another vehicle
            </button>
          </Card>
        ) : (
          <Card>
            <Field label="Entering state">
              <select
                value={stateCode}
                onChange={(e) => {
                  const sc = e.target.value as StateCode;
                  setStateCode(sc);
                  const modes = STATE_CONFIGS[sc].taxModes;
                  if (!modes.includes(taxMode)) setTaxMode(modes[0]);
                }}
                style={inputStyle}
              >
                {STATE_LIST.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Customer name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                style={inputStyle}
              />
            </Field>

            <Field label="Mobile number">
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="98XXXXXXXX"
                inputMode="tel"
                style={inputStyle}
              />
            </Field>

            <Field label="Vehicle number">
              <input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                placeholder="UP80AB1234"
                autoCapitalize="characters"
                style={{
                  ...inputStyle,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: ".04em",
                }}
              />
            </Field>

            <div style={{ display: "flex", gap: 12, ...fieldWrap }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Tax mode</label>
                <select
                  value={taxMode}
                  onChange={(e) => setTaxMode(e.target.value as TaxMode)}
                  style={inputStyle}
                >
                  {cfg.taxModes.map((m) => (
                    <option key={m} value={m}>
                      {TAX_MODE_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Tax from</label>
                <input
                  type="date"
                  value={taxFrom}
                  onChange={(e) => setTaxFrom(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {isDays ? (
              <Field label="Number of days">
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            ) : (
              <p
                style={{
                  ...fieldWrap,
                  fontSize: 12.5,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                The portal computes the validity period for{" "}
                {TAX_MODE_LABELS[taxMode].toLowerCase()} automatically.
              </p>
            )}

            {/* Advanced overrides — server defaults apply when left blank. */}
            <button
              type="button"
              onClick={() => setAdvanced((a) => !a)}
              style={{
                marginTop: 18,
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              {advanced ? "− Hide" : "+ Advanced"} entry options
            </button>
            {advanced && (
              <div style={{ marginTop: 6 }}>
                <Field label="Entry district (optional)">
                  <input
                    value={entryDistrict}
                    onChange={(e) => setEntryDistrict(e.target.value)}
                    placeholder={cfg.entryDistrictDefault}
                    style={inputStyle}
                  />
                </Field>
                {cfg.hasDistance && (
                  <Field label="Distance in km (optional)">
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      placeholder="500"
                      style={inputStyle}
                    />
                  </Field>
                )}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: 16,
                  fontSize: 13,
                  color: "#C0392B",
                  background: "#FCEBE9",
                  borderRadius: 9,
                  padding: "10px 12px",
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={submitting}
              style={{
                width: "100%",
                marginTop: 22,
                height: 48,
                border: "none",
                borderRadius: 11,
                background: theme,
                color: "#1b1b1b",
                fontSize: 15,
                fontWeight: 700,
                cursor: submitting ? "default" : "pointer",
                fontFamily: "inherit",
                opacity: submitting ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
              }}
            >
              {submitting && (
                <span
                  style={{
                    width: 15,
                    height: 15,
                    border: "2px solid rgba(0,0,0,.3)",
                    borderTopColor: "#1b1b1b",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                    display: "inline-block",
                  }}
                />
              )}
              {submitting ? "Submitting" : "Submit request"}
            </button>

            <p
              style={{
                marginTop: 14,
                fontSize: 12,
                color: "var(--text-muted)",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              You’ll pay the government border tax via a UPI QR when your
              operator starts the process.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface, #fff)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "24px",
        boxShadow: "0 8px 30px rgba(16,18,30,.06)",
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
