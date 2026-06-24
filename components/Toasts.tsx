"use client";
import type { ViewModel } from "@/types";

/** Toast stack — ported 1:1 from the source template. Always mounted. */
export default function Toasts({ vm }: { vm: ViewModel }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "18px",
        right: "18px",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "300px",
      }}
    >
      {vm.toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid " + t.accent,
            borderRadius: "11px",
            boxShadow: "0 8px 24px rgba(2,6,111,.10)",
            padding: "13px 15px",
            animation: "toastIn .25s both",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: t.accent,
              }}
            />
            {t.title}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginTop: "4px",
              paddingLeft: "15px",
            }}
          >
            {t.msg}
          </div>
        </div>
      ))}
    </div>
  );
}
