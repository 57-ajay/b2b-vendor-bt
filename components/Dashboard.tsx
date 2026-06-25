"use client";
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  PieChart,
} from "lucide-react";

import GrowthChart from "@/components/GrowthChart";
import {
  BTN_SM,
  CardHead,
  EmptyState,
  MONO,
  StatusPill,
} from "@/components/premium";
import type { ViewModel } from "@/types";

const LIST_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "0 20px",
  height: "58px",
  borderTop: "1px solid var(--divider)",
};
const ELLIPSIS: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  fontSize: "12.5px",
  color: "var(--text-secondary)",
};

/** Dashboard route — visual redesign; metrics, chart and lists logic unchanged. */
export default function Dashboard({
  vm,
  requestsLength,
}: {
  vm: ViewModel;
  requestsLength: number;
}) {
  return (
    <>
      {/* Metric stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
        }}
      >
        {(vm.metrics ?? []).map((m, i) => (
          <div
            key={i}
            onClick={m.onClick}
            className="rd-card"
            style={{ padding: "18px 20px", cursor: m.cursor, animationDelay: `${0.03 * i}s` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  color: "var(--text-muted)",
                }}
              >
                {m.label}
              </span>
              {m.caret}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 600,
                fontFamily: MONO,
                color: m.color,
                lineHeight: 1.05,
                marginTop: "8px",
                letterSpacing: "-.02em",
              }}
            >
              {m.value}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "3px" }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Today at a glance */}
      {vm.dashShowGlance && (
        <section className="rd-card" style={{ padding: "20px 22px", marginTop: "20px" }}>
          <CardHead
            icon={PieChart}
            title="Today at a glance"
            mb={16}
            aside={
              <button
                onClick={vm.onToggleGlance}
                className="rd-btn"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  height: "30px",
                  padding: "0 12px",
                  borderRadius: "9px",
                }}
              >
                Hide
              </button>
            }
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "36px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "none" }}>{vm.donutEl}</div>
            <div
              style={{
                flex: 1,
                minWidth: "260px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 32px",
                maxWidth: "520px",
              }}
            >
              {(vm.donutLegend ?? []).map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "3px",
                      background: g.color,
                      flex: "none",
                    }}
                  />
                  <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", flex: 1 }}>
                    {g.label}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 600, fontFamily: MONO }}>
                    {g.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Monthly report */}
      <section className="rd-card" style={{ padding: "20px 22px", marginTop: "24px" }}>
        <CardHead
          icon={BarChart3}
          title="Monthly report"
          mb={10}
          aside={
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Requests per day · {vm.monthLabel}
            </span>
          }
        />
        <GrowthChart theme={vm.theme} requestsLength={requestsLength} />
        <div style={{ position: "relative", height: "16px", marginTop: "6px" }}>
          {(vm.monthTicks ?? []).map((t, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                transform: "translateX(-50%)",
                left: t.left,
                fontSize: "11px",
                fontWeight: 600,
                color: t.color,
              }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* Needs attention */}
      <section
        className="rd-card"
        style={{ marginTop: "24px", padding: 0, overflow: "hidden" }}
      >
        <div style={{ padding: "18px 20px 14px" }}>
          <CardHead
            icon={CircleAlert}
            title="Needs attention"
            tint="var(--warn)"
            tintBg="var(--warn-tint)"
            mb={0}
            aside={
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--primary)",
                  background: "var(--primary-tint)",
                  borderRadius: "999px",
                  padding: "4px 11px",
                  fontFamily: MONO,
                }}
              >
                {vm.attentionCount} open
              </span>
            }
          />
        </div>
        {(vm.attentionRows ?? []).map((r, i) => (
          <div key={i} style={{ ...LIST_ROW, animation: r.anim }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                flex: "none",
                borderRadius: "50%",
                background: r.dot,
                animation: r.dotAnim,
              }}
            />
            <span style={{ fontFamily: MONO, fontSize: "13px", fontWeight: 500, width: "108px" }}>
              {r.vehicle}
            </span>
            <span style={ELLIPSIS}>{r.route}</span>
            <StatusPill text={r.statusLabel} bg={r.pillBg} color={r.pillText} />
            {r.isStart && (
              <button
                onClick={r.onAction}
                className="rd-btn rd-btn-primary"
                style={{ ...BTN_SM, border: "none", background: "var(--primary)", color: "#fff" }}
              >
                Start
              </button>
            )}
            {r.isView && (
              <button
                onClick={r.onAction}
                className="rd-btn"
                style={{ ...BTN_SM, border: "none", background: "transparent", color: "var(--primary)" }}
              >
                View
              </button>
            )}
          </div>
        ))}
        {vm.attentionEmpty && (
          <EmptyState icon={CheckCircle2}>Nothing needs attention right now.</EmptyState>
        )}
      </section>

      {/* Recent requests */}
      <section
        className="rd-card"
        style={{ marginTop: "24px", padding: 0, overflow: "hidden" }}
      >
        <div style={{ padding: "18px 20px 14px" }}>
          <CardHead icon={Clock} title="Recent requests" mb={0} />
        </div>
        {(vm.recentRows ?? []).map((r, i) => (
          <div
            key={i}
            onClick={r.onClick}
            className="hov-inset"
            style={{ ...LIST_ROW, height: "54px", cursor: "pointer", transition: "background .15s" }}
          >
            <span style={{ fontFamily: MONO, fontSize: "13px", fontWeight: 500, width: "120px" }}>
              {r.vehicle}
            </span>
            <span style={ELLIPSIS}>{r.route}</span>
            <StatusPill text={r.statusLabel} bg={r.pillBg} color={r.pillText} dot={r.dot} />
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                width: "84px",
                textAlign: "right",
              }}
            >
              {r.time}
            </span>
            <ChevronRight size={16} style={{ color: "var(--text-muted)", flex: "none" }} />
          </div>
        ))}
      </section>
    </>
  );
}
