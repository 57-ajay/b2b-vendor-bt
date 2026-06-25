import { Search } from "lucide-react";

/**
 * Shared "premium" UI primitives for the operator panel. Pure presentational —
 * no state, no business logic. Colours come from the live CSS-variable tokens
 * so everything tracks the light/dark switch. The `.rd-*` classes referenced
 * here live in globals.css.
 */

export const MONO = "'JetBrains Mono',monospace";

export type IconType = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

/* ----------------------------------------------------------------- headers */

export function CardHead({
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
    <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: mb }}>
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
      <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", letterSpacing: "-.01em" }}>
        {title}
      </span>
      {aside != null && <div style={{ marginLeft: "auto" }}>{aside}</div>}
    </div>
  );
}

export function MetaItem({ icon: Icon, children }: { icon: IconType; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "12.5px",
        fontWeight: 500,
        color: "var(--text-secondary)",
      }}
    >
      <Icon size={13} strokeWidth={2} />
      {children}
    </span>
  );
}

export const Dot = () => (
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

/* ------------------------------------------------------------------ alerts */

export const ALERT_TONES = {
  success: {
    fg: "var(--money)",
    bg: "var(--money-tint)",
    bd: "color-mix(in srgb, var(--money) 22%, transparent)",
  },
  warn: { fg: "var(--warn)", bg: "var(--warn-tint)", bd: "var(--warn-border)" },
  danger: { fg: "var(--danger)", bg: "var(--danger-tint)", bd: "var(--danger-border)" },
};

export function Alert({
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

export function alertLink(color: string): React.CSSProperties {
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

/* ----------------------------------------------------------------- buttons */

export const BTN_PRIMARY: React.CSSProperties = {
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

export const BTN_GHOST: React.CSSProperties = {
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

/** Small inline action button (table rows). Set background/color/border per use. */
export const BTN_SM: React.CSSProperties = {
  height: "32px",
  padding: "0 13px",
  borderRadius: "9px",
  fontSize: "12px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  whiteSpace: "nowrap",
};

/* ------------------------------------------------------------- status pill */

export function StatusPill({
  text,
  bg,
  color,
  dot,
  dotAnim,
}: {
  text: React.ReactNode;
  bg: string;
  color: string;
  dot?: string;
  dotAnim?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        fontSize: "11.5px",
        fontWeight: 600,
        color,
        background: bg,
        borderRadius: "999px",
        padding: "4px 11px",
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: dot,
            animation: dotAnim,
          }}
        />
      )}
      {text}
    </span>
  );
}

/* ------------------------------------------------------------- empty state */

export function EmptyState({ icon: Icon, children }: { icon: IconType; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "52px 24px",
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "13px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "13px",
          background: "var(--surface-inset)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} />
      </span>
      <div>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------- search box */

export function SearchInput({
  value,
  onChange,
  placeholder,
  width = "320px",
}: {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  width?: string;
}) {
  return (
    <div style={{ position: "relative", width, maxWidth: "100%" }}>
      <Search
        size={15}
        style={{
          position: "absolute",
          left: "13px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-muted)",
          pointerEvents: "none",
        }}
      />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rd-input"
        style={{
          width: "100%",
          height: "40px",
          border: "1px solid var(--border)",
          borderRadius: "11px",
          padding: "0 14px 0 36px",
          fontSize: "13px",
          fontFamily: "inherit",
          outline: "none",
          background: "var(--surface)",
          color: "var(--text)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------- data table */

export interface Column<T> {
  label: string;
  width?: number | string;
  flex?: number;
  align?: "right";
  cell: (row: T, i: number) => React.ReactNode;
}

function cellStyle(c: { width?: number | string; flex?: number; align?: "right" }): React.CSSProperties {
  const right = c.align === "right";
  return {
    width: c.width,
    flex: c.flex,
    minWidth: 0,
    ...(right
      ? { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "7px", textAlign: "right" as const }
      : {}),
  };
}

const TABLE_HEAD: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "0 20px",
  height: "44px",
  borderBottom: "1px solid var(--border)",
  fontSize: "10.5px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  color: "var(--text-muted)",
  background: "var(--surface)",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const TABLE_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "0 20px",
  height: "56px",
  borderTop: "1px solid var(--divider)",
  transition: "background .15s",
};

export function DataTable<T>({
  columns,
  rows,
  onRowClick,
  rowAnim,
  empty,
  title,
  titleIcon,
  titleTint,
  titleTintBg,
  titleAside,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T, i: number) => void;
  rowAnim?: (row: T) => string | undefined;
  empty?: React.ReactNode;
  title?: string;
  titleIcon?: IconType;
  titleTint?: string;
  titleTintBg?: string;
  titleAside?: React.ReactNode;
}) {
  return (
    <div className="rd-card" style={{ padding: 0, overflow: "hidden" }}>
      {title && titleIcon && (
        <div style={{ padding: "18px 20px 14px" }}>
          <CardHead
            icon={titleIcon}
            title={title}
            tint={titleTint}
            tintBg={titleTintBg}
            aside={titleAside}
            mb={0}
          />
        </div>
      )}
      <div style={title ? { ...TABLE_HEAD, position: "static" } : TABLE_HEAD}>
        {columns.map((c, i) => (
          <span key={i} style={cellStyle(c)}>
            {c.label}
          </span>
        ))}
      </div>
      {rows.map((row, i) => {
        const clickable = !!onRowClick;
        return (
          <div
            key={i}
            onClick={clickable ? () => onRowClick!(row, i) : undefined}
            className={clickable ? "hov-inset" : undefined}
            style={{
              ...TABLE_ROW,
              cursor: clickable ? "pointer" : "default",
              animation: rowAnim ? rowAnim(row) : undefined,
            }}
          >
            {columns.map((c, j) => (
              <span key={j} style={cellStyle(c)}>
                {c.cell(row, i)}
              </span>
            ))}
          </div>
        );
      })}
      {empty}
    </div>
  );
}
