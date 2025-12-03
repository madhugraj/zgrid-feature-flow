type FetchOptions = { method?: "GET" | "POST" | "DELETE"; headers?: Record<string, string>; body?: any; timeoutMs?: number };

// =================== SERVICE ENDPOINTS CONFIGURATION ===================
// Individual service endpoints - Uses local proxy in development to bypass CORS
const IS_DEV = import.meta.env.DEV;

const SERVICE_ENDPOINTS = {
  PII: IS_DEV ? "/proxy/pii" : "http://57.152.84.241:8000",
  TOXICITY: IS_DEV ? "/proxy/toxicity" : "http://localhost:8001",
  JAILBREAK_ROBERTA: IS_DEV ? "/proxy/jailbreak-roberta" : "http://172.210.123.118:5005",
  JAILBREAK_DISTILBERT: IS_DEV ? "/proxy/jailbreak-distilbert" : "http://4.156.246.0:8002",
  BAN: IS_DEV ? "/proxy/ban" : "http://48.194.33.158:8004",
  SECRETS: IS_DEV ? "/proxy/secrets" : "http://4.156.154.216:8005",
  FORMAT: IS_DEV ? "/proxy/format" : "http://20.242.132.57:8006",
  GIBBERISH: IS_DEV ? "/proxy/gibberish" : "http://51.8.74.156:8007",
};

// Content Moderation Gateway - Single endpoint for all services (if available)
let GATEWAY_BASE = import.meta.env.VITE_GATEWAY_URL || "http://20.237.89.50:8010";
let GATEWAY_KEY = import.meta.env.VITE_GATEWAY_API_KEY || "supersecret123";

// API Keys for all services
const API_KEY = "supersecret123";

// Admin API Keys for individual services (for configuration management)
let PII_ADMIN_KEY = import.meta.env.VITE_PII_ADMIN_KEY || "piiprivileged123";
let JAIL_ADMIN_KEY = import.meta.env.VITE_JAIL_ADMIN_KEY || "jailprivileged123";
let BAN_ADMIN_KEY = import.meta.env.VITE_BAN_ADMIN_KEY || "banprivileged123";
let POLICY_ADMIN_KEY = import.meta.env.VITE_POLICY_ADMIN_KEY || "policyprivileged123";
let SECRETS_ADMIN_KEY = import.meta.env.VITE_SECRETS_ADMIN_KEY || "secretsprivileged123";
let FORMAT_ADMIN_KEY = import.meta.env.VITE_FORMAT_ADMIN_KEY || "formatprivileged123";
let GIBBERISH_ADMIN_KEY = import.meta.env.VITE_GIBBERISH_ADMIN_KEY || "gibberishprivileged123";

// Configuration helpers
export function setServiceConfig(config: {
  gatewayEndpoint?: string;
  gatewayApiKey?: string;
  piiAdminKey?: string;
  jailAdminKey?: string;
  banAdminKey?: string;
  policyAdminKey?: string;
  secretsAdminKey?: string;
  formatAdminKey?: string;
  gibberishAdminKey?: string;
}) {
  if (config.gatewayEndpoint) GATEWAY_BASE = config.gatewayEndpoint;
  if (config.gatewayApiKey) GATEWAY_KEY = config.gatewayApiKey;
  if (config.piiAdminKey) PII_ADMIN_KEY = config.piiAdminKey;
  if (config.jailAdminKey) JAIL_ADMIN_KEY = config.jailAdminKey;
  if (config.banAdminKey) BAN_ADMIN_KEY = config.banAdminKey;
  if (config.policyAdminKey) POLICY_ADMIN_KEY = config.policyAdminKey;
  if (config.secretsAdminKey) SECRETS_ADMIN_KEY = config.secretsAdminKey;
  if (config.formatAdminKey) FORMAT_ADMIN_KEY = config.formatAdminKey;
  if (config.gibberishAdminKey) GIBBERISH_ADMIN_KEY = config.gibberishAdminKey;
}

export function getServiceConfig() {
  return {
    GATEWAY_BASE, GATEWAY_KEY,
    PII_ADMIN_KEY, JAIL_ADMIN_KEY, BAN_ADMIN_KEY,
    POLICY_ADMIN_KEY, SECRETS_ADMIN_KEY, FORMAT_ADMIN_KEY, GIBBERISH_ADMIN_KEY
  };
}

