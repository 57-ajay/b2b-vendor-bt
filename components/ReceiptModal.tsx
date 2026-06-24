"use client";
import type { ViewModel } from "@/types";

/** Receipt preview modal — ported 1:1 from the source template (sc-if receiptModalOpen). */
export default function ReceiptModal({ vm }: { vm: ViewModel }) {
  return (
    <div
      onClick={vm.onReceiptModalClose}
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
        onClick={vm.stopProp}
        style={{
          width: "420px",
          background: "var(--surface)",
          borderRadius: "16px",
          boxShadow: "0 16px 40px rgba(2,6,111,.14)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "var(--sidebar)",
            color: "#fff",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "7px",
                background: "#FAC800",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              T
            </div>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>Tax Receipt</span>
          </div>
          <button
            onClick={vm.onReceiptModalClose}
            style={{
              border: "none",
              background: "transparent",
              color: "#AEB2DA",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "24px" }}>
          {(vm.receiptModalFields ?? []).map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--divider)",
              }}
            >
              <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                {f.label}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: f.font,
                }}
              >
                {f.value}
              </span>
            </div>
          ))}
          <div
            style={{
              marginTop: "18px",
              textAlign: "center",
              fontSize: "11.5px",
              color: "var(--text-muted)",
            }}
          >
            This is a system-generated receipt · TaxFlow
          </div>
        </div>
      </div>
    </div>
  );
}
