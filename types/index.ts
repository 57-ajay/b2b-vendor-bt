import type { ChangeEvent, MouseEvent, ReactNode } from "react";

/* ============================================================================
   Domain model — ported 1:1 from the source MockDriverPanelService.
   ============================================================================ */

export type RequestStatus =
  | "PENDING"
  | "PROCESSING"
  | "OPENING_PORTAL"
  | "ENTERING_DETAILS"
  | "CALCULATING_TAX"
  | "QR_GENERATED"
  | "AWAITING_PAYMENT"
  | "PAYMENT_SUCCESS"
  | "RECEIPT_GENERATED"
  | "COMPLETED"
  | "FAILED"
  | "RECONCILING";

export type FailStage =
  | "NONE"
  | "OPENING_PORTAL"
  | "ENTERING_DETAILS"
  | "AWAITING_PAYMENT"
  | "PAYMENT_SUCCESS";

export interface QrInfo {
  payload: string;
  expiresAt: string;
}

export interface FailureInfo {
  stage: string;
  reason: string;
}

export interface DriverRequest {
  requestId: string;
  vendorId: string;
  vehicleNumber: string;
  engineNumber: string;
  chassisNumber: string;
  journeyDate: string;
  state: string;
  border: string;
  mobile: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  taxAmount?: number;
  isDuplicate?: boolean;
  duplicateOf?: string;
  qr?: QrInfo;
  failure?: FailureInfo | null;
  receiptId?: string;
  /** Demo control: which stage to force a failure at (internal). */
  _failStage?: FailStage | string;
  /** Transient highlight flag for newly-arrived rows (internal). */
  _isNew?: boolean;
}

export interface Receipt {
  receiptId: string;
  requestId: string;
  storageUrl: string;
  taxAmount: number;
  govReference: string;
  generatedAt: string;
}

export interface Wallet {
  vendorId: string;
  balance: number;
  heldAmount: number;
  currency: string;
}

export type TransactionType =
  | "TOPUP"
  | "HOLD"
  | "COMMIT"
  | "RELEASE"
  | "REFUND";

export interface Transaction {
  txnId: string;
  type: TransactionType;
  amount: number;
  refRequestId?: string;
  createdAt: string;
  balanceAfter: number;
}

export interface PricingMap {
  "border-tax": number;
  "state-tax": number;
  "rc-mobile": number;
  [key: string]: number;
}

export interface Settings {
  vendorId: string;
  businessName: string;
  subdomain: string;
  brandLogoUrl: string;
  themeColor: string;
  pricePerRequest: number;
  notifyWebhook: string;
  pricing: PricingMap;
  email?: string;
}

export interface StatusMeta {
  label: string;
  text: string;
  bg: string;
  dot: string;
}

export interface StepDef {
  key: RequestStatus;
  label: string;
  gold: boolean;
}

/* ---- Border-tax pricing configuration ---- */
export interface DurationCfg {
  on: boolean;
  p?: Record<string, string>;
}

export interface BtStateCfg {
  active: boolean;
  upi: boolean;
  netBanking: boolean;
  otp: boolean;
  durations: Record<string, DurationCfg>;
}

/* ============================================================================
   UI state value-objects
   ============================================================================ */

export interface Toast {
  id: number;
  title: string;
  msg: string;
  accent: string;
}

export interface ModalState {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
}

export interface ReceiptModalState {
  rc: Receipt;
  req?: DriverRequest;
}

export type Route =
  | "login"
  | "dashboard"
  | "requests"
  | "detail"
  | "wallet"
  | "receipts"
  | "settings"
  | "pricing"
  | "commercials";

export type PricingSection = "border-tax" | "state-tax" | "rc-mobile";
export type SettingsTabKey = "profile" | "branding" | "pricing" | "notif";

/* ============================================================================
   Event-handler aliases
   ============================================================================ */
export type ClickHandler = () => void;
export type InputHandler = (e: ChangeEvent<HTMLInputElement>) => void;
export type SelectHandler = (e: ChangeEvent<HTMLSelectElement>) => void;
export type MouseHandler = (e: MouseEvent) => void;

/* ============================================================================
   View-model row items — each mirrors an object literal built in renderVals().
   ============================================================================ */

export interface NavItem {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: ClickHandler;
  padLeft: string;
  indent: boolean;
  connBottom: string;
  badge: string;
  caret: ReactNode;
  bg: string;
  color: string;
  weight: number;
}

export interface MetricCard {
  label: string;
  value: string;
  sub: string;
  color: string;
  onClick: ClickHandler;
  cursor: string;
  hover: string;
  caret: ReactNode;
}

export interface MonthTick {
  label: string;
  left: string;
  color: string;
}

export interface AttentionRow {
  vehicle: string;
  route: string;
  statusLabel: string;
  pillText: string;
  pillBg: string;
  dot: string;
  dotAnim: string;
  isStart: boolean;
  isView: boolean;
  onAction: ClickHandler;
  anim: string;
}

export interface RecentRow {
  vehicle: string;
  route: string;
  statusLabel: string;
  pillText: string;
  pillBg: string;
  dot: string;
  time: string;
  onClick: ClickHandler;
}

