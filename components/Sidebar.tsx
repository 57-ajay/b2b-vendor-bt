"use client";
import { Fragment } from "react";

import type { ViewModel } from "@/types";

/** App sidebar (nav rail) — ported 1:1 from the source template. */
export default function Sidebar({ vm }: { vm: ViewModel }) {
  return (
    <aside
      style={{
        flex: "none",
        width: vm.sidebarWidth,
        background: "linear-gradient(185deg,#0A0F4D 0%,var(--sidebar) 55%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: "width .22s cubic-bezier(.22,1,.36,1)",
        position: "sticky",
        top: 0,
        height: "100vh",
        boxShadow:
          "1px 0 0 rgba(255,255,255,.05),12px 0 40px -24px rgba(2,6,111,.6)",
      }}
    >
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          gap: "11px",
          padding: "0 18px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            flex: "none",
            borderRadius: "9px",
            background: "linear-gradient(150deg,#FFE27A,#FAC800)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            boxShadow: "0 4px 12px rgba(250,200,0,.32)",
          }}
        >
          {vm.brandLogo}
        </div>
        <span
          style={{
            fontWeight: 600,
            fontSize: "13.5px",
            letterSpacing: ".03em",
            lineHeight: 1.2,
            opacity: vm.brandLabelOpacity,
            overflow: "hidden",
          }}
        >
          {vm.brandName}
        </span>
      </div>
      <nav
        style={{
          flex: 1,
          padding: "14px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          width: "100%",
        }}
      >
        {vm.navItems.map((nav, i) => (
          <button
            key={i}
            onClick={nav.onClick}
            title={nav.label}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "11px",
              height: "40px",
              paddingLeft: nav.padLeft,
              paddingRight: "11px",
              border: "none",
              borderRadius: "10px",
              background: nav.bg,
              color: nav.color,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: nav.weight,
              textAlign: "left",
              width: "100%",
              transition: "background .15s",
            }}
          >
            {nav.active && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "8px",
                  bottom: "8px",
                  width: "3px",
                  borderRadius: "3px",
                  background: "linear-gradient(#FFE27A,#FAC800)",
                  boxShadow: "0 0 12px rgba(250,200,0,.55)",
                }}
              />
            )}
            {nav.indent && (
              <>
                <span
                  style={{
                    position: "absolute",
                    left: "22px",
                    top: 0,
                    bottom: nav.connBottom,
                    width: "1.5px",
                    background: "rgba(255,255,255,.16)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "22px",
                    top: "50%",
                    width: "10px",
                    height: "1.5px",
                    background: "rgba(255,255,255,.16)",
                  }}
                />
              </>
            )}
            <span
              style={{
                width: "18px",
                height: "18px",
                flex: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {nav.icon}
            </span>
            <span
              style={{
                flex: 1,
                opacity: vm.navLabelOpacity,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {nav.label}
            </span>
            {nav.badge && (
              <span
                style={{
                  flex: "none",
                  minWidth: "18px",
                  height: "18px",
                  padding: "0 5px",
                  borderRadius: "9px",
                  background: "#E5484D",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'JetBrains Mono',monospace",
                  opacity: vm.navLabelOpacity,
                }}
              >
                {nav.badge}
              </span>
            )}
            <Fragment>{nav.caret}</Fragment>
          </button>
        ))}
      </nav>
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(255,255,255,.07)",
          display: "flex",
          alignItems: "center",
          gap: "9px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            flex: "none",
            borderRadius: "50%",
            background: vm.connDot,
            animation: vm.connAnim,
          }}
        />
        <span
          style={{
            fontSize: "12px",
            color: "#AEB2DA",
            opacity: vm.navLabelOpacity,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {vm.connLabel}
        </span>
      </div>
    </aside>
  );
}
