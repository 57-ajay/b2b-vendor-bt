"use client";
import type { ViewModel } from "@/types";

const CARD_SHADOW =
  "0 1px 1px rgba(2,6,111,.04),0 10px 28px -14px rgba(2,6,111,.14)";

/** Receipts route — ported 1:1 from the source template (sc-if routeIsReceipts). */
export default function Receipts({ vm }: { vm: ViewModel }) {
  return (
    <>
      <div
        style={{ position: "relative", maxWidth: "320px", marginBottom: "16px" }}
      >
        <input
          value={vm.receiptSearch}
          onChange={vm.onReceiptSearch}
          placeholder="Search vehicle or reference"
          style={{
            width: "100%",
            height: "38px",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "0 14px",
            fontSize: "13px",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "14px",
          background: "var(--surface)",
          boxShadow: CARD_SHADOW,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "0 18px",
            height: "42px",
            borderBottom: "1px solid var(--border)",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            color: "var(--text-muted)",
          }}
        >
          <span style={{ width: "130px" }}>Vehicle</span>
          <span style={{ width: "110px" }}>Tax</span>
          <span style={{ flex: 1 }}>Gov reference</span>
          <span style={{ width: "120px" }}>Generated</span>
          <span style={{ width: "140px", textAlign: "right" }}>Actions</span>
        </div>
        {(vm.receiptRows ?? []).map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "0 18px",
              height: "54px",
              borderBottom: "1px solid var(--divider)",
            }}
          >
            <span
              style={{
                width: "130px",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              {r.vehicle}
            </span>
            <span
              style={{
                width: "110px",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {r.amount}
            </span>
            <span
              style={{
                flex: 1,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "12.5px",
                color: "var(--text-secondary)",
              }}
            >
              {r.govRef}
            </span>
            <span
              style={{
                width: "120px",
                fontSize: "12.5px",
                color: "var(--text-secondary)",
              }}
            >
              {r.generated}
            </span>
            <span
              style={{
                width: "140px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "7px",
              }}
            >
              <button
                onClick={r.onView}
                style={{
                  height: "30px",
                  padding: "0 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "var(--text)",
                }}
              >
                View
              </button>
              <button
                onClick={r.onDownload}
                style={{
                  height: "30px",
                  padding: "0 12px",
                  border: "none",
                  borderRadius: "8px",
                  background: "var(--primary)",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                PDF
              </button>
            </span>
          </div>
        ))}
        {vm.receiptsEmpty && (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            No receipts match your search.
          </div>
        )}
      </div>
    </>
  );
}