export interface LegendItem {
  label: string;
  color: string;
  count: string;
}

export interface FilterChip {
  label: string;
  onClick: ClickHandler;
  bg: string;
  color: string;
  border: string;
}

export interface RequestRow {
  shortId: string;
  vehicle: string;
  route: string;
  journey: string;
  statusLabel: string;
  pillText: string;
  pillBg: string;
  dot: string;
  dotAnim: string;
  time: string;
  isDuplicate: boolean;
  isStart: boolean;
  isRetry: boolean;
  isViewOnly: boolean;
  onClick: ClickHandler;
  onStart: MouseHandler;
  anim: string;
}

export interface FieldRow {
  label: string;
  value: string;
  font: string;
}

export interface StepRow {
  label: string;
  ring: string;
  fill: string;
  mark: string;
  glyph: string;
  text: string;
  weight: number;
  line: string;
  anim: string;
}

export interface LogRow {
  time: string;
  text: string;
}

export interface QuickTopup {
  label: string;
  onClick: ClickHandler;
}

export interface TxnRow {
  type: string;
  tagText: string;
  tagBg: string;
  tagDot: string;
  ref: string;
  amount: string;
  amtColor: string;
  balance: string;
  time: string;
}

export interface ReceiptRow {
  vehicle: string;
  amount: string;
  govRef: string;
  generated: string;
  onView: ClickHandler;
  onDownload: ClickHandler;
}

export interface PricingService {
  label: string;
  amount: string;
  active: boolean;
  onClick: ClickHandler;
  bg: string;
  border: string;
  color: string;
}

export interface BtStateItem {
  name: string;
  dot: string;
  selected: boolean;
  bg: string;
  color: string;
  weight: number;
  bot: ReactNode;
  chevron: string;
  onClick: ClickHandler;
}

export interface PayBtn {
  label: string;
  on: boolean;
  onClick: ClickHandler;
  bg: string;
  color: string;
  border: string;
  shadow: string;
  checkBg: string;
  checkColor: string;
  check: string;
  knobBg: string;
  knobLeft: string;
  track: string;
}

export interface VehicleCol {
  key: string;
  sub: string;
  icon: ReactNode;
}

export interface BtCell {
  vk: string;
  val: string;
  disabled: boolean;
  bg: string;
  color: string;
  onInput: InputHandler;
}

export interface BtRow {
  dur: string;
  on: boolean;
  durColor: string;
  durDeco: string;
  toggleBg: string;
  toggleKnob: string;
  onToggle: ClickHandler;
  cells: BtCell[];
}

export interface SettingsTab {
  label: string;
  onClick: ClickHandler;
  weight: number;
  color: string;
  border: string;
}

export interface AccentSwatch {
  color: string;
  border: string;
  onClick: ClickHandler;
}

/* ============================================================================
   The flat view-model the template binds against. Shell-level fields are always
   present; route-specific groups are populated only for the active route
   (exactly as in the source renderVals()), hence optional.
   ============================================================================ */
export interface ViewModel {
  /* routing */
  routeIsLogin: boolean;
  showShell: boolean;
  routeKey: string;
  routeIsDashboard: boolean;
  routeIsRequests: boolean;
  routeIsDetail: boolean;
  routeIsWallet: boolean;
  routeIsReceipts: boolean;
  routeIsSettings: boolean;
  routeIsPricing: boolean;
  routeIsCommercials: boolean;

  /* login */
  loginEmail: string;
  loginPass: string;
  loginPassType: "text" | "password";
  loginPassToggle: string;
  loginError: string;
  loginBusy: boolean;
  loginBtnLabel: string;
  onLoginEmail: InputHandler;
  onLoginPass: InputHandler;
  onTogglePass: ClickHandler;
  onLogin: ClickHandler;

  /* shell */
  sidebarWidth: string;
  brandLabelOpacity: number;
  navLabelOpacity: number;
  brandName: string;
  brandLogo: ReactNode;
  navItems: NavItem[];
  connDot: string;
  connAnim: string;
  connLabel: string;
  onToggleSidebar: ClickHandler;
  theme: string;
  onToggleTheme: ClickHandler;
  themeIcon: ReactNode;
  pageTitle: string;
  pageSubtitle: string;
  walletBalanceFmt: string;
  walletHeldFmt: string;
  walletIcon: ReactNode;
  bellIcon: ReactNode;
  goWallet: ClickHandler;
  goSettings: ClickHandler;
  goRequests: ClickHandler;
  onBell: ClickHandler;
  profileName: string;
  profileRole: string;
  profileEmail: string;
  profileOpen: boolean;
  onToggleProfile: ClickHandler;
  onLogout: ClickHandler;

  /* toasts + confirm modal */
  toasts: Toast[];
  modalOpen: boolean;
  modalTitle: string;
  modalBody: string;
  modalConfirmLabel: string;
  onModalCancel: ClickHandler;
  onModalConfirm: ClickHandler;
  stopProp: MouseHandler;

