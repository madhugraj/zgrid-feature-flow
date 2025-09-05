type FetchOptions = { method?: "GET" | "POST" | "DELETE"; headers?: Record<string,string>; body?: any; timeoutMs?: number };

// Default endpoints - using mock for demo since localhost has CORS issues
// To use real services, expose them via ngrok or configure CORS properly
let PII_BASE = import.meta.env.VITE_PII_ENDPOINT || "mock";
let PII_KEY  = import.meta.env.VITE_PII_API_KEY || "supersecret123";

let TOX_BASE = import.meta.env.VITE_TOX_ENDPOINT || "mock";
let TOX_KEY  = import.meta.env.VITE_TOX_API_KEY || "supersecret123";

let JAIL_BASE = import.meta.env.VITE_JAIL_ENDPOINT || "mock";
let JAIL_KEY  = import.meta.env.VITE_JAIL_API_KEY || "supersecret123";

let BAN_BASE = import.meta.env.VITE_BAN_ENDPOINT || "mock";
let BAN_KEY  = import.meta.env.VITE_BAN_API_KEY || "supersecret123";

let POLICY_BASE = import.meta.env.VITE_POLICY_ENDPOINT || "mock";
let POLICY_KEY  = import.meta.env.VITE_POLICY_API_KEY || "supersecret123";

let SECRETS_BASE = import.meta.env.VITE_SECRETS_ENDPOINT || "mock";
let SECRETS_KEY  = import.meta.env.VITE_SECRETS_API_KEY || "supersecret123";

let FORMAT_BASE = import.meta.env.VITE_FORMAT_ENDPOINT || "mock";
let FORMAT_KEY  = import.meta.env.VITE_FORMAT_API_KEY || "supersecret123";

// Admin API Keys (separate from regular keys)
let PII_ADMIN_KEY = import.meta.env.VITE_PII_ADMIN_KEY || "piiprivileged123";
let JAIL_ADMIN_KEY = import.meta.env.VITE_JAIL_ADMIN_KEY || "jailprivileged123";
let BAN_ADMIN_KEY = import.meta.env.VITE_BAN_ADMIN_KEY || "banprivileged123";
let POLICY_ADMIN_KEY = import.meta.env.VITE_POLICY_ADMIN_KEY || "policyprivileged123";
let SECRETS_ADMIN_KEY = import.meta.env.VITE_SECRETS_ADMIN_KEY || "secretsprivileged123";
let FORMAT_ADMIN_KEY = import.meta.env.VITE_FORMAT_ADMIN_KEY || "formatprivileged123";

// Configuration helpers
export function setServiceConfig(config: {
  piiEndpoint?: string;
  piiApiKey?: string;
  piiAdminKey?: string;
  toxEndpoint?: string;
  toxApiKey?: string;
  jailEndpoint?: string;
  jailApiKey?: string;
  jailAdminKey?: string;
  banEndpoint?: string;
  banApiKey?: string;
  banAdminKey?: string;
  policyEndpoint?: string;
  policyApiKey?: string;
  policyAdminKey?: string;
  secretsEndpoint?: string;
  secretsApiKey?: string;
  secretsAdminKey?: string;
  formatEndpoint?: string;
  formatApiKey?: string;
  formatAdminKey?: string;
}) {
  if (config.piiEndpoint) PII_BASE = config.piiEndpoint;
  if (config.piiApiKey) PII_KEY = config.piiApiKey;
  if (config.piiAdminKey) PII_ADMIN_KEY = config.piiAdminKey;
  if (config.toxEndpoint) TOX_BASE = config.toxEndpoint;
  if (config.toxApiKey) TOX_KEY = config.toxApiKey;
  if (config.jailEndpoint) JAIL_BASE = config.jailEndpoint;
  if (config.jailApiKey) JAIL_KEY = config.jailApiKey;
  if (config.jailAdminKey) JAIL_ADMIN_KEY = config.jailAdminKey;
  if (config.banEndpoint) BAN_BASE = config.banEndpoint;
  if (config.banApiKey) BAN_KEY = config.banApiKey;
  if (config.banAdminKey) BAN_ADMIN_KEY = config.banAdminKey;
  if (config.policyEndpoint) POLICY_BASE = config.policyEndpoint;
  if (config.policyApiKey) POLICY_KEY = config.policyApiKey;
  if (config.policyAdminKey) POLICY_ADMIN_KEY = config.policyAdminKey;
  if (config.secretsEndpoint) SECRETS_BASE = config.secretsEndpoint;
  if (config.secretsApiKey) SECRETS_KEY = config.secretsApiKey;
  if (config.secretsAdminKey) SECRETS_ADMIN_KEY = config.secretsAdminKey;
  if (config.formatEndpoint) FORMAT_BASE = config.formatEndpoint;
  if (config.formatApiKey) FORMAT_KEY = config.formatApiKey;
  if (config.formatAdminKey) FORMAT_ADMIN_KEY = config.formatAdminKey;
}

