// Gateway Response Parser
// Parses the nested results map from the Content Moderation Gateway

export interface GatewayEnvelope {
  status: 'pass' | 'fixed' | 'blocked' | 'error';
  clean_text?: string;
  blocked_categories?: string[];
  reasons?: string[];
  results?: {
    policy?: ServiceResult;
    ban?: ServiceResult;
    toxicity?: ServiceResult;
    pii?: ServiceResult;
    secrets?: ServiceResult;
    format?: ServiceResult;
    gibberish?: ServiceResult;
    jailbreak?: ServiceResult;
  };
}

export interface ServiceResult {
  status: 'pass' | 'fixed' | 'blocked' | 'error';
  clean_text?: string;
  reasons?: string[];
  flagged_categories?: string[];
  flagged_terms?: string[];
  flagged_spans?: Array<{
    start: number;
    end: number;
    type: string;
    text: string;
  }>;
  entities?: Array<{
    type: string;
    value: string;
    offset: number;
    replacement?: string;
  }>;
  flagged_secrets?: Array<{
    id: string;
    category: string;
    severity: string;
    snippet: string;
  }>;
  matched_expression?: string;
  extracted_variables?: Record<string, any>;
  is_gibberish?: boolean;
  confidence?: number;
  coverage?: number;
  flagged_signatures?: string[];
  scores?: Record<string, number>;
  steps?: Array<{
    name: string;
    passed: boolean;
    details?: any;
  }>;
}

export interface ParsedGatewayResponse {
  // Envelope-level data
  overallStatus: 'pass' | 'fixed' | 'blocked' | 'error';
  cleanText?: string;
  blockedCategories: string[];
  reasons: string[];
  
  // Per-service results
  serviceResults: {
    policy?: ServiceResult;
    ban?: ServiceResult;
    toxicity?: ServiceResult;
    pii?: ServiceResult;
    secrets?: ServiceResult;
    format?: ServiceResult;
    gibberish?: ServiceResult;
    jailbreak?: ServiceResult;
  };
  
  // UI helpers
  hasIssues: boolean;
  flaggedServices: string[];
  allSpans: Array<{
    service: string;
    start: number;
    end: number;
    type: string;
    text: string;
  }>;
}

/**
 * Parse the gateway response envelope and extract per-service results
 */
export function parseGatewayResponse(response: GatewayEnvelope): ParsedGatewayResponse {
  const serviceResults = response.results || {};
  
  // Collect all flagged services
  const flaggedServices = Object.entries(serviceResults)
    .filter(([_, result]) => result.status === 'blocked' || result.status === 'fixed')
    .map(([service, _]) => service);
  
  // Collect all spans across services
  const allSpans: Array<{
    service: string;
    start: number;
    end: number;
    type: string;
    text: string;
  }> = [];
  
  Object.entries(serviceResults).forEach(([service, result]) => {
    if (result.flagged_spans) {
      result.flagged_spans.forEach(span => {
        allSpans.push({
          service,
          ...span
        });
      });
    }
  });
  
  return {
    overallStatus: response.status,
    cleanText: response.clean_text,
    blockedCategories: response.blocked_categories || [],
    reasons: response.reasons || [],
    serviceResults,
    hasIssues: response.status === 'blocked' || response.status === 'fixed',
    flaggedServices,
    allSpans
  };
}

/**
 * Get human-readable service name
 */
export function getServiceDisplayName(service: string): string {
  const names: Record<string, string> = {
    policy: 'Policy/Bias',
    ban: 'Banned Terms',
    toxicity: 'Toxicity',
    pii: 'PII Detection',
    secrets: 'Secrets Detection',
    format: 'Format Validation',
    gibberish: 'Gibberish Detection',
    jailbreak: 'Jailbreak Protection'
  };
  return names[service] || service.toUpperCase();
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pass':
      return 'text-green-600';
    case 'fixed':
      return 'text-yellow-600';
    case 'blocked':
      return 'text-red-600';
    case 'error':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get status icon for UI
 */
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pass':
      return '✓';
    case 'fixed':
      return '⚠';
    case 'blocked':
      return '✗';
    case 'error':
      return '?';
    default:
      return '•';
  }
}

/**
 * Format reasons for display
 */
export function formatReasons(reasons: string[] | undefined): string {
  if (!reasons || reasons.length === 0) return 'No issues detected';
  return reasons.join('; ');
}

/**
 * Extract highlights for UI (e.g., click-to-highlight)
 */
export function extractHighlights(parsed: ParsedGatewayResponse): Array<{
  text: string;
  service: string;
  type: string;
  offset: number;
  length: number;
}> {
  return parsed.allSpans.map(span => ({
    text: span.text,
    service: span.service,
    type: span.type,
    offset: span.start,
    length: span.end - span.start
  }));
}