  /* receipt modal (always assigned) */
  receiptModalOpen: boolean;
  receiptModalFields: FieldRow[];
  onReceiptModalClose: ClickHandler;

  /* dashboard */
  metrics?: MetricCard[];
  dashShowGlance?: boolean;
  onToggleGlance?: ClickHandler;
  monthLabel?: string;
  monthTicks?: MonthTick[];
  attentionCount?: string;
  attentionEmpty?: boolean;
  attentionRows?: AttentionRow[];
  recentRows?: RecentRow[];
  donutEl?: ReactNode;
  donutLegend?: LegendItem[];

  /* requests */
  searchValue?: string;
  onSearch?: InputHandler;
  filterChips?: FilterChip[];
  requestsEmpty?: boolean;
  requestsEmptyText?: string;
  requestRows?: RequestRow[];

  /* detail */
  d_vehicle?: string;
  d_shortId?: string;
  d_statusLabel?: string;
  d_pillText?: string;
  d_pillBg?: string;
  d_dot?: string;
  d_dotAnim?: string;
  d_fields?: FieldRow[];
  d_steps?: StepRow[];
  d_log?: LogRow[];
  logOpen?: boolean;
  logChevron?: string;
  onToggleLog?: ClickHandler;
  ac_pending?: boolean;
  ac_processing?: boolean;
  ac_awaiting?: boolean;
  ac_completed?: boolean;
  ac_failed?: boolean;
  ac_reconciling?: boolean;
  d_priceFmt?: string;
  d_walletCovers?: boolean;
  d_walletShort?: boolean;
  d_isDuplicate?: boolean;
  d_dupOf?: string;
  d_onViewOriginal?: ClickHandler;
  d_startDisabled?: boolean;
  d_startBg?: string;
  d_startCursor?: string;
  d_onStart?: ClickHandler;
  d_failStage?: string;
  d_onFailStage?: SelectHandler;
  qrEl?: ReactNode;
  d_amountFmt?: string;
  d_countdown?: string;
  d_copyLabel?: string;
  d_onCopy?: ClickHandler;
  d_onShare?: ClickHandler;
  d_onMarkPaid?: ClickHandler;
  d_govRef?: string;
  d_generatedAt?: string;
  /** Pricing breakdown block (detail right rail). */
  d_pr_received?: string;
  d_pr_vendor?: string;
  d_pr_profit?: string;
  d_pr_margin?: string;
  d_pr_taxKnown?: boolean;
  d_onView?: ClickHandler;
  d_onDownload?: ClickHandler;
  d_failReason?: string;
  d_onRetry?: ClickHandler;

  /* wallet */
  topupQuick?: QuickTopup[];
  topupCustom?: string;
  onTopupInput?: InputHandler;
  onTopupCustom?: ClickHandler;
  txnEmpty?: boolean;
  txnRows?: TxnRow[];

  /* receipts */
  receiptSearch?: string;
  onReceiptSearch?: InputHandler;
  receiptsEmpty?: boolean;
  receiptRows?: ReceiptRow[];

  /* commercials — vendor commission model on border-tax payments */
  comm_isPercent?: boolean;
  comm_percent?: string;
  comm_fixed?: string;
  comm_onModePercent?: ClickHandler;
  comm_onModeFixed?: ClickHandler;
  comm_onPercent?: InputHandler;
  comm_onFixed?: InputHandler;
  comm_egTax?: string;
  comm_egCommission?: string;
  comm_egTotal?: string;
  comm_egRate?: string;

  /* pricing */
  pr_title?: string;
  pr_desc?: string;
  pr_isBorderTax?: boolean;
  pr_isSimple?: boolean;
  pr_comingTitle?: string;
  pr_draft?: string;
  pr_current?: string;
  onPrDraft?: InputHandler;
  onPrSave?: ClickHandler;
  pricingServices?: PricingService[];
  btStates?: BtStateItem[];
  btSelectedName?: string;
  btSearch?: string;
  onBtSearch?: InputHandler;
  btAutomation?: boolean;
  btAutomationBg?: string;
  btAutomationKnob?: string;
  onBtAutomation?: ClickHandler;
  btActive?: boolean;
  btActiveBg?: string;
  btActiveKnob?: string;
  btStatusLabel?: string;
  btStatusColor?: string;
  btStatusDot?: string;
  onBtActive?: ClickHandler;
  onAddUnavail?: ClickHandler;
  btUpi?: PayBtn;
  btNet?: PayBtn;
  btOtp?: PayBtn;
  btVehicles?: VehicleCol[];
  btRows?: BtRow[];
  onBtSave?: ClickHandler;

  /* settings */
  settingsTabs?: SettingsTab[];
  st_profile?: boolean;
  st_branding?: boolean;
  st_pricing?: boolean;
  st_notif?: boolean;
  set_business?: string;
  set_email?: string;
  set_subdomain?: string;
  set_webhook?: string;
  set_price?: string;
  onPriceInput?: InputHandler;
  onSavePrice?: ClickHandler;
  accentSwatches?: AccentSwatch[];
  notifOn?: boolean;
  notifBg?: string;
  notifKnob?: string;
  onToggleNotif?: ClickHandler;
}