export function getServiceConfig() {
  return { 
    PII_BASE, PII_KEY, PII_ADMIN_KEY,
    TOX_BASE, TOX_KEY,
    JAIL_BASE, JAIL_KEY, JAIL_ADMIN_KEY,
    BAN_BASE, BAN_KEY, BAN_ADMIN_KEY,
    POLICY_BASE, POLICY_KEY, POLICY_ADMIN_KEY,
    SECRETS_BASE, SECRETS_KEY, SECRETS_ADMIN_KEY,
    FORMAT_BASE, FORMAT_KEY, FORMAT_ADMIN_KEY
  };
}

// single fetch with timeout + helpful errors
async function xfetch(url: string, { method="GET", headers={}, body, timeoutMs=12000 }: FetchOptions = {}) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  
  console.log(`🚀 xfetch: Making request to: ${url}`, { method, headers, body });
  console.log(`🌐 Current origin: ${window.location.origin}`);
  
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
    console.log(`✅ Response status: ${r.status} for ${url}`, {
      status: r.status,
      statusText: r.statusText,
      headers: Object.fromEntries(r.headers.entries())
    });
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error(`❌ HTTP Error ${r.status}:`, errorText);
      throw new Error(`${r.status} ${r.statusText}: ${errorText}`);
    }
    
    const result = await r.json();
    console.log(`📝 Response data:`, result);
    return result;
  } catch (e) {
    clearTimeout(to);
    console.error(`💥 Fetch failed for ${url}:`, e);
    
    // More specific error handling
    if (e.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    } else if (e instanceof TypeError) {
      throw new Error(`Network error: Cannot connect to ${url}. Make sure the service is running on the correct port.`);
    } else {
      throw new Error(`Network error: ${e.message} - This might be a CORS issue. Make sure your local services allow cross-origin requests from ${window.location.origin}`);
    }
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

export async function healthSecrets() { 
  if (SECRETS_BASE === "mock") return { status: "ok", service: "secrets-mock" };
  return xfetch(`${SECRETS_BASE}/health`); 
}

export async function healthFormat() { 
  if (FORMAT_BASE === "mock") return { status: "ok", service: "format-mock" };
  return xfetch(`${FORMAT_BASE}/health`); 
}

// API calls
export async function validatePII(text: string, entities?: string[], return_spans?: boolean) {
  console.log('validatePII called with:', { text, entities, return_spans, PII_BASE });
  
  if (PII_BASE === "mock") {
    // Mock PII detection
    const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    const phones = text.match(/\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s*\d{3}-\d{4}\b/g) || [];
    const names = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
    
    return {
      status: (emails.length > 0 || phones.length > 0 || names.length > 0) ? "fixed" : "pass",
      redacted_text: text
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]")
        .replace(/\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s*\d{3}-\d{4}\b/g, "[PHONE]")
        .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "[PERSON]"),
      entities: [
        ...emails.map(email => ({ entity_type: "EMAIL_ADDRESS", text: email, score: 0.9 })),
        ...phones.map(phone => ({ entity_type: "PHONE_NUMBER", text: phone, score: 0.9 })),
        ...names.map(name => ({ entity_type: "PERSON", text: name, score: 0.8 }))
      ],
      steps: [{ name: "PII_detection", passed: true, details: { entities_found: emails.length + phones.length + names.length } }],
      reasons: (emails.length > 0 || phones.length > 0 || names.length > 0) ? ["PII redacted"] : ["No PII detected"]
    };
  }
  
  const requestBody = { 
    text, 
    entities: entities || [
      "EMAIL_ADDRESS", 
      "PHONE_NUMBER", 
      "CREDIT_CARD", 
      "US_SSN", 
      "PERSON", 
      "LOCATION", 
      "IN_AADHAAR", 
      "IN_PAN"
    ], 
    return_spans: return_spans || true 
  };
  
  console.log('PII Request URL:', `${PII_BASE}/validate`);
  console.log('PII Request Body:', requestBody);
  console.log('PII Request Headers:', { "x-api-key": PII_KEY });
  
  try {
    const result = await xfetch(`${PII_BASE}/validate`, {
      method: "POST",
      headers: { "x-api-key": PII_KEY },
      body: requestBody,
    });
    
    console.log('PII Response:', result);
    return result;
  } catch (error) {
    console.error('PII Validation Error:', error);
    throw error;
  }
}

