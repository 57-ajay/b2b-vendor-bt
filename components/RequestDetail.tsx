"use client";
import type { ViewModel } from "@/types";

const CARD_SHADOW =
  "0 1px 1px rgba(2,6,111,.04),0 10px 28px -14px rgba(2,6,111,.14)";
const SECTION_LABEL: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  color: "var(--text-muted)",
};
const MONO = "'JetBrains Mono',monospace";
const PR_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 0",
};
const PR_LABEL: React.CSSProperties = {
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--text-secondary)",
};
const PR_SUB: React.CSSProperties = {
  fontSize: "11px",
  color: "var(--text-muted)",
  marginTop: "2px",
};
const PR_VAL: React.CSSProperties = {
  fontSize: "13.5px",
  fontWeight: 600,
  fontFamily: MONO,
  color: "var(--text)",
};
/** Small trending-up glyph used in the pricing breakdown. */
const TrendUp = ({ size = 15 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </svg>
);

/** Request detail route — ported 1:1 from the source template (sc-if routeIsDetail). */
export default function RequestDetail({ vm }: { vm: ViewModel }) {
  return (
    <>
      <button
        onClick={vm.goRequests}
        style={{
          border: "none",
          background: "transparent",
          color: "var(--text-secondary)",
          fontSize: "13px",
          cursor: "pointer",
          fontFamily: "inherit",
          padding: 0,
          marginBottom: "14px",
        }}
      >
        ‹ All requests
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "13px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 600,
            fontFamily: "'JetBrains Mono',monospace",
            letterSpacing: "-.01em",
          }}
        >
          {vm.d_vehicle}
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            fontSize: "12px",
            fontWeight: 500,
            color: vm.d_pillText,
            background: vm.d_pillBg,
            borderRadius: "999px",
            padding: "4px 12px",
            transition: "all .2s",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: vm.d_dot,
              animation: vm.d_dotAnim,
            }}
          />
          {vm.d_statusLabel}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "12px",
            color: "var(--text-muted)",
            marginLeft: "auto",
          }}
        >
          {vm.d_shortId}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: "14px",
              background: "var(--surface)",
              boxShadow: CARD_SHADOW,
              padding: "18px",
            }}
          >
            <div style={{ ...SECTION_LABEL, marginBottom: "14px" }}>
              Customer submission
            </div>
            {(vm.d_fields ?? []).map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderTop: "1px solid var(--surface-inset)",
                }}
              >
                <span
                  style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}
                >
                  {f.label}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    fontFamily: f.font,
                    color: "var(--text)",
                  }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </section>

          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: "14px",
              background: "var(--surface)",
              boxShadow: CARD_SHADOW,
              padding: "18px",
            }}
          >
            <div style={{ ...SECTION_LABEL, marginBottom: "16px" }}>
              Live status
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {(vm.d_steps ?? []).map((s, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: "13px", alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      alignSelf: "stretch",
                    }}
                  >
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        flex: "none",
                        borderRadius: "50%",
                        border: "2px solid " + s.ring,
                        background: s.fill,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        color: s.mark,
                        animation: s.anim,
                      }}
                    >
                      {s.glyph}
                    </span>
                    <span
                      style={{
                        width: "2px",
                        flex: 1,
                        minHeight: "14px",
                        background: s.line,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: s.text,
                      fontWeight: s.weight,
                      paddingBottom: "14px",
                      paddingTop: "1px",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: "14px",
              background: "var(--surface)",
              boxShadow: CARD_SHADOW,
              overflow: "hidden",
            }}
          >
            <button
              onClick={vm.onToggleLog}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                border: "none",
                background: "var(--surface)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span style={SECTION_LABEL}>Activity log</span>
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                {vm.logChevron}
              </span>
            </button>
            {vm.logOpen && (
              <div style={{ padding: "0 18px 16px" }}>
                {(vm.d_log ?? []).map((l, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "6px 0",
                      fontSize: "12.5px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        color: "var(--text-muted)",
                        width: "64px",
                        flex: "none",
                      }}
                    >
                      {l.time}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>{l.text}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: action card + pricing breakdown */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            position: "sticky",
            top: "20px",
          }}
        >
          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: "14px",
              background: "var(--surface)",
              boxShadow: CARD_SHADOW,
              padding: "22px",
            }}
          >
          {/* PENDING */}
          {vm.ac_pending && (
            <>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>
                Start processing
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  marginTop: "6px",
                  lineHeight: 1.55,
                }}
              >
                A fee of{" "}
                <b
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    color: "var(--text)",
                  }}
                >
                  {vm.d_priceFmt}
                </b>{" "}
                is held from your wallet now and charged only when a receipt is
                produced.
              </div>
              {vm.d_walletCovers && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "14px",
                    fontSize: "12.5px",
                    color: "#0E7C5A",
                    background: "#E6F5EE",
                    borderRadius: "9px",
                    padding: "9px 12px",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>✓</span> Wallet balance covers
                  this hold.
                </div>
              )}
              {vm.d_walletShort && (
                <div
                  style={{
                    marginTop: "14px",
                    fontSize: "12.5px",
                    color: "#B45309",
                    background: "#FBEFE0",
                    borderRadius: "9px",
                    padding: "11px 12px",
                    lineHeight: 1.5,
                  }}
                >
                  Insufficient wallet balance to cover the hold.{" "}
                  <button
                    onClick={vm.goWallet}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--primary)",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Top up wallet
                  </button>
                </div>
              )}
              {vm.d_isDuplicate && (
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "12px",
                    color: "#7A5C00",
                    background: "#FFF7D1",
                    borderRadius: "9px",
                    padding: "9px 12px",
                  }}
                >
                  Flagged as a possible duplicate of{" "}
                  <a
                    onClick={vm.d_onViewOriginal}
                    style={{
                      color: "var(--primary)",
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {vm.d_dupOf}
                  </a>
                  .
                </div>
              )}
              <button
                onClick={vm.d_onStart}
                disabled={vm.d_startDisabled}
                style={{
                  width: "100%",
                  marginTop: "18px",
                  height: "44px",
                  border: "none",
                  borderRadius: "11px",
                  background: vm.d_startBg,
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: vm.d_startCursor,
                  fontFamily: "inherit",
                }}
              >
                Start process
              </button>
              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--divider)",
                }}
              >
                <label
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "#C5C9D6",
                  }}
                >
                  Demo · force failure at
                </label>
                <select
                  value={vm.d_failStage}
                  onChange={vm.d_onFailStage}
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    height: "34px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "0 10px",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    color: "var(--text-secondary)",
                    background: "var(--surface)",
                  }}
                >
                  <option value="NONE">No failure (completes)</option>
                  <option value="OPENING_PORTAL">Portal unavailable</option>
                  <option value="ENTERING_DETAILS">Data rejected</option>
                  <option value="AWAITING_PAYMENT">QR expired</option>
                  <option value="PAYMENT_SUCCESS">Receipt missing (reconcile)</option>
                </select>
              </div>
            </>
          )}

          {/* PROCESSING */}
          {vm.ac_processing && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "14px 0",
              }}
            >
              <span
                style={{
                  width: "38px",
                  height: "38px",
                  border: "3px solid var(--primary-tint)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                }}
              />
              <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "16px" }}>
                {vm.d_statusLabel}
              </div>
              <div
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  marginTop: "5px",
                }}
              >
                Working through the government portal automatically. This usually
                takes under a minute.
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#7A5C00",
                  background: "#FFF7D1",
                  borderRadius: "8px",
                  padding: "7px 12px",
                  marginTop: "14px",
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {vm.d_priceFmt} held
              </div>
            </div>
          )}

          {/* AWAITING PAYMENT */}
          {vm.ac_awaiting && (
            <>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>
                Awaiting payment
              </div>
              <div
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  marginTop: "5px",
                }}
              >
                Driver scans to pay the tax. We advance automatically on
                confirmation.
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "18px",
                }}
              >
                <div
                  style={{
                    width: "148px",
                    height: "148px",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    padding: "10px",
                    background: "#ffffff",
                  }}
                >
                  {vm.qrEl}
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: "14px" }}>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 600,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {vm.d_amountFmt}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#7A5C00",
                    background: "#FFF7D1",
                    borderRadius: "999px",
                    padding: "4px 13px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#FAC800",
                      animation: "pulse 1.6s infinite",
                    }}
                  />
                  Expires in {vm.d_countdown}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                <button
                  onClick={vm.d_onCopy}
                  style={{
                    flex: 1,
                    height: "38px",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    background: "var(--surface)",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "var(--text)",
                  }}
                >
                  {vm.d_copyLabel}
                </button>
                <button
                  onClick={vm.d_onShare}
                  style={{
                    flex: 1,
                    height: "38px",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    background: "var(--surface)",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "var(--text)",
                  }}
                >
                  Share
                </button>
              </div>
              <button
                onClick={vm.d_onMarkPaid}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  height: "40px",
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
                Mark paid (demo)
              </button>
            </>
          )}

          {/* RECONCILING */}
          {vm.ac_reconciling && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "10px 0",
              }}
            >
              <span
                style={{
                  width: "36px",
                  height: "36px",
                  border: "3px solid #FBEFE0",
                  borderTopColor: "#E0801F",
                  borderRadius: "50%",
                  animation: "spin .9s linear infinite",
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  marginTop: "14px",
                  color: "#B45309",
                }}
              >
                Reconciling payment
              </div>
              <div
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  marginTop: "6px",
                  lineHeight: 1.55,
                }}
              >
                Payment received, receipt pending. Your funds are protected — no
                extra charge applies while we recover the receipt.
              </div>
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--text-muted)",
                  marginTop: "12px",
                }}
              >
                Escalated to operations · auto-retrying
              </div>
            </div>
          )}

          {/* COMPLETED */}
          {vm.ac_completed && (
            <>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#E6F5EE",
                    color: "#0E7C5A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "15px",
                  }}
                >
                  ✓
                </span>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  Receipt generated
                </div>
              </div>
              <div
                style={{
                  marginTop: "16px",
                  border: "1px solid var(--border)",
                  borderRadius: "11px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "11px 14px",
                    borderBottom: "1px solid var(--divider)",
                  }}
                >
                  <span
                    style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}
                  >
                    Tax amount
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    {vm.d_amountFmt}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "11px 14px",
                    borderBottom: "1px solid var(--divider)",
                  }}
                >
                  <span
                    style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}
                  >
                    Gov reference
                  </span>
                  <span
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 500,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    {vm.d_govRef}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "11px 14px",
                  }}
                >
                  <span
                    style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}
                  >
                    Generated
                  </span>
                  <span style={{ fontSize: "12.5px", color: "var(--text)" }}>
                    {vm.d_generatedAt}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <button
                  onClick={vm.d_onView}
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
                  View receipt
                </button>
                <button
                  onClick={vm.d_onDownload}
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
                  Download
                </button>
              </div>
            </>
          )}

          {/* FAILED */}
          {vm.ac_failed && (
            <>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#FCEBE9",
                    color: "#C0392B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  !
                </span>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                  Processing failed
                </div>
              </div>
              <div
                style={{
                  marginTop: "14px",
                  fontSize: "13px",
                  color: "#C0392B",
                  background: "#FCEBE9",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  lineHeight: 1.5,
                }}
              >
                {vm.d_failReason}
              </div>
              <div
                style={{
                  fontSize: "12.5px",
                  color: "#0E7C5A",
                  marginTop: "12px",
                }}
              >
                No charge applied — the hold was released back to your wallet.
              </div>
              <button
                onClick={vm.d_onRetry}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  height: "44px",
                  border: "none",
                  borderRadius: "11px",
                  background: "var(--primary)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Retry request
              </button>
            </>
          )}
          </section>

          {/* Pricing breakdown — what the customer pays, what we remit, profit */}
          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: "14px",
              background: "var(--surface)",
              boxShadow: CARD_SHADOW,
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  flex: "none",
                  borderRadius: "7px",
                  background: "var(--money-tint)",
                  color: "var(--money)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendUp size={13} />
              </span>
              <span style={SECTION_LABEL}>Pricing breakdown</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={PR_ROW}>
                <div>
                  <div style={PR_LABEL}>Received from customer</div>
                  <div style={PR_SUB}>Tax + service fee</div>
                </div>
                <span style={PR_VAL}>{vm.d_pr_received}</span>
              </div>
              <div
                style={{
                  ...PR_ROW,
                  borderTop: "1px solid var(--surface-inset)",
                }}
              >
                <div>
                  <div style={PR_LABEL}>Paid by vendor</div>
                  <div style={PR_SUB}>Remitted to government</div>
                </div>
                <span style={{ ...PR_VAL, color: "var(--text-secondary)" }}>
                  {vm.d_pr_vendor}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 15px",
                borderRadius: "12px",
                background: "var(--money-tint)",
                border:
                  "1px solid color-mix(in srgb, var(--money) 24%, transparent)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "11px" }}
              >
                <span
                  style={{
                    width: "30px",
                    height: "30px",
                    flex: "none",
                    borderRadius: "9px",
                    background:
                      "color-mix(in srgb, var(--money) 16%, transparent)",
                    color: "var(--money)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendUp size={15} />
                </span>
                <div>
                  <div
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "var(--money)",
                    }}
                  >
                    Net profit
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--money)",
                      opacity: 0.75,
                    }}
                  >
                    {vm.d_pr_margin}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  fontFamily: MONO,
                  color: "var(--money)",
                  letterSpacing: "-.01em",
                }}
              >
                {vm.d_pr_profit}
              </span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
