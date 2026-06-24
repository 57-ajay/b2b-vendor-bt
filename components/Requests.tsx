"use client";
import type { ViewModel } from "@/types";

const CARD_SHADOW =
  "0 1px 1px rgba(2,6,111,.04),0 10px 28px -14px rgba(2,6,111,.14)";

/** Tax Requests route — ported 1:1 from the source template (sc-if routeIsRequests). */
export default function Requests({ vm }: { vm: ViewModel }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: "240px",
            maxWidth: "340px",
          }}
        >
          <input
            value={vm.searchValue}
            onChange={vm.onSearch}
            placeholder="Search vehicle, ID or mobile"
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
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
          {(vm.filterChips ?? []).map((c, i) => (
            <button
              key={i}
              onClick={c.onClick}
              style={{
                height: "32px",
                padding: "0 13px",
                border: "1px solid " + c.border,
                borderRadius: "999px",
                background: c.bg,
                color: c.color,
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
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
            position: "sticky",
            top: 0,
            background: "var(--surface)",
          }}
        >
          <span style={{ width: "92px" }}>Request</span>
          <span style={{ width: "118px" }}>Vehicle</span>
          <span style={{ flex: 1 }}>Route</span>
          <span style={{ width: "104px" }}>Journey</span>
          <span style={{ width: "128px" }}>Status</span>
          <span style={{ width: "78px" }}>Created</span>
          <span style={{ width: "96px", textAlign: "right" }}>Actions</span>
        </div>
        {(vm.requestRows ?? []).map((r, i) => (
          <div
            key={i}
            onClick={r.onClick}
            className="hov-inset"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "0 18px",
              height: "54px",
              borderBottom: "1px solid var(--divider)",
              cursor: "pointer",
              transition: "background .15s",
              animation: r.anim,
            }}
          >
            <span
              style={{
                width: "92px",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              {r.shortId}
            </span>
            <span
              style={{
                width: "118px",
                fontFamily: "'JetBrains Mono',monospace",
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
                    fontWeight: 600,
                    color: "#7A5C00",
                    background: "#FFF7D1",
                    borderRadius: "5px",
                    padding: "1px 5px",
                  }}
                >
                  DUP
                </span>
              )}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: "12.5px",
                color: "var(--text-secondary)",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {r.route}
            </span>
            <span
              style={{
                width: "104px",
                fontSize: "12.5px",
                color: "var(--text-secondary)",
              }}
            >
              {r.journey}
            </span>
            <span style={{ width: "128px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11.5px",
                  fontWeight: 500,
                  color: r.pillText,
                  background: r.pillBg,
                  borderRadius: "999px",
                  padding: "3px 10px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: r.dot,
                    animation: r.dotAnim,
                  }}
                />
                {r.statusLabel}
              </span>
            </span>
            <span
              style={{
                width: "78px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              {r.time}
            </span>
            <span
              style={{
                width: "96px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "6px",
              }}
            >
              {r.isStart && (
                <button
                  onClick={r.onStart}
                  style={{
                    height: "28px",
                    padding: "0 11px",
                    border: "none",
                    borderRadius: "7px",
                    background: "var(--primary)",
                    color: "#fff",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Start
                </button>
              )}
              {r.isRetry && (
                <button
                  onClick={r.onStart}
                  style={{
                    height: "28px",
                    padding: "0 11px",
                    border: "1px solid var(--border)",
                    borderRadius: "7px",
                    background: "var(--surface)",
                    color: "#C0392B",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Retry
                </button>
              )}
              {r.isViewOnly && (
                <button
                  onClick={r.onClick}
                  style={{
                    height: "28px",
                    padding: "0 11px",
                    border: "none",
                    borderRadius: "7px",
                    background: "transparent",
                    color: "var(--primary)",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  View
                </button>
              )}
            </span>
          </div>
        ))}
        {vm.requestsEmpty && (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            {vm.requestsEmptyText}
          </div>
        )}
      </div>
    </>
  );
}
