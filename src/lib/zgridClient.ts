type FetchOptions = { method?: "GET" | "POST"; headers?: Record<string,string>; body?: any; timeoutMs?: number };

// Default endpoints - using your ngrok URLs
let PII_BASE = import.meta.env.VITE_PII_ENDPOINT || "https://62db46e0d53a.ngrok-free.app";
let PII_KEY  = import.meta.env.VITE_PII_API_KEY || "supersecret123";

let TOX_BASE = import.meta.env.VITE_TOX_ENDPOINT || "https://41eb0925df35.ngrok-free.app";
let TOX_KEY  = import.meta.env.VITE_TOX_API_KEY || "supersecret123";

let JAIL_BASE = import.meta.env.VITE_JAIL_ENDPOINT || "http://localhost:8002";
let JAIL_KEY  = import.meta.env.VITE_JAIL_API_KEY || "supersecret123";

let BAN_BASE = import.meta.env.VITE_BAN_ENDPOINT || "http://localhost:8004";
let BAN_KEY  = import.meta.env.VITE_BAN_API_KEY || "supersecret123";

let POLICY_BASE = import.meta.env.VITE_POLICY_ENDPOINT || "http://localhost:8003";
let POLICY_KEY  = import.meta.env.VITE_POLICY_API_KEY || "supersecret123";

// Configuration helpers
export function setServiceConfig(config: {
  piiEndpoint?: string;
  piiApiKey?: string;
  toxEndpoint?: string;
  toxApiKey?: string;
  jailEndpoint?: string;
  jailApiKey?: string;
  banEndpoint?: string;
  banApiKey?: string;
  policyEndpoint?: string;
  policyApiKey?: string;
}) {
  if (config.piiEndpoint) PII_BASE = config.piiEndpoint;
  if (config.piiApiKey) PII_KEY = config.piiApiKey;
  if (config.toxEndpoint) TOX_BASE = config.toxEndpoint;
  if (config.toxApiKey) TOX_KEY = config.toxApiKey;
  if (config.jailEndpoint) JAIL_BASE = config.jailEndpoint;
  if (config.jailApiKey) JAIL_KEY = config.jailApiKey;
  if (config.banEndpoint) BAN_BASE = config.banEndpoint;
  if (config.banApiKey) BAN_KEY = config.banApiKey;
  if (config.policyEndpoint) POLICY_BASE = config.policyEndpoint;
  if (config.policyApiKey) POLICY_KEY = config.policyApiKey;
}

export function getServiceConfig() {
  return { PII_BASE, PII_KEY, TOX_BASE, TOX_KEY, JAIL_BASE, JAIL_KEY, BAN_BASE, BAN_KEY, POLICY_BASE, POLICY_KEY };
}

// single fetch with timeout + helpful errors
async function xfetch(url: string, { method="GET", headers={}, body, timeoutMs=12000 }: FetchOptions = {}) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  
  console.log(`Making request to: ${url}`, { method, headers, body });
  
  try {
    const r = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...headers 
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    });
    
    clearTimeout(to);
    console.log(`Response status: ${r.status} for ${url}`);
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error(`HTTP Error ${r.status}:`, errorText);
      throw new Error(`${r.status} ${r.statusText}: ${errorText}`);
    }
    
    return r.json();
  } catch (e) {
    clearTimeout(to);
    console.error(`Fetch failed for ${url}:`, e);
    throw new Error(`Network error: ${e.message} - This might be a CORS issue. Make sure your local services allow cross-origin requests from ${window.location.origin}`);
  }
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

export async function healthJail() { 
  if (JAIL_BASE === "mock") return { status: "ok", service: "jail-mock" };
  return xfetch(`${JAIL_BASE}/health`); 
}

export async function healthBan() { 
  if (BAN_BASE === "mock") return { status: "ok", service: "ban-mock" };
  return xfetch(`${BAN_BASE}/health`); 
}