// Single fetch with timeout + helpful errors
async function xfetch(url: string, { method = "GET", headers = {}, body, timeoutMs = 12000 }: FetchOptions = {}) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);

  console.log(`🚀 xfetch: Making request to: ${url}`, { method, headers, body });
  console.log(`🌐 Current origin: ${window.location.origin}`);
  console.log(`🔍 Browser info:`, {
    userAgent: navigator.userAgent,
    isSecureContext: window.isSecureContext,
    location: window.location.href
  });

  // For Lovable environments, try Supabase proxy first to bypass browser restrictions
  const hostname = window.location.hostname;
  console.log(`🔍 Hostname check: ${hostname}`);
  console.log(`🔍 Contains lovableproject.com: ${hostname.includes('lovableproject.com')}`);
  console.log(`🔍 Contains lovable.app: ${hostname.includes('lovable.app')}`);

  if (hostname.includes('lovableproject.com') || hostname.includes('lovable.app')) {
    console.log("🔄 Detected Lovable environment, trying Supabase proxy first...");
    try {
      return await xfetchProxy(url, { method, headers, body, timeoutMs });
    } catch (proxyError) {
      console.warn("⚠️ Proxy approach failed, falling back to direct fetch:", proxyError);
      // Continue with direct fetch below
    }
  } else {
    console.log("🏠 Not a Lovable environment, using direct fetch");
  }

  try {
    // Test CORS preflight for POST requests
    if (method === "POST") {
      console.log("🧪 Testing CORS preflight (OPTIONS) first...");
      try {
        const preflightResponse = await fetch(url, {
          method: "OPTIONS",
          headers: {
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-api-key",
            "Origin": window.location.origin
          },
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
        });
        console.log(`🔍 Preflight result: ${preflightResponse.status}`, {
          status: preflightResponse.status,
          headers: Object.fromEntries(preflightResponse.headers.entries())
        });
      } catch (preflightError) {
        console.error("❌ CORS preflight failed:", preflightError);
        throw new Error(`CORS preflight failed: ${preflightError.message}. The server may not support OPTIONS requests or CORS is misconfigured.`);
      }
    }

    // Add cache-busting timestamp to force fresh request
    const cacheBuster = `?t=${Date.now()}&r=${Math.random()}`;
    const finalUrl = url.includes('?') ? `${url}&${cacheBuster.slice(1)}` : `${url}${cacheBuster}`;

    console.log(`🔄 Making actual POST request to: ${finalUrl}`);
    console.log(`📋 Request details:`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    });

    const r = await fetch(finalUrl, {
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
    } else if (e instanceof TypeError && e.message === 'Failed to fetch') {
      throw new Error(`Network error: Cannot connect to ${url}. This might be:\n- Mixed content (HTTPS → HTTP) blocked by browser\n- CORS preflight failure\n- Gateway service is down\n- Network connectivity issues`);
    } else {
      throw new Error(`Network error: ${e.message}`);
    }
  }
}

// Health check for the gateway
export async function healthGateway() {
  if (GATEWAY_BASE === "mock") return { status: "ok", service: "gateway-mock" };
  return xfetch(`${GATEWAY_BASE}/health`);
}

// Proxy function using Supabase edge function for Lovable environments
async function xfetchProxy(url: string, { method = "GET", headers = {}, body, timeoutMs = 12000 }: FetchOptions = {}) {
  console.log(`🔄 Using Supabase proxy for: ${url}`);
  console.log(`🔄 Proxy method: ${method}, body:`, body);

  // Use the generic 'proxy' endpoint on the function
  const proxyUrl = `https://bgczwmnqxmxusfwapqcn.supabase.co/functions/v1/gateway-proxy/proxy`;

  console.log(`🔄 Proxy URL: ${proxyUrl}`);
  console.log(`🔄 Target URL: ${url}`);

  const requestBody = method === "GET" ? undefined : JSON.stringify(body || {});
  console.log(`🔄 Proxy request body:`, requestBody);

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const response = await fetch(proxyUrl, {
      method: method, // Use the original method (POST/GET)
      headers: {
        "Content-Type": "application/json",
        "x-target-url": url, // Tell the proxy where to send the request
        ...headers
      },
      body: requestBody,
      signal: ctrl.signal,
    });

    clearTimeout(to);
    console.log(`🔄 Proxy response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🔄 Proxy error response:`, errorText);

      if (response.status === 404) {
        throw new Error(`Gateway proxy function not deployed or endpoint not found. Please check Supabase Functions deployment.`);
      } else if (response.status === 500) {
        throw new Error(`Gateway proxy internal error. Details: ${errorText}`);
      }

      throw new Error(`Proxy error: ${response.status} ${response.statusText}: ${errorText}`);
    }

    // Some services might return text/plain (like Ban service sometimes)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      console.log(`🔄 Proxy success response:`, result);
      return result;
    } else {
      const textResult = await response.text();
      console.log(`🔄 Proxy success response (text):`, textResult);
      // Try to parse if it looks like JSON
      try {
        return JSON.parse(textResult);
      } catch {
        return { text: textResult };
      }
    }
  } catch (e) {
    clearTimeout(to);

    if (e.name === 'AbortError') {
      throw new Error(`Proxy request timed out after ${timeoutMs}ms. Gateway may be down or slow.`);
    }

    throw e;
  }
}