export async function validateTox(text: string, return_spans?: boolean) {
  if (TOX_BASE === "mock") {
    // Mock toxicity detection
    const toxicWords = ["hate", "stupid", "idiot", "damn"];
    const hasToxicity = toxicWords.some(word => text.toLowerCase().includes(word));
    
    return {
      status: hasToxicity ? "blocked" : "pass",
      clean_text: hasToxicity ? text.replace(/hate|stupid|idiot|damn/gi, "***") : text,
      flagged: hasToxicity ? [{ type: "toxicity", score: 0.7 }] : [],
      scores: {
        toxicity: hasToxicity ? 0.7 : 0.1,
        severe_toxicity: 0.1,
        obscene: hasToxicity ? 0.3 : 0.05,
        threat: 0.05,
        insult: hasToxicity ? 0.5 : 0.05,
        identity_attack: 0.05
      },
      steps: [{ name: "detoxify", passed: !hasToxicity, details: { model: "unbiased", threshold: 0.5 } }],
      reasons: hasToxicity ? ["No toxicity or profanity detected"] : ["Toxic content detected"]
    };
  }
  
  return xfetch(`${TOX_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": TOX_KEY },
    body: { text, return_spans: return_spans || true },
  });
}

export async function validateJailbreak(text: string, return_spans?: boolean) {
  if (JAIL_BASE === "mock") {
    // Mock jailbreak detection
    const jailbreakPatterns = ["ignore all previous", "dan", "pretend to be", "act as", "jailbreak"];
    const hasJailbreak = jailbreakPatterns.some(pattern => 
      text.toLowerCase().includes(pattern)
    );
    
    return {
      status: hasJailbreak ? "blocked" : "pass",
      clean_text: hasJailbreak ? "" : text,
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
          details: { score: hasJailbreak ? 0.85 : 0.15, threshold: 0.5 }
        }
      ],
      reasons: hasJailbreak ? ["Request blocked"] : []
    };
  }
  
  return xfetch(`${JAIL_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": JAIL_KEY },
    body: { text, return_spans: return_spans || true },
  });
}

export async function validateBan(text: string, return_spans?: boolean) {
  if (BAN_BASE === "mock") {
    // Mock ban detection
    const bannedTerms = ["scam", "violence", "hate", "fraud", "illegal"];
    const hasBanned = bannedTerms.some(term => 
      text.toLowerCase().includes(term)
    );
    
    return {
      status: hasBanned ? "blocked" : "pass",
      clean_text: hasBanned ? "" : text,
      flagged: hasBanned ? [
        { type: "ban", token: "detected term", list: "default", span: [0, 10] }
      ] : [],
      steps: [
        {
          name: "banlist",
          passed: !hasBanned,
          details: { hits: hasBanned ? 1 : 0, mode: "whole_word" }
        }
      ],
      reasons: hasBanned ? ["Blocked"] : []
    };
  }
  
  return xfetch(`${BAN_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": BAN_KEY },
    body: { text, return_spans: return_spans || true },
  });
}

export async function validatePolicy(text: string, return_spans?: boolean) {
  if (POLICY_BASE === "mock") {
    // Mock policy moderation
    const violatingTerms = ["bomb", "kill", "violence", "illegal", "drugs"];
    const hasViolation = violatingTerms.some(term => 
      text.toLowerCase().includes(term)
    );
    
    return {
      status: hasViolation ? "blocked" : "pass",
      clean_text: hasViolation ? "" : text,
      flagged: hasViolation ? [
        { category: "Illicit behavior", evidence: "detected violation" }
      ] : [],
      steps: [
        {
          name: "llamaguard",
          passed: !hasViolation,
          details: { model: "LlamaGuard-7B.Q4_K_M.gguf", ctx: 4096, temp: 0 }
        }
      ],
      reasons: hasViolation ? ["Blocked"] : []
    };
  }
  
  return xfetch(`${POLICY_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": POLICY_KEY },
    body: { text, return_spans: return_spans || true },
  });
}

