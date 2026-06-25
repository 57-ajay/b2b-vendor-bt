"use client";
import { Activity, Inbox, Plus, Wallet } from "lucide-react";

import {
  type Column,
  CardHead,
  DataTable,
  EmptyState,
  MONO,
  StatusPill,
} from "@/components/premium";
import type { TxnRow, ViewModel } from "@/types";

const TXN_COLUMNS: Column<TxnRow>[] = [
  {
    label: "Type",
    width: 138,
    cell: (t) => <StatusPill text={t.type} bg={t.tagBg} color={t.tagText} dot={t.tagDot} />,
  },
  {
    label: "Reference",
    flex: 1,
    cell: (t) => (
      <span style={{ fontFamily: MONO, fontSize: "12.5px", color: "var(--text-secondary)" }}>
        {t.ref}
      </span>
    ),
  },
  {
    label: "Amount",
    width: 116,
    align: "right",
    cell: (t) => (
      <span style={{ fontFamily: MONO, fontSize: "13px", fontWeight: 600, color: t.amtColor }}>
        {t.amount}
      </span>
    ),
  },
  {
    label: "Balance",
    width: 124,
    align: "right",
    cell: (t) => (
      <span style={{ fontFamily: MONO, fontSize: "12.5px", color: "var(--text-secondary)" }}>
        {t.balance}
      </span>
    ),
  },
  {
    label: "When",
    width: 92,
    align: "right",
    cell: (t) => <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.time}</span>,
  },
];

/** Wallet route — visual redesign; balances, top-up and txn logic unchanged. */
export default function WalletView({ vm }: { vm: ViewModel }) {
  const txns = vm.txnRows ?? [];
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          alignItems: "stretch",
        }}
        className="rd-grid"
      >
        {/* Balance hero */}
        <section
          className="rd-card"
          style={{
            padding: "26px",
            border: "none",
            color: "#fff",
            background:
              "linear-gradient(135deg, var(--money), color-mix(in srgb, var(--money) 58%, #052019))",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "180px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".07em",
              color: "rgba(255,255,255,.72)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Wallet size={15} /> Available balance
          </div>
          <div
            style={{
              fontSize: "44px",
              fontWeight: 700,
              fontFamily: MONO,
              letterSpacing: "-.02em",
              marginTop: "10px",
              lineHeight: 1,
            }}
          >
            {vm.walletBalanceFmt}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,.78)",
              marginTop: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--gold)" }}
            />
            {vm.walletHeldFmt} reserved for in-flight requests
          </div>
          <Wallet
            size={150}
            strokeWidth={1}
            style={{
              position: "absolute",
              right: "-30px",
              bottom: "-36px",
              color: "rgba(255,255,255,.08)",
            }}
          />
        </section>

        {/* Top up */}
        <section
          className="rd-card"
          style={{ padding: "24px", display: "flex", flexDirection: "column" }}
        >
          <CardHead icon={Plus} title="Top up" mb={6} />
          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "18px" }}>
            Add funds instantly to cover request holds.
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {(vm.topupQuick ?? []).map((q, i) => (
              <button
                key={i}
                onClick={q.onClick}
                className="rd-btn hov-primary-border"
                style={{
                  flex: 1,
                  height: "44px",
                  border: "1px solid var(--border)",
                  borderRadius: "11px",
                  background: "var(--surface)",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: MONO,
                  color: "var(--text)",
                }}
              >
                {q.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <input
              value={vm.topupCustom}
              onChange={vm.onTopupInput}
              placeholder="Custom amount"
              className="rd-input"
              style={{
                flex: 1,
                height: "44px",
                border: "1px solid var(--border)",
                borderRadius: "11px",
                padding: "0 14px",
                fontSize: "13px",
                fontFamily: "inherit",
                outline: "none",
                background: "var(--surface)",
                color: "var(--text)",
              }}
            />
            <button
              onClick={vm.onTopupCustom}
              className="rd-btn rd-btn-primary"
              style={{
                height: "44px",
                padding: "0 22px",
                border: "none",
                borderRadius: "11px",
                background: "var(--primary)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </section>
      </div>

      <div style={{ marginTop: "24px" }}>
        <DataTable
          title="Transactions"
          titleIcon={Activity}
          columns={TXN_COLUMNS}
          rows={txns}
          empty={vm.txnEmpty ? <EmptyState icon={Inbox}>No transactions yet.</EmptyState> : null}
        />
      </div>
    </>
  );
}
