type FetchOptions = { method?: "GET" | "POST"; headers?: Record<string,string>; body?: any; timeoutMs?: number };

// Default endpoints - can be overridden
let PII_BASE = import.meta.env.VITE_PII_ENDPOINT || "https://62db46e0d53a.ngrok-free.app";
let PII_KEY  = import.meta.env.VITE_PII_API_KEY || "supersecret123";

let TOX_BASE = import.meta.env.VITE_TOX_ENDPOINT || "https://41eb0925df35.ngrok-free.app";
let TOX_KEY  = import.meta.env.VITE_TOX_API_KEY || "supersecret123";

// Configuration helpers
export function setServiceConfig(config: {
  piiEndpoint?: string;
  piiApiKey?: string;
  toxEndpoint?: string;
  toxApiKey?: string;
}) {
  if (config.piiEndpoint) PII_BASE = config.piiEndpoint;
  if (config.piiApiKey) PII_KEY = config.piiApiKey;
  if (config.toxEndpoint) TOX_BASE = config.toxEndpoint;
  if (config.toxApiKey) TOX_KEY = config.toxApiKey;
}

export function getServiceConfig() {
  return { PII_BASE, PII_KEY, TOX_BASE, TOX_KEY };
}

// single fetch with timeout + helpful errors
async function xfetch(url: string, { method="GET", headers={}, body, timeoutMs=12000 }: FetchOptions = {}) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  
  console.log(`Making request to: ${url}`, { method, headers, body });
  
  const r = await fetch(url, {
    method,
    headers: { 
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...headers 
    },
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
export async function healthPII() { 
  if (PII_BASE === "mock") return { status: "ok", service: "pii-mock" };
  return xfetch(`${PII_BASE}/health`); 
}

export async function healthTox() { 
  if (TOX_BASE === "mock") return { status: "ok", service: "tox-mock" };
  return xfetch(`${TOX_BASE}/health`); 
}

// API calls
export async function validatePII(text: string, extra?: Record<string,unknown>) {
  if (PII_BASE === "mock") {
    // Mock PII detection
    const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    const phones = text.match(/\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s*\d{3}-\d{4}\b/g) || [];
    const names = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
    
    return {
      results: [
        ...emails.map(email => ({ entity_type: "EMAIL_ADDRESS", text: email, score: 0.9 })),
        ...phones.map(phone => ({ entity_type: "PHONE_NUMBER", text: phone, score: 0.9 })),
        ...names.map(name => ({ entity_type: "PERSON", text: name, score: 0.8 }))
      ],
      anonymized_text: text
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]")
        .replace(/\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s*\d{3}-\d{4}\b/g, "[PHONE]")
        .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[PERSON]"),
      original_text: text
    };
  }
  
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
  if (TOX_BASE === "mock") {
    // Mock toxicity detection
    const toxicWords = ["hate", "stupid", "idiot", "damn"];
    const hasToxicity = toxicWords.some(word => payload.text.toLowerCase().includes(word));
    
    return {
      is_toxic: hasToxicity,
      toxicity_score: hasToxicity ? 0.7 : 0.1,
      cleaned_text: hasToxicity ? payload.text.replace(/hate|stupid|idiot|damn/gi, "***") : payload.text,
      original_text: payload.text,
      details: {
        toxicity: hasToxicity ? 0.7 : 0.1,
        severe_toxicity: 0.1,
        obscene: hasToxicity ? 0.3 : 0.05,
        threat: 0.05,
        insult: hasToxicity ? 0.5 : 0.05,
        identity_attack: 0.05
      }
    };
  }
  
  return xfetch(`${TOX_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": TOX_KEY },
    body: payload,
  });
}