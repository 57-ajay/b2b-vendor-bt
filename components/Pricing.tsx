"use client";
import type { ViewModel } from "@/types";

const CARD_SHADOW =
  "0 1px 1px rgba(2,6,111,.04),0 10px 28px -14px rgba(2,6,111,.14)";

/** Pricing route — ported 1:1 from the source template (sc-if routeIsPricing). */
export default function Pricing({ vm }: { vm: ViewModel }) {
  return (
    <>
      {vm.pr_isBorderTax && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <section
            style={{
              border: "1px solid var(--border)",
              borderRadius: "16px",
              background: "var(--surface)",
              boxShadow: CARD_SHADOW,
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              maxHeight: "calc(100vh - 140px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--primary)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M2 4l4-1.5L12 4l4-1.5v12L12 16l-6-1.5L2 16V4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinejoin="round"
                />
                <path d="M6 2.5v12M12 4v12" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              States
            </div>
            <div
              style={{
                marginTop: "14px",
                border: "1px solid var(--border)",
                borderRadius: "13px",
                padding: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "var(--surface-inset)",
              }}
            >
              <span style={{ color: "var(--primary)", flex: "none" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path
                    d="M11 2v8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5.5 5.5a7 7 0 109 0"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.25 }}
                >
                  Activate automation states
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginTop: "2px",
                    lineHeight: 1.3,
                  }}
                >
                  Enable toggle for all AI-automation states
                </div>
              </div>
              <button
                onClick={vm.onBtAutomation}
                style={{
                  flex: "none",
                  width: "42px",
                  height: "24px",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: vm.btAutomationBg,
                  position: "relative",
                  transition: "background .2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: vm.btAutomationKnob,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left .2s",
                  }}
                />
              </button>
            </div>
            <div style={{ position: "relative", marginTop: "14px" }}>
              <span
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                  <line
                    x1="11"
                    y1="11"
                    x2="14"
                    y2="14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <input
                value={vm.btSearch}
                onChange={vm.onBtSearch}
                placeholder="Search state..."
                style={{
                  width: "100%",
                  height: "42px",
                  border: "1px solid var(--border)",
                  borderRadius: "11px",
                  padding: "0 14px 0 36px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  background: "var(--surface)",
                }}
              />
            </div>
            <div
              style={{
                marginTop: "10px",
                overflowY: "auto",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              {(vm.btStates ?? []).map((st, i) => (
                <button
                  key={i}
                  onClick={st.onClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "11px",
                    height: "44px",
                    padding: "0 13px",
                    border: "none",
                    borderRadius: "11px",
                    background: st.bg,
                    color: st.color,
                    fontWeight: st.weight,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    textAlign: "left",
                    width: "100%",
                    transition: "background .15s",
                  }}
                >
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      flex: "none",
                      background: st.dot,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {st.name}
                  </span>
                  <span
                    style={{
                      flex: "none",
                      color: "var(--text-muted)",
                      display: "flex",
                    }}
                  >
                    {st.bot}
                  </span>
                  <span
                    style={{
                      flex: "none",
                      color: "var(--primary)",
                      fontSize: "17px",
                      lineHeight: 1,
                    }}
                  >
                    {st.chevron}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    letterSpacing: "-.02em",
                  }}
                >
                  {vm.btSelectedName}
                </div>
                <div
                  style={{
                    fontSize: "13.5px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  Manage tax pricing for all vehicle types &amp; durations
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flex: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    maxWidth: "180px",
                    fontSize: "11.5px",
                    color: "var(--text-muted)",
                    lineHeight: 1.35,
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      border: "1.5px solid var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontStyle: "italic",
                      flex: "none",
                    }}
                  >
                    i
                  </span>
                  Changes apply only after you press Save Changes
                </div>
                <button
                  onClick={vm.onBtSave}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    height: "46px",
                    padding: "0 22px",
                    border: "none",
                    borderRadius: "13px",
                    background: "var(--primary)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 8px 20px -8px rgba(2,6,111,.5)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3 3h9l3 3v9H3V3z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 3v4h6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "nowrap",
                whiteSpace: "nowrap",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                background: "var(--surface)",
                boxShadow: "0 1px 1px rgba(2,6,111,.04)",
                padding: "12px 14px",
              }}
            >
              <button
                onClick={vm.onBtActive}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  height: "42px",
                  padding: "0 16px",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  background: "var(--surface)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 1px 2px rgba(2,6,111,.05)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: vm.btStatusDot,
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: vm.btStatusColor,
                  }}
                >
                  {vm.btStatusLabel}
                </span>
                <span
                  style={{
                    width: "38px",
                    height: "22px",
                    borderRadius: "999px",
                    background: vm.btActiveBg,
                    position: "relative",
                    display: "inline-block",
                    transition: "background .2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: vm.btActiveKnob,
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 1px 2px rgba(0,0,0,.25)",
                      transition: "left .2s",
                    }}
                  />
                </span>
              </button>
              <div style={{ flex: 1, minWidth: "8px" }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: "none",
                  padding: "6px 8px 6px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  background: "var(--surface-inset)",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    color: "var(--text-muted)",
                  }}
                >
                  Payment
                </span>
                <button
                  onClick={vm.btUpi?.onClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "42px",
                    padding: "0 15px",
                    border: "1px solid " + vm.btUpi?.border,
                    borderRadius: "12px",
                    background: vm.btUpi?.bg,
                    color: vm.btUpi?.color,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    boxShadow: vm.btUpi?.shadow,
                    transition: "background .2s,box-shadow .2s,border-color .2s",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <rect
                      x="2"
                      y="4"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="2"
                      y1="7.5"
                      x2="16"
                      y2="7.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  {vm.btUpi?.label}
                </button>
                <button
                  onClick={vm.btNet?.onClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "42px",
                    padding: "0 15px",
                    border: "1px solid " + vm.btNet?.border,
                    borderRadius: "12px",
                    background: vm.btNet?.bg,
                    color: vm.btNet?.color,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    boxShadow: vm.btNet?.shadow,
                    transition: "background .2s,box-shadow .2s,border-color .2s",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: vm.btNet?.checkBg,
                      color: vm.btNet?.checkColor,
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {vm.btNet?.check}
                  </span>
                  {vm.btNet?.label}
                </button>
                <button
                  onClick={vm.btOtp?.onClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    height: "42px",
                    padding: "0 15px",
                    border: "1px solid " + vm.btOtp?.border,
                    borderRadius: "12px",
                    background: vm.btOtp?.bg,
                    color: vm.btOtp?.color,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    boxShadow: vm.btOtp?.shadow,
                    transition: "background .2s,box-shadow .2s,border-color .2s",
                  }}
                >
                  {vm.btOtp?.label}
                  <span
                    style={{
                      width: "36px",
                      height: "21px",
                      borderRadius: "999px",
                      background: vm.btOtp?.track,
                      position: "relative",
                      display: "inline-block",
                      transition: "background .2s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "2.5px",
                        left: vm.btOtp?.knobLeft,
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: vm.btOtp?.knobBg,
                        boxShadow: "0 1px 3px rgba(0,0,0,.3)",
                        transition: "left .2s",
                      }}
                    />
                  </span>
                </button>
              </div>
            </div>

            <section
              style={{
                border: "1px solid var(--border)",
                borderRadius: "16px",
                background: "var(--surface)",
                boxShadow: CARD_SHADOW,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "18px 20px",
                  borderBottom: "1px solid var(--divider)",
                }}
              >
                <div
                  style={{
                    width: "170px",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    color: "var(--text-muted)",
                  }}
                >
                  Duration
                </div>
                {(vm.btVehicles ?? []).map((v, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span style={{ color: "var(--primary)" }}>{v.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      {v.key}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {v.sub}
                    </span>
                  </div>
                ))}
              </div>
              {(vm.btRows ?? []).map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--divider)",
                  }}
                >
                  <div
                    style={{
                      width: "170px",
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                    }}
                  >
                    <button
                      onClick={r.onToggle}
                      style={{
                        flex: "none",
                        width: "42px",
                        height: "24px",
                        borderRadius: "999px",
                        border: "none",
                        cursor: "pointer",
                        background: r.toggleBg,
                        position: "relative",
                        transition: "background .2s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "3px",
                          left: r.toggleKnob,
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left .2s",
                        }}
                      />
                    </button>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: r.durColor,
                        textDecoration: r.durDeco,
                      }}
                    >
                      {r.dur}
                    </span>
                  </div>
                  {r.cells.map((c, j) => (
                    <div
                      key={j}
                      style={{
                        flex: 1,
                        padding: "0 8px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          maxWidth: "150px",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "13px",
                            color: "var(--text-muted)",
                            fontFamily: "'JetBrains Mono',monospace",
                          }}
                        >
                          ₹
                        </span>
                        <input
                          value={c.val}
                          onChange={c.onInput}
                          disabled={c.disabled}
                          placeholder="--"
                          style={{
                            width: "100%",
                            height: "44px",
                            border: "1px solid var(--border)",
                            borderRadius: "11px",
                            padding: "0 12px 0 28px",
                            fontSize: "15px",
                            fontWeight: 600,
                            fontFamily: "'JetBrains Mono',monospace",
                            background: c.bg,
                            color: c.color,
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </div>
        </div>
      )}

      {vm.pr_isSimple && (
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: "16px",
            background: "var(--surface)",
            boxShadow: CARD_SHADOW,
            padding: "80px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "var(--primary-tint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M12 7.2v5l3.2 2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".14em",
              color: "var(--accent-text,#7A5C00)",
              marginTop: "24px",
            }}
          >
            {vm.pr_comingTitle}
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              letterSpacing: "-.02em",
              marginTop: "10px",
            }}
          >
            Coming soon
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginTop: "10px",
              maxWidth: "420px",
              lineHeight: 1.6,
            }}
          >
            {vm.pr_desc} Configuration for this service is on the way.
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "22px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#7A5C00",
              background: "#FFF7D1",
              borderRadius: "999px",
              padding: "7px 16px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#FAC800",
                animation: "pulse 1.6s infinite",
              }}
            />
            In development
          </span>
        </section>
      )}
    </>
  );
}
