"use client";
import GrowthChart from "@/components/GrowthChart";
import type { ViewModel } from "@/types";

const CARD_SHADOW =
  "0 1px 1px rgba(2,6,111,.04),0 10px 28px -14px rgba(2,6,111,.14)";

/** Dashboard route — ported 1:1 from the source template (sc-if routeIsDashboard). */
export default function Dashboard({
  vm,
  requestsLength,
}: {
  vm: ViewModel;
  requestsLength: number;
}) {
  return (
    <>
      <div
        style={{
          position: "relative",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          boxShadow: CARD_SHADOW,
          display: "flex",
          height: "92px",
          overflow: "hidden",
          background: "linear-gradient(180deg,var(--surface),var(--surface-inset))",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            left: "24px",
            right: "24px",
            height: "1px",
            background:
              "linear-gradient(90deg,transparent,rgba(250,200,0,.5),transparent)",
          }}
        />
        {(vm.metrics ?? []).map((m, i) => (
          <div
            key={i}
            onClick={m.onClick}
            className={m.hover ? "hov-inset" : undefined}
            style={{
              flex: 1,
              padding: "18px 22px",
              borderRight: "1px solid var(--divider)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              cursor: m.cursor,
              transition: "background .15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  color: "var(--text-muted)",
                }}
              >
                {m.label}
              </span>
              {m.caret}
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 600,
                fontFamily: "'JetBrains Mono',monospace",
                color: m.color,
                lineHeight: 1.05,
                marginTop: "6px",
                letterSpacing: "-.02em",
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontSize: "11.5px",
                color: "var(--text-muted)",
                marginTop: "2px",
              }}
            >
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {vm.dashShowGlance && (
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: "14px",
            background: "var(--surface)",
            boxShadow: CARD_SHADOW,
            padding: "16px 20px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              Today at a glance
            </div>
            <button
              onClick={vm.onToggleGlance}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Hide
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "36px",
              marginTop: "10px",
            }}
          >
            <div style={{ flex: "none" }}>{vm.donutEl}</div>
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 32px",
                maxWidth: "520px",
              }}
            >
              {(vm.donutLegend ?? []).map((g, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "9px" }}
                >
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "3px",
                      background: g.color,
                      flex: "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text-secondary)",
                      flex: 1,
                    }}
                  >
                    {g.label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    {g.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: "14px",
          background: "var(--surface)",
          boxShadow: CARD_SHADOW,
          padding: "18px 20px",
          marginTop: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600 }}>Monthly report</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Requests per day · {vm.monthLabel}
          </div>
        </div>
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

      <div style={{ marginTop: "24px" }}>
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: "14px",
            background: "var(--surface)",
            boxShadow: CARD_SHADOW,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px 12px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              Needs attention
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--primary)",
                background: "var(--primary-tint)",
                borderRadius: "999px",
                padding: "3px 10px",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {vm.attentionCount} open
            </span>
          </div>
          <div style={{ flex: 1 }}>
            {(vm.attentionRows ?? []).map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "0 18px",
                  height: "54px",
                  borderTop: "1px solid var(--divider)",
                  animation: r.anim,
                }}
              >
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
                <span
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: "13px",
                    fontWeight: 500,
                    width: "108px",
                  }}
                >
                  {r.vehicle}
                </span>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: "var(--text-secondary)",
                    flex: 1,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.route}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    flex: "none",
                    whiteSpace: "nowrap",
                    fontSize: "11.5px",
                    fontWeight: 500,
                    color: r.pillText,
                    background: r.pillBg,
                    borderRadius: "999px",
                    padding: "3px 10px",
                  }}
                >
                  {r.statusLabel}
                </span>
                {r.isStart && (
                  <button
                    onClick={r.onAction}
                    style={{
                      height: "30px",
                      padding: "0 13px",
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
                    Start
                  </button>
                )}
                {r.isView && (
                  <button
                    onClick={r.onAction}
                    style={{
                      height: "30px",
                      padding: "0 11px",
                      border: "none",
                      borderRadius: "8px",
                      background: "transparent",
                      color: "var(--primary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    View
                  </button>
                )}
              </div>
            ))}
            {vm.attentionEmpty && (
              <div
                style={{
                  padding: "36px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "13px",
                }}
              >
                Nothing needs attention right now.
              </div>
            )}
          </div>
        </section>
      </div>

      <section style={{ marginTop: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
          Recent requests
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
          {(vm.recentRows ?? []).map((r, i) => (
            <div
              key={i}
              onClick={r.onClick}
              className="hov-inset"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "0 18px",
                height: "52px",
                borderTop: "1px solid var(--divider)",
                cursor: "pointer",
                transition: "background .15s",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: "13px",
                  fontWeight: 500,
                  width: "120px",
                }}
              >
                {r.vehicle}
              </span>
              <span
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  flex: 1,
                }}
              >
                {r.route}
              </span>
              <span style={{ width: "150px", flex: "none" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
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
                    }}
                  />
                  {r.statusLabel}
                </span>
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  width: "90px",
                  textAlign: "right",
                }}
              >
                {r.time}
              </span>
              <span style={{ color: "#C5C9D6", fontSize: "16px" }}>›</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
