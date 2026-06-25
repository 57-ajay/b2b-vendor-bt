"use client";
import { IndianRupee, Info, Landmark, Percent, Receipt, TrendingUp } from "lucide-react";

import { CardHead, type IconType, MONO } from "@/components/premium";
import type { ViewModel } from "@/types";

function segBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    height: "42px",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    transition: "background .18s ease, color .18s ease, box-shadow .18s ease",
    background: active ? "var(--surface)" : "transparent",
    color: active ? "var(--primary)" : "var(--text-secondary)",
    boxShadow: active
      ? "0 1px 2px rgba(2,6,111,.06), 0 6px 16px -10px rgba(2,6,111,.32)"
      : "none",
  };
}

const LABEL: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: ".05em",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: "8px",
};

const BIG_INPUT: React.CSSProperties = {
  width: "100%",
  height: "52px",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "22px",
  fontWeight: 700,
  fontFamily: MONO,
  outline: "none",
  background: "var(--surface)",
  color: "var(--text)",
};

function ExampleRow({
  icon: Icon,
  iconBg,
  iconTone,
  label,
  sub,
  value,
  valueColor,
}: {
  icon: IconType;
  iconBg: string;
  iconTone: string;
  label: string;
  sub?: string;
  value?: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            width: "36px",
            height: "36px",
            flex: "none",
            borderRadius: "10px",
            background: iconBg,
            color: iconTone,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} strokeWidth={2.2} />
        </span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{label}</div>
          {sub && (
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
              {sub}
            </div>
          )}
        </div>
      </div>
      <span
        style={{
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: MONO,
          color: valueColor ?? "var(--text)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Commercials route — the vendor sets the commission earned on every border-tax
 * payment: either a percentage of the government tax, or a flat amount. The
 * value feeds the request pricing breakdown (d_pr_*) and updates in real time.
 */
export default function Commercials({ vm }: { vm: ViewModel }) {
  const isPct = !!vm.comm_isPercent;
  return (
    <div className="rd-grid">
      {/* Commission model */}
      <section
        className="rd-card"
        style={{ padding: "24px", display: "flex", flexDirection: "column" }}
      >
        <CardHead icon={Percent} title="Commission model" mb={10} />
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "18px",
          }}
        >
          Set what you earn on every border-tax payment. Your commission is added on top of the
          government charge — the customer pays the total.
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            padding: "5px",
            background: "var(--surface-inset)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
          }}
        >
          <button onClick={vm.comm_onModePercent} className="rd-btn" style={segBtn(isPct)}>
            <Percent size={15} /> Percentage
          </button>
          <button onClick={vm.comm_onModeFixed} className="rd-btn" style={segBtn(!isPct)}>
            <IndianRupee size={15} /> Fixed charge
          </button>
        </div>

        {/* Input */}
        <div style={{ marginTop: "20px" }}>
          {isPct ? (
            <>
              <label style={LABEL}>Commission rate</label>
              <div style={{ position: "relative" }}>
                <input
                  value={vm.comm_percent}
                  onChange={vm.comm_onPercent}
                  inputMode="decimal"
                  placeholder="15"
                  className="rd-input"
                  style={{ ...BIG_INPUT, padding: "0 48px 0 16px" }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    fontFamily: MONO,
                  }}
                >
                  %
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                Percentage of the government border-tax amount, kept as your earning.
              </div>
            </>
          ) : (
            <>
              <label style={LABEL}>Flat commission</label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    fontFamily: MONO,
                  }}
                >
                  ₹
                </span>
                <input
                  value={vm.comm_fixed}
                  onChange={vm.comm_onFixed}
                  inputMode="numeric"
                  placeholder="150"
                  className="rd-input"
                  style={{ ...BIG_INPUT, padding: "0 16px 0 36px" }}
                />
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                A fixed amount added to every border-tax payment, regardless of the tax.
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "var(--primary-tint)",
              color: "var(--primary)",
              fontSize: "12.5px",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            <Info size={15} strokeWidth={2.2} style={{ flex: "none", marginTop: "1px" }} />
            <div>
              Changes apply instantly — every request&apos;s pricing breakdown recalculates in real
              time.
            </div>
          </div>
        </div>
      </section>

      {/* Live preview */}
      <section
        className="rd-card"
        style={{ padding: "24px", display: "flex", flexDirection: "column" }}
      >
        <CardHead
          icon={Receipt}
          title="What the customer pays"
          tint="var(--money)"
          tintBg="var(--money-tint)"
          aside={
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Example
            </span>
          }
        />
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}
        >
          <ExampleRow
            icon={Landmark}
            iconBg="var(--surface-inset)"
            iconTone="var(--text-secondary)"
            label="Government border tax"
            sub="Remitted to the portal"
            value={vm.comm_egTax}
          />
          <div style={{ height: "1px", background: "var(--divider)" }} />
          <ExampleRow
            icon={TrendingUp}
            iconBg="var(--money-tint)"
            iconTone="var(--money)"
            label="Your commission"
            sub={vm.comm_egRate}
            value={"+ " + (vm.comm_egCommission ?? "—")}
            valueColor="var(--money)"
          />
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px",
              borderRadius: "14px",
              background: "var(--primary)",
              color: "#fff",
              boxShadow: "0 14px 30px -16px var(--primary)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  opacity: 0.82,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                }}
              >
                Customer pays
              </div>
              <div style={{ fontSize: "12px", opacity: 0.7, marginTop: "2px" }}>
                Tax + your commission
              </div>
            </div>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 700,
                fontFamily: MONO,
                letterSpacing: "-.02em",
              }}
            >
              {vm.comm_egTotal}
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "16px",
            textAlign: "center",
          }}
        >
          Mirrors the breakdown under every request&apos;s pricing panel.
        </div>
      </section>
    </div>
  );
}
