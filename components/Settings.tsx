"use client";
import type { ViewModel } from "@/types";

const LABEL: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  color: "var(--text-muted)",
};
const FIELD_INPUT: React.CSSProperties = {
  width: "100%",
  marginTop: "7px",
  height: "42px",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "0 14px",
  fontSize: "14px",
  fontFamily: "inherit",
};

/** Settings route — ported 1:1 from the source template (sc-if routeIsSettings). */
export default function SettingsView({ vm }: { vm: ViewModel }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "6px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "24px",
        }}
      >
        {(vm.settingsTabs ?? []).map((t, i) => (
          <button
            key={i}
            onClick={t.onClick}
            style={{
              height: "38px",
              padding: "0 4px",
              marginRight: "18px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "13.5px",
              fontWeight: t.weight,
              color: t.color,
              borderBottom: "2px solid " + t.border,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: "560px" }}>
        {vm.st_profile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={LABEL}>Business name</label>
              <input value={vm.set_business} readOnly style={FIELD_INPUT} />
            </div>
            <div>
              <label style={LABEL}>Email</label>
              <input value={vm.set_email} readOnly style={FIELD_INPUT} />
            </div>
            <div>
              <label style={LABEL}>New password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                style={FIELD_INPUT}
              />
            </div>
            <button
              style={{
                alignSelf: "flex-start",
                height: "42px",
                padding: "0 22px",
                border: "none",
                borderRadius: "10px",
                background: "var(--primary)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Save changes
            </button>
          </div>
        )}
        {vm.st_branding && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={LABEL}>Logo</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FAC800",
                    fontWeight: 700,
                    fontSize: "22px",
                  }}
                >
                  T
                </div>
                <button
                  style={{
                    height: "38px",
                    padding: "0 16px",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    background: "var(--surface)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "var(--text)",
                  }}
                >
                  Upload new
                </button>
              </div>
            </div>
            <div>
              <label style={LABEL}>Accent color</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                {(vm.accentSwatches ?? []).map((a, i) => (
                  <button
                    key={i}
                    onClick={a.onClick}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "9px",
                      background: a.color,
                      border: "2px solid " + a.border,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label style={LABEL}>Subdomain</label>
              <div
                style={{
                  marginTop: "7px",
                  height: "42px",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "0 14px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "14px",
                  fontFamily: "'JetBrains Mono',monospace",
                  color: "var(--text-secondary)",
                  background: "var(--surface-inset)",
                }}
              >
                {vm.set_subdomain}
              </div>
            </div>
          </div>
        )}
        {vm.st_pricing && (
          <div>
            <label style={LABEL}>Price per request</label>
            <input
              value={vm.set_price}
              onChange={vm.onPriceInput}
              style={{
                width: "200px",
                marginTop: "7px",
                height: "42px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "0 14px",
                fontSize: "15px",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            />
            <div
              style={{
                fontSize: "12.5px",
                color: "var(--text-muted)",
                marginTop: "10px",
                lineHeight: 1.5,
                maxWidth: "420px",
              }}
            >
              This is the amount held from your wallet when an operator starts a
              request. The hold is charged only when a receipt is produced, and
              released on failure.
            </div>
            <button
              onClick={vm.onSavePrice}
              style={{
                display: "block",
                marginTop: "18px",
                height: "42px",
                padding: "0 22px",
                border: "none",
                borderRadius: "10px",
                background: "var(--primary)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Save price
            </button>
          </div>
        )}
        {vm.st_notif && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid var(--divider)",
              }}
            >
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 500 }}>
                  Status-change alerts
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "2px",
                  }}
                >
                  Toast on every request transition
                </div>
              </div>
              <button
                onClick={vm.onToggleNotif}
                style={{
                  width: "44px",
                  height: "26px",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: vm.notifBg,
                  position: "relative",
                  transition: "background .2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: vm.notifKnob,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--surface)",
                    transition: "left .2s",
                  }}
                />
              </button>
            </div>
            <div>
              <label style={LABEL}>Webhook URL (optional)</label>
              <input
                value={vm.set_webhook}
                readOnly
                placeholder="https://"
                style={{
                  width: "100%",
                  marginTop: "7px",
                  height: "42px",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "0 14px",
                  fontSize: "14px",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
