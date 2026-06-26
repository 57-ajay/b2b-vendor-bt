import { INTERNAL_API_KEY, SUVIDHA_API_URL } from "../config";

/**
 * HTTP client for the suvidha agent. Called only from Cloud Functions, so the
 * base URL + internal key never reach the browser. Functions that use this must
 * declare `secrets: [INTERNAL_API_KEY]`.
 */

export interface RunResult {
  ok: boolean;
  jobId?: string;
  status?: string;
  deduped?: boolean;
  reason?: string;
  error?: string;
  message?: string;
  missing?: string[];
  invalid?: { field: string; reason: string }[];
}

function base(): string {
  const b = SUVIDHA_API_URL.value();
  if (!b) throw new Error("SUVIDHA_API_URL is not configured.");
  return b.replace(/\/+$/, "");
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const key = INTERNAL_API_KEY.value();
  if (key) h["X-Internal-Key"] = key;
  return h;
}

export async function agentRun(
  params: Record<string, string>,
): Promise<RunResult> {
  const res = await fetch(`${base()}/api/run`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ taskId: "border-tax", source: "app", params }),
  });
  return (await res.json()) as RunResult;
}

export async function agentIntervene(
  requestId: string,
  input: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(
    `${base()}/api/jobs/${encodeURIComponent(requestId)}/intervene`,
    { method: "POST", headers: headers(), body: JSON.stringify({ input }) },
  );
  return (await res.json()) as { ok: boolean; message?: string };
}

export async function agentCancel(
  requestId: string,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(
    `${base()}/api/jobs/${encodeURIComponent(requestId)}/cancel`,
    { method: "POST", headers: headers() },
  );
  return (await res.json()) as { ok: boolean; message?: string };
}
