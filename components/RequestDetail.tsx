"use client";
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Box,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cog,
  Copy,
  Download,
  Eye,
  FileText,
  Hash,
  MapPin,
  Milestone,
  Phone,
  QrCode,
  RotateCcw,
  Share2,
  ShieldCheck,
  TrendingUp,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";

import type { FieldRow, ViewModel } from "@/types";

const MONO = "'JetBrains Mono',monospace";

type IconType = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

/* ---------------------------------------------------------------- primitives */

/** Consistent card section header: tinted icon chip + title + optional aside. */
function CardHead({
  icon: Icon,
  title,
  tint = "var(--primary)",
  tintBg = "var(--primary-tint)",
  aside,
  mb = 20,
}: {
  icon: IconType;
  title: string;
  tint?: string;
  tintBg?: string;
  aside?: React.ReactNode;
  mb?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "11px",
        marginBottom: mb,
      }}
    >
      <span
        style={{
          width: "32px",
          height: "32px",
          flex: "none",
          borderRadius: "10px",
          background: tintBg,
          color: tint,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} strokeWidth={2.2} />
      </span>
      <span
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--text)",
          letterSpacing: "-.01em",
        }}
      >
        {title}
      </span>
      {aside != null && <div style={{ marginLeft: "auto" }}>{aside}</div>}
    </div>
  );
}

const ALERT_TONES = {
  success: {
    fg: "var(--money)",
    bg: "var(--money-tint)",
    bd: "color-mix(in srgb, var(--money) 22%, transparent)",
  },
  warn: { fg: "var(--warn)", bg: "var(--warn-tint)", bd: "var(--warn-border)" },
  danger: {
    fg: "var(--danger)",
    bg: "var(--danger-tint)",
    bd: "var(--danger-border)",
  },
};

function Alert({
  tone,
  icon: Icon,
  children,
}: {
  tone: keyof typeof ALERT_TONES;
  icon: IconType;
  children: React.ReactNode;
}) {
  const t = ALERT_TONES[tone];
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        padding: "12px 14px",
        borderRadius: "12px",
        background: t.bg,
        border: "1px solid " + t.bd,
        color: t.fg,
        fontSize: "12.5px",
        fontWeight: 500,
        lineHeight: 1.5,
      }}
    >
      <Icon size={15} strokeWidth={2.2} style={{ flex: "none", marginTop: "1px" }} />
      <div>{children}</div>
    </div>
  );
}

/** Inline link styled to sit inside a coloured alert. */
function alertLink(color: string): React.CSSProperties {
  return {
    border: "none",
    background: "transparent",
    color,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: 0,
    fontSize: "inherit",
    textDecoration: "underline",
  };
}

const META_ITEM: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "12.5px",
  fontWeight: 500,
  color: "var(--text-secondary)",
};
function MetaItem({ icon: Icon, children }: { icon: IconType; children: React.ReactNode }) {
  return (
    <span style={META_ITEM}>
      <Icon size={13} strokeWidth={2} />
      {children}
    </span>
  );
}
const Dot = () => (
  <span
    style={{
      width: "3px",
      height: "3px",
      flex: "none",
      borderRadius: "50%",
      background: "var(--text-muted)",
    }}
  />
);

function FieldIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  const p = { size: 15, strokeWidth: 2 };
  if (l.includes("vehicle")) return <Truck {...p} />;
  if (l.includes("engine")) return <Cog {...p} />;
  if (l.includes("chassis")) return <Box {...p} />;
  if (l.includes("journey") || l.includes("date")) return <Calendar {...p} />;
  if (l.includes("state")) return <MapPin {...p} />;
  if (l.includes("border")) return <Milestone {...p} />;
  if (l.includes("mobile") || l.includes("phone")) return <Phone {...p} />;
  return <Hash {...p} />;
}

