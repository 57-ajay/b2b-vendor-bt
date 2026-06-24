"use client";
import type { ViewModel } from "@/types";

/** Top bar (header) — ported 1:1 from the source template. */
export default function Topbar({ vm }: { vm: ViewModel }) {
  return (
    <header
      style={{
        height: "64px",
        flex: "none",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        background: "var(--topbar-bg)",
        backdropFilter: "blur(8px)",
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <button
          onClick={vm.onToggleSidebar}
          style={{
            width: "32px",
            height: "32px",
            border: "1px solid var(--border)",
            borderRadius: "9px",
            background: "var(--surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              display: "block",
              width: "14px",
              height: "2px",
              background: "currentColor",
              boxShadow: "0 -4px 0 currentColor,0 4px 0 currentColor",
            }}
          />
        </button>
        <div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "-.01em",
              lineHeight: 1.1,
            }}
          >
            {vm.pageTitle}
          </div>
          <div
            style={{
              fontSize: "12.5px",
              color: "var(--text-secondary)",
              marginTop: "2px",
            }}
          >
            {vm.pageSubtitle}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={vm.goWallet}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            height: "40px",
            padding: "0 14px",
            border: "1px solid var(--border)",
            borderRadius: "11px",
            background: "var(--surface)",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow:
              "0 1px 1px rgba(2,6,111,.04),0 10px 28px -14px rgba(2,6,111,.14)",
          }}
        >
          <span
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "7px",
              background: "var(--money-tint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--money)",
            }}
          >
            {vm.walletIcon}
          </span>
          <span style={{ textAlign: "left", lineHeight: 1.15 }}>
            <span
              style={{
                display: "block",
                fontSize: "9.5px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                color: "var(--text-muted)",
              }}
            >
              Wallet
            </span>
            <span
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "'JetBrains Mono',monospace",
                color: "var(--text)",
              }}
            >
              {vm.walletBalanceFmt}
            </span>
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              borderLeft: "1px solid var(--border)",
              paddingLeft: "11px",
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            held {vm.walletHeldFmt}
          </span>
        </button>
        <button
          onClick={vm.onToggleTheme}
          title="Toggle theme"
          style={{
            position: "relative",
            width: "40px",
            height: "40px",
            border: "1px solid var(--border)",
            borderRadius: "11px",
            background: "var(--surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          {vm.themeIcon}
        </button>
        <button
          onClick={vm.onBell}
          style={{
            position: "relative",
            width: "40px",
            height: "40px",
            border: "1px solid var(--border)",
            borderRadius: "11px",
            background: "var(--surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
          }}
        >
          {vm.bellIcon}
        </button>
        <button
          onClick={vm.onToggleProfile}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            height: "40px",
            padding: "0 7px 0 7px",
            border: "1px solid var(--border)",
            borderRadius: "11px",
            background: "var(--surface)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            OP
          </span>
          <span
            style={{ textAlign: "left", lineHeight: 1.1, paddingRight: "4px" }}
          >
            <span
              style={{ display: "block", fontSize: "12.5px", fontWeight: 600 }}
            >
              {vm.profileName}
            </span>
            <span
              style={{
                display: "block",
                fontSize: "10.5px",
                color: "var(--text-muted)",
              }}
            >
              {vm.profileRole}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
