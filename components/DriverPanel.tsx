"use client";
import React from "react";

import {
  ATTENTION,
  fmtMoney,
  pad,
  RANK,
  STATUS_META,
  STEP_DEFS,
  TRANSIENT,
} from "@/lib/constants";
import { monthData as computeMonthData } from "@/lib/month-data";
import { createService } from "@/lib/services";
import type { DriverPanelService } from "@/lib/services/types";
import type {
  BtStateCfg,
  DriverRequest,
  ModalState,
  PricingSection,
  ReceiptModalState,
  RequestStatus,
  Route,
  Settings,
  SettingsTabKey,
  Toast,
  Transaction,
  ViewModel,
  Wallet,
} from "@/types";

import Commercials from "@/components/Commercials";
import ConfirmModal from "@/components/ConfirmModal";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import Pricing from "@/components/Pricing";
import ProfileMenu from "@/components/ProfileMenu";
import ReceiptModal from "@/components/ReceiptModal";
import Receipts from "@/components/Receipts";
import RequestDetail from "@/components/RequestDetail";
import Requests from "@/components/Requests";
import SettingsView from "@/components/Settings";
import Sidebar from "@/components/Sidebar";
import Toasts from "@/components/Toasts";
import Topbar from "@/components/Topbar";
import WalletView from "@/components/Wallet";

interface DriverPanelState {
  route: Route;
  currentId: string | null;
  loggedIn: boolean;
  loginEmail: string;
  loginPass: string;
  showPass: boolean;
  loginErr: string;
  loginBusy: boolean;
  requests: DriverRequest[];
  wallet: Wallet | null;
  transactions: Transaction[];
  settings: Settings | null;
  sidebarCollapsed: boolean;
  profileOpen: boolean;
  connReconnect: boolean;
  theme: "light" | "dark";
  search: string;
  filters: RequestStatus[];
  receiptSearch: string;
  logOpen: boolean;
  toasts: Toast[];
  now: number;
  dashShowGlance: boolean;
  modal: ModalState | null;
  receiptModal: ReceiptModalState | null;
  settingsTab: SettingsTabKey;
  topupCustom: string;
  notifOn: boolean;
  accent: string;
  priceEdit: string;
  pricingOpen: boolean;
  pricingSection: PricingSection;
  priceDraft: Record<string, string | undefined>;
  btSelState: string;
  btSearch: string;
  btAutomation: boolean;
  btSaved: Record<string, boolean>;
  btData: Record<string, BtStateCfg>;
  commMode: "percent" | "fixed";
  commPercent: string;
  commFixed: string;
  reqComm: Record<string, { mode: "percent" | "fixed"; value: number }>;
  captchaInput: string;
  _copied?: boolean;
}

interface PillVals {
  statusLabel: string;
  pillText: string;
  pillBg: string;
  dot: string;
}

interface DonutCounts {
  processing: number;
  awaiting: number;
  completed: number;
  other: number;
}

/**
 * DriverPanel — the single stateful container, ported 1:1 from the source
 * `Component extends DCLogic` class. Owns the mock service, all state, the
 * React lifecycle (subscriptions / tick / live-arrival), and renderVals(),
 * which builds the flat view-model the presentational components bind to.
 */
export default class DriverPanel extends React.Component<
  Record<string, never>,
  DriverPanelState