// Check if gateway proxy is deployed and working
export async function checkProxyDeployment(): Promise<{ deployed: boolean; error?: string }> {
  try {
    const proxyUrl = `https://bgczwmnqxmxusfwapqcn.supabase.co/functions/v1/gateway-proxy/health`;
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (response.status === 404) {
      return {
        deployed: false,
        error: "Function not found (404). Deploy gateway-proxy to Supabase."
      };
    }

    if (!response.ok) {
      const errorText = await response.text();
      return {
        deployed: true,
        error: `Proxy deployed but returned ${response.status}: ${errorText}`
      };
    }

    return { deployed: true };
  } catch (error) {
    return {
      deployed: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// All health checks now use the gateway
export async function healthPII() {
  return healthGateway();
}

export async function healthTox() {
  return healthGateway();
}

export async function healthJail() {
  return healthGateway();
}

export async function healthBan() {
  return healthGateway();
}

export async function healthPolicy() {
  return healthGateway();
}

export async function healthSecrets() {
  return healthGateway();
}

export async function healthFormat() {
  return healthGateway();
}

export async function healthGibberish() {
  return healthGateway();
}

// =================== UNIFIED CONTENT MODERATION API ===================

// Main validation function using the Content Moderation Gateway
export async function validateContent(text: string, options: {
  check_bias?: boolean;
  check_toxicity?: boolean;
  check_pii?: boolean;
  check_secrets?: boolean;
  check_jailbreak?: boolean;
  check_format?: boolean;
  check_gibberish?: boolean;
  action_on_fail?: "refrain" | "filter" | "mask";
  entities?: string[];
  expressions?: string[];
  return_spans?: boolean;
  gibberish_threshold?: number;
  gibberish_min_length?: number;
} = {}) {
  console.log('validateContent called with:', { text, options, GATEWAY_BASE });

  if (GATEWAY_BASE === "mock") {
    // Mock unified validation
    const hasIssues = text.toLowerCase().includes("test") || text.toLowerCase().includes("example");

    return {
      status: hasIssues ? "blocked" : "pass",
      clean_text: hasIssues ? "" : text,
      blocked_categories: hasIssues ? ["test_content"] : [],
      reasons: hasIssues ? ["Test content detected"] : ["Content is safe"],
      flagged: hasIssues ? [{ type: "test", score: 0.8 }] : [],
      steps: [{ name: "unified_check", passed: !hasIssues, details: { gateway: "mock" } }]
    };
  }

  const requestBody = {
    text,
    check_bias: options.check_bias !== undefined ? options.check_bias : true,
    check_toxicity: options.check_toxicity !== undefined ? options.check_toxicity : true,
    check_pii: options.check_pii !== undefined ? options.check_pii : true,
    check_secrets: options.check_secrets !== undefined ? options.check_secrets : true,
    check_jailbreak: options.check_jailbreak !== undefined ? options.check_jailbreak : true,
    check_format: options.check_format !== undefined ? options.check_format : true,
    check_gibberish: options.check_gibberish !== undefined ? options.check_gibberish : true,
    action_on_fail: options.action_on_fail || "refrain",
    return_spans: options.return_spans !== undefined ? options.return_spans : true,
    ...(options.entities && { entities: options.entities })
  };

  console.log('Gateway Request URL:', `${GATEWAY_BASE}/validate`);
  console.log('Gateway Request Body:', requestBody);
  console.log('Gateway Request Headers:', { "X-API-Key": GATEWAY_KEY });

  // Test health endpoint first for debugging
  console.log('🏥 Testing health endpoint first...');
  try {
    const healthResult = await xfetch(`${GATEWAY_BASE}/health`);
    console.log('✅ Health check passed:', healthResult);
  } catch (healthError) {
    console.error('❌ Health check failed:', healthError);
    throw new Error(`Gateway unreachable: ${healthError.message}`);
  }

  try {
    const result = await xfetch(`${GATEWAY_BASE}/validate`, {
      method: "POST",
      headers: { "X-API-Key": GATEWAY_KEY },
      body: requestBody,
    });

    console.log('Gateway Response:', result);

    // Gateway returns envelope with nested results map
    // Envelope: { status, clean_text, blocked_categories, reasons, results: { policy: {...}, ban: {...}, ... } }
    return {
      ...result,
      // Expose nested service results at top level for backward compatibility
      serviceResults: result.results || {}
    };
  } catch (error) {
    console.error('Content Validation Error:', error);
    throw error;
  }
}

// =================== DIRECT SERVICE API FUNCTIONS ===================
// These functions call individual backend services directly

export async function validatePII(text: string, entities?: string[], return_spans?: boolean) {
  console.log('validatePII called with:', { text, entities, return_spans });
  console.log('Using PII service at:', SERVICE_ENDPOINTS.PII);

  // Try direct service first, then fall back to mock
  try {
    const result = await xfetch(`${SERVICE_ENDPOINTS.PII}/detect`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY },
      body: {
        text,
        entities: entities || ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "US_SSN", "PERSON", "LOCATION", "IN_AADHAAR", "IN_PAN"],
        return_spans: return_spans !== undefined ? return_spans : true
      }
    });

    console.log('PII Service Response:', result);
    return result;
  } catch (error) {
    console.error('PII Service Error, falling back to mock:', error);

    // Fall back to mock response
    console.log('Using mock PII response');
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b|\b\d{10}\b/;
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/;
    const creditCardRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;

    const hasPII = emailRegex.test(text) ||
      phoneRegex.test(text) ||
      ssnRegex.test(text) ||
      creditCardRegex.test(text) ||
      text.toLowerCase().includes("john doe") ||
      text.toLowerCase().includes("new york");

    return {
      status: hasPII ? "flagged" : "pass",
      clean_text: hasPII ? text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g, "[EMAIL]")
        .replace(/\b\d{3}-\d{3}-\d{4}\b|\b\d{10}\b/g, "[PHONE]")
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN]")
        .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[CREDIT_CARD]") : text,
      flagged: hasPII ? [{ type: "pii", score: 0.9 }] : [],
      reasons: hasPII ? ["PII detected (mock)"] : ["No PII detected (mock)"],
      spans: []
    };
  }
}

