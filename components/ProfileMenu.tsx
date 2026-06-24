"use client";
import type { ViewModel } from "@/types";

/** Profile dropdown menu — ported 1:1 from the source template. */
export default function ProfileMenu({ vm }: { vm: ViewModel }) {
  return (
    <div
      style={{
        position: "fixed",
        right: "28px",
        top: "62px",
        zIndex: 60,
        width: "190px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        boxShadow: "0 16px 40px rgba(2,6,111,.14)",
        overflow: "hidden",
        animation: "fadeUp .18s both",
      }}
    >
      <div
        style={{ padding: "12px 14px", borderBottom: "1px solid var(--divider)" }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600 }}>{vm.profileName}</div>
        <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
          {vm.profileEmail}
        </div>
      </div>
      <button
        onClick={vm.goSettings}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "10px 14px",
          border: "none",
          background: "var(--surface)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "13px",
          color: "var(--text)",
        }}
      >
        Settings
      </button>
      <button
        onClick={vm.onLogout}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "10px 14px",
          border: "none",
          borderTop: "1px solid var(--divider)",
          background: "var(--surface)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "13px",
          color: "#C0392B",
        }}
      >
        Log out
      </button>
    </div>
  );
}