export async function healthPolicy() { 
  if (POLICY_BASE === "mock") return { status: "ok", service: "policy-mock" };
  return xfetch(`${POLICY_BASE}/health`); 
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

export async function validateJailbreak(payload: {
  text: string;
  threshold?: number;
  action_on_fail?: "filter" | "refrain" | "reask";
  enable_similarity?: boolean;
  return_spans?: boolean;
}) {
  if (JAIL_BASE === "mock") {
    // Mock jailbreak detection
    const jailbreakPatterns = ["ignore all previous", "dan", "pretend to be", "act as", "jailbreak"];
    const hasJailbreak = jailbreakPatterns.some(pattern => 
      payload.text.toLowerCase().includes(pattern)
    );
    
    return {
      status: hasJailbreak ? "blocked" : "pass",
      clean_text: hasJailbreak ? "" : payload.text,
      flagged: hasJailbreak ? [
        { type: "jailbreak", score: 0.85 },
        { type: "rule", rule: "JAILBREAK_PATTERN", span: [0, 10], token: "detected pattern" }
      ] : [],
      scores: {
        classifier: hasJailbreak ? 0.85 : 0.15,
        similarity: null,
        rule_hits: hasJailbreak ? 1 : 0
      },
      steps: [
        {
          name: "classifier",
          passed: !hasJailbreak,
          details: { score: hasJailbreak ? 0.85 : 0.15, threshold: payload.threshold || 0.5 }
        }
      ],
      reasons: hasJailbreak ? ["Jailbreak attempt detected"] : []
    };
  }
  
  return xfetch(`${JAIL_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": JAIL_KEY },
    body: payload,
  });
}

export async function validateBan(payload: {
  text: string;
  mode?: "exact" | "whole_word" | "substring" | "regex";
  action_on_fail?: "mask" | "filter" | "refrain" | "reask";
  lists?: string[];
  case_sensitive?: boolean;
  return_spans?: boolean;
}) {
  if (BAN_BASE === "mock") {
    // Mock ban detection
    const bannedTerms = ["scam", "violence", "hate", "fraud", "illegal"];
    const hasBanned = bannedTerms.some(term => 
      payload.text.toLowerCase().includes(term)
    );
    
    return {
      status: hasBanned ? "fixed" : "pass",
      clean_text: hasBanned ? payload.text.replace(/scam|violence|hate|fraud|illegal/gi, "***") : payload.text,
      flagged: hasBanned ? [
        { type: "ban", token: "detected term", list: "default", span: [0, 10] }
      ] : [],
      steps: [
        {
          name: "banlist",
          passed: !hasBanned,
          details: { hits: hasBanned ? 1 : 0, mode: payload.mode || "whole_word" }
        }
      ],
      reasons: hasBanned ? ["Terms masked"] : []
    };
  }
  
  return xfetch(`${BAN_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": BAN_KEY },
    body: payload,
  });
}

export async function validatePolicy(payload: {
  text: string;
  role?: "user" | "assistant" | "system";
  action_on_fail?: "filter" | "refrain" | "reask";
  policy?: string;
  return_spans?: boolean;
}) {
  if (POLICY_BASE === "mock") {
    // Mock policy moderation
    const violatingTerms = ["bomb", "kill", "violence", "illegal", "drugs"];
    const hasViolation = violatingTerms.some(term => 
      payload.text.toLowerCase().includes(term)
    );
    
    return {
      status: hasViolation ? "blocked" : "pass",
      clean_text: hasViolation ? "" : payload.text,
      decision: hasViolation ? "disallowed" : "allowed",
      violations: hasViolation ? [
        { category: "Illicit behavior", evidence: "detected violation" }
      ] : [],
      steps: [
        {
          name: "llamaguard",
          passed: !hasViolation,
          details: { model: "LlamaGuard-7B.Q4_K_M.gguf", ctx: 4096, temp: 0 }
        }
      ],
      reasons: hasViolation ? ["Policy violation"] : []
    };
  }
  
  return xfetch(`${POLICY_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": POLICY_KEY },
    body: payload,
  });
}