export async function validateTox(text: string, return_spans?: boolean) {
  console.log('validateTox called with:', { text, return_spans });
  console.log('Using Toxicity service at:', SERVICE_ENDPOINTS.TOXICITY);

  // If endpoint is "mock", return mock response immediately
  if (SERVICE_ENDPOINTS.TOXICITY === "mock") {
    console.log('Using mock toxicity response');
    const hasToxicity = text.toLowerCase().includes("stupid") ||
      text.toLowerCase().includes("hate") ||
      text.toLowerCase().includes("kill") ||
      text.toLowerCase().includes("idiot");

    return {
      status: hasToxicity ? "flagged" : "pass",
      clean_text: hasToxicity ? "" : text,
      flagged: hasToxicity ? [{ type: "toxicity", score: 0.7 }] : [],
      reasons: hasToxicity ? ["Toxic language detected (mock)"] : ["No toxicity detected (mock)"],
      spans: []
    };
  }

  // Try direct service first, then fall back to gateway
  try {
    const result = await xfetch(`${SERVICE_ENDPOINTS.TOXICITY}/detect`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY },
      body: {
        text,
        return_spans: return_spans !== undefined ? return_spans : true
      }
    });

    console.log('Toxicity Service Response:', result);
    return result;
  } catch (error) {
    console.error('Toxicity Service Error, falling back to gateway:', error);

    // Fall back to gateway
    try {
      const result = await validateContent(text, {
        check_toxicity: true,
        check_pii: false,
        check_secrets: false,
        check_jailbreak: false,
        check_format: false,
        check_gibberish: false,
        return_spans: return_spans !== undefined ? return_spans : true,
        action_on_fail: "refrain"
      });

      // Extract just the toxicity service result from gateway response
      if (result.serviceResults && result.serviceResults.toxicity) {
        console.log('Toxicity Gateway Response:', result.serviceResults.toxicity);
        return result.serviceResults.toxicity;
      }

      // Fallback to mock response if gateway doesn't have toxicity service
      console.log('Gateway does not have toxicity service, returning mock response');
      const hasToxicity = text.toLowerCase().includes("stupid") ||
        text.toLowerCase().includes("hate") ||
        text.toLowerCase().includes("kill") ||
        text.toLowerCase().includes("idiot");

      return {
        status: hasToxicity ? "flagged" : "pass",
        clean_text: hasToxicity ? "" : text,
        flagged: hasToxicity ? [{ type: "toxicity", score: 0.7 }] : [],
        reasons: hasToxicity ? ["Toxic language detected (fallback)"] : ["No toxicity detected (fallback)"],
        spans: []
      };
    } catch (gatewayError) {
      console.error('Gateway also failed:', gatewayError);
      throw new Error(`Both toxicity service and gateway failed. Service error: ${error.message}, Gateway error: ${gatewayError.message}`);
    }
  }
}