export async function validateSecrets(text: string, return_spans?: boolean) {
  if (SECRETS_BASE === "mock") {
    // Mock secrets detection
    const secretPatterns = [
      { pattern: /AKIA[0-9A-Z]{16}/g, type: "AWS_ACCESS_KEY_ID", category: "CLOUD" },
      { pattern: /sk_live_[0-9a-zA-Z]{24}/g, type: "STRIPE_SECRET", category: "PAYMENTS" },
      { pattern: /-----BEGIN.*PRIVATE KEY-----/g, type: "PRIVATE_KEY", category: "CRYPTO" },
      { pattern: /ghp_[0-9a-zA-Z]{36}/g, type: "GITHUB_TOKEN", category: "DEV" }
    ];
    
    const detected = [];
    let cleanText = text;
    
    for (const { pattern, type, category } of secretPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        detected.push({
          type: "secret",
          id: type,
          category,
          engine: "regex",
          severity: 5,
          start: match.index,
          end: match.index + match[0].length,
          snippet: match[0].substring(0, 10) + "..."
        });
        cleanText = cleanText.replace(match[0], "***");
      }
    }
    
    return {
      status: detected.length > 0 ? "blocked" : "pass",
      clean_text: detected.length > 0 ? "" : text,
      flagged: detected,
      steps: [
        {
          name: "regex+entropy",
          passed: detected.length === 0,
          details: {
            hits: detected.length,
            enable_regex: true,
            enable_entropy: true,
            entropy_threshold: 4.0
          }
        }
      ],
      reasons: detected.length > 0 ? ["Secrets blocked"] : []
    };
  }
  
  return xfetch(`${SECRETS_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": SECRETS_KEY },
    body: { text, return_spans: return_spans || true },
  });
}

export async function validateFormat(text: string, expressions?: string[], return_spans?: boolean) {
  if (FORMAT_BASE === "mock") {
    // Mock format validation using Cucumber expressions
    const customExpressions = expressions || ["Email {email}, phone {phone}"];
    const hasValidFormat = customExpressions.some(expr => {
      // Simple mock validation - check for basic Cucumber structure
      const pattern = expr.replace(/{word}/g, "\\w+").replace(/{int}/g, "\\d+").replace(/{email}/g, "[\\w._%+-]+@[\\w.-]+\\.[A-Za-z]{2,}").replace(/{phone}/g, "[\\d\\-\\+\\(\\)\\s]+");
      const regex = new RegExp(pattern, "i");
      return regex.test(text);
    });
    
    return {
      status: hasValidFormat ? "pass" : "blocked",
      clean_text: hasValidFormat ? text : "",
      matched_expression: hasValidFormat ? customExpressions[0] : null,
      variables: hasValidFormat ? { email: "john@example.com", phone: "+1-555-123-4567" } : {},
      spans: hasValidFormat ? { email: [6, 21], phone: [29, 45] } : {},
      steps: [
        {
          name: "cucumber_expressions",
          passed: hasValidFormat,
          details: { expressions_checked: customExpressions.length }
        }
      ],
      reasons: hasValidFormat ? ["Input matches expected format"] : ["Format validation failed"]
    };
  }
  
  return xfetch(`${FORMAT_BASE}/validate`, {
    method: "POST",
    headers: { "x-api-key": FORMAT_KEY },
    body: { text, expressions: expressions || ["Email {email}, phone {phone}"], return_spans: return_spans || true },
  });
}

// Admin API functions
export async function addPIIEntities(config: {
  custom_entities?: Array<{
    type: string;
    pattern: string;
    description: string;
  }>;
  custom_placeholders?: Array<{
    entity_type: string;
    placeholder: string;
  }>;
  custom_thresholds?: Array<{
    entity_type: string;
    threshold: number;
  }>;
}) {
  if (PII_BASE === "mock") {
    return { status: "success", message: "Custom PII entities added (mock)" };
  }
  
  return xfetch(`${PII_BASE}/admin/entities`, {
    method: "POST",
    headers: { "x-api-key": PII_ADMIN_KEY },
    body: config,
  });
}

export async function getPIIEntities() {
  if (PII_BASE === "mock") {
    return { 
      custom_entities: [
        { type: "EMPLOYEE_ID", pattern: "\\bEMP\\d{6}\\b", description: "Employee ID format" }
      ],
      custom_placeholders: [
        { entity_type: "EMPLOYEE_ID", placeholder: "[EMP_ID]" }
      ],
      custom_thresholds: [
        { entity_type: "EMPLOYEE_ID", threshold: 0.8 }
      ]
    };
  }
  
  return xfetch(`${PII_BASE}/admin/entities`, {
    headers: { "x-api-key": PII_ADMIN_KEY },
  });
}

export async function clearPIIEntities() {
  if (PII_BASE === "mock") {
    return { status: "success", message: "Custom PII entities cleared (mock)" };
  }
  
  return xfetch(`${PII_BASE}/admin/entities`, {
    method: "DELETE",
    headers: { "x-api-key": PII_ADMIN_KEY },
  });
}

export async function addJailbreakRules(config: {
  custom_rules?: Array<{
    id: string;
    pattern: string;
    flags?: string;
  }>;
  custom_similarity_texts?: {
    texts: string[];
  };
}) {
  if (JAIL_BASE === "mock") {
    return { status: "success", message: "Custom jailbreak rules added (mock)" };
  }
  
  return xfetch(`${JAIL_BASE}/admin/rules`, {
    method: "POST",
    headers: { "x-api-key": JAIL_ADMIN_KEY },
    body: config,
  });
}

export async function getJailbreakRules() {
  if (JAIL_BASE === "mock") {
    return {
      custom_rules: [
        { id: "COMPANY_SECRETS", pattern: "\\b(ignore|disregard)\\s+(company|internal)\\s+(policies|rules)\\b", flags: "i" }
      ],
      custom_similarity_texts: {
        texts: ["ignore all company policies", "disregard internal guidelines"]
      }
    };
  }
  
  return xfetch(`${JAIL_BASE}/admin/rules`, {
    headers: { "x-api-key": JAIL_ADMIN_KEY },
  });
}

export async function clearJailbreakRules() {
  if (JAIL_BASE === "mock") {
    return { status: "success", message: "Custom jailbreak rules cleared (mock)" };
  }
  
  return xfetch(`${JAIL_BASE}/admin/rules`, {
    method: "DELETE",
    headers: { "x-api-key": JAIL_ADMIN_KEY },
  });
}

export async function addPolicyRules(config: {
  custom_policies?: Array<{
    category: string;
    keywords: string[];
    severity: string;
  }>;
  custom_categories?: Array<{
    name: string;
    description: string;
  }>;
}) {
  if (POLICY_BASE === "mock") {
    return { status: "success", message: "Custom policy rules added (mock)" };
  }
  
  return xfetch(`${POLICY_BASE}/admin/policies`, {
    method: "POST",
    headers: { "x-api-key": POLICY_ADMIN_KEY },
    body: config,
  });
}

export async function getPolicyRules() {
  if (POLICY_BASE === "mock") {
    return {
      custom_policies: [
        { category: "COMPANY_SECRETS", keywords: ["confidential", "proprietary"], severity: "HIGH" }
      ],
      custom_categories: [
        { name: "CompanyPolicy", description: "Internal company policy violations" }
      ]
    };
  }
  
  return xfetch(`${POLICY_BASE}/admin/policies`, {
    headers: { "x-api-key": POLICY_ADMIN_KEY },
  });
}

export async function clearPolicyRules() {
  if (POLICY_BASE === "mock") {
    return { status: "success", message: "Custom policy rules cleared (mock)" };
  }
  
  return xfetch(`${POLICY_BASE}/admin/policies`, {
    method: "DELETE",
    headers: { "x-api-key": POLICY_ADMIN_KEY },
  });
}

export async function addBanRules(config: {
  custom_bans?: Array<{
    pattern: string;
    type: "literal" | "regex";
    category: string;
    severity: number;
  }>;
  custom_allow?: string[];
}) {
  if (BAN_BASE === "mock") {
    return { status: "success", message: "Custom ban rules added (mock)" };
  }
  
  return xfetch(`${BAN_BASE}/admin/banlists`, {
    method: "POST",
    headers: { "x-api-key": BAN_ADMIN_KEY },
    body: config,
  });
}

export async function getBanRules() {
  if (BAN_BASE === "mock") {
    return {
      custom_bans: [
        { pattern: "competitorxyz", type: "literal", category: "COMPETITOR", severity: 4 }
      ],
      custom_allow: ["our company discussion", "legitimate business"]
    };
  }
  
  return xfetch(`${BAN_BASE}/admin/banlists`, {
    headers: { "x-api-key": BAN_ADMIN_KEY },
  });
}

export async function clearBanRules() {
  if (BAN_BASE === "mock") {
    return { status: "success", message: "Custom ban rules cleared (mock)" };
  }
  
  return xfetch(`${BAN_BASE}/admin/banlists`, {
    method: "DELETE",
    headers: { "x-api-key": BAN_ADMIN_KEY },
  });
}

export async function addSecretsSignatures(config: {
  custom_signatures?: Array<{
    id: string;
    category: string;
    type: "regex";
    pattern: string;
    severity: number;
  }>;
}) {
  if (SECRETS_BASE === "mock") {
    return { status: "success", message: "Custom secrets signatures added (mock)" };
  }
  
  return xfetch(`${SECRETS_BASE}/admin/signatures`, {
    method: "POST",
    headers: { "x-api-key": SECRETS_ADMIN_KEY },
    body: config,
  });
}

export async function getSecretsSignatures() {
  if (SECRETS_BASE === "mock") {
    return {
      custom_signatures: [
        { id: "CUSTOM_API_KEY", category: "INTERNAL", type: "regex", pattern: "\\bck_[A-Za-z0-9]{32}\\b", severity: 4 }
      ]
    };
  }
  
  return xfetch(`${SECRETS_BASE}/admin/signatures`, {
    headers: { "x-api-key": SECRETS_ADMIN_KEY },
  });
}

export async function clearSecretsSignatures() {
  if (SECRETS_BASE === "mock") {
    return { status: "success", message: "Custom secrets signatures cleared (mock)" };
  }
  
  return xfetch(`${SECRETS_BASE}/admin/signatures`, {
    method: "DELETE",
    headers: { "x-api-key": SECRETS_ADMIN_KEY },
  });
}

export async function addFormatExpressions(config: {
  custom_expressions?: string[];
}) {
  if (FORMAT_BASE === "mock") {
    return { status: "success", message: "Custom format expressions added (mock)" };
  }
  
  return xfetch(`${FORMAT_BASE}/admin/expressions`, {
    method: "POST",
    headers: { "x-api-key": FORMAT_ADMIN_KEY },
    body: config,
  });
}

export async function getFormatExpressions() {
  if (FORMAT_BASE === "mock") {
    return {
      custom_expressions: [
        "Email {email}, phone {phone}",
        "Name: {word}, Age: {int}"
      ]
    };
  }
  
  return xfetch(`${FORMAT_BASE}/admin/expressions`, {
    headers: { "x-api-key": FORMAT_ADMIN_KEY },
  });
}

export async function clearFormatExpressions() {
  if (FORMAT_BASE === "mock") {
    return { status: "success", message: "Custom format expressions cleared (mock)" };
  }
  
  return xfetch(`${FORMAT_BASE}/admin/expressions`, {
    method: "DELETE",
    headers: { "x-api-key": FORMAT_ADMIN_KEY },
  });
}