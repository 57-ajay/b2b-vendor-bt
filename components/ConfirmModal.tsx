"use client";
import type { ViewModel } from "@/types";

/** Confirm modal — ported 1:1 from the source template (sc-if modalOpen). */
export default function ConfirmModal({ vm }: { vm: ViewModel }) {
  return (
    <div
      onClick={vm.onModalCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,18,48,.32)",
        backdropFilter: "blur(2px)",
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeUp .15s both",
      }}
    >
      <div
        style={{
          width: "380px",
          background: "var(--surface)",
          borderRadius: "16px",
          boxShadow: "0 16px 40px rgba(2,6,111,.14)",
          padding: "24px",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: 600 }}>{vm.modalTitle}</div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginTop: "8px",
            lineHeight: 1.55,
          }}
        >
          {vm.modalBody}
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
          <button
            onClick={vm.onModalCancel}
            style={{
              flex: 1,
              height: "42px",
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
            Cancel
          </button>
          <button
            onClick={vm.onModalConfirm}
            style={{
              flex: 1,
              height: "42px",
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
            {vm.modalConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