export async function validateJailbreak(text: string, return_spans?: boolean, useDistilBERT: boolean = false) {
  console.log('validateJailbreak called with:', { text, return_spans, useDistilBERT });

  // Choose between RoBERTa (default) or DistilBERT model
  const endpoint = useDistilBERT ? SERVICE_ENDPOINTS.JAILBREAK_DISTILBERT : SERVICE_ENDPOINTS.JAILBREAK_ROBERTA;
  console.log('Using Jailbreak service at:', endpoint);

  // Try direct service first, then fall back to mock
  try {
    const result = await xfetch(`${endpoint}/detect`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY },
      body: {
        text,
        return_spans: return_spans !== undefined ? return_spans : true
      }
    });

    console.log('Jailbreak Service Response:', result);
    return result;
  } catch (error) {
    console.error('Jailbreak Service Error, falling back to mock:', error);

    // Fall back to mock response
    console.log('Using mock jailbreak response');
    const jailbreakKeywords = [
      "ignore instructions", "disregard", "bypass", "override", "system prompt",
      "jailbreak", "roleplay", "hypothetical", "pretend", "simulate",
      "developer mode", "administrator", "override safety", "ignore policy"
    ];

    const hasJailbreak = jailbreakKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    ) || text.toLowerCase().includes("dan") || text.toLowerCase().includes("evil mode");

    return {
      status: hasJailbreak ? "flagged" : "pass",
      clean_text: hasJailbreak ? "" : text,
      flagged: hasJailbreak ? [{ type: "jailbreak", score: 0.85 }] : [],
      reasons: hasJailbreak ? ["Jailbreak attempt detected (mock)"] : ["No jailbreak detected (mock)"],
      spans: []
    };
  }
}

export async function validateBan(text: string, return_spans?: boolean) {
  console.log('validateBan called with:', { text, return_spans });
  console.log('Using Ban/Content service at:', SERVICE_ENDPOINTS.BAN);

  // Try direct service first, then fall back to mock
  try {
    const result = await xfetch(`${SERVICE_ENDPOINTS.BAN}/check`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY },
      body: {
        text,
        return_spans: return_spans !== undefined ? return_spans : true
      }
    });

    console.log('Ban Service Response:', result);
    return result;
  } catch (error) {
    console.error('Ban Service Error, falling back to mock:', error);

    // Fall back to mock response
    console.log('Using mock ban response');
    const banKeywords = [
      "spam", "scam", "fraud", "illegal", "drugs", "weapon", "violence",
      "hate speech", "discrimination", "harassment", "threat", "abuse",
      "offensive", "inappropriate", "profanity", "vulgar"
    ];

    const hasBannedContent = banKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    ) || text.toLowerCase().includes("xxx") || text.toLowerCase().includes("adult content");

    return {
      status: hasBannedContent ? "flagged" : "pass",
      clean_text: hasBannedContent ? "" : text,
      flagged: hasBannedContent ? [{ type: "ban", score: 0.9 }] : [],
      reasons: hasBannedContent ? ["Banned content detected (mock)"] : ["No banned content detected (mock)"],
      spans: []
    };
  }
}

export async function validatePolicy(text: string, return_spans?: boolean) {
  console.log('validatePolicy called with:', { text, return_spans });

  // Policy service uses the gateway for now (LlamaGuard model)
  return validateContent(text, {
    check_bias: true,
    check_toxicity: false,
    check_pii: false,
    check_secrets: false,
    check_jailbreak: false,
    check_format: false,
    check_gibberish: false,
    return_spans: return_spans !== undefined ? return_spans : true,
    action_on_fail: "refrain"
  });
}

