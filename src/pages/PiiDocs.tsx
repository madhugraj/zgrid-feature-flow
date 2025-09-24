import { Code } from "@/components/Code";

export default function PiiDocs() {
  const endpoint = "http://localhost:8000";
  const curlExample = `curl -s -X POST ${endpoint}/validate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: supersecret123" \\
  -d '{
    "text": "Email john.doe@acme.com, phone +1 (415) 555-1212, meet Sam in Mumbai",
    "entities": ["EMAIL_ADDRESS", "PHONE_NUMBER", "PERSON", "LOCATION"],
    "return_spans": true,
    "language": "en"
  }'`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              PII Protection API
            </h1>
            <p className="text-xl text-muted-foreground">
              Detect and anonymize personally identifiable information using advanced ML pipelines
            </p>
          </div>

          {/* Service Overview */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Service Overview</h2>
            <p className="text-muted-foreground">
              Advanced PII detection and redaction service using multi-engine pipelines to identify and anonymize 
              personally identifiable information including emails, phone numbers, names, locations, and more.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Detection Capabilities</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Email addresses</li>
                  <li>• Phone numbers</li>
                  <li>• Person names</li>
                  <li>• Locations & addresses</li>
                  <li>• SSN, Aadhaar, PAN cards</li>
                  <li>• Custom entity types</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Features</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multi-engine detection</li>
                  <li>• Configurable thresholds</li>
                  <li>• Custom placeholders</li>
                  <li>• Span-level precision</li>
                  <li>• Multi-language support</li>
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
                <p className="text-sm text-muted-foreground">Detect and anonymize PII in text</p>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Authentication</h2>
            <p className="text-muted-foreground">
              All requests require an API key sent via the <code>X-API-Key</code> header.
            </p>
            <Code code="X-API-Key: supersecret123" />
          </div>

          {/* Request Format */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Request Format</h2>
            <p className="text-muted-foreground">POST /validate</p>
            <Code
              code={`{
  "text": "Email john.doe@acme.com, phone +1 (415) 555-1212, meet Sam in Mumbai",
  "entities": ["EMAIL_ADDRESS", "PHONE_NUMBER", "PERSON", "LOCATION"],
  "detection_labels": ["person", "location", "organization"],
  "detection_threshold": 0.6,
  "thresholds": {
    "EMAIL_ADDRESS": 0.3,
    "PERSON": 0.6
  },
  "return_spans": true,
  "language": "en"
}`}
            />
            
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Parameters</h3>
              <div className="grid gap-3">
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">text</code>
                  <span className="text-sm text-muted-foreground">Text content to analyze for PII</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">entities</code>
                  <span className="text-sm text-muted-foreground">PII entity types to detect (optional)</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">detection_labels</code>
                  <span className="text-sm text-muted-foreground">Additional detection categories (optional)</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">detection_threshold</code>
                  <span className="text-sm text-muted-foreground">Global confidence threshold (0.0-1.0)</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">thresholds</code>
                  <span className="text-sm text-muted-foreground">Per-entity confidence thresholds (optional)</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">return_spans</code>
                  <span className="text-sm text-muted-foreground">Return character positions of detected PII (boolean)</span>
                </div>
                <div className="flex gap-4">
                  <code className="text-sm bg-muted px-2 py-1 rounded min-w-fit">language</code>
                  <span className="text-sm text-muted-foreground">Language code for processing (default: "en")</span>
                </div>
              </div>
            </div>
          </div>

          {/* Response Format */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Response Format</h2>
            <Code
              code={`{
  "status": "fixed|pass",
  "redacted_text": "processed text with PII redacted",
  "entities": [
    {
      "type": "ENTITY_TYPE",
      "start": 0,
      "end": 10,
      "score": 0.95,
      "replacement": "[ENTITY]"
    }
  ],
  "steps": [
    {
      "name": "entity_detection",
      "passed": true,
      "details": {
        "entities_found": 1,
        "ml_engine": "spacy_transformers"
      }
    },
    {
      "name": "pattern_matching",
      "passed": true,
      "details": {
        "patterns_matched": 1,
        "regex_engine": "presidio"
      }
    }
  ],
  "reasons": ["PII detected and redacted"]
}`}
            />
          </div>

          {/* Status Values */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Response Status Values</h2>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-mono min-w-fit">pass</span>
                <span className="text-sm text-muted-foreground">No PII detected in the content</span>
              </div>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-mono min-w-fit">fixed</span>
                <span className="text-sm text-muted-foreground">PII detected and redacted successfully</span>
              </div>
            </div>
          </div>

          {/* Entity Types */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Supported Entity Types</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Personal Information</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• <strong>EMAIL_ADDRESS:</strong> Email addresses</div>
                  <div>• <strong>PHONE_NUMBER:</strong> Phone numbers (various formats)</div>
                  <div>• <strong>PERSON:</strong> Person names</div>
                  <div>• <strong>LOCATION:</strong> Addresses and locations</div>
                  <div>• <strong>ORGANIZATION:</strong> Company and org names</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">Identification Numbers</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• <strong>US_SSN:</strong> Social Security Numbers</div>
                  <div>• <strong>CREDIT_CARD:</strong> Credit card numbers</div>
                  <div>• <strong>AADHAAR:</strong> Indian Aadhaar numbers</div>
                  <div>• <strong>IN_PAN:</strong> Indian PAN card numbers</div>
                  <div>• <strong>DATE_TIME:</strong> Dates and timestamps</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Test */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Quick Test</h2>
            <p className="text-muted-foreground">
              Test the PII detection endpoint with curl:
            </p>
            <Code code={curlExample} />
          </div>

          {/* Configuration */}
          <div className="feature-card rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Configuration & Features</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Security Features</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>API Key Authentication:</strong> Secure access control</div>
                  <div>• <strong>CORS Protection:</strong> Cross-origin request security</div>
                  <div>• <strong>Non-root Container:</strong> Enhanced container security</div>
                  <div>• <strong>Resource Limits:</strong> Memory and CPU constraints</div>
                  <div>• <strong>Health Checks:</strong> Automated service monitoring</div>
                  <div>• <strong>Comprehensive Logging:</strong> Audit trail and debugging</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Advanced Capabilities</h3>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <div>• <strong>Multi-engine Detection:</strong> Combines ML models and regex patterns</div>
                  <div>• <strong>Configurable Thresholds:</strong> Fine-tune detection sensitivity</div>
                  <div>• <strong>Custom Placeholders:</strong> Define replacement patterns</div>
                  <div>• <strong>Span-level Precision:</strong> Exact character positions</div>
                  <div>• <strong>Batch Processing:</strong> Handle multiple texts efficiently</div>
                  <div>• <strong>Production Ready:</strong> Scaling, monitoring, backup procedures</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}