function FieldCell({ f }: { f: FieldRow }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
      <span
        style={{
          width: "34px",
          height: "34px",
          flex: "none",
          borderRadius: "10px",
          background: "var(--surface-inset)",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FieldIcon label={f.label} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            color: "var(--text-muted)",
          }}
        >
          {f.label}
        </div>
        <div
          title={f.value}
          style={{
            fontSize: "14.5px",
            fontWeight: 600,
            fontFamily: f.font,
            color: "var(--text)",
            marginTop: "3px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {f.value || "—"}
        </div>
      </div>
    </div>
  );
}

function PriceRow({
  icon: Icon,
  iconTone,
  iconBg,
  label,
  sub,
  value,
  muted,
}: {
  icon: IconType;
  iconTone: string;
  iconBg: string;
  label: string;
  sub: string;
  value?: string;
  muted?: boolean;
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
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
            {label}
          </div>
          <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
            {sub}
          </div>
        </div>
      </div>
      <span
        style={{
          fontSize: "15px",
          fontWeight: 600,
          fontFamily: MONO,
          color: muted ? "var(--text-secondary)" : "var(--text)",
        }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

/* Shared button styles. */
const BTN_PRIMARY: React.CSSProperties = {
  width: "100%",
  height: "48px",
  border: "none",
  borderRadius: "12px",
  background: "var(--primary)",
  color: "#fff",
  fontSize: "14.5px",
  fontWeight: 600,
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};
const BTN_GHOST: React.CSSProperties = {
  flex: 1,
  height: "44px",
  border: "1px solid var(--border)",
  borderRadius: "11px",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
};
const CARD_DESC: React.CSSProperties = {
  fontSize: "13px",
  color: "var(--text-secondary)",
  lineHeight: 1.6,
  marginTop: "2px",
};
const CENTERED: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "18px 8px",
};

/* --------------------------------------------------------------- the route */

/**
 * Request detail route. Pure visual redesign — every `vm.*` binding, handler,
 * and status branch is preserved exactly; only the layout/styling changed.
 */
export default function RequestDetail({ vm }: { vm: ViewModel }) {
  const fields = vm.d_fields ?? [];
  const findVal = (re: RegExp) => fields.find((f) => re.test(f.label))?.value;
  const journey = findVal(/journey|date/i);
  const stateVal = findVal(/^state|\bstate\b/i);

  const statusBadge = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "13px",
        fontWeight: 600,
        color: vm.d_pillText,
        background: vm.d_pillBg,
        borderRadius: "999px",
        padding: "7px 15px",
        whiteSpace: "nowrap",
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
  );

  return (
    <>
      {/* back link */}
      <button
        onClick={vm.goRequests}
        className="rd-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: "none",
          background: "transparent",
          color: "var(--text-secondary)",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          padding: "2px 0",
          marginBottom: "14px",
        }}
      >
        <ArrowLeft size={15} /> All requests
      </button>

      {/* ---------------------------------------------------------- header */}
      <section
        className="rd-card"
        style={{ padding: "22px 24px", marginBottom: "20px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
            <span
              style={{
                width: "54px",
                height: "54px",
                flex: "none",
                borderRadius: "15px",
                background: "var(--primary-tint)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Truck size={26} strokeWidth={2} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  fontFamily: MONO,
                  letterSpacing: "-.02em",
                  lineHeight: 1.1,
                  color: "var(--text)",
                }}
              >
                {vm.d_vehicle}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "9px",
                  flexWrap: "wrap",
                }}
              >
                <MetaItem icon={Hash}>{vm.d_shortId}</MetaItem>
                {journey && (
                  <>
                    <Dot />
                    <MetaItem icon={Calendar}>{journey}</MetaItem>
                  </>
                )}
                {stateVal && (
                  <>
                    <Dot />
                    <MetaItem icon={MapPin}>{stateVal}</MetaItem>
                  </>
                )}
              </div>
            </div>
          </div>
          {statusBadge}
        </div>
      </section>

      {/* ------------------------------------------------------ dashboard grid */}
      <div className="rd-grid">
        {/* Customer information */}
        <section className="rd-card" style={{ padding: "24px", animationDelay: ".04s" }}>
          <CardHead icon={FileText} title="Customer information" />
          <div className="rd-fields">
            {fields.length === 0 ? (
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                No submission details.
              </div>
            ) : (
              fields.map((f, i) => <FieldCell key={i} f={f} />)
            )}
          </div>
        </section>

        {/* Processing card */}
        <section className="rd-card" style={{ padding: "24px", animationDelay: ".08s" }}>
          {/* PENDING */}
          {vm.ac_pending && (
            <>
              <CardHead icon={Zap} title="Start processing" mb={12} />
              <div style={CARD_DESC}>
                A fee of{" "}
                <b style={{ fontFamily: MONO, color: "var(--text)", fontWeight: 700 }}>
                  {vm.d_priceFmt}
                </b>{" "}
                is held from your wallet now and charged only when a receipt is produced.
              </div>

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "var(--surface-inset)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      flex: "none",
                      borderRadius: "10px",
                      background: "var(--primary-tint)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Wallet size={17} />
                  </span>
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text)" }}>
                      Wallet hold
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                      Held now · charged on receipt
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: "18px", fontWeight: 700, fontFamily: MONO, color: "var(--text)" }}>
                  {vm.d_priceFmt}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "14px",
                }}
              >
                {vm.d_walletCovers && (
                  <Alert tone="success" icon={CheckCircle2}>
                    Wallet balance covers this hold.
                  </Alert>
                )}
                {vm.d_walletShort && (
                  <Alert tone="warn" icon={AlertTriangle}>
                    Insufficient wallet balance to cover the hold.{" "}
                    <button onClick={vm.goWallet} className="rd-link" style={alertLink("var(--warn)")}>
                      Top up wallet
                    </button>
                  </Alert>
                )}
                {vm.d_isDuplicate && (
                  <Alert tone="warn" icon={Copy}>
                    Flagged as a possible duplicate of{" "}
                    <a onClick={vm.d_onViewOriginal} className="rd-link" style={alertLink("var(--warn)")}>
                      {vm.d_dupOf}
                    </a>
                    .
                  </Alert>
                )}
              </div>

              <button
                onClick={vm.d_onStart}
                disabled={vm.d_startDisabled}
                className="rd-btn rd-btn-primary"
                style={{
                  ...BTN_PRIMARY,
                  marginTop: "18px",
                  background: vm.d_startBg,
                  cursor: vm.d_startCursor,
                }}
              >
                <Zap size={17} /> Start process
              </button>

              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "18px",
                  borderTop: "1px solid var(--divider)",
                }}
              >
                <label
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "var(--text-muted)",
                  }}
                >
                  Demo · force failure at
                </label>
                <select
                  value={vm.d_failStage}
                  onChange={vm.d_onFailStage}
                  className="hov-primary-border"
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    height: "38px",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "0 12px",
                    fontSize: "12.5px",
                    fontFamily: "inherit",
                    color: "var(--text-secondary)",
                    background: "var(--surface)",
                    cursor: "pointer",
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
            <div style={CENTERED}>
              <span
                style={{
                  width: "44px",
                  height: "44px",
                  border: "3px solid var(--primary-tint)",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  animation: "spin .8s linear infinite",
                }}
              />
              <div style={{ fontSize: "15px", fontWeight: 600, marginTop: "18px" }}>
                {vm.d_statusLabel}
              </div>
              <div style={{ ...CARD_DESC, maxWidth: "300px", marginTop: "6px" }}>
                Working through the government portal automatically. This usually takes
                under a minute.
              </div>
              <div
                style={{
                  marginTop: "16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--warn)",
                  background: "var(--warn-tint)",
                  border: "1px solid var(--warn-border)",
                  borderRadius: "999px",
                  padding: "6px 14px",
                  fontFamily: MONO,
                }}
              >
                <Wallet size={13} /> {vm.d_priceFmt} held
              </div>
            </div>
          )}

          {/* AWAITING PAYMENT */}
          {vm.ac_awaiting && (
            <>
              <CardHead icon={QrCode} title="Awaiting payment" mb={12} />
              <div style={CARD_DESC}>
                Driver scans to pay the tax. We advance automatically on confirmation.
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "18px" }}>
                <div
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                    padding: "12px",
                    background: "#ffffff",
                    boxShadow: "0 12px 30px -16px rgba(2,6,111,.32)",
                  }}
                >
                  {vm.qrEl}
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    fontFamily: MONO,
                    letterSpacing: "-.02em",
                  }}
                >
                  {vm.d_amountFmt}
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--warn)",
                    background: "var(--warn-tint)",
                    border: "1px solid var(--warn-border)",
                    borderRadius: "999px",
                    padding: "5px 14px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--gold)",
                      animation: "pulse 1.6s infinite",
                    }}
                  />
                  Expires in {vm.d_countdown}
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                <button onClick={vm.d_onCopy} className="rd-btn rd-btn-ghost" style={BTN_GHOST}>
                  <Copy size={15} /> {vm.d_copyLabel}
                </button>
                <button onClick={vm.d_onShare} className="rd-btn rd-btn-ghost" style={BTN_GHOST}>
                  <Share2 size={15} /> Share
                </button>
              </div>
              <button
                onClick={vm.d_onMarkPaid}
                className="rd-btn rd-btn-primary"
                style={{ ...BTN_PRIMARY, height: "44px", marginTop: "10px" }}
              >
                <CheckCircle2 size={16} /> Mark paid (demo)
              </button>
            </>
          )}

          {/* RECONCILING */}
          {vm.ac_reconciling && (
            <div style={CENTERED}>
              <span
                style={{
                  width: "44px",
                  height: "44px",
                  border: "3px solid var(--warn-tint)",
                  borderTopColor: "var(--warn)",
                  borderRadius: "50%",
                  animation: "spin .9s linear infinite",
                }}
              />
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  marginTop: "16px",
                  color: "var(--warn)",
                }}
              >
                Reconciling payment
              </div>
              <div style={{ ...CARD_DESC, maxWidth: "320px", marginTop: "6px" }}>
                Payment received, receipt pending. Your funds are protected — no extra
                charge applies while we recover the receipt.
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "12px" }}>
                Escalated to operations · auto-retrying
              </div>
            </div>
          )}

          {/* COMPLETED */}
          {vm.ac_completed && (
            <>
              <CardHead
                icon={CheckCircle2}
                title="Receipt generated"
                tint="var(--money)"
                tintBg="var(--money-tint)"
                mb={16}
              />
              <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                {[
                  { label: "Tax amount", value: vm.d_amountFmt, mono: true },
                  { label: "Gov reference", value: vm.d_govRef, mono: true },
                  { label: "Generated", value: vm.d_generatedAt, mono: false },
                ].map((r, i, arr) => (
                  <div
                    key={r.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--divider)" : "none",
                    }}
                  >
                    <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        fontFamily: r.mono ? MONO : "inherit",
                        color: "var(--text)",
                      }}
                    >
                      {r.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button onClick={vm.d_onView} className="rd-btn rd-btn-ghost" style={BTN_GHOST}>
                  <Eye size={15} /> View receipt
                </button>
                <button
                  onClick={vm.d_onDownload}
                  className="rd-btn rd-btn-primary"
                  style={{ ...BTN_PRIMARY, flex: 1, width: "auto", height: "44px" }}
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </>
          )}

          {/* FAILED */}
          {vm.ac_failed && (
            <>
              <CardHead
                icon={AlertTriangle}
                title="Processing failed"
                tint="var(--danger)"
                tintBg="var(--danger-tint)"
                mb={14}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Alert tone="danger" icon={AlertTriangle}>
                  {vm.d_failReason}
                </Alert>
                <Alert tone="success" icon={ShieldCheck}>
                  No charge applied — the hold was released back to your wallet.
                </Alert>
              </div>
              <button
                onClick={vm.d_onRetry}
                className="rd-btn rd-btn-primary"
                style={{ ...BTN_PRIMARY, marginTop: "16px" }}
              >
                <RotateCcw size={16} /> Retry request
              </button>
            </>
          )}
        </section>

        {/* Live status timeline */}
        <section className="rd-card" style={{ padding: "24px", animationDelay: ".12s" }}>
          <CardHead icon={Activity} title="Live status" />
          <div>
            {(vm.d_steps ?? []).map((s, i, arr) => (
              <div key={i} style={{ display: "flex", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      flex: "none",
                      borderRadius: "50%",
                      border: "2px solid " + s.ring,
                      background: s.fill,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: s.mark,
                      animation: s.anim,
                    }}
                  >
                    {s.glyph}
                  </span>
                  {i < arr.length - 1 && (
                    <span
                      style={{
                        width: "2px",
                        flex: 1,
                        minHeight: "18px",
                        background: s.line,
                        borderRadius: "2px",
                        margin: "3px 0",
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: "13.5px",
                    color: s.text,
                    fontWeight: s.weight,
                    paddingTop: "2px",
                    paddingBottom: i < arr.length - 1 ? "16px" : "0",
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing breakdown */}
        <section className="rd-card" style={{ padding: "24px", animationDelay: ".16s" }}>
          <CardHead
            icon={TrendingUp}
            title="Pricing breakdown"
            tint="var(--money)"
            tintBg="var(--money-tint)"
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <PriceRow
              icon={ArrowDownLeft}
              iconTone="var(--money)"
              iconBg="var(--money-tint)"
              label="Received from customer"
              sub="Tax + service fee"
              value={vm.d_pr_received}
            />
            <div style={{ height: "1px", background: "var(--divider)" }} />
            <PriceRow
              icon={ArrowUpRight}
              iconTone="var(--text-secondary)"
              iconBg="var(--surface-inset)"
              label="Paid by vendor"
              sub="Remitted to government"
              value={vm.d_pr_vendor}
              muted
            />
          </div>
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              borderRadius: "14px",
              background: "var(--money-tint)",
              border: "1px solid color-mix(in srgb, var(--money) 24%, transparent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  width: "38px",
                  height: "38px",
                  flex: "none",
                  borderRadius: "11px",
                  background: "color-mix(in srgb, var(--money) 18%, transparent)",
                  color: "var(--money)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={19} strokeWidth={2.4} />
              </span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--money)" }}>
                  Net profit
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--money)", opacity: 0.75, marginTop: "1px" }}>
                  {vm.d_pr_margin}
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                fontFamily: MONO,
                color: "var(--money)",
                letterSpacing: "-.02em",
              }}
            >
              {vm.d_pr_profit}
            </span>
          </div>
        </section>

        {/* Activity log — full width timeline */}
        <section className="rd-card rd-span" style={{ animationDelay: ".2s" }}>
          <button
            onClick={vm.onToggleLog}
            className="rd-btn"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "11px",
              padding: "18px 22px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                width: "32px",
                height: "32px",
                flex: "none",
                borderRadius: "10px",
                background: "var(--primary-tint)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={16} strokeWidth={2.2} />
            </span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>
              Activity log
            </span>
            <span
              style={{
                marginLeft: "auto",
                color: "var(--text-muted)",
                display: "flex",
                transition: "transform .2s ease",
                transform: vm.logOpen ? "rotate(180deg)" : "none",
              }}
            >
              <ChevronDown size={18} />
            </span>
          </button>
          {vm.logOpen && (
            <div style={{ padding: "2px 22px 22px" }}>
              {(vm.d_log ?? []).length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    padding: "8px 0",
                  }}
                >
                  <Clock size={15} /> No activity recorded yet.
                </div>
              ) : (
                (vm.d_log ?? []).map((l, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: "14px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          flex: "none",
                          borderRadius: "50%",
                          background: "var(--primary)",
                          marginTop: "4px",
                          boxShadow: "0 0 0 4px var(--primary-tint)",
                        }}
                      />
                      {i < arr.length - 1 && (
                        <span
                          style={{
                            width: "2px",
                            flex: 1,
                            minHeight: "16px",
                            background: "var(--divider)",
                            margin: "4px 0",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? "16px" : "0", minWidth: 0 }}>
                      <div style={{ fontSize: "11.5px", fontFamily: MONO, color: "var(--text-muted)" }}>
                        {l.time}
                      </div>
                      <div style={{ fontSize: "13.5px", color: "var(--text)", marginTop: "3px", lineHeight: 1.5 }}>
                        {l.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
