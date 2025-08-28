import { Code } from "@/components/Code";

export default function PiiDocs() {
  const endpoint = "http://localhost:8000";

  const curl = `curl -s -X POST ${endpoint}/validate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: supersecret123" \\
  -d '{"text":"Email john.doe@acme.com, phone +1 (415) 555-1212, meet Sam in Mumbai"}' | jq`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">PII Protection — Z-Grid Microservice</h1>
      <p className="text-muted-foreground mt-2">
        API documentation for the PII detection and redaction service.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-xs uppercase text-muted-foreground">Endpoints</div>
          <div className="text-sm mt-2">
            <div><code className="bg-muted px-1 rounded">GET {endpoint}/health</code></div>
            <div><code className="bg-muted px-1 rounded">POST {endpoint}/validate</code></div>
          </div>
        </div>
        <div className="border rounded-xl p-4 bg-card">
          <div className="text-xs uppercase text-muted-foreground">Auth</div>
          <div className="text-sm mt-2">
            Header <code className="bg-muted px-1 rounded">X-API-Key</code> (configured via environment)
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold">Request</h2>
      <Code code={`POST ${endpoint}/validate
Headers:
  Content-Type: application/json
  X-API-Key: supersecret123
Body:
{
  "text": "string",
  "entities": ["EMAIL_ADDRESS","PHONE_NUMBER","PERSON","LOCATION"],     // optional
  "detection_labels": ["person","location","organization"],             // optional
  "detection_threshold": 0.6,                                           // optional
  "thresholds": {"EMAIL_ADDRESS":0.3,"PERSON":0.6},                      // optional
  "return_spans": true,
  "language": "en"
}`} />

      <h2 className="mt-6 text-xl font-semibold">Response</h2>
      <Code code={`{
  "status": "pass | fixed",
  "redacted_text": "...",
  "entities": [{ 
    "type": "EMAIL_ADDRESS", 
    "value": "...", 
    "start": 0, 
    "end": 10, 
    "score": 1, 
    "replacement": "[EMAIL]" 
  }],
  "steps": [
    { "name": "entity_detection", "passed": true }, 
    { "name": "pattern_matching", "passed": true }
  ],
  "reasons": ["PII redacted"]
}`} />

      <h2 className="mt-6 text-xl font-semibold">Quick Test</h2>
      <Code code={curl} />

      <div className="mt-8 p-6 bg-muted/50 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Security Features</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>API key authentication</li>
          <li>CORS protection</li>
          <li>Non-root container user</li>
          <li>Resource limits and health checks</li>
          <li>Comprehensive logging</li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-muted/50 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Service Capabilities</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>Multi-engine detection:</strong> Advanced ML pipelines</li>
          <li><strong>Supports:</strong> Emails, phones, SSNs, names, locations, Aadhaar, PAN, etc.</li>
          <li><strong>Configurable:</strong> Thresholds, placeholders, entity types</li>
          <li><strong>Production-ready:</strong> Scaling, monitoring, backup procedures</li>
        </ul>
      </div>
    </main>
  );
}