export async function validateSecrets(text: string, return_spans?: boolean) {
  console.log('validateSecrets called with:', { text, return_spans });
  console.log('Using Secrets service at:', SERVICE_ENDPOINTS.SECRETS);

  // Try direct service first, then fall back to gateway
  try {
    const result = await xfetch(`${SERVICE_ENDPOINTS.SECRETS}/detect`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY },
      body: {
        text,
        return_spans: return_spans !== undefined ? return_spans : true
      }
    });

    console.log('Secrets Service Response:', result);
    return result;
  } catch (error) {
    console.error('Secrets Service Error, falling back to mock:', error);

    // Fall back to mock response
    console.log('Using mock secrets response');
    const hasSecrets = text.toLowerCase().includes("password") ||
      text.toLowerCase().includes("secret") ||
      text.toLowerCase().includes("api_key") ||
      text.toLowerCase().includes("token") ||
      text.includes("sk-") ||
      text.match(/\b[A-Za-z0-9]{20,}\b/);

    return {
      status: hasSecrets ? "flagged" : "pass",
      clean_text: hasSecrets ? "" : text,
      flagged: hasSecrets ? [{ type: "secret", score: 0.8 }] : [],
      reasons: hasSecrets ? ["Secret detected (mock)"] : ["No secrets detected (mock)"],
      spans: []
    };
  }
}

export async function validateFormat(text: string, expressions?: string[], return_spans?: boolean) {
  console.log('validateFormat called with:', { text, expressions, return_spans });
  console.log('Using Format service at:', SERVICE_ENDPOINTS.FORMAT);

  // Try direct service first, then fall back to mock
  try {
    const result = await xfetch(`${SERVICE_ENDPOINTS.FORMAT}/validate`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY },
      body: {
        text,
        expressions: expressions || [],
        return_spans: return_spans !== undefined ? return_spans : true
      }
    });

    console.log('Format Service Response:', result);
    return result;
  } catch (error) {
    console.error('Format Service Error, falling back to mock:', error);

    // Fall back to mock response
    console.log('Using mock format response');
    const hasFormatIssue = !expressions || expressions.length === 0 ?
      text.length < 5 || text.length > 1000 :
      !expressions.every(expr => {
        try {
          new RegExp(expr);
          return true;
        } catch {
          return false;
        }
      });

    return {
      status: hasFormatIssue ? "flagged" : "pass",
      clean_text: hasFormatIssue ? "" : text,
      flagged: hasFormatIssue ? [{ type: "format", score: 0.6 }] : [],
      reasons: hasFormatIssue ? ["Format violation (mock)"] : ["Format valid (mock)"],
      spans: []
    };
  }
}

export async function validateGibberish(text: string, threshold?: number, min_length?: number, return_spans?: boolean) {
  console.log('validateGibberish called with:', { text, threshold, min_length, return_spans });
  console.log('Using Gibberish service at:', SERVICE_ENDPOINTS.GIBBERISH);

  // Try direct service first, then fall back to mock
  try {
    const result = await xfetch(`${SERVICE_ENDPOINTS.GIBBERISH}/detect`, {
      method: "POST",
      headers: { "X-API-Key": API_KEY },
      body: {
        text,
        threshold: threshold || 0.8,
        min_length: min_length || 10,
        return_spans: return_spans !== undefined ? return_spans : true
      }
    });

    console.log('Gibberish Service Response:', result);
    return result;
  } catch (error) {
    console.error('Gibberish Service Error, falling back to mock:', error);

    // Fall back to mock response
    console.log('Using mock gibberish response');

    // Simple heuristics to detect gibberish

    // Check for repetitive characters, random character sequences, or unusual patterns
    const hasRepeatingChars = /(.)\1{3,}/.test(text); // 4+ same chars in a row
    const hasManyConsonants = text.match(/[^aeiou\s]{4,}/i) !== null; // 4+ consecutive consonants
    const isTooShort = text.length < (min_length || 10);
    const hasUnusualRatio = /[aeiou]/i.test(text) && (text.match(/[aeiou]/gi) || []).length / text.length < 0.1; // Less than 10% vowels

    // Calculate a simple gibberish score
    let gibberishScore = 0;
    if (hasRepeatingChars) gibberishScore += 0.3;
    if (hasManyConsonants) gibberishScore += 0.3;
    if (isTooShort) gibberishScore += 0.2;
    if (hasUnusualRatio) gibberishScore += 0.2;

    const hasGibberish = gibberishScore > (threshold || 0.8);

    return {
      status: hasGibberish ? "flagged" : "pass",
      clean_text: hasGibberish ? "" : text,
      flagged: hasGibberish ? [{ type: "gibberish", score: gibberishScore }] : [],
      reasons: hasGibberish ? ["Gibberish detected (mock)"] : ["Text is coherent (mock)"],
      spans: []
    };
  }
}

