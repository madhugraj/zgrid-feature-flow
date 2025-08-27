type FetchOptions = { method?: "GET" | "POST"; headers?: Record<string,string>; body?: any; timeoutMs?: number };

const PII_BASE = import.meta.env.VITE_PII_ENDPOINT ?? "";
const PII_KEY  = import.meta.env.VITE_PII_API_KEY ?? "";

const TOX_BASE = import.meta.env.VITE_TOX_ENDPOINT ?? "";
const TOX_KEY  = import.meta.env.VITE_TOX_API_KEY ?? "";

// single fetch with timeout + helpful errors
async function xfetch(url: string, { method="GET", headers={}, body, timeoutMs=12000 }: FetchOptions = {}) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  const r = await fetch(url, {
    method,
    headers: { "Content-Type":"application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
    signal: ctrl.signal,
    credentials: "omit",
    cache: "no-store",
  }).catch((e) => { throw new Error(`Network error: ${e.message}`) });
  clearTimeout(to);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}: ${await r.text()}`);
  return r.json();
}

// Health helpers
export async function healthPII() { return xfetch(`${PII_BASE}/health`); }
export async function healthTox() { return xfetch(`${TOX_BASE}/health`); }

// API calls
export async function validatePII(text: string, extra?: Record<string,unknown>) {
  return xfetch(`${PII_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": PII_KEY },
    body: { text, ...(extra || {}) },
  });
}

export async function validateTox(payload: {
  text: string;
  mode?: "sentence" | "text";
  tox_threshold?: number;
  labels?: string[];
  action_on_fail?: "remove_sentences" | "remove_all" | "redact";
  profanity_enabled?: boolean;
  profanity_action?: "mask" | "remove";
}) {
  return xfetch(`${TOX_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": TOX_KEY },
    body: payload,
  });
}