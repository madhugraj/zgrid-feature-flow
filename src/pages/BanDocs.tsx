import { Code } from "@/components/Code";

export default function BanDocs() {
  const endpoint = "http://localhost:8004";
  const curlExample = `curl -s -X POST ${endpoint}/validate \\
  -H 'content-type: application/json' \\
  -H "x-api-key: supersecret123" \\
  -d '{
    "text": "This looks like ScamCoin. Extreme violence content ahead.",
    "mode": "whole_word",
    "action_on_fail": "mask",
    "lists": ["default"],
    "case_sensitive": false,
    "return_spans": true
  }'`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Ban / Bias & Brand-Safety API
            </h1>
            <p className="text-xl text-muted-foreground">
              Block or sanitize banned terms, slurs, and brand-unsafe content with flexible matching modes
            </p>
          </div>

          {/* Service Overview */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Service Overview</h2>
            <p className="text-muted-foreground">
              Comprehensive content filtering service that blocks or sanitizes banned terms, phrases, slurs, and brand-unsafe words. 
              Supports multiple matching modes including exact, whole-word, substring, and regex patterns with optional whitelists.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Matching Modes</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code>exact</code> - Exact string match</li>
                  <li>• <code>whole_word</code> - Word boundary match</li>
                  <li>• <code>substring</code> - Contains match</li>
                  <li>• <code>regex</code> - Pattern matching</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Actions</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code>mask</code> - Replace with ***</li>
                  <li>• <code>filter</code> - Remove content</li>
                  <li>• <code>refrain</code> - Block request</li>
                  <li>• <code>reask</code> - Request rephrase</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">API Endpoints</h2>
            
            <div className="space-y-4">
              <div className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-sm font-mono">GET</span>
                  <code className="text-foreground">/health</code>
                </div>
                <p className="text-sm text-muted-foreground">Health check endpoint</p>
              </div>
              
              <div className="border border-border/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-sm font-mono">POST</span>
                  <code className="text-foreground">/validate</code>
                </div>
                <p className="text-sm text-muted-foreground">Validate and filter banned content</p>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Authentication</h2>
            <p className="text-muted-foreground">
              All requests require an API key sent via the <code>x-api-key</code> header.
            </p>
            <Code code="x-api-key: your-api-key-here" />
          </div>

          {/* Request Format */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Request Format</h2>
            <p className="text-muted-foreground">POST /validate</p>
            <Code
              code={`{
  "text": "This looks like ScamCoin. Extreme violence content ahead.",
  "mode": "whole_word",
  "action_on_fail": "mask",
  "lists": ["default"],
  "case_sensitive": false,
  "return_spans": true
}`}
            />
            
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Parameters</h3>
              <div className="grid gap-3">
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">text</code>
                  <span className="text-sm text-muted-foreground">Content to check for banned terms</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">mode</code>
                  <span className="text-sm text-muted-foreground">Matching mode: exact, whole_word, substring, regex</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">action_on_fail</code>
                  <span className="text-sm text-muted-foreground">Action when banned content found: mask, filter, refrain, reask</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">lists</code>
                  <span className="text-sm text-muted-foreground">Ban lists to check against (array of strings)</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">case_sensitive</code>
                  <span className="text-sm text-muted-foreground">Whether matching is case sensitive (boolean)</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">return_spans</code>
                  <span className="text-sm text-muted-foreground">Return character positions of banned terms (boolean)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Response Format</h2>
            <Code
              code={`{
  "status": "fixed",
  "clean_text": "This looks like ***. Extreme *** content ahead.",
  "flagged": [
    {
      "type": "ban",
      "token": "ScamCoin",
      "list": "brands",
      "span": [17, 25]
    },
    {
      "type": "ban",
      "token": "violence",
      "list": "safety",
      "span": [36, 44]
    }
  ],
  "steps": [
    {
      "name": "banlist",
      "passed": false,
      "details": {
        "hits": 2,
        "mode": "whole_word"
      }
    }
  ],
  "reasons": ["Terms masked"]
}`}
            />
          </div>

          {/* Status Values */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Response Status Values</h2>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-mono min-w-fit">pass</span>
                <span className="text-sm text-muted-foreground">No banned content detected</span>
              </div>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-mono min-w-fit">fixed</span>
                <span className="text-sm text-muted-foreground">Banned content masked or filtered</span>
              </div>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-mono min-w-fit">blocked</span>
                <span className="text-sm text-muted-foreground">Request blocked due to banned content</span>
              </div>
            </div>
          </div>

          {/* Ban Lists */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Ban Lists Management</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">List Types</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>default.txt:</strong> General banned terms</div>
                  <div>• <strong>brands.txt:</strong> Brand-unsafe terms and competitors</div>
                  <div>• <strong>safety.txt:</strong> Safety-related terms (violence, self-harm)</div>
                  <div>• <strong>compliance.txt:</strong> Regulatory compliance terms</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">File Formats</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>TXT files:</strong> One term per line</div>
                  <div>• <strong>JSON files:</strong> Array of strings</div>
                  <div>• <strong>Whitelists:</strong> Terms that bypass ban detection</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Test */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Quick Test</h2>
            <p className="text-muted-foreground">
              Test the ban detection endpoint with curl:
            </p>
            <Code code={curlExample} />
          </div>

          {/* Configuration */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Configuration & Tuning</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Key Environment Variables</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div><code>MATCH_MODE</code> - Default matching mode (whole_word recommended)</div>
                  <div><code>CASE_SENSITIVE</code> - Case sensitivity (0=false, 1=true)</div>
                  <div><code>NORMALIZE</code> - Text normalization (lowercasing, accent-folding)</div>
                  <div><code>MASK_TOKEN</code> - Replacement token for masking (default: ***)</div>
                  <div><code>LIST_DIR</code> - Directory containing ban lists</div>
                  <div><code>WHITELIST_DIR</code> - Directory containing whitelist files</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Advanced Features</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>Regex Mode:</strong> Use patterns like <code>(?i)\\bscam\\w+\\b</code></div>
                  <div>• <strong>Whitelists:</strong> Allow specific terms to bypass detection</div>
                  <div>• <strong>Multiple Lists:</strong> Check against multiple ban lists simultaneously</div>
                  <div>• <strong>Normalization:</strong> Handle variations in spelling and case</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}