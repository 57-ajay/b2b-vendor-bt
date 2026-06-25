"use client";
import { Inbox } from "lucide-react";

import {
  BTN_SM,
  type Column,
  DataTable,
  EmptyState,
  MONO,
  SearchInput,
  StatusPill,
} from "@/components/premium";
import type { RequestRow, ViewModel } from "@/types";

const ELLIPSIS: React.CSSProperties = {
  display: "block",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

const COLUMNS: Column<RequestRow>[] = [
  {
    label: "Request",
    width: 92,
    cell: (r) => (
      <span style={{ fontFamily: MONO, fontSize: "12px", color: "var(--text-secondary)" }}>
        {r.shortId}
      </span>
    ),
  },
  {
    label: "Vehicle",
    width: 122,
    cell: (r) => (
      <span
        style={{
          fontFamily: MONO,
          fontSize: "13px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}
      >
        {r.vehicle}
        {r.isDuplicate && (
          <span
            style={{
              fontSize: "9.5px",
              fontWeight: 700,
              color: "var(--warn)",
              background: "var(--warn-tint)",
              border: "1px solid var(--warn-border)",
              borderRadius: "5px",
              padding: "1px 5px",
            }}
          >
            DUP
          </span>
        )}
      </span>
    ),
  },
  {
    label: "Route",
    flex: 1,
    cell: (r) => (
      <span style={{ ...ELLIPSIS, fontSize: "12.5px", color: "var(--text-secondary)" }}>
        {r.route}
      </span>
    ),
  },
  {
    label: "Journey",
    width: 104,
    cell: (r) => (
      <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{r.journey}</span>
    ),
  },
  {
    label: "Status",
    width: 132,
    cell: (r) => (
      <StatusPill
        text={r.statusLabel}
        bg={r.pillBg}
        color={r.pillText}
        dot={r.dot}
        dotAnim={r.dotAnim}
      />
    ),
  },
  {
    label: "Created",
    width: 78,
    cell: (r) => <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{r.time}</span>,
  },
  {
    label: "Actions",
    width: 92,
    align: "right",
    cell: (r) => (
      <>
        {r.isStart && (
          <button
            onClick={r.onStart}
            className="rd-btn rd-btn-primary"
            style={{ ...BTN_SM, border: "none", background: "var(--primary)", color: "#fff" }}
          >
            Start
          </button>
        )}
        {r.isRetry && (
          <button
            onClick={r.onStart}
            className="rd-btn"
            style={{
              ...BTN_SM,
              border: "1px solid var(--danger-border)",
              background: "var(--danger-tint)",
              color: "var(--danger)",
            }}
          >
            Retry
          </button>
        )}
        {r.isViewOnly && (
          <button
            onClick={r.onClick}
            className="rd-btn"
            style={{ ...BTN_SM, border: "none", background: "transparent", color: "var(--primary)" }}
          >
            View
          </button>
        )}
      </>
    ),
  },
];

/** Tax Requests route — visual redesign; rows, filters and handlers unchanged. */
export default function Requests({ vm }: { vm: ViewModel }) {
  const rows = vm.requestRows ?? [];
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <SearchInput
          value={vm.searchValue}
          onChange={vm.onSearch}
          placeholder="Search vehicle, ID or mobile"
          width="340px"
        />
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", marginLeft: "auto" }}>
          {(vm.filterChips ?? []).map((c, i) => (
            <button
              key={i}
              onClick={c.onClick}
              className="rd-btn"
              style={{
                height: "36px",
                padding: "0 15px",
                border: "1px solid " + c.border,
                borderRadius: "999px",
                background: c.bg,
                color: c.color,
                fontSize: "12.5px",
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={rows}
        onRowClick={(r) => r.onClick()}
        rowAnim={(r) => r.anim}
        empty={
          vm.requestsEmpty ? <EmptyState icon={Inbox}>{vm.requestsEmptyText}</EmptyState> : null
        }
      />
    </>
  );
}
