import { Code } from "@/components/Code";

export default function SecretsDocs() {
  const endpoint = "http://localhost:8005";
  
  const basicRequest = `const response = await fetch('http://localhost:8005/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'supersecret123'
  },
  body: JSON.stringify({
    text: "user content to check for secrets",
    return_spans: true
  })
});`;

  const responseExample = `{
  "status": "blocked|pass|fixed",
  "clean_text": "processed content",
  "flagged": [
    {
      "type": "secret",
      "id": "SECRET_TYPE",
      "category": "SECRET_CATEGORY",
      "start": 0,
      "end": 10,
      "score": 0.95,
      "engine": "detection_engine",
      "severity": 5,
      "value": "secret_value",
      "snippet": "context around secret"
    }
  ],
  "steps": [
    {
      "name": "regex+entropy",
      "passed": false,
      "details": {
        "hits": 1,
        "enable_regex": true,
        "enable_entropy": true
      }
    }
  ],
  "reasons": ["Secrets blocked"]
}`;

  const jsIntegration = `async function checkForSecrets(userInput) {
  try {
    const response = await fetch('http://localhost:8005/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'supersecret123'
      },
      body: JSON.stringify({
        text: userInput,
        return_spans: true
      })
    });

    const result = await response.json();
    
    if (result.status === 'blocked') {
      // Handle blocked content
      console.log('Secrets detected:', result.flagged);
      return { safe: false, message: 'Content contains sensitive information' };
    }
    
    return { safe: true, content: result.clean_text };
  } catch (error) {
    console.error('Secret detection failed:', error);
    // Fail-safe: allow content through on service error
    return { safe: true, content: userInput };
  }
}

// Usage
const userInput = "My AWS key is AKIAIOSFODNN7EXAMPLE";
const check = await checkForSecrets(userInput);
if (!check.safe) {
  alert(check.message);
}`;

  const pythonIntegration = `import requests
import json

def check_for_secrets(text):
    try:
        response = requests.post(
            'http://localhost:8005/validate',
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': 'supersecret123'
            },
            json={
                'text': text,
                'return_spans': True
            }
        )
        
        result = response.json()
        
        if result['status'] == 'blocked':
            # Handle blocked content
            print(f"Secrets detected: {result['flagged']}")
            return False, "Content contains sensitive information"
        
        return True, result['clean_text']
    except Exception as e:
        print(f"Secret detection failed: {e}")
        # Fail-safe: allow content through on service error
        return True, text

# Usage
user_input = "My password is qweds234"
is_safe, content = check_for_secrets(user_input)
if not is_safe:
    print("Blocked:", content)`;

  const configExample = `# Detection sensitivity
ENTROPY_THRESHOLD=3.0        # Lower = more sensitive (3.0-4.5)
MIN_TOKEN_LEN=8             # Minimum token length to analyze
CONTEXT_WINDOW_CHARS=40     # Context search window around tokens

# Engine toggles
ENABLE_REGEX=1              # Enable/disable regex detection
ENABLE_ENTROPY=1            # Enable/disable entropy detection
ENABLE_YELP_DETECTOR=1      # Enable/disable Yelp detect-secrets

# Actions
SECRETS_ACTION_ON_FAIL=refrain  # Options: refrain, filter, mask, reask`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Secrets Detection Service - User Guide
            </h1>
            <p className="text-xl text-muted-foreground">
              Identify and block sensitive credentials using multi-engine approach
            </p>
          </div>

          {/* Overview */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
            <p className="text-muted-foreground">
              The Secrets Detection Service identifies and blocks sensitive credentials, API keys, passwords, and other confidential information in user content. It uses a multi-engine approach for comprehensive detection.
            </p>
            
            <div className="border border-border/50 rounded-lg p-4 bg-muted/20">
              <h3 className="font-semibold text-foreground mb-2">Service Endpoint</h3>
              <Code code={`POST http://localhost:8005/validate
Headers: 
  Content-Type: application/json
  X-API-Key: supersecret123`} />
            </div>
          </div>

          {/* API Usage */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">API Usage</h2>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">Basic Request</h3>
              <Code code={basicRequest} />
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Response Format</h3>
              <Code code={responseExample} />
            </div>
          </div>

          {/* Detection Engines */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Detection Engines</h2>
            
            <div className="space-y-4">
              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">1. Regex Pattern Matching</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><strong>Purpose:</strong> Detects known secret formats</div>
                  <div><strong>Examples:</strong> AWS keys, GitHub tokens, Stripe keys</div>
                  <div><strong>Strengths:</strong> High precision, zero false positives for known patterns</div>
                  <div><strong>Response Engine:</strong> <code>"engine": "regex"</code></div>
                </div>
              </div>
              
              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">2. Entropy Analysis</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><strong>Purpose:</strong> Identifies high-entropy tokens (random-looking strings)</div>
                  <div><strong>Examples:</strong> Base64, hex strings, JWT tokens</div>
                  <div><strong>Strengths:</strong> Catches unknown secret formats</div>
                  <div><strong>Response Engine:</strong> <code>"engine": "entropy"</code></div>
                </div>
              </div>
              
              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">3. Yelp detect-secrets (Enhanced)</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div><strong>Purpose:</strong> Advanced secret detection using battle-tested algorithms</div>
                  <div><strong>Examples:</strong> Private keys, SSH keys, complex credentials</div>
                  <div><strong>Strengths:</strong> Industry-proven detection with low false positives</div>
                  <div><strong>Response Engine:</strong> <code>"engine": "yelp_PLUGIN_NAME"</code></div>
                </div>
              </div>
            </div>
          </div>

          {/* Secret Categories */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Secret Categories</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-semibold text-foreground">Category</th>
                    <th className="text-left py-2 font-semibold text-foreground">Description</th>
                    <th className="text-left py-2 font-semibold text-foreground">Examples</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code>CLOUD</code></td>
                    <td className="py-2">Cloud provider keys</td>
                    <td className="py-2">AWS, GCP, Azure keys</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code>DEV</code></td>
                    <td className="py-2">Developer credentials</td>
                    <td className="py-2">GitHub tokens, SSH keys</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code>SAAS</code></td>
                    <td className="py-2">SaaS platform keys</td>
                    <td className="py-2">Slack, Stripe, Twilio tokens</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code>COMM</code></td>
                    <td className="py-2">Communication service keys</td>
                    <td className="py-2">SendGrid, Telegram tokens</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code>AUTH</code></td>
                    <td className="py-2">Authentication tokens</td>
                    <td className="py-2">JWT, OAuth tokens</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2"><code>PAYMENTS</code></td>
                    <td className="py-2">Payment processing keys</td>
                    <td className="py-2">Stripe, PayPal keys</td>
                  </tr>
                  <tr>
                    <td className="py-2"><code>GENERIC</code></td>
                    <td className="py-2">Generic high-entropy tokens</td>
                    <td className="py-2">Base64, hex strings</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Severity Levels */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Severity Levels</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded text-sm font-mono w-8 text-center">1</span>
                <div className="flex-1">
                  <span className="text-foreground font-medium">Low risk</span>
                  <span className="text-muted-foreground ml-2">Monitor</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded text-sm font-mono w-8 text-center">2</span>
                <div className="flex-1">
                  <span className="text-foreground font-medium">Medium risk</span>
                  <span className="text-muted-foreground ml-2">Warn</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded text-sm font-mono w-8 text-center">3</span>
                <div className="flex-1">
                  <span className="text-foreground font-medium">High risk</span>
                  <span className="text-muted-foreground ml-2">Filter</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded text-sm font-mono w-8 text-center">4</span>
                <div className="flex-1">
                  <span className="text-foreground font-medium">Critical risk</span>
                  <span className="text-muted-foreground ml-2">Block</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded text-sm font-mono w-8 text-center">5</span>
                <div className="flex-1">
                  <span className="text-foreground font-medium">Extremely critical</span>
                  <span className="text-muted-foreground ml-2">Immediate block</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detection Models */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Detection Models & Algorithms</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Multi-Engine Architecture</h3>
                <p className="text-muted-foreground mb-4">
                  The service uses three complementary detection engines:
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-border/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">1. Pattern-Based Detection (Regex)</h4>
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    <div><strong>Model:</strong> Custom regex patterns</div>
                    <div><strong>Detection Method:</strong> Exact pattern matching</div>
                    <div><strong>Accuracy:</strong> Very high (near 100%)</div>
                    <div><strong>False Positives:</strong> Very low</div>
                    <div><strong>Use Case:</strong> Known secret formats</div>
                  </div>
                </div>

                <div className="border border-border/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">2. Statistical Detection (Entropy)</h4>
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    <div><strong>Model:</strong> Shannon Entropy Analysis</div>
                    <div><strong>Detection Method:</strong> Mathematical randomness measurement</div>
                    <div><strong>Algorithm:</strong> <code>H(X) = -Σ P(x) × log₂(P(x))</code></div>
                    <div><strong>Threshold:</strong> Configurable (default: 3.0)</div>
                    <div><strong>Token Length:</strong> Configurable (default: 8+ characters)</div>
                    <div><strong>Accuracy:</strong> High for random strings</div>
                    <div><strong>False Positives:</strong> Medium (some random words may trigger)</div>
                  </div>
                </div>

                <div className="border border-border/50 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">3. Machine Learning-Based Detection (Yelp detect-secrets)</h4>
                  <div className="grid gap-1 text-sm text-muted-foreground">
                    <div><strong>Model:</strong> Multiple specialized detectors</div>
                    <div><strong>Detection Methods:</strong></div>
                    <div className="ml-4">
                      <div>- Base64HighEntropyString (entropy + base64 validation)</div>
                      <div>- HexHighEntropyString (entropy + hex validation)</div>
                      <div>- KeywordDetector (semantic keyword analysis)</div>
                      <div>- PrivateKeyDetector (cryptographic key patterns)</div>
                    </div>
                    <div><strong>Accuracy:</strong> Very high (battle-tested at Yelp)</div>
                    <div><strong>False Positives:</strong> Low</div>
                    <div><strong>Training:</strong> Industry-standard datasets</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Configuration Parameters</h2>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">Environment Variables</h3>
              <Code code={configExample} />
            </div>
          </div>

          {/* Integration Examples */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Integration Examples</h2>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">JavaScript/Node.js</h3>
              <Code code={jsIntegration} />
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Python</h3>
              <Code code={pythonIntegration} />
            </div>
          </div>

          {/* Test Cases */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Test Cases</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Detected Secrets</h3>
                <div className="space-y-3 text-sm">
                  <div className="border border-red-500/20 rounded p-3 bg-red-500/5">
                    <div className="text-red-400 font-mono mb-1">AWS Key</div>
                    <div className="text-muted-foreground">Input: "AKIAIOSFODNN7EXAMPLE"</div>
                    <div className="text-muted-foreground">Output: BLOCKED (Regex detection)</div>
                  </div>
                  <div className="border border-red-500/20 rounded p-3 bg-red-500/5">
                    <div className="text-red-400 font-mono mb-1">Private Key</div>
                    <div className="text-muted-foreground">Input: "-----BEGIN RSA PRIVATE KEY-----"</div>
                    <div className="text-muted-foreground">Output: BLOCKED (Yelp PrivateKeyDetector)</div>
                  </div>
                  <div className="border border-red-500/20 rounded p-3 bg-red-500/5">
                    <div className="text-red-400 font-mono mb-1">High Entropy Token</div>
                    <div className="text-muted-foreground">Input: "aGVsbG8gd29ybGQ=" (base64)</div>
                    <div className="text-muted-foreground">Output: BLOCKED (Entropy analysis)</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Safe Content</h3>
                <div className="space-y-3 text-sm">
                  <div className="border border-green-500/20 rounded p-3 bg-green-500/5">
                    <div className="text-green-400 font-mono mb-1">Normal text</div>
                    <div className="text-muted-foreground">Input: "This is a regular sentence"</div>
                    <div className="text-muted-foreground">Output: PASS</div>
                  </div>
                  <div className="border border-green-500/20 rounded p-3 bg-green-500/5">
                    <div className="text-green-400 font-mono mb-1">Low entropy tokens</div>
                    <div className="text-muted-foreground">Input: "hello world"</div>
                    <div className="text-muted-foreground">Output: PASS</div>
                  </div>
                  <div className="border border-green-500/20 rounded p-3 bg-green-500/5">
                    <div className="text-green-400 font-mono mb-1">Technical terms</div>
                    <div className="text-muted-foreground">Input: "function calculateSum(a, b)"</div>
                    <div className="text-muted-foreground">Output: PASS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Best Practices</h2>
            
            <div className="space-y-4">
              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">1. Integration Strategy</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Always handle service errors gracefully</li>
                  <li>• Implement timeouts for service calls</li>
                  <li>• Use fail-safe approach (allow content on service failure)</li>
                </ul>
              </div>

              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">2. User Experience</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Provide clear feedback when content is blocked</li>
                  <li>• Explain why content was flagged (when appropriate)</li>
                  <li>• Offer guidance on creating safe content</li>
                </ul>
              </div>

              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">3. Security</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Never log detected secrets</li>
                  <li>• Use HTTPS in production</li>
                  <li>• Rotate API keys regularly</li>
                </ul>
              </div>

              <div className="border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">4. Performance</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• The service is optimized for real-time use</li>
                  <li>• Typical response time: &lt;100ms</li>
                  <li>• Can handle high-volume traffic</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Troubleshooting</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Common Issues</h3>
                
                <div className="space-y-3">
                  <div className="border border-border/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Service Not Responding</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Check if service is running: <code>curl http://localhost:8005/health</code></li>
                      <li>• Verify port 8005 is not blocked by firewall</li>
                      <li>• Check Docker/container status if using containerized deployment</li>
                    </ul>
                  </div>

                  <div className="border border-border/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">False Positives</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Adjust entropy threshold in environment variables</li>
                      <li>• Review content that's being incorrectly flagged</li>
                      <li>• Consider adding to allow list for legitimate use cases</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Monitoring & Maintenance</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div><strong>Health Check:</strong> <code>GET http://localhost:8005/health</code> → <code>{`{"ok": true}`}</code></div>
                  <div><strong>Logs:</strong> Service logs detection activities</div>
                  <div><strong>Updates:</strong> Pattern updates via <code>patterns/signatures.json</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}