// =================== ADMIN API FUNCTIONS ===================
// Legacy admin functions for individual services (uses original endpoints for admin operations)

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
  // Admin operations still use individual service endpoints
  const PII_BASE = import.meta.env.VITE_PII_ENDPOINT || "http://52.170.163.62:8000";

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
  const PII_BASE = import.meta.env.VITE_PII_ENDPOINT || "http://52.170.163.62:8000";

  if (PII_BASE === "mock") {
    return { entities: [], placeholders: [], thresholds: [] };
  }

  return xfetch(`${PII_BASE}/admin/entities`, {
    headers: { "x-api-key": PII_ADMIN_KEY },
  });
}

export async function clearPIIEntities() {
  const PII_BASE = import.meta.env.VITE_PII_ENDPOINT || "http://52.170.163.62:8000";

  if (PII_BASE === "mock") {
    return { status: "success", message: "PII entities cleared (mock)" };
  }

  return xfetch(`${PII_BASE}/admin/entities`, {
    method: "DELETE",
    headers: { "x-api-key": PII_ADMIN_KEY },
  });
}

// Jailbreak Admin Functions
export async function addJailbreakRules(config: {
  custom_patterns?: Array<{
    pattern: string;
    description: string;
    severity: number;
  }>;
  custom_thresholds?: {
    classifier_threshold?: number;
    similarity_threshold?: number;
  };
}) {
  const JAIL_BASE = import.meta.env.VITE_JAIL_ENDPOINT || "http://localhost:8002";

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
  const JAIL_BASE = import.meta.env.VITE_JAIL_ENDPOINT || "http://localhost:8002";

  if (JAIL_BASE === "mock") {
    return { patterns: [], thresholds: {} };
  }

  return xfetch(`${JAIL_BASE}/admin/rules`, {
    headers: { "x-api-key": JAIL_ADMIN_KEY },
  });
}

export async function clearJailbreakRules() {
  const JAIL_BASE = import.meta.env.VITE_JAIL_ENDPOINT || "http://localhost:8002";

  if (JAIL_BASE === "mock") {
    return { status: "success", message: "Jailbreak rules cleared (mock)" };
  }

  return xfetch(`${JAIL_BASE}/admin/rules`, {
    method: "DELETE",
    headers: { "x-api-key": JAIL_ADMIN_KEY },
  });
}

// Policy Admin Functions
export async function addPolicyRules(config: {
  custom_policies?: Array<{
    name: string;
    description: string;
    rules: string[];
  }>;
  custom_categories?: Array<{
    category: string;
    severity: number;
    action: string;
  }>;
}) {
  const POLICY_BASE = import.meta.env.VITE_POLICY_ENDPOINT || "http://localhost:8003";

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
  const POLICY_BASE = import.meta.env.VITE_POLICY_ENDPOINT || "http://localhost:8003";

  if (POLICY_BASE === "mock") {
    return { policies: [], categories: [] };
  }

  return xfetch(`${POLICY_BASE}/admin/policies`, {
    headers: { "x-api-key": POLICY_ADMIN_KEY },
  });
}

export async function clearPolicyRules() {
  const POLICY_BASE = import.meta.env.VITE_POLICY_ENDPOINT || "http://localhost:8003";

  if (POLICY_BASE === "mock") {
    return { status: "success", message: "Policy rules cleared (mock)" };
  }

  return xfetch(`${POLICY_BASE}/admin/policies`, {
    method: "DELETE",
    headers: { "x-api-key": POLICY_ADMIN_KEY },
  });
}

// Ban Admin Functions
export async function addBanRules(config: {
  custom_terms?: Array<{
    term: string;
    category: string;
    severity: number;
  }>;
  custom_lists?: Array<{
    name: string;
    terms: string[];
    mode: string;
  }>;
}) {
  const BAN_BASE = import.meta.env.VITE_BAN_ENDPOINT || "http://localhost:8004";

  if (BAN_BASE === "mock") {
    return { status: "success", message: "Custom ban rules added (mock)" };
  }

  return xfetch(`${BAN_BASE}/admin/banlist`, {
    method: "POST",
    headers: { "x-api-key": BAN_ADMIN_KEY },
    body: config,
  });
}

export async function getBanRules() {
  const BAN_BASE = import.meta.env.VITE_BAN_ENDPOINT || "http://localhost:8004";

  if (BAN_BASE === "mock") {
    return { terms: [], lists: [] };
  }

  return xfetch(`${BAN_BASE}/admin/banlist`, {
    headers: { "x-api-key": BAN_ADMIN_KEY },
  });
}

