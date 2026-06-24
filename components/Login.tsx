"use client";
import type { ViewModel } from "@/types";

/** Login screen — ported 1:1 from the source template (sc-if routeIsLogin). */
export default function Login({ vm }: { vm: ViewModel }) {
  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <div
        style={{
          flex: "0 0 44%",
          background:
            "linear-gradient(150deg,#0A0F4D 0%,#02066F 48%,#010436 100%)",
          color: "#fff",
          padding: "64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(150deg,#FFE27A,#FAC800)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "var(--primary)",
              fontSize: "18px",
              boxShadow: "0 6px 18px rgba(250,200,0,.4)",
            }}
          >
            T
          </div>
          <span
            style={{ fontWeight: 600, fontSize: "16px", letterSpacing: ".04em" }}
          >
            TAXFLOW
          </span>
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: "400px" }}>
          <div
            style={{
              fontSize: "13px",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#FAC800",
              fontWeight: 600,
              marginBottom: "18px",
            }}
          >
            Border Tax Automation
          </div>
          <div
            style={{
              fontSize: "33px",
              fontWeight: 600,
              lineHeight: 1.22,
              letterSpacing: "-.015em",
            }}
          >
            Border tax, automated end‑to‑end.
          </div>
          <div
            style={{
              marginTop: "18px",
              color: "#AEB2DA",
              fontSize: "14px",
              lineHeight: 1.65,
            }}
          >
            Submit a vehicle, hold the fee, let the engine file it, and hand the
            driver a receipt. One calm console for the whole flow.
          </div>
          <div style={{ marginTop: "34px", display: "flex", gap: "28px" }}>
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                99.2%
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#8A90C8",
                  letterSpacing: ".04em",
                  marginTop: "2px",
                }}
              >
                FILING SUCCESS
              </div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,.12)" }} />
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                &lt;60s
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#8A90C8",
                  letterSpacing: ".04em",
                  marginTop: "2px",
                }}
              >
                AVG. TURNAROUND
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            color: "#7C82C0",
            fontSize: "12px",
            fontFamily: "'JetBrains Mono',monospace",
            letterSpacing: ".02em",
          }}
        >
          yourname.taxflow.in
        </div>
        <div
          style={{
            position: "absolute",
            right: "-160px",
            top: "38%",
            width: "460px",
            height: "460px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(250,200,0,.16),transparent 62%)",
            transform: "translateY(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "50%",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.06)",
            transform: "translateY(-50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "50%",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            border: "1px solid rgba(250,200,0,.2)",
            transform: "translateY(-50%)",
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            animation: "fadeUp .4s both",
          }}
        >
          <div
            style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-.01em" }}
          >
            Sign in
          </div>
          <div
            style={{
              color: "var(--text-secondary)",
              fontSize: "13px",
              marginTop: "6px",
            }}
          >
            Operator access to your driver panel.
          </div>
          <div style={{ marginTop: "28px" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                color: "var(--text-muted)",
              }}
            >
              Email
            </label>
            <input
              value={vm.loginEmail}
              onChange={vm.onLoginEmail}
              placeholder="operator@taxflow.in"
              style={{
                width: "100%",
                marginTop: "7px",
                height: "44px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "0 14px",
                fontSize: "14px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>
          <div style={{ marginTop: "16px" }}>
            <label
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                color: "var(--text-muted)",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative", marginTop: "7px" }}>
              <input
                value={vm.loginPass}
                onChange={vm.onLoginPass}
                type={vm.loginPassType}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: "44px",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "0 44px 0 14px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={vm.onTogglePass}
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "6px",
                  height: "32px",
                  padding: "0 10px",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {vm.loginPassToggle}
              </button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                style={{
                  accentColor: "var(--primary)",
                  width: "15px",
                  height: "15px",
                }}
              />{" "}
              Remember me
            </label>
            <a
              style={{
                fontSize: "13px",
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Forgot password?
            </a>
          </div>
          {vm.loginError && (
            <div
              style={{
                marginTop: "16px",
                fontSize: "13px",
                color: "#C0392B",
                background: "#FCEBE9",
                borderRadius: "9px",
                padding: "10px 12px",
              }}
            >
              {vm.loginError}
            </div>
          )}
          <button
            onClick={vm.onLogin}
            style={{
              width: "100%",
              marginTop: "22px",
              height: "46px",
              border: "none",
              borderRadius: "11px",
              background: "var(--primary)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
            }}
          >
            {vm.loginBusy && (
              <span
                style={{
                  width: "15px",
                  height: "15px",
                  border: "2px solid rgba(255,255,255,.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin .7s linear infinite",
                  display: "inline-block",
                }}
              />
            )}
            {vm.loginBtnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
