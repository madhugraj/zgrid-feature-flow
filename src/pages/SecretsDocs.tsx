import { Code } from "@/components/Code";

export default function SecretsDocs() {
  const endpoint = "http://localhost:8005";
  const curlExample = `curl -s -X POST ${endpoint}/validate \\
  -H 'content-type: application/json' \\
  -H "x-api-key: supersecret123" \\
  -d '{
    "text": "AKIA... and sk_live_... and -----BEGIN RSA PRIVATE KEY-----\\n...",
    "action_on_fail": "mask",
    "categories": ["CLOUD", "DEV"],
    "return_spans": true
  }'`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Secrets Detection API
            </h1>
            <p className="text-xl text-muted-foreground">
              Find hard-coded credentials using regex signatures, entropy analysis, and context keywords
            </p>
          </div>

          {/* Service Overview */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Service Overview</h2>
            <p className="text-muted-foreground">
              Advanced secrets detection service that identifies hard-coded credentials in text using a combination of 
              regex signatures, entropy analysis, and contextual keywords. Operates entirely locally with no external API calls.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Detection Methods</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Regex pattern matching</li>
                  <li>• Entropy threshold analysis</li>
                  <li>• Context keyword detection</li>
                  <li>• Multi-engine validation</li>
                  <li>• Configurable sensitivity</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Secret Categories</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code>CLOUD</code> - AWS, Azure, GCP keys</li>
                  <li>• <code>DEV</code> - GitHub, GitLab tokens</li>
                  <li>• <code>PAYMENTS</code> - Stripe, PayPal keys</li>
                  <li>• <code>DATABASE</code> - Connection strings</li>
                  <li>• <code>CRYPTO</code> - Private keys, certificates</li>
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
                <p className="text-sm text-muted-foreground">Scan text for hard-coded secrets and credentials</p>
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
  "text": "AKIA... and sk_live_... and -----BEGIN RSA PRIVATE KEY-----\\n...",
  "action_on_fail": "mask",
  "categories": ["CLOUD", "DEV"],
  "return_spans": true
}`}
            />
            
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Parameters</h3>
              <div className="grid gap-3">
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">text</code>
                  <span className="text-sm text-muted-foreground">Content to scan for secrets and credentials</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">action_on_fail</code>
                  <span className="text-sm text-muted-foreground">Action when secrets found: mask, filter, refrain, reask</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">categories</code>
                  <span className="text-sm text-muted-foreground">Secret categories to check: CLOUD, DEV, PAYMENTS, etc.</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">return_spans</code>
                  <span className="text-sm text-muted-foreground">Return character positions of detected secrets (boolean)</span>
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
  "clean_text": "AKIA*** and *** and ",
  "flagged": [
    {
      "type": "secret",
      "id": "AWS_ACCESS_KEY_ID",
      "category": "CLOUD",
      "engine": "regex",
      "severity": 5,
      "start": 0,
      "end": 20,
      "snippet": "AKIA..."
    },
    {
      "type": "secret",
      "id": "STRIPE_SECRET",
      "category": "PAYMENTS",
      "engine": "regex",
      "severity": 5,
      "start": 25,
      "end": 55
    }
  ],
  "steps": [
    {
      "name": "regex+entropy",
      "passed": false,
      "details": {
        "hits": 2,
        "enable_regex": true,
        "enable_entropy": true,
        "entropy_threshold": 4.0
      }
    }
  ],
  "reasons": ["Secrets masked"]
}`}
            />
          </div>

          {/* Status Values */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Response Status Values</h2>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-mono min-w-fit">pass</span>
                <span className="text-sm text-muted-foreground">No secrets detected in the content</span>
              </div>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-mono min-w-fit">fixed</span>
                <span className="text-sm text-muted-foreground">Secrets detected and masked/filtered</span>
              </div>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-mono min-w-fit">blocked</span>
                <span className="text-sm text-muted-foreground">Request blocked due to detected secrets</span>
              </div>
            </div>
          </div>

          {/* Secret Types */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Detected Secret Types</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Cloud & Infrastructure</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• <strong>AWS Access Keys:</strong> AKIA..., ASIA...</div>
                  <div>• <strong>AWS Secret Keys:</strong> Base64 encoded secrets</div>
                  <div>• <strong>Google API Keys:</strong> AIza... patterns</div>
                  <div>• <strong>Azure Keys:</strong> Various Azure service keys</div>
                  <div>• <strong>JWT Tokens:</strong> eyJ... encoded tokens</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">Development & Services</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• <strong>GitHub Tokens:</strong> ghp_..., gho_... patterns</div>
                  <div>• <strong>Stripe Keys:</strong> sk_live_..., pk_live_...</div>
                  <div>• <strong>Private Keys:</strong> RSA, SSH, PGP keys</div>
                  <div>• <strong>Database URLs:</strong> Connection strings</div>
                  <div>• <strong>API Keys:</strong> Generic high-entropy tokens</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detection Engines */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Detection Engines</h2>
            <div className="space-y-4">
              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Regex Engine</h3>
                <p className="text-sm text-muted-foreground">
                  Pattern-based detection using curated regex signatures for known secret formats.
                  High precision for well-defined credential patterns.
                </p>
              </div>
              
              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Entropy Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Statistical analysis of character randomness to identify high-entropy strings 
                  that may be encoded secrets or tokens.
                </p>
              </div>
              
              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Context Keywords</h3>
                <p className="text-sm text-muted-foreground">
                  Contextual analysis looking for keywords like "password", "token", "key" 
                  near potential secret values to reduce false positives.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Test */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Quick Test</h2>
            <p className="text-muted-foreground">
              Test the secrets detection endpoint with curl:
            </p>
            <Code code={curlExample} />
          </div>

          {/* Configuration */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Configuration & Tuning</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Detection Settings</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div><code>ENABLE_REGEX</code> - Enable regex pattern matching (1/0)</div>
                  <div><code>ENABLE_ENTROPY</code> - Enable entropy analysis (1/0)</div>
                  <div><code>ENABLE_CONTEXT</code> - Enable context keyword detection (1/0)</div>
                  <div><code>ENTROPY_THRESHOLD</code> - Minimum entropy for detection (default: 4.0)</div>
                  <div><code>MIN_TOKEN_LENGTH</code> - Minimum token length to analyze (default: 20)</div>
                  <div><code>CONTEXT_WINDOW_CHARS</code> - Context window size (default: 40)</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Response Settings</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div><code>SECRETS_ACTION_ON_FAIL</code> - Default action (mask, filter, refrain, reask)</div>
                  <div><code>MASK_TOKEN</code> - Replacement token for masking (default: ***)</div>
                  <div><code>RETURN_SECRET_VALUES</code> - Return actual secret values (0=disabled for security)</div>
                  <div><code>PATTERNS_DIR</code> - Directory containing regex pattern files</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern Management */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Pattern Management</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Custom Patterns</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add or edit regex signatures in <code>patterns/signatures.json</code> to detect custom secret formats.
                  Hot-reload by restarting the service.
                </p>
                <Code
                  code={`{
  "AWS_ACCESS_KEY_ID": {
    "pattern": "AKIA[0-9A-Z]{16}",
    "category": "CLOUD",
    "severity": 5,
    "description": "AWS Access Key ID"
  },
  "CUSTOM_API_KEY": {
    "pattern": "myapp_[a-f0-9]{32}",
    "category": "DEV",
    "severity": 4,
    "description": "Custom application API key"
  }
}`}
                />
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Security Best Practices</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>Local Processing:</strong> All analysis happens locally, no data leaves your environment</div>
                  <div>• <strong>No Secret Storage:</strong> Service doesn't store or log detected secret values</div>
                  <div>• <strong>Configurable Masking:</strong> Control how secrets are redacted in responses</div>
                  <div>• <strong>Category Filtering:</strong> Only scan for relevant secret types per use case</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}