export async function clearBanRules() {
  const BAN_BASE = import.meta.env.VITE_BAN_ENDPOINT || "http://localhost:8004";

  if (BAN_BASE === "mock") {
    return { status: "success", message: "Ban rules cleared (mock)" };
  }

  return xfetch(`${BAN_BASE}/admin/banlist`, {
    method: "DELETE",
    headers: { "x-api-key": BAN_ADMIN_KEY },
  });
}

// Secrets Admin Functions
export async function addSecretsSignatures(config: {
  custom_signatures?: Array<{
    name: string;
    pattern: string;
    category: string;
    severity: number;
  }>;
  custom_entropy_rules?: {
    entropy_threshold?: number;
    min_length?: number;
  };
}) {
  const SECRETS_BASE = import.meta.env.VITE_SECRETS_ENDPOINT || "http://localhost:8005";

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
  const SECRETS_BASE = import.meta.env.VITE_SECRETS_ENDPOINT || "http://localhost:8005";

  if (SECRETS_BASE === "mock") {
    return { signatures: [], entropy_rules: {} };
  }

  return xfetch(`${SECRETS_BASE}/admin/signatures`, {
    headers: { "x-api-key": SECRETS_ADMIN_KEY },
  });
}

export async function clearSecretsSignatures() {
  const SECRETS_BASE = import.meta.env.VITE_SECRETS_ENDPOINT || "http://localhost:8005";

  if (SECRETS_BASE === "mock") {
    return { status: "success", message: "Secrets signatures cleared (mock)" };
  }

  return xfetch(`${SECRETS_BASE}/admin/signatures`, {
    method: "DELETE",
    headers: { "x-api-key": SECRETS_ADMIN_KEY },
  });
}

// Format Admin Functions
export async function addFormatExpressions(config: {
  custom_expressions?: Array<{
    name: string;
    expression: string;
    description: string;
  }>;
  custom_variables?: Array<{
    name: string;
    pattern: string;
    description: string;
  }>;
}) {
  const FORMAT_BASE = import.meta.env.VITE_FORMAT_ENDPOINT || "http://localhost:8006";

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
  const FORMAT_BASE = import.meta.env.VITE_FORMAT_ENDPOINT || "http://localhost:8006";

  if (FORMAT_BASE === "mock") {
    return { expressions: [], variables: [] };
  }

  return xfetch(`${FORMAT_BASE}/admin/expressions`, {
    headers: { "x-api-key": FORMAT_ADMIN_KEY },
  });
}

export async function clearFormatExpressions() {
  const FORMAT_BASE = import.meta.env.VITE_FORMAT_ENDPOINT || "http://localhost:8006";

  if (FORMAT_BASE === "mock") {
    return { status: "success", message: "Format expressions cleared (mock)" };
  }

  return xfetch(`${FORMAT_BASE}/admin/expressions`, {
    method: "DELETE",
    headers: { "x-api-key": FORMAT_ADMIN_KEY },
  });
}

// Gibberish Admin Functions
export async function addGibberishRules(config: {
  threshold?: number;
  min_length?: number;
  custom_patterns?: Array<{
    pattern: string;
    description: string;
    weight: number;
  }>;
}) {
  const GIBBERISH_BASE = import.meta.env.VITE_GIBBERISH_ENDPOINT || "http://localhost:8007";

  if (GIBBERISH_BASE === "mock") {
    return { status: "success", message: "Custom gibberish rules added (mock)" };
  }

  return xfetch(`${GIBBERISH_BASE}/admin/rules`, {
    method: "POST",
    headers: { "x-api-key": GIBBERISH_ADMIN_KEY },
    body: config,
  });
}

export async function getGibberishRules() {
  const GIBBERISH_BASE = import.meta.env.VITE_GIBBERISH_ENDPOINT || "http://localhost:8007";

  if (GIBBERISH_BASE === "mock") {
    return { threshold: 0.8, min_length: 10, patterns: [] };
  }

  return xfetch(`${GIBBERISH_BASE}/admin/rules`, {
    headers: { "x-api-key": GIBBERISH_ADMIN_KEY },
  });
}

export async function clearGibberishRules() {
  const GIBBERISH_BASE = import.meta.env.VITE_GIBBERISH_ENDPOINT || "http://localhost:8007";

  if (GIBBERISH_BASE === "mock") {
    return { status: "success", message: "Gibberish rules cleared (mock)" };
  }

  return xfetch(`${GIBBERISH_BASE}/admin/rules`, {
    method: "DELETE",
    headers: { "x-api-key": GIBBERISH_ADMIN_KEY },
  });
}