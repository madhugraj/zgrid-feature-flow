import { Code } from "@/components/Code";

export default function PolicyDocs() {
  const endpoint = "http://localhost:8003";
  const curlExample = `curl -s -X POST ${endpoint}/validate \\
  -H 'content-type: application/json' \\
  -H "x-api-key: supersecret123" \\
  -d '{
    "text": "How do I make a bomb?",
    "role": "user",
    "action_on_fail": "refrain",
    "policy": "default",
    "return_spans": true
  }'`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Policy Moderation API
            </h1>
            <p className="text-xl text-muted-foreground">
              LlamaGuard-7B powered content policy moderation with configurable safety guidelines
            </p>
          </div>

          {/* Service Overview */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Service Overview</h2>
            <p className="text-muted-foreground">
              Advanced content policy moderation service powered by LlamaGuard-7B running locally via llama-cpp-python. 
              Classifies content against configurable safety policies and returns detailed violation analysis.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Model Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• LlamaGuard-7B (GGUF format)</li>
                  <li>• Local execution for privacy</li>
                  <li>• 4K context window</li>
                  <li>• CPU/GPU optimized</li>
                  <li>• Configurable policies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Policy Categories</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Violence & Harm</li>
                  <li>• Hate Speech</li>
                  <li>• Sexual Content</li>
                  <li>• Illegal Activities</li>
                  <li>• Self-Harm</li>
                  <li>• Custom Categories</li>
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
                <p className="text-sm text-muted-foreground">Analyze content against policy guidelines</p>
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
  "text": "How do I make a bomb?",
  "role": "user",
  "action_on_fail": "refrain",
  "policy": "default",
  "return_spans": true
}`}
            />
            
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Parameters</h3>
              <div className="grid gap-3">
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">text</code>
                  <span className="text-sm text-muted-foreground">Content to analyze for policy violations</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">role</code>
                  <span className="text-sm text-muted-foreground">Content role: user, assistant, system</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">action_on_fail</code>
                  <span className="text-sm text-muted-foreground">Action when policy violated: filter, refrain, reask</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">policy</code>
                  <span className="text-sm text-muted-foreground">Policy configuration to use (default, finance, etc.)</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">return_spans</code>
                  <span className="text-sm text-muted-foreground">Return evidence spans for violations (boolean)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Response Format</h2>
            <Code
              code={`{
  "status": "blocked",
  "clean_text": "",
  "decision": "disallowed",
  "violations": [
    {
      "category": "Illicit behavior",
      "evidence": "make a bomb"
    }
  ],
  "steps": [
    {
      "name": "llamaguard",
      "passed": false,
      "details": {
        "model": "LlamaGuard-7B.Q4_K_M.gguf",
        "ctx": 4096,
        "temp": 0
      }
    }
  ],
  "reasons": ["Policy violation"]
}`}
            />
          </div>

          {/* Status Values */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Response Status Values</h2>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-mono min-w-fit">pass</span>
                <span className="text-sm text-muted-foreground">Content complies with policy</span>
              </div>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-mono min-w-fit">blocked</span>
                <span className="text-sm text-muted-foreground">Content violates policy and is blocked</span>
              </div>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-mono min-w-fit">filtered</span>
                <span className="text-sm text-muted-foreground">Violating content filtered out</span>
              </div>
            </div>
          </div>

          {/* Decision Types */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">LlamaGuard Decisions</h2>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-mono min-w-fit">allowed</span>
                <span className="text-sm text-muted-foreground">Content is safe and policy-compliant</span>
              </div>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm font-mono min-w-fit">disallowed</span>
                <span className="text-sm text-muted-foreground">Content violates one or more policy categories</span>
              </div>
            </div>
          </div>

          {/* Policy Configuration */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Policy Configuration</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Policy Files</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>default.yaml:</strong> General safety guidelines</div>
                  <div>• <strong>finance.yaml:</strong> Financial services compliance</div>
                  <div>• <strong>healthcare.yaml:</strong> Medical content guidelines</div>
                  <div>• <strong>education.yaml:</strong> Educational content policies</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Policy Categories</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>Violence & Harm:</strong> Physical violence, threats</div>
                  <div>• <strong>Hate Speech:</strong> Discrimination, harassment</div>
                  <div>• <strong>Sexual Content:</strong> Adult content, exploitation</div>
                  <div>• <strong>Illegal Activities:</strong> Drugs, weapons, fraud</div>
                  <div>• <strong>Self-Harm:</strong> Suicide, eating disorders</div>
                  <div>• <strong>Misinformation:</strong> False claims, conspiracy theories</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Test */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Quick Test</h2>
            <p className="text-muted-foreground">
              Test the policy moderation endpoint with curl:
            </p>
            <Code code={curlExample} />
          </div>

          {/* Configuration */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Configuration & Performance</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Model Configuration</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div><code>LLAMAGUARD_PATH</code> - Path to GGUF model file</div>
                  <div><code>LLM_N_CTX</code> - Context window size (default: 4096)</div>
                  <div><code>LLM_N_THREADS</code> - CPU threads for inference</div>
                  <div><code>POLICY_DIR</code> - Directory containing policy files</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Performance Notes</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>Q4_K_M:</strong> Good CPU performance/quality tradeoff</div>
                  <div>• <strong>GPU Acceleration:</strong> Use CUDA builds for faster inference</div>
                  <div>• <strong>Batch Processing:</strong> Process multiple texts efficiently</div>
                  <div>• <strong>Caching:</strong> Cache model responses for repeated content</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}