> {
  svc: DriverPanelService;
  private _prevStatus: Record<string, RequestStatus>;
  private _toastSeq: number;
  private _unsubAuth?: () => void;
  private _unsubR?: () => void;
  private _unsubW?: () => void;
  private _unsubT?: () => void;
  private _tick?: ReturnType<typeof setInterval>;

  constructor(props: Record<string, never>) {
    super(props);
    this.svc = createService();
    this.state = {
      route: "login",
      currentId: null,
      loggedIn: false,
      loginEmail: "",
      loginPass: "",
      showPass: false,
      loginErr: "",
      loginBusy: false,
      requests: [],
      wallet: null,
      transactions: [],
      settings: null,
      sidebarCollapsed: false,
      profileOpen: false,
      connReconnect: false,
      theme: "light",
      search: "",
      filters: [],
      receiptSearch: "",
      logOpen: true,
      toasts: [],
      now: Date.now(),
      dashShowGlance: false,
      modal: null,
      receiptModal: null,
      settingsTab: "profile",
      topupCustom: "",
      notifOn: false,
      accent: "#FAC800",
      priceEdit: "150",
      pricingOpen: false,
      pricingSection: "border-tax",
      priceDraft: {},
      commMode: "percent",
      commPercent: "15",
      commFixed: "150",
      reqComm: {},
      captchaInput: "",
      btSelState: "Andhra Pradesh",
      btSearch: "",
      btAutomation: true,
      btSaved: { "Andhra Pradesh": true },
      btData: {
        "Andhra Pradesh": {
          active: true,
          upi: false,
          netBanking: true,
          otp: true,
          durations: {
            Daily: { on: false },
            Weekly: { on: false },
            Monthly: { on: false },
            Quarterly: {
              on: true,
              p: { Sedan: "790", SUV: "790", Innova: "", Traveller: "" },
            },
            Yearly: { on: false },
          },
        },
      },
    };
    this._prevStatus = {};
    this._toastSeq = 0;
  }

  componentDidMount() {
    // Drive subscriptions off auth: start reading only once a vendor is signed
    // in and the vendorId claim is known; tear down on sign-out. (The mock
    // starts signed-out and fires the vendorId on its demo login.)
    this._unsubAuth = this.svc.init((vendorId) => {
      if (vendorId) {
        this._startSubscriptions(vendorId);
        this.setState((p) => ({
          loggedIn: true,
          loginBusy: false,
          loginErr: "",
          route: p.route === "login" ? "dashboard" : p.route,
        }));
      } else {
        this._stopSubscriptions();
        this._prevStatus = {};
        this.setState({
          loggedIn: false,
          route: "login",
          requests: [],
          wallet: null,
          transactions: [],
        });
      }
    });
    this._tick = setInterval(() => this.setState({ now: Date.now() }), 1000);
  }

  private _startSubscriptions(vendorId: string) {
    this._stopSubscriptions();
    this._unsubR = this.svc.subscribeToRequests(vendorId, (rs) => {
      rs.forEach((r) => {
        const p = this._prevStatus[r.requestId];
        if (p && p !== r.status) {
          this._emitToast(r);
        }
        this._prevStatus[r.requestId] = r.status;
      });
      // Stamp each request with the commission terms in effect the first time it
      // is seen, so later changes to the commercials setting never rewrite the
      // earnings of requests that were already handled.
      this.setState((prev) => {
        const reqComm = { ...prev.reqComm };
        const mode = prev.commMode;
        const value =
          mode === "percent"
            ? parseFloat(prev.commPercent) || 0
            : parseInt(prev.commFixed, 10) || 0;
        rs.forEach((r) => {
          if (!reqComm[r.requestId]) reqComm[r.requestId] = { mode, value };
        });
        return { requests: rs, reqComm };
      });
    });
    this._unsubW = this.svc.subscribeToWallet(vendorId, (w) =>
      this.setState({ wallet: w }),
    );
    this._unsubT = this.svc.subscribeToTransactions(vendorId, (t) =>
      this.setState({ transactions: t }),
    );
    this.svc
      .getSettings(vendorId)
      .then((s) =>
        this.setState({ settings: s, priceEdit: String(s.pricePerRequest) }),
      )
      .catch(() => {});
    this.svc.scheduleLiveArrival((nr) => {
      this._prevStatus[nr.requestId] = nr.status;
      if (this.state.notifOn)
        this._toast(nr.vehicleNumber, "New request received", "#FAC800");
    });
  }

  private _stopSubscriptions() {
    if (this._unsubR) {
      this._unsubR();
      this._unsubR = undefined;
    }
    if (this._unsubW) {
      this._unsubW();
      this._unsubW = undefined;
    }
    if (this._unsubT) {
      this._unsubT();
      this._unsubT = undefined;
    }
  }

  componentWillUnmount() {
    if (this._unsubAuth) this._unsubAuth();
    this._stopSubscriptions();
    clearInterval(this._tick);
    this.svc.dispose();
  }

  monthData() {
    return computeMonthData(this.state.requests.length);
  }

  _emitToast(r: DriverRequest) {
    if (!this.state.notifOn) return;
    const m = STATUS_META[r.status];
    const id = ++this._toastSeq;
    const title = r.vehicleNumber;
    let msg = m.label,
      accent = m.dot;
    if (r.status === "COMPLETED") {
      msg = "Receipt generated";
      accent = "#107A52";
    } else if (r.status === "FAILED") {
      msg = (r.failure && r.failure.reason) || "Failed";
      accent = "#DC2626";
    } else if (r.status === "AWAITING_PAYMENT") {
      msg = "Awaiting payment";
      accent = "#FAC800";
    } else msg = m.label;
    const t: Toast = { id, title, msg, accent };
    this.setState((s) => ({ toasts: [...s.toasts, t] }));
    setTimeout(
      () => this.setState((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
      4200,
    );
  }

  _toast(title: string, msg: string, accent?: string) {
    const id = ++this._toastSeq;
    this.setState((s) => ({
      toasts: [...s.toasts, { id, title, msg, accent: accent || "var(--primary)" }],
    }));
    setTimeout(
      () => this.setState((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
      3200,
    );
  }

  go(route: Route, id?: string) {
    this.setState({
      route,
      currentId: id !== undefined ? id : this.state.currentId,
      profileOpen: false,
    });
  }

  goPricing(section: PricingSection) {
    this.setState({
      route: "pricing",
      pricingSection: section,
      pricingOpen: true,
      profileOpen: false,
    });
  }

  btCfg(name: string): BtStateCfg {
    const d = this.state.btData[name];
    if (d) return d;
    return {
      active: true,
      upi: false,
      netBanking: false,
      otp: false,
      durations: {
        Daily: { on: false },
        Weekly: { on: false },
        Monthly: { on: false },
        Quarterly: { on: false },
        Yearly: { on: false },
      },
    };
  }

  btUpdate(name: string, fn: (cur: BtStateCfg) => void) {
    this.setState((p) => {
      const cur: BtStateCfg = JSON.parse(
        JSON.stringify(p.btData[name] || this.btCfg(name)),
      );
      fn(cur);
      return { btData: Object.assign({}, p.btData, { [name]: cur }) };
    });
  }

  rel(iso: string) {
    const d = (this.state.now - new Date(iso).getTime()) / 1000;
    if (d < 60) return Math.floor(d) + "s ago";
    if (d < 3600) return Math.floor(d / 60) + "m ago";
    if (d < 86400) return Math.floor(d / 3600) + "h ago";
    return Math.floor(d / 86400) + "d ago";
  }

  // ---- donut ----
  buildDonut(counts: DonutCounts) {
    const segs: Array<[string, number]> = [
      ["var(--primary)", counts.processing],
      ["#FAC800", counts.awaiting],
      ["#107A52", counts.completed],
      ["#E0801F", counts.other],
    ];
    const total = segs.reduce((a, s) => a + s[1], 0) || 1;
    const R = 34,
      C = 2 * Math.PI * R;
    let off = 0;
    const circles = segs
      .filter((s) => s[1] > 0)
      .map((s, i) => {
        const len = C * (s[1] / total);
        const el = React.createElement("circle", {
          key: i,
          cx: 48,
          cy: 48,
          r: R,
          fill: "none",
          stroke: s[0],
          strokeWidth: 13,
          strokeDasharray: len - 2 + " " + (C - len + 2),
          strokeDashoffset: -off,
          transform: "rotate(-90 48 48)",
          strokeLinecap: "round",
        });
        off += len;
        return el;
      });
    const tot =
      counts.processing + counts.awaiting + counts.completed + counts.other;
    return React.createElement(
      "svg",
      { width: 96, height: 96, viewBox: "0 0 96 96" },
      React.createElement("circle", {
        cx: 48,
        cy: 48,
        r: R,
        fill: "none",
        stroke: "var(--divider)",
        strokeWidth: 13,
      }),
      ...circles,
      React.createElement(
        "text",
        {
          x: 48,
          y: 46,
          textAnchor: "middle",
          fontSize: 20,
          fontWeight: 600,
          fill: "var(--text)",
          fontFamily: "JetBrains Mono, monospace",
        },
        String(tot),
      ),
      React.createElement(
        "text",
        {
          x: 48,
          y: 60,
          textAnchor: "middle",
          fontSize: 9,
          fill: "var(--text-muted)",
          fontFamily: "Inter",
        },
        "today",
      ),
    );
  }

  buildGrowth(series: number[]) {
    const E = React.createElement;
    const W = 700,
      H = 190,
      padL = 8,
      padR = 8,
      padT = 14,
      padB = 10;
    const max = Math.max(...series, 1),
      n = series.length;
    const x = (i: number) => padL + (W - padL - padR) * (i / (n - 1));
    const y = (v: number) => padT + (H - padT - padB) * (1 - v / (max * 1.15));
    const pts = series.map((v, i) => [x(i), y(v)]);
    const line = pts
      .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1))
      .join(" ");
    const area =
      line +
      " L" +
      x(n - 1).toFixed(1) +
      " " +
      (H - padB) +
      " L" +
      x(0).toFixed(1) +
      " " +
      (H - padB) +
      " Z";
    const grid = [0.25, 0.5, 0.75, 1].map((f, i) =>
      E("line", {
        key: "g" + i,
        x1: padL,
        x2: W - padR,
        y1: padT + (H - padT - padB) * f,
        y2: padT + (H - padT - padB) * f,
        stroke: "var(--divider)",
        strokeWidth: 1,
      }),
    );
    const dots = pts.map((p, i) =>
      E("circle", {
        key: "d" + i,
        cx: p[0],
        cy: p[1],
        r: i === n - 1 ? 5 : 3.2,
        fill: i === n - 1 ? "#FAC800" : "var(--surface)",
        stroke: i === n - 1 ? "#E0B400" : "var(--primary)",
        strokeWidth: 2,
      }),
    );
    const last = pts[n - 1];
    return E(
      "svg",
      {
        width: "100%",
        height: 190,
        viewBox: "0 0 " + W + " " + H,
        preserveAspectRatio: "none",
        style: { display: "block" },
      },
      E(
        "defs",
        null,
        E(
          "linearGradient",
          { id: "gfill", x1: 0, y1: 0, x2: 0, y2: 1 },
          E("stop", {
            offset: "0%",
            stopColor: "var(--primary)",
            stopOpacity: 0.22,
          }),
          E("stop", {
            offset: "100%",
            stopColor: "var(--primary)",
            stopOpacity: 0,
          }),
        ),
      ),
      ...grid,
      E("path", { d: area, fill: "url(#gfill)" }),
      E("path", {
        d: line,
        fill: "none",
        stroke: "var(--primary)",
        strokeWidth: 2.5,
        strokeLinejoin: "round",
        strokeLinecap: "round",
        vectorEffect: "non-scaling-stroke",
      }),
      ...dots,
      E(
        "text",
        {
          x: last[0],
          y: Math.max(16, last[1] - 12),
          textAnchor: "end",
          fontSize: 13,
          fontWeight: 700,
          fill: "var(--text)",
          fontFamily: "JetBrains Mono, monospace",
        },
        String(series[n - 1]),
      ),
    );
  }

  buildQR() {
    const cells = [];
    const seed = (this.state.currentId || "x").length;
    const N = 11;
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const on =
          (x * 7 + y * 13 + seed * 3) % 5 < 2 ||
          (x < 3 && y < 3) ||
          (x > N - 4 && y < 3) ||
          (x < 3 && y > N - 4);
        if (on)
          cells.push(
            React.createElement("rect", {
              key: x + "-" + y,
              x: x * 12,
              y: y * 12,
              width: 11,
              height: 11,
              fill: "#02066F",
            }),
          );
      }
    return React.createElement(
      "svg",
      { width: "100%", height: "100%", viewBox: "0 0 132 132" },
      cells,
    );
  }

  // ---- actions ----
  doLogin() {
    this.setState({ loginBusy: true, loginErr: "" });
    // On success the auth observer (componentDidMount) flips loggedIn + route
    // and starts the subscriptions; we only handle the failure here.
    this.svc
      .login(this.state.loginEmail, this.state.loginPass)
      .catch((e: Error) =>
        this.setState({ loginBusy: false, loginErr: e.message }),
      );
  }

  confirmStart(id: string) {
    const r = this.state.requests.find((x) => x.requestId === id);
    const price = this.state.settings ? this.state.settings.pricePerRequest : 150;
    const body =
      r && r.isDuplicate
        ? "This looks like a duplicate of " +
          r.duplicateOf +
          ". " +
          fmtMoney(price) +
          " will be held and charged only when a receipt is produced. Process anyway?"
        : fmtMoney(price) +
          " will be held from your wallet and charged only when a receipt is produced.";
    this.setState({
      modal: {
        title: "Start processing",
        body,
        confirmLabel: "Start process",
        onConfirm: () => this._doStart(id),
      },
    });
  }

  _doStart(id: string) {
    this.setState({ modal: null });
    this.svc.startProcess(id).catch((e: Error) => {
      if (e.message === "INSUFFICIENT") {
        this._toast(
          "Insufficient balance",
          "Top up your wallet to start.",
          "#E0801F",
        );
      }
    });
  }

  topUp(amount: number) {
    if (!amount || amount <= 0) return;
    this.setState({
      modal: {
        title: "Confirm top-up",
        body: "Add " + fmtMoney(amount) + " to your wallet?",
        confirmLabel: "Add funds",
        onConfirm: () => {
          this.setState({ modal: null, topupCustom: "" });
          this.svc
            .topUpWallet(this.svc.vendorId, amount)
            .then(() =>
              this._toast("Wallet topped up", "Added " + fmtMoney(amount), "#107A52"),
            );
        },
      },
    });
  }

  openReceipt(receiptId: string) {
    this.svc.getReceipt(receiptId).then((rc) => {
      const req = this.state.requests.find((x) => x.requestId === rc.requestId);
      this.setState({ receiptModal: { rc, req } });
    });
  }

  confirmCancel(id: string) {
    this.setState({
      modal: {
        title: "Cancel request",
        body: "Stop processing this request? If no payment has been made, the held fee is released back to your wallet.",
        confirmLabel: "Cancel request",
        onConfirm: () => {
          this.setState({ modal: null });
          this.svc
            .cancel(id)
            .catch((e: Error) =>
              this._toast("Couldn’t cancel", e.message, "#E0801F"),
            );
        },
      },
    });
  }

  submitCaptcha(id: string) {
    const input = this.state.captchaInput.trim();
    if (!input) return;
    this.setState({ captchaInput: "" });
    this.svc
      .intervene(id, input)
      .catch((e: Error) => this._toast("Captcha failed", e.message, "#E0801F"));
  }

  renderVals(): ViewModel {
    const s = this.state,
      svc = this.svc;
    const reqs = s.requests;
    const cur = reqs.find((r) => r.requestId === s.currentId);
    const price = s.settings ? s.settings.pricePerRequest : 150;
    // Vendor commission on border-tax payments (drives the request pricing
    // breakdown). Either a percentage of the government tax, or a flat amount.
    const commIsPercent = s.commMode === "percent";
    const commPct = parseFloat(s.commPercent) || 0;
    const commFix = parseInt(s.commFixed, 10) || 0;
    const commissionFor = (tax: number) =>
      commIsPercent ? Math.round((tax * commPct) / 100) : commFix;
    // Per-request commission using the terms snapshotted when the request was
    // first seen (s.reqComm); falls back to the current setting if unstamped.
    const commForReq = (r: DriverRequest) => {
      const cfg = s.reqComm[r.requestId] || {
        mode: s.commMode,
        value: commIsPercent ? commPct : commFix,
      };
      const tax = r.taxAmount || 0;
      const isPct = cfg.mode === "percent";
      const earnedNum: number | null = isPct
        ? tax > 0
          ? Math.round((tax * cfg.value) / 100)
          : null
        : cfg.value;
      return { isPct, value: cfg.value, earnedNum };
    };

    // counts
    const completedToday = reqs.filter((r) => r.status === "COMPLETED").length;
    const failedCount = reqs.filter((r) => r.status === "FAILED").length;
    const awaitingCount = reqs.filter(
      (r) => r.status === "AWAITING_PAYMENT",
    ).length;
    const succRate =
      completedToday + failedCount > 0
        ? Math.round((completedToday / (completedToday + failedCount)) * 100)
        : 100;

    const pill = (st: RequestStatus): PillVals => {
      const m = STATUS_META[st];
      return { statusLabel: m.label, pillText: m.text, pillBg: m.bg, dot: m.dot };
    };

    // nav
    const E = React.createElement;
    const svg = (...k: React.ReactNode[]) =>
      E("svg", { width: 18, height: 18, viewBox: "0 0 18 18", fill: "none" }, ...k);
    const ICON: Record<string, React.ReactNode> = {
      dashboard: svg(
        E("rect", { x: 1, y: 1, width: 7, height: 7, rx: 1.5, fill: "currentColor" }),
        E("rect", { x: 10, y: 1, width: 7, height: 7, rx: 1.5, fill: "currentColor", opacity: 0.5 }),
        E("rect", { x: 1, y: 10, width: 7, height: 7, rx: 1.5, fill: "currentColor", opacity: 0.5 }),
        E("rect", { x: 10, y: 10, width: 7, height: 7, rx: 1.5, fill: "currentColor" }),
      ),
      requests: svg(
        E("rect", { x: 1, y: 3, width: 16, height: 2, rx: 1, fill: "currentColor" }),
        E("rect", { x: 1, y: 8, width: 16, height: 2, rx: 1, fill: "currentColor" }),
        E("rect", { x: 1, y: 13, width: 11, height: 2, rx: 1, fill: "currentColor" }),
      ),
      wallet: svg(
        E("rect", { x: 1, y: 3, width: 16, height: 12, rx: 2.5, fill: "currentColor", opacity: 0.5 }),
        E("circle", { cx: 13, cy: 9, r: 1.8, fill: "currentColor" }),
      ),
      receipts: svg(
        E("path", { d: "M3 1h12v16l-2-1.4L11 17l-2-1.4L7 17l-2-1.4L3 17V1z", fill: "currentColor", opacity: 0.55 }),
      ),
      settings: svg(
        E("circle", { cx: 9, cy: 9, r: 2.6, fill: "currentColor" }),
        E("circle", { cx: 9, cy: 9, r: 6.5, stroke: "currentColor", strokeWidth: 1.6, fill: "none", opacity: 0.5 }),
      ),
      pricing: svg(
        E("text", { x: 9, y: 13.5, textAnchor: "middle", fontSize: 14, fontWeight: 700, fill: "currentColor", fontFamily: "Poppins, sans-serif" }, "₹"),
      ),
      commercials: svg(
        E("circle", { cx: 5.5, cy: 5.5, r: 2.2, stroke: "currentColor", strokeWidth: 1.6, fill: "none" }),
        E("circle", { cx: 12.5, cy: 12.5, r: 2.2, stroke: "currentColor", strokeWidth: 1.6, fill: "none" }),
        E("line", { x1: 13.5, y1: 4, x2: 4, y2: 13.5, stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" }),
      ),
      borderTax: svg(
        E("rect", { x: 2, y: 2, width: 14, height: 14, rx: 2, stroke: "currentColor", strokeWidth: 1.6, fill: "none" }),
        E("line", { x1: 9, y1: 2, x2: 9, y2: 16, stroke: "currentColor", strokeWidth: 1.4 }),
        E("line", { x1: 2, y1: 9, x2: 16, y2: 9, stroke: "currentColor", strokeWidth: 1.4 }),
      ),
      stateTax: svg(
        E("rect", { x: 2, y: 3.5, width: 14, height: 11, rx: 2, stroke: "currentColor", strokeWidth: 1.6, fill: "none" }),
        E("rect", { x: 4.5, y: 6.5, width: 4, height: 5, rx: 1, fill: "currentColor" }),
        E("line", { x1: 10, y1: 7, x2: 13.5, y2: 7, stroke: "currentColor", strokeWidth: 1.4 }),
        E("line", { x1: 10, y1: 11, x2: 13.5, y2: 11, stroke: "currentColor", strokeWidth: 1.4 }),
      ),
      rcMobile: svg(
        ...(function () {
          const d: React.ReactNode[] = [];
          for (let r = 0; r < 4; r++)
            for (let c = 0; c < 4; c++)
              d.push(
                E("circle", { key: r + "-" + c, cx: 3 + c * 4, cy: 3 + r * 4, r: 1, fill: "currentColor" }),
              );
          return d;
        })(),
      ),
    };
    const caretEl = (open: boolean) =>
      E(
        "span",
        {
          style: {
            display: "inline-flex",
            flex: "none",
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "none",
            opacity: s.sidebarCollapsed ? 0 : 0.7,
          },
        },
        E(
          "svg",
          { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none" },
          E("path", { d: "M2.5 4.5L6 8l3.5-3.5", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }),
        ),
      );
    const reqBadge = reqs.filter((r) => ATTENTION.includes(r.status)).length;
    const onPricing = s.route === "pricing";
    const pOpen = s.pricingOpen || onPricing;
    const childActive = (k: string) => onPricing && s.pricingSection === k;
    interface ItemOpts {
      indent?: boolean;
      last?: boolean;
      badge?: string;
      caret?: React.ReactNode;
    }
    const item = (
      icon: React.ReactNode,
      label: string,
      active: boolean,
      onClick: () => void,
      opts?: ItemOpts,
    ) => {
      const o = opts || {};
      return {
        icon,
        label,
        active,
        onClick,
        padLeft: o.indent ? "40px" : "13px",
        indent: !!o.indent,
        connBottom: o.last ? "50%" : "0",
        badge: o.badge || "",
        caret: o.caret || "",
        bg: active
          ? "linear-gradient(90deg,rgba(250,200,0,.10),rgba(255,255,255,.05))"
          : "transparent",
        color: active ? "#fff" : "#AEB2DA",
        weight: active ? 600 : 500,
      };
    };
    const navItems = [
      item(ICON.dashboard, "Dashboard", s.route === "dashboard", () =>
        this.go("dashboard"),
      ),
      item(
        ICON.requests,
        "Tax Requests",
        s.route === "requests" || s.route === "detail",
        () => this.go("requests"),
        { badge: reqBadge ? String(reqBadge) : "" },
      ),
      item(ICON.pricing, "Pricing", onPricing, () =>
        this.setState((p) => ({
          pricingOpen: !(p.pricingOpen || p.route === "pricing"),
        })), { caret: s.sidebarCollapsed ? "" : caretEl(pOpen) },
      ),
    ];
    // The Pricing sub-tree is only rendered when the rail is expanded — at 72px
    // the indented children have no room and would spill outside the rail.
    if (pOpen && !s.sidebarCollapsed) {
      navItems.push(
        item(ICON.borderTax, "Border Tax", childActive("border-tax"), () =>
          this.goPricing("border-tax"), { indent: true },
        ),
      );
      navItems.push(
        item(ICON.stateTax, "State Tax", childActive("state-tax"), () =>
          this.goPricing("state-tax"), { indent: true },
        ),
      );
      navItems.push(
        item(
          ICON.rcMobile,
          "RC Mobile Update",
          childActive("rc-mobile"),
          () => this.goPricing("rc-mobile"),
          { indent: true, last: true },
        ),
      );
    }
    navItems.push(
      item(ICON.wallet, "Wallet", s.route === "wallet", () => this.go("wallet")),
    );
    navItems.push(
      item(ICON.commercials, "Commercials", s.route === "commercials", () =>
        this.go("commercials"),
      ),
    );
    navItems.push(
      item(ICON.receipts, "Receipts", s.route === "receipts", () =>
        this.go("receipts"),
      ),
    );

    // page title
    const titles: Record<string, [string, string]> = {
      dashboard: ["Dashboard", "Operations overview"],
      requests: ["Border Tax Requests", "All vehicle tax requests"],
      detail: ["Request detail", "Live processing"],
      wallet: ["Wallet", "Balance & transactions"],
      commercials: ["Commercials", "Commission on border-tax payments"],
      receipts: ["Receipts", "Generated tax receipts"],
      settings: ["Settings", "Account & white-label"],
      pricing: ["Pricing", "Service rates configuration"],
    };
    const [pageTitle, pageSubtitle] = titles[s.route] || ["", ""];

    const out: ViewModel = {
      routeIsLogin: s.route === "login" || !s.loggedIn,
      showShell: s.loggedIn && s.route !== "login",
      routeKey: s.route + (s.currentId || ""),
      routeIsDashboard: s.route === "dashboard",
      routeIsRequests: s.route === "requests",
      routeIsDetail: s.route === "detail",
      routeIsWallet: s.route === "wallet",
      routeIsReceipts: s.route === "receipts",
      routeIsSettings: s.route === "settings",
      routeIsPricing: s.route === "pricing",
      routeIsCommercials: s.route === "commercials",
      // login
      loginEmail: s.loginEmail,
      loginPass: s.loginPass,
      loginPassType: s.showPass ? "text" : "password",
      loginPassToggle: s.showPass ? "Hide" : "Show",
      loginError: s.loginErr,
      loginBusy: s.loginBusy,
      loginBtnLabel: s.loginBusy ? "Signing in" : "Sign in",
      onLoginEmail: (e) => this.setState({ loginEmail: e.target.value }),
      onLoginPass: (e) => this.setState({ loginPass: e.target.value }),
      onTogglePass: () => this.setState((p) => ({ showPass: !p.showPass })),
      onLogin: () => this.doLogin(),
      // shell
      sidebarWidth: s.sidebarCollapsed ? "72px" : "248px",
      brandLabelOpacity: s.sidebarCollapsed ? 0 : 1,
      navLabelOpacity: s.sidebarCollapsed ? 0 : 1,
      brandName: (s.settings && s.settings.businessName
        ? s.settings.businessName
        : "TaxFlow"
      ).toUpperCase(),
      brandLogo: E(
        "svg",
        { width: 19, height: 19, viewBox: "0 0 22 22", fill: "none" },
        E("rect", { x: 3, y: 3, width: 16, height: 12, rx: 2.6, fill: "currentColor" }),
        E("rect", { x: 5.2, y: 5.4, width: 11.6, height: 4.2, rx: 1, fill: "#FAC800" }),
        E("circle", { cx: 6.6, cy: 12, r: 1.15, fill: "#FAC800" }),
        E("circle", { cx: 15.4, cy: 12, r: 1.15, fill: "#FAC800" }),
        E("rect", { x: 5, y: 16.4, width: 3.4, height: 2.4, rx: 1, fill: "currentColor" }),
        E("rect", { x: 13.6, y: 16.4, width: 3.4, height: 2.4, rx: 1, fill: "currentColor" }),
      ),
      navItems,
      connDot: s.connReconnect ? "#E0801F" : "#0E9E6E",
      connAnim: s.connReconnect ? "pulse 1.6s infinite" : "none",
      connLabel: s.connReconnect ? "Reconnecting…" : "Live • connected",
      onToggleSidebar: () =>
        this.setState((p) => ({ sidebarCollapsed: !p.sidebarCollapsed })),
      theme: s.theme,
      onToggleTheme: () =>
        this.setState((p) => ({ theme: p.theme === "dark" ? "light" : "dark" })),
      themeIcon:
        s.theme === "dark"
          ? E(
              "svg",
              { width: 17, height: 17, viewBox: "0 0 18 18", fill: "none" },
              E("circle", { cx: 9, cy: 9, r: 3.6, fill: "currentColor" }),
              ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                const r = (a * Math.PI) / 180;
                return E("line", {
                  key: a,
                  x1: 9 + 5.6 * Math.cos(r),
                  y1: 9 + 5.6 * Math.sin(r),
                  x2: 9 + 7.4 * Math.cos(r),
                  y2: 9 + 7.4 * Math.sin(r),
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                  strokeLinecap: "round",
                });
              }),
            )
          : E(
              "svg",
              { width: 16, height: 16, viewBox: "0 0 18 18", fill: "none" },
              E("path", { d: "M15.5 11.2A6.8 6.8 0 116.8 2.5a5.4 5.4 0 108.7 8.7z", fill: "currentColor" }),
            ),
      pageTitle,
      pageSubtitle,
      walletBalanceFmt: s.wallet ? fmtMoney(s.wallet.balance) : "—",
      walletHeldFmt: s.wallet ? fmtMoney(s.wallet.heldAmount) : "—",
      walletIcon: E(
        "svg",
        { width: 15, height: 15, viewBox: "0 0 18 18", fill: "none" },
        E("rect", { x: 1, y: 3, width: 16, height: 12, rx: 2.5, fill: "currentColor", opacity: 0.3 }),
        E("circle", { cx: 13, cy: 9, r: 1.8, fill: "currentColor" }),
      ),
      bellIcon: E(
        "svg",
        { width: 17, height: 17, viewBox: "0 0 18 18", fill: "none" },
        E("path", { d: "M9 2a4.5 4.5 0 00-4.5 4.5c0 4-1.5 5-1.5 5h12s-1.5-1-1.5-5A4.5 4.5 0 009 2z", fill: "currentColor", opacity: 0.6 }),
        E("circle", { cx: 9, cy: 15, r: 1.4, fill: "currentColor" }),
      ),
      goWallet: () => this.go("wallet"),
      goSettings: () => this.go("settings"),
      goRequests: () => this.go("requests"),
      onBell: () =>
        this._toast("Notifications", "You’re all caught up.", "var(--primary)"),
      profileName: "Operator",
      profileRole: "Admin",
      profileEmail: s.settings
        ? s.settings.email || "operator@taxflow.in"
        : "operator@taxflow.in",
      profileOpen: s.profileOpen,
      onToggleProfile: () =>
        this.setState((p) => ({ profileOpen: !p.profileOpen })),
      onLogout: () => {
        this.setState({ profileOpen: false });
        // The auth observer flips loggedIn + route and clears the data.
        void this.svc.logout();
      },
      // toasts/modal
      toasts: s.toasts,
      modalOpen: !!s.modal,
      modalTitle: s.modal ? s.modal.title : "",
      modalBody: s.modal ? s.modal.body : "",
      modalConfirmLabel: s.modal ? s.modal.confirmLabel : "",
      onModalCancel: () => this.setState({ modal: null }),
      onModalConfirm: () => {
        if (s.modal && s.modal.onConfirm) s.modal.onConfirm();
      },
      stopProp: (e) => e.stopPropagation(),
      // receipt modal (assigned below; placeholders keep the type complete)
      receiptModalOpen: false,
      receiptModalFields: [],
      onReceiptModalClose: () => this.setState({ receiptModal: null }),
    };

    // ---- dashboard ----
    if (s.route === "dashboard") {
      const caret = E(
        "span",
        {
          style: {
            display: "inline-flex",
            transition: "transform .2s",
            transform: s.dashShowGlance ? "rotate(180deg)" : "none",
            color: "var(--text-muted)",
          },
        },
        E(
          "svg",
          { width: 11, height: 11, viewBox: "0 0 12 12", fill: "none" },
          E("path", { d: "M2.5 4.5L6 8l3.5-3.5", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" }),
        ),
      );
      const noClick = () => {};
      // Net earnings = sum of the per-request commission (the requests table's
      // "Earned" column). Recomputed every render, so it tracks the commission
      // rate and incoming requests in real time.
      const netEarnings = reqs.reduce(
        (sum, r) => sum + (commForReq(r).earnedNum || 0),
        0,
      );
      out.metrics = [
        { label: "Net earnings", value: fmtMoney(netEarnings), sub: "commission earned", color: "var(--money)", onClick: noClick, cursor: "default", hover: "", caret: "" },
        { label: "Total requests", value: String(reqs.length), sub: "generated", color: "var(--text)", onClick: noClick, cursor: "default", hover: "", caret: "" },
        { label: "Completed", value: String(completedToday), sub: "requests completed", color: "var(--money)", onClick: noClick, cursor: "default", hover: "", caret: "" },
        { label: "Success rate", value: succRate + "%", sub: s.dashShowGlance ? "tap to hide breakdown" : "tap for breakdown", color: "var(--money)", onClick: () => this.setState((p) => ({ dashShowGlance: !p.dashShowGlance })), cursor: "pointer", hover: "background:var(--surface-inset)", caret },
      ];
      out.dashShowGlance = s.dashShowGlance;
      out.onToggleGlance = () => this.setState({ dashShowGlance: false });
      const md = this.monthData();
      out.monthLabel = md.monthLabel;
      const tickDays = Array.from(
        new Set([1, 5, 10, 15, 20, 25, md.dim, md.today]),
      )
        .filter((d) => d >= 1 && d <= md.dim)
        .sort((a, b) => a - b);
      out.monthTicks = tickDays.map((d) => ({
        label: String(d),
        left: (((d - 0.5) / md.dim) * 100).toFixed(2) + "%",
        color: d === md.today ? "var(--gold-text)" : "var(--text-muted)",
      }));
      const att = reqs.filter((r) => ATTENTION.includes(r.status));
      out.attentionCount = String(att.length);
      out.attentionEmpty = att.length === 0;
      out.attentionRows = att.map((r) => {
        const p = pill(r.status);
        const start = r.status === "PENDING";
        return {
          vehicle: r.vehicleNumber,
          route: r.state + " → " + r.border,
          ...p,
          dotAnim: r.status === "AWAITING_PAYMENT" ? "pulse 1.6s infinite" : "none",
          isStart: start,
          isView: !start,
          onAction: () =>
            start ? this.confirmStart(r.requestId) : this.go("detail", r.requestId),
          anim: r._isNew ? "hi 1.2s" : "none",
        };
      });
      const recent = reqs
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);
      out.recentRows = recent.map((r) => {
        const p = pill(r.status);
        return {
          vehicle: r.vehicleNumber,
          route: r.state + " → " + r.border,
          ...p,
          time: this.rel(r.createdAt),
          onClick: () => this.go("detail", r.requestId),
        };
      });
      const counts: DonutCounts = {
        processing: reqs.filter(
          (r) => TRANSIENT.includes(r.status) || r.status === "PENDING",
        ).length,
        awaiting: awaitingCount,
        completed: completedToday,
        other: reqs.filter(
          (r) => r.status === "FAILED" || r.status === "RECONCILING",
        ).length,
      };
      out.donutEl = this.buildDonut(counts);
      out.donutLegend = [
        { label: "In progress", color: "var(--primary)", count: String(counts.processing) },
        { label: "Awaiting payment", color: "#FAC800", count: String(counts.awaiting) },
        { label: "Completed", color: "#107A52", count: String(counts.completed) },
        { label: "Needs review", color: "#E0801F", count: String(counts.other) },
      ];
    }

    // ---- requests ----
    if (s.route === "requests") {
      const allStatuses: RequestStatus[] = [
        "PENDING",
        "PROCESSING",
        "AWAITING_PAYMENT",
        "COMPLETED",
        "FAILED",
        "RECONCILING",
      ];
      out.searchValue = s.search;
      out.onSearch = (e) => this.setState({ search: e.target.value });
      out.filterChips = allStatuses.map((st) => {
        const on = s.filters.includes(st);
        const m = STATUS_META[st];
        return {
          label: m.label,
          onClick: () =>
            this.setState((p) => ({
              filters: p.filters.includes(st)
                ? p.filters.filter((x) => x !== st)
                : [...p.filters, st],
            })),
          bg: on ? "var(--primary)" : "var(--surface)",
          color: on ? "#fff" : "var(--text-secondary)",
          border: on ? "var(--primary)" : "var(--border)",
        };
      });
      const q = s.search.trim().toLowerCase();
      const filtered = reqs.filter((r) => {
        if (s.filters.length && !s.filters.includes(r.status)) return false;
        if (
          q &&
          !(
            r.vehicleNumber.toLowerCase().includes(q) ||
            r.requestId.toLowerCase().includes(q) ||
            r.mobile.includes(q)
          )
        )
          return false;
        return true;
      });
      out.requestsEmpty = filtered.length === 0;
      out.requestsEmptyText =
        q || s.filters.length
          ? "No requests match your filters."
          : "No requests yet.";
      out.requestRows = filtered.map((r) => {
        const p = pill(r.status);
        const start = r.status === "PENDING";
        const retry = r.status === "FAILED";
        const cfg = commForReq(r);
        return {
          shortId: r.requestId,
          vehicle: r.vehicleNumber,
          route: r.state + " → " + r.border,
          journey: r.journeyDate,
          commission: cfg.isPct ? cfg.value + "%" : "Fixed",
          earned: cfg.earnedNum != null ? fmtMoney(cfg.earnedNum) : "—",
          ...p,
          dotAnim:
            r.status === "AWAITING_PAYMENT"
              ? "pulse 1.6s infinite"
              : TRANSIENT.includes(r.status)
                ? "pulseNavy 1.6s infinite"
                : "none",
          time: this.rel(r.createdAt),
          isDuplicate: !!r.isDuplicate,
          isStart: start,
          isRetry: retry,
          isViewOnly: !start && !retry,
          onClick: () => this.go("detail", r.requestId),
          onStart: (e) => {
            e.stopPropagation();
            if (start) this.confirmStart(r.requestId);
            else this.svc.retryRequest(r.requestId);
          },
          anim: r._isNew ? "hi 1.2s" : "none",
        };
      });
    }

    // ---- detail ----
    if (s.route === "detail" && cur) {
      const m = STATUS_META[cur.status];
      out.d_vehicle = cur.vehicleNumber;
      out.d_shortId = cur.requestId;
      out.d_statusLabel = m.label;
      out.d_pillText = m.text;
      out.d_pillBg = m.bg;
      out.d_dot = m.dot;
      out.d_dotAnim =
        cur.status === "AWAITING_PAYMENT"
          ? "pulse 1.6s infinite"
          : TRANSIENT.includes(cur.status)
            ? "pulseNavy 1.6s infinite"
            : "none";
      const mono = "'JetBrains Mono',monospace";
      out.d_fields = [
        { label: "Vehicle", value: cur.vehicleNumber, font: mono },
        { label: "Engine", value: cur.engineNumber, font: mono },
        { label: "Chassis", value: cur.chassisNumber, font: mono },
        { label: "Journey date", value: cur.journeyDate, font: "inherit" },
        { label: "State", value: cur.state, font: "inherit" },
        { label: "Border", value: cur.border, font: "inherit" },
        { label: "Mobile", value: cur.mobile, font: mono },
      ];
      const curRank =
        cur.status === "FAILED"
          ? RANK[(cur.failure && cur.failure.stage) as string] || 0
          : cur.status === "RECONCILING"
            ? 6
            : RANK[cur.status] !== undefined
              ? RANK[cur.status]
              : 0;
      out.d_steps = STEP_DEFS.map((st) => {
        const r = RANK[st.key];
        let state = r < curRank ? "done" : r === curRank ? "active" : "upcoming";
        if (cur.status === "COMPLETED") state = r <= 8 ? "done" : "upcoming";
        const failed = cur.status === "FAILED" && r === curRank;
        let ring: string,
          fill: string,
          mark: string,
          glyph: string,
          text: string,
          weight: number,
          line: string,
          anim = "none";
        if (failed) {
          ring = "#DC2626";
          fill = "#FCEBE9";
          mark = "#C0392B";
          glyph = "!";
          text = "#C0392B";
          weight = 600;
          line = "var(--divider)";
        } else if (state === "done") {
          ring = "#C9CCE4";
          fill = "var(--primary)";
          mark = "#fff";
          glyph = "✓";
          text = "var(--text)";
          weight = 500;
          line = "#C9CCE4";
        } else if (state === "active") {
          ring = "var(--primary)";
          fill = st.gold ? "#FAC800" : "#fff";
          mark = st.gold ? "var(--primary)" : "var(--primary)";
          glyph = st.gold ? "●" : "";
          text = "var(--primary)";
          weight = 600;
          line = "var(--divider)";
          anim = st.gold ? "pulse 1.6s infinite" : "pulseNavy 1.6s infinite";
        } else {
          ring = "#E3E6EE";
          fill = "#fff";
          mark = "#C5C9D6";
          glyph = "";
          text = "var(--text-muted)";
          weight = 400;
          line = "var(--divider)";
        }
        return { label: st.label, ring, fill, mark, glyph, text, weight, line, anim };
      });
      // log
      out.d_log = [{ time: this.rel(cur.createdAt), text: "Request submitted by customer" }];
      if (cur.status !== "PENDING")
        out.d_log.unshift({ time: this.rel(cur.updatedAt), text: "Now: " + m.label });
      if (cur.taxAmount)
        out.d_log.splice(1, 0, {
          time: "—",
          text: "Tax calculated: " + fmtMoney(cur.taxAmount),
        });
      out.logOpen = s.logOpen;
      out.logChevron = s.logOpen ? "⌃" : "⌄";
      out.onToggleLog = () => this.setState((p) => ({ logOpen: !p.logOpen }));
      // action card state
      const disp = cur.displayStatus;
      out.ac_captcha = disp === "ACTION_CAPTCHA";
      out.ac_pending = cur.status === "PENDING";
      out.ac_processing = TRANSIENT.includes(cur.status) && !out.ac_captcha;
      out.ac_awaiting = cur.status === "AWAITING_PAYMENT";
      out.ac_completed = cur.status === "COMPLETED";
      out.ac_failed = cur.status === "FAILED";
      out.ac_reconciling = cur.status === "RECONCILING";
      out.d_isDemo = this.svc.isMock;
      // Cancel is offered while the agent is mid-flight (real backend only).
      out.d_canCancel =
        !this.svc.isMock &&
        !!(
          out.ac_processing ||
          out.ac_captcha ||
          out.ac_awaiting ||
          out.ac_reconciling
        );
      out.d_onCancel = () => this.confirmCancel(cur.requestId);
      // Captcha — the vendor reads the image and relays the code to the customer.
      if (cur.captcha) {
        out.d_captchaImg = cur.captcha.url;
        out.d_captchaAttempt =
          cur.captcha.maxAttempts != null
            ? "Attempt " + cur.captcha.attempt + " of " + cur.captcha.maxAttempts
            : "Attempt " + cur.captcha.attempt;
        out.d_captchaRejected = cur.captcha.lastResult === "rejected";
        let ccd = "";
        if (cur.captcha.deadline) {
          const left = Math.max(
            0,
            Math.floor((cur.captcha.deadline - s.now) / 1000),
          );
          ccd = pad(Math.floor(left / 60)) + ":" + pad(left % 60);
        }
        out.d_captchaCountdown = ccd;
      }
      out.d_captchaInput = s.captchaInput;
      out.onCaptchaInput = (e) => this.setState({ captchaInput: e.target.value });
      out.d_onSubmitCaptcha = () => this.submitCaptcha(cur.requestId);
      out.d_mockAgent = !!cur.mockAgent;
      out.d_onSimulatePaid = () => {
        this.svc
          .intervene(cur.requestId, "paid")
          .catch((e: Error) => this._toast("Couldn’t simulate", e.message, "#E0801F"));
      };
      out.d_priceFmt = fmtMoney(price);
      // Pricing breakdown: the customer pays the government tax plus the vendor
      // commission (configured on Commercials); we remit the tax and keep the
      // commission as profit. Percentage commissions resolve once tax is known.
      const curCfg = commForReq(cur);
      const prTax = cur.taxAmount || 0;
      const prTaxKnown = prTax > 0;
      const prComm = curCfg.earnedNum; // number | null
      out.d_pr_taxKnown = prTaxKnown;
      out.d_pr_received =
        prTaxKnown && prComm != null ? fmtMoney(prTax + prComm) : "—";
      out.d_pr_vendor = prTaxKnown ? fmtMoney(prTax) : "—";
      out.d_pr_profit = prComm != null ? fmtMoney(prComm) : "—";
      out.d_pr_margin = curCfg.isPct
        ? curCfg.value + "% commission"
        : prTaxKnown && prComm != null
          ? Math.round((prComm / (prTax + prComm)) * 100) + "% margin"
          : "Flat commission";
      const covers = s.wallet
        ? s.wallet.balance - s.wallet.heldAmount >= price
        : true;
      out.d_walletCovers = covers;
      out.d_walletShort = !covers;
      out.d_isDuplicate = !!cur.isDuplicate;
      out.d_dupOf = cur.duplicateOf || "";
      out.d_onViewOriginal = () => {
        const o = reqs.find((x) => x.requestId === cur.duplicateOf);
        if (o) this.go("detail", o.requestId);
      };
      out.d_startDisabled = !covers;
      out.d_startBg = covers ? "var(--primary)" : "#C5C9D6";
      out.d_startCursor = covers ? "pointer" : "not-allowed";
      out.d_onStart = () => {
        if (covers) this.confirmStart(cur.requestId);
      };
      out.d_failStage = cur._failStage || "NONE";
      out.d_onFailStage = (e) => {
        this.svc.setFailStage(cur.requestId, e.target.value);
        this.forceUpdate();
      };
      // awaiting
      out.qrEl = this.buildQR();
      out.d_qrImg = cur.qrUrl;
      out.d_amountFmt = fmtMoney(cur.taxAmount || 0);
      let cd = "--";
      if (cur.qr) {
        const left = Math.max(
          0,
          Math.floor((new Date(cur.qr.expiresAt).getTime() - s.now) / 1000),
        );
        cd = pad(Math.floor(left / 60)) + ":" + pad(left % 60);
      }
      out.d_countdown = cd;
      out.d_copyLabel = s._copied ? "Copied!" : "Copy link";
      out.d_onCopy = () => {
        this.setState({ _copied: true });
        this._toast(
          "Link copied",
          "Payment link copied to clipboard",
          "var(--primary)",
        );
        setTimeout(() => this.setState({ _copied: false }), 1500);
      };
      out.d_onShare = () =>
        this._toast("Share", "Payment link shared via SMS", "var(--primary)");
      out.d_onMarkPaid = () => this.svc.markPaid(cur.requestId);
      // completed
      if (cur.receiptId) {
        const rc = svc.receipts[cur.receiptId];
        if (rc) {
          out.d_govRef = rc.govReference;
          out.d_generatedAt = this.rel(rc.generatedAt);
        }
      }
      out.d_onView = () => this.openReceipt(cur.receiptId as string);
      out.d_onDownload = () => {
        const rc = cur.receiptId ? svc.receipts[cur.receiptId] : undefined;
        if (rc && rc.storageUrl && rc.storageUrl !== "#") {
          window.open(rc.storageUrl, "_blank", "noopener");
        } else if (this.svc.isMock) {
          this._toast("Downloading", "Receipt PDF download started", "#107A52");
        } else {
          this._toast("Receipt", "The receipt link isn’t ready yet.", "#E0801F");
        }
      };
      // failed
      out.d_failReason = cur.failure ? cur.failure.reason : "Processing error.";
      out.d_onRetry = () => {
        this.svc.retryRequest(cur.requestId);
        this._toast(
          "Retrying",
          cur.vehicleNumber + " returned to pending",
          "var(--primary)",
        );
      };
    } else if (s.route === "detail") {
      // fallbacks so holes resolve
      Object.assign(out, {
        d_vehicle: "",
        d_shortId: "",
        d_statusLabel: "",
        d_pillText: "var(--text-secondary)",
        d_pillBg: "#F2F3F7",
        d_dot: "var(--text-muted)",
        d_dotAnim: "none",
        d_fields: [],
        d_steps: [],
        d_log: [],
        logOpen: s.logOpen,
        logChevron: "⌃",
        onToggleLog: () => {},
        ac_pending: false,
        ac_processing: false,
        ac_awaiting: false,
        ac_completed: false,
        ac_failed: false,
        ac_reconciling: false,
        ac_captcha: false,
      });
    }

    // ---- wallet ----
    if (s.route === "wallet") {
      out.topupQuick = [500, 1000, 5000].map((a) => ({
        label: fmtMoney(a),
        onClick: () => this.topUp(a),
      }));
      out.topupCustom = s.topupCustom;
      out.onTopupInput = (e) =>
        this.setState({ topupCustom: e.target.value.replace(/[^0-9]/g, "") });
      out.onTopupCustom = () => this.topUp(parseInt(s.topupCustom || "0", 10));
      const tagMeta: Record<
        string,
        { t: string; c: string; bg: string; dot: string }
      > = {
        TOPUP: { t: "Top-up", c: "#0E7C5A", bg: "#E6F5EE", dot: "#0E9E6E" },
        HOLD: { t: "Hold", c: "#6B7280", bg: "#F2F3F7", dot: "#9AA0B0" },
        COMMIT: { t: "Commit", c: "var(--primary)", bg: "var(--primary-tint)", dot: "var(--primary)" },
        RELEASE: { t: "Release", c: "#B45309", bg: "#FBEFE0", dot: "#E0801F" },
        REFUND: { t: "Refund", c: "#0E7C5A", bg: "#E6F5EE", dot: "#0E9E6E" },
      };
      out.txnEmpty = s.transactions.length === 0;
      out.txnRows = s.transactions.map((t) => {
        const tm = tagMeta[t.type];
        const credit =
          t.type === "TOPUP" || t.type === "RELEASE" || t.type === "REFUND";
        const isHold = t.type === "HOLD";
        return {
          type: tm.t,
          tagText: tm.c,
          tagBg: tm.bg,
          tagDot: tm.dot,
          ref: t.refRequestId || "—",
          amount: (credit ? "+" : isHold ? "−" : "−") + fmtMoney(t.amount),
          amtColor: credit
            ? "#0E7C5A"
            : isHold
              ? "var(--text-muted)"
              : "var(--text)",
          balance: fmtMoney(t.balanceAfter),
          time: this.rel(t.createdAt),
        };
      });
    }

    // ---- receipts ----
    if (s.route === "receipts") {
      out.receiptSearch = s.receiptSearch;
      out.onReceiptSearch = (e) =>
        this.setState({ receiptSearch: e.target.value });
      const q = s.receiptSearch.trim().toLowerCase();
      const list = Object.values(svc.receipts)
        .map((rc) => {
          const req = reqs.find((x) => x.requestId === rc.requestId) || ({} as DriverRequest);
          return { rc, vehicle: req.vehicleNumber || "—" };
        })
        .filter(
          (x) =>
            !q ||
            x.vehicle.toLowerCase().includes(q) ||
            x.rc.govReference.toLowerCase().includes(q),
        )
        .sort(
          (a, b) =>
            new Date(b.rc.generatedAt).getTime() -
            new Date(a.rc.generatedAt).getTime(),
        );
      out.receiptsEmpty = list.length === 0;
      out.receiptRows = list.map((x) => ({
        vehicle: x.vehicle,
        amount: fmtMoney(x.rc.taxAmount),
        govRef: x.rc.govReference,
        generated: this.rel(x.rc.generatedAt),
        onView: () => this.openReceipt(x.rc.receiptId),
        onDownload: () =>
          this._toast("Downloading", "Receipt PDF download started", "#107A52"),
      }));
    }

    // ---- commercials ----
    if (s.route === "commercials") {
      out.comm_isPercent = commIsPercent;
      out.comm_percent = s.commPercent;
      out.comm_fixed = s.commFixed;
      out.comm_onModePercent = () => this.setState({ commMode: "percent" });
      out.comm_onModeFixed = () => this.setState({ commMode: "fixed" });
      out.comm_onPercent = (e) => {
        let v = e.target.value.replace(/[^0-9.]/g, "");
        if (parseFloat(v) > 100) v = "100";
        this.setState({ commPercent: v });
      };
      out.comm_onFixed = (e) =>
        this.setState({ commFixed: e.target.value.replace(/[^0-9]/g, "") });
      // Live example using a representative border-tax amount (latest known tax).
      const egTax = reqs.find((r) => (r.taxAmount || 0) > 0)?.taxAmount || 500;
      const egComm = commissionFor(egTax);
      out.comm_egTax = fmtMoney(egTax);
      out.comm_egCommission = fmtMoney(egComm);
      out.comm_egTotal = fmtMoney(egTax + egComm);
      out.comm_egRate = commIsPercent
        ? commPct + "% of government tax"
        : "Flat " + fmtMoney(commFix) + " per request";
    }

    // ---- pricing ----
    if (s.route === "pricing") {
      const meta: Record<string, { title: string; desc: string; icon: string }> = {
        "border-tax": {
          title: "Border Tax",
          desc: "Charged per inter-state border crossing. This rate is held from your wallet when an operator starts a request, and committed only when a receipt is produced.",
          icon: "border",
        },
        "state-tax": {
          title: "State Tax",
          desc: "Applied to intra-state movement permits. Held at request start and reconciled on completion.",
          icon: "state",
        },
        "rc-mobile": {
          title: "RC Mobile Update",
          desc: "Fee for updating registration certificate mobile records via the portal.",
          icon: "rc",
        },
      };
      const sec = s.pricingSection,
        m = meta[sec];
      const prices = (s.settings && s.settings.pricing) || {
        "border-tax": 150,
        "state-tax": 120,
        "rc-mobile": 80,
      };
      out.pr_title = m.title;
      out.pr_desc = m.desc;
      out.pr_isBorderTax = sec === "border-tax";
      out.pr_isSimple = sec !== "border-tax";
      out.pr_comingTitle = m.title;
      out.pr_draft =
        s.priceDraft[sec] !== undefined
          ? s.priceDraft[sec]
          : String(prices[sec]);
      out.pr_current = fmtMoney(prices[sec]);
      out.onPrDraft = (e) => {
        const v = e.target.value.replace(/[^0-9]/g, "");
        this.setState((p) => ({
          priceDraft: Object.assign({}, p.priceDraft, { [sec]: v }),
        }));
      };
      out.onPrSave = () => {
        const v = parseInt(out.pr_draft || "0", 10) || 0;
        const np = Object.assign({}, prices, { [sec]: v });
        const patch: Partial<Settings> = { pricing: np };
        if (sec === "border-tax") patch.pricePerRequest = v;
        this.svc.updateSettings(this.svc.vendorId, patch);
        this.setState((p) => ({
          settings: Object.assign({}, p.settings, patch) as Settings,
          priceDraft: Object.assign({}, p.priceDraft, { [sec]: undefined }),
        }));
        this._toast("Saved", m.title + " rate set to " + fmtMoney(v), "#107A52");
      };
      out.pricingServices = Object.keys(meta).map((k) => ({
        label: meta[k].title,
        amount: fmtMoney(prices[k]),
        active: k === sec,
        onClick: () => this.goPricing(k as PricingSection),
        bg: k === sec ? "var(--primary-tint)" : "var(--surface)",
        border: k === sec ? "var(--primary)" : "var(--border)",
        color: k === sec ? "var(--primary)" : "var(--text)",
      }));

      // ----- Border Tax matrix -----
      if (sec === "border-tax") {
        const ALL_STATES: Array<[string, boolean, boolean]> = [
          ["Andhra Pradesh", true, false],
          ["Arunachal Pradesh", false, false],
          ["Assam", false, false],
          ["Bihar", true, true],
          ["Chhattisgarh", false, false],
          ["Goa", false, false],
          ["Gujarat", true, false],
          ["Haryana", true, true],
          ["Himachal Pradesh", true, true],
          ["Jharkhand", true, false],
          ["Karnataka", true, false],
          ["Kerala", false, false],
          ["Madhya Pradesh", true, false],
          ["Maharashtra", true, false],
          ["Odisha", false, false],
          ["Punjab", true, false],
          ["Rajasthan", true, false],
          ["Tamil Nadu", true, false],
          ["Telangana", true, false],
          ["Uttar Pradesh", true, false],
          ["Uttarakhand", false, false],
          ["West Bengal", true, false],
        ];
        const sel = s.btSelState;
        const cfg = this.btCfg(sel);
        const botIcon = E(
          "svg",
          { width: 15, height: 15, viewBox: "0 0 18 18", fill: "none" },
          E("rect", { x: 3, y: 5, width: 12, height: 9, rx: 2.5, stroke: "currentColor", strokeWidth: 1.4 }),
          E("circle", { cx: 7, cy: 9.5, r: 1, fill: "currentColor" }),
          E("circle", { cx: 11, cy: 9.5, r: 1, fill: "currentColor" }),
          E("line", { x1: 9, y1: 2.5, x2: 9, y2: 5, stroke: "currentColor", strokeWidth: 1.4 }),
          E("circle", { cx: 9, cy: 2, r: 1, fill: "currentColor" }),
        );
        const q = s.btSearch.trim().toLowerCase();
        const savedActive = (nm: string, def: boolean) =>
          s.btSaved[nm] !== undefined ? s.btSaved[nm] : def;
        out.btStates = ALL_STATES.filter(
          ([nm]) => !q || nm.toLowerCase().includes(q),
        ).map(([nm, active, bot]) => ({
          name: nm,
          dot: savedActive(nm, active) ? "#0E9E6E" : "#C5C9D6",
          selected: nm === sel,
          bg: nm === sel ? "var(--primary-tint)" : "transparent",
          color: nm === sel ? "var(--primary)" : "var(--text)",
          weight: nm === sel ? 600 : 500,
          bot: bot ? botIcon : "",
          chevron: nm === sel ? "›" : "",
          onClick: () => this.setState({ btSelState: nm }),
        }));
        out.btSelectedName = sel;
        out.btSearch = s.btSearch;
        out.onBtSearch = (e) => this.setState({ btSearch: e.target.value });
        out.btAutomation = s.btAutomation;
        out.btAutomationBg = s.btAutomation ? "var(--primary)" : "#C5C9D6";
        out.btAutomationKnob = s.btAutomation ? "22px" : "3px";
        out.onBtAutomation = () =>
          this.setState((p) => ({ btAutomation: !p.btAutomation }));
        // active + payment toggles
        out.btActive = cfg.active;
        out.btActiveBg = cfg.active ? "#0E9E6E" : "#C5C9D6";
        out.btActiveKnob = cfg.active ? "18px" : "3px";
        out.btStatusLabel = cfg.active ? "Active" : "Inactive";
        out.btStatusColor = cfg.active ? "#0E7C5A" : "var(--text-muted)";
        out.btStatusDot = cfg.active ? "#0E9E6E" : "#C5C9D6";
        out.onBtActive = () =>
          this.btUpdate(sel, (c) => {
            c.active = !c.active;
          });
        out.onAddUnavail = () =>
          this._toast(
            "Unavailability",
            "Add an unavailability reason for " + sel,
            "#E0801F",
          );
        const payBtn = (key: "upi" | "netBanking" | "otp", label: string, on: boolean) => ({
          label,
          on,
          onClick: () =>
            this.btUpdate(sel, (c) => {
              c[key] = !c[key];
            }),
          bg: on ? "linear-gradient(135deg,#0A0F4D,#02066F)" : "var(--surface)",
          color: on ? "#fff" : "var(--text-secondary)",
          border: on ? "transparent" : "var(--border)",
          shadow: on
            ? "0 8px 18px -8px rgba(2,6,111,.6)"
            : "0 1px 2px rgba(2,6,111,.05)",
          checkBg: on ? "#FAC800" : "transparent",
          checkColor: on ? "#02066F" : "transparent",
          check: on ? "✓" : "",
          knobBg: "#fff",
          knobLeft: on ? "17px" : "2.5px",
          track: on ? "#FAC800" : "#E3E6EE",
        });
        out.btUpi = payBtn("upi", "UPI", cfg.upi);
        out.btNet = payBtn("netBanking", "Net Banking", cfg.netBanking);
        out.btOtp = payBtn("otp", "OTP Required", cfg.otp);
        // vehicles + durations matrix
        const VEH: Array<[string, string]> = [
          ["Sedan", "4 Seater"],
          ["SUV", "5-7 Seater"],
          ["Innova", "8-9 Seater"],
          ["Traveller", "10+ Seater"],
        ];
        const carIcon = () =>
          E(
            "svg",
            { width: 22, height: 16, viewBox: "0 0 26 18", fill: "none" },
            E("path", { d: "M2 12l1.6-4.2C4 6.7 5 6 6.2 6h10.6c1 0 2 .5 2.6 1.4L22 12", stroke: "currentColor", strokeWidth: 1.5, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
            E("rect", { x: 1, y: 11, width: 22, height: 4, rx: 1.5, fill: "currentColor" }),
            E("circle", { cx: 6, cy: 15, r: 2, fill: "currentColor" }),
            E("circle", { cx: 18, cy: 15, r: 2, fill: "currentColor" }),
          );
        out.btVehicles = VEH.map(([k, sub]) => ({ key: k, sub, icon: carIcon() }));
        const DUR = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
        out.btRows = DUR.map((d) => {
          const dc = cfg.durations[d] || { on: false, p: {} };
          const on = dc.on;
          return {
            dur: d,
            on,
            durColor: on ? "var(--text)" : "var(--text-muted)",
            durDeco: on ? "none" : "line-through",
            toggleBg: on ? "var(--primary)" : "#E3E6EE",
            toggleKnob: on ? "22px" : "3px",
            onToggle: () =>
              this.btUpdate(sel, (c) => {
                c.durations[d] = c.durations[d] || { on: false, p: {} };
                c.durations[d].on = !c.durations[d].on;
                if (!c.durations[d].p) c.durations[d].p = {};
              }),
            cells: VEH.map(([vk]) => ({
              vk,
              val: (dc.p && dc.p[vk]) || "",
              disabled: !on,
              bg: on ? "var(--surface)" : "var(--surface-inset)",
              color: on ? "var(--text)" : "var(--text-muted)",
              onInput: (e: React.ChangeEvent<HTMLInputElement>) => {
                const v = e.target.value.replace(/[^0-9]/g, "");
                this.btUpdate(sel, (c) => {
                  c.durations[d] = c.durations[d] || { on: true, p: {} };
                  c.durations[d].p = c.durations[d].p || {};
                  (c.durations[d].p as Record<string, string>)[vk] = v;
                });
              },
            })),
          };
        });
        out.onBtSave = () => {
          const nowActive = this.btCfg(sel).active;
          this.setState((p) => ({
            btSaved: Object.assign({}, p.btSaved, { [sel]: nowActive }),
          }));
          this._toast(
            "Saved",
            "Border tax pricing updated for " +
              sel +
              (nowActive ? " · active" : " · inactive"),
            nowActive ? "#107A52" : "#9AA0B0",
          );
        };
      }
    }

    // ---- settings ----
    if (s.route === "settings") {
      const tabs: Array<[SettingsTabKey, string]> = [
        ["profile", "Profile"],
        ["branding", "Branding"],
        ["pricing", "Pricing"],
        ["notif", "Notifications"],
      ];
      out.settingsTabs = tabs.map(([k, l]) => ({
        label: l,
        onClick: () => this.setState({ settingsTab: k }),
        weight: s.settingsTab === k ? 600 : 500,
        color: s.settingsTab === k ? "var(--primary)" : "var(--text-muted)",
        border: s.settingsTab === k ? "var(--primary)" : "transparent",
      }));
      out.st_profile = s.settingsTab === "profile";
      out.st_branding = s.settingsTab === "branding";
      out.st_pricing = s.settingsTab === "pricing";
      out.st_notif = s.settingsTab === "notif";
      out.set_business = s.settings ? s.settings.businessName : "";
      out.set_email = "operator@taxflow.in";
      out.set_subdomain = s.settings ? s.settings.subdomain : "";
      out.set_webhook = s.settings ? s.settings.notifyWebhook : "";
      out.set_price = s.priceEdit;
      out.onPriceInput = (e) =>
        this.setState({ priceEdit: e.target.value.replace(/[^0-9]/g, "") });
      out.onSavePrice = () => {
        const v = parseInt(s.priceEdit || "0", 10) || 150;
        this.svc.updateSettings(this.svc.vendorId, { pricePerRequest: v });
        this.setState({
          settings: Object.assign({}, s.settings, { pricePerRequest: v }) as Settings,
        });
        this._toast("Saved", "Price updated to " + fmtMoney(v), "#107A52");
      };
      out.accentSwatches = ["#FAC800", "#2A6FDB", "#1F8A5B", "#C0392B"].map((c) => ({
        color: c,
        border: s.accent === c ? "var(--text)" : "transparent",
        onClick: () => this.setState({ accent: c }),
      }));
      out.notifOn = s.notifOn;
      out.notifBg = s.notifOn ? "var(--primary)" : "#D7D9EC";
      out.notifKnob = s.notifOn ? "21px" : "3px";
      out.onToggleNotif = () => this.setState((p) => ({ notifOn: !p.notifOn }));
    }

    // ---- receipt modal ----
    out.receiptModalOpen = !!s.receiptModal;
    if (s.receiptModal) {
      const { rc, req } = s.receiptModal;
      const mono = "'JetBrains Mono',monospace";
      out.receiptModalFields = [
        { label: "Vehicle", value: req ? req.vehicleNumber : "—", font: mono },
        { label: "Tax amount", value: fmtMoney(rc.taxAmount), font: mono },
        { label: "Gov reference", value: rc.govReference, font: mono },
        { label: "Receipt ID", value: rc.receiptId, font: mono },
        { label: "Generated", value: this.rel(rc.generatedAt), font: "inherit" },
      ];
    } else out.receiptModalFields = [];
    out.onReceiptModalClose = () => this.setState({ receiptModal: null });

    return out;
  }

  render() {
    const vals = this.renderVals();
    return (
      <div
        data-theme={vals.theme}
        style={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          background: "var(--bg)",
          color: "var(--text)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {vals.routeIsLogin && <Login vm={vals} />}

        {vals.showShell && (
          <>
            <Sidebar vm={vals} />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                background: "var(--bg)",
              }}
            >
              <Topbar vm={vals} />
              {vals.profileOpen && <ProfileMenu vm={vals} />}
              <main style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
                <div
                  key={vals.routeKey}
                  style={{ maxWidth: "1180px", margin: "0 auto" }}
                >
                  {vals.routeIsDashboard && (
                    <Dashboard
                      vm={vals}
                      requestsLength={this.state.requests.length}
                    />
                  )}
                  {vals.routeIsRequests && <Requests vm={vals} />}
                  {vals.routeIsDetail && <RequestDetail vm={vals} />}
                  {vals.routeIsWallet && <WalletView vm={vals} />}
                  {vals.routeIsCommercials && <Commercials vm={vals} />}
                  {vals.routeIsReceipts && <Receipts vm={vals} />}
                  {vals.routeIsSettings && <SettingsView vm={vals} />}
                  {vals.routeIsPricing && <Pricing vm={vals} />}
                </div>
              </main>
            </div>
          </>
        )}

        {vals.modalOpen && <ConfirmModal vm={vals} />}
        {vals.receiptModalOpen && <ReceiptModal vm={vals} />}
        <Toasts vm={vals} />
      </div>
    );
  }
}
