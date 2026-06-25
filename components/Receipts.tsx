"use client";
import { Download, Eye, Inbox, Receipt } from "lucide-react";

import {
  BTN_SM,
  type Column,
  DataTable,
  EmptyState,
  MONO,
  SearchInput,
} from "@/components/premium";
import type { ReceiptRow, ViewModel } from "@/types";

const COLUMNS: Column<ReceiptRow>[] = [
  {
    label: "Vehicle",
    width: 140,
    cell: (r) => (
      <span style={{ fontFamily: MONO, fontSize: "13px", fontWeight: 500 }}>{r.vehicle}</span>
    ),
  },
  {
    label: "Tax",
    width: 110,
    cell: (r) => (
      <span style={{ fontFamily: MONO, fontSize: "13px", fontWeight: 600 }}>{r.amount}</span>
    ),
  },
  {
    label: "Gov reference",
    flex: 1,
    cell: (r) => (
      <span style={{ fontFamily: MONO, fontSize: "12.5px", color: "var(--text-secondary)" }}>
        {r.govRef}
      </span>
    ),
  },
  {
    label: "Generated",
    width: 130,
    cell: (r) => (
      <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{r.generated}</span>
    ),
  },
  {
    label: "Actions",
    width: 150,
    align: "right",
    cell: (r) => (
      <>
        <button
          onClick={r.onView}
          className="rd-btn"
          style={{
            ...BTN_SM,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
          }}
        >
          <Eye size={13} /> View
        </button>
        <button
          onClick={r.onDownload}
          className="rd-btn rd-btn-primary"
          style={{ ...BTN_SM, border: "none", background: "var(--primary)", color: "#fff" }}
        >
          <Download size={13} /> PDF
        </button>
      </>
    ),
  },
];

/** Receipts route — visual redesign; data + handlers unchanged. */
export default function Receipts({ vm }: { vm: ViewModel }) {
  const rows = vm.receiptRows ?? [];
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              width: "40px",
              height: "40px",
              flex: "none",
              borderRadius: "12px",
              background: "var(--primary-tint)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Receipt size={19} strokeWidth={2} />
          </span>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-.01em" }}>
              Receipts
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "1px" }}>
              {rows.length} generated
            </div>
          </div>
        </div>
        <SearchInput
          value={vm.receiptSearch}
          onChange={vm.onReceiptSearch}
          placeholder="Search vehicle or reference"
        />
      </div>

      <DataTable
        columns={COLUMNS}
        rows={rows}
        empty={
          vm.receiptsEmpty ? (
            <EmptyState icon={Inbox}>No receipts match your search.</EmptyState>
          ) : null
        }
      />
    </>
  );
}
