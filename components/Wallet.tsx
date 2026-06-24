"use client";
import type { ViewModel } from "@/types";

const CARD_SHADOW =
  "0 1px 1px rgba(2,6,111,.04),0 10px 28px -14px rgba(2,6,111,.14)";

/** Wallet route — ported 1:1 from the source template (sc-if routeIsWallet). */
export default function WalletView({ vm }: { vm: ViewModel }) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: "14px",
            background: "linear-gradient(135deg,var(--money),#0a5740)",
            color: "#fff",
            boxShadow: "0 6px 20px rgba(14,107,79,.22)",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              color: "#AEB2DA",
            }}
          >
            Available balance
          </div>
          <div
            style={{
              fontSize: "42px",
              fontWeight: 600,
              fontFamily: "'JetBrains Mono',monospace",
              letterSpacing: "-.02em",
              marginTop: "8px",
              lineHeight: 1,
            }}
          >
            {vm.walletBalanceFmt}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#AEB2DA",
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#FAC800",
              }}
            />
            {vm.walletHeldFmt} reserved for in-flight requests
          </div>
          <div
            style={{
              position: "absolute",
              right: "-60px",
              bottom: "-60px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              border: "1px solid rgba(250,200,0,.16)",
            }}
          />
        </section>
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: "14px",
            background: "var(--surface)",
            boxShadow: CARD_SHADOW,
            padding: "22px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600 }}>Top up</div>
          <div
            style={{
              fontSize: "12.5px",
              color: "var(--text-secondary)",
              marginTop: "4px",
            }}
          >
            Add funds instantly to cover request holds.
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            {(vm.topupQuick ?? []).map((q, i) => (
              <button
                key={i}
                onClick={q.onClick}
                className="hov-primary-border"
                style={{
                  flex: 1,
                  height: "42px",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  background: "var(--surface)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono',monospace",
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
              style={{
                flex: 1,
                height: "42px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "0 14px",
                fontSize: "13px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              onClick={vm.onTopupCustom}
              style={{
                height: "42px",
                padding: "0 20px",
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
              Add
            </button>
          </div>
        </section>
      </div>

      <section style={{ marginTop: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
          Transactions
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
              height: "40px",
              borderBottom: "1px solid var(--border)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              color: "var(--text-muted)",
            }}
          >
            <span style={{ width: "130px" }}>Type</span>
            <span style={{ flex: 1 }}>Reference</span>
            <span style={{ width: "110px", textAlign: "right" }}>Amount</span>
            <span style={{ width: "120px", textAlign: "right" }}>Balance</span>
            <span style={{ width: "96px", textAlign: "right" }}>When</span>
          </div>
          {(vm.txnRows ?? []).map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "0 18px",
                height: "50px",
                borderBottom: "1px solid var(--divider)",
              }}
            >
              <span style={{ width: "130px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "11.5px",
                    fontWeight: 500,
                    color: t.tagText,
                    background: t.tagBg,
                    borderRadius: "999px",
                    padding: "3px 10px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: t.tagDot,
                    }}
                  />
                  {t.type}
                </span>
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {t.ref}
              </span>
              <span
                style={{
                  width: "110px",
                  textAlign: "right",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "'JetBrains Mono',monospace",
                  color: t.amtColor,
                }}
              >
                {t.amount}
              </span>
              <span
                style={{
                  width: "120px",
                  textAlign: "right",
                  fontSize: "12.5px",
                  fontFamily: "'JetBrains Mono',monospace",
                  color: "var(--text-secondary)",
                }}
              >
                {t.balance}
              </span>
              <span
                style={{
                  width: "96px",
                  textAlign: "right",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                {t.time}
              </span>
            </div>
          ))}
          {vm.txnEmpty && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: "13px",
              }}
            >
              No transactions yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
