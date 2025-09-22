import { Code } from "@/components/Code";

export default function ToxDocs() {
  const endpoint = "http://localhost:8001";
  const key = "supersecret123";

  const curl = `curl -X POST ${endpoint}/validate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${key}" \\
  -d '{"text":"You are an idiot. But also here is some useful info."}' | jq`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Toxicity & Profanity Protection — Z-Grid Microservice</h1>
      <p className="text-muted-foreground mt-2">
        API documentation for the toxicity detection and content filtering service.
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
            Header <code className="bg-muted px-1 rounded">X-API-Key</code> 
            <br />
            <span className="text-xs text-muted-foreground">Keys: supersecret123, toxevalyavar</span>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold">Request</h2>
      <Code code={`POST ${endpoint}/validate
Headers:
  Content-Type: application/json
  X-API-Key: ${key}
Body:
{
  "text": "string",
  "detoxify_threshold": 0.5,                    // optional, default 0.5
  "profanity_action": "mask",                   // optional: mask|remove|flag
  "return_scores": true                         // optional, default true
}`} />

      <h2 className="mt-6 text-xl font-semibold">Response</h2>
      <Code code={`{
  "status": "pass | fixed | blocked",
  "clean_text": "But also here is some useful info.",
  "flagged": [
    {
      "type": "toxicity",
      "score": 0.98780757188797,
      "span": [0, 17],
      "sentence": "You are an idiot.",
      "token": null
    }
  ],
  "scores": {
    "toxicity": 0.98780757188797,
    "severe_toxicity": 0.042480338364839554,
    "obscene": 0.7727358341217041,
    "threat": 0.0013019745238125324,
    "insult": 0.9573231339454651,
    "identity_attack": 0.013347610831260681,
    "sexual_explicit": 0.0
  },
  "steps": [
    {
      "name": "detoxify",
      "passed": true,
      "details": {
        "mode": "sentence",
        "threshold": 0.5,
        "labels": ["toxicity", "severe_toxicity", "obscene", "threat", "insult", "identity_attack", "sexual_explicit"],
        "toxic_spans": 1
      }
    },
    {
      "name": "profanity",
      "passed": true,
      "details": {
        "hits": 0,
        "action": "mask"
      }
    }
  ],
  "reasons": ["Toxic sentences removed."]
}`} />

      <h2 className="mt-6 text-xl font-semibold">Response Status</h2>
      <div className="grid gap-3 mt-4">
        <div className="border rounded p-3 bg-green-50 border-green-200">
          <div className="font-medium text-green-800">pass</div>
          <div className="text-sm text-green-700">No toxicity or profanity detected</div>
        </div>
        <div className="border rounded p-3 bg-yellow-50 border-yellow-200">
          <div className="font-medium text-yellow-800">fixed</div>
          <div className="text-sm text-yellow-700">Toxic data found</div>
        </div>
        <div className="border rounded p-3 bg-red-50 border-red-200">
          <div className="font-medium text-red-800">blocked</div>
          <div className="text-sm text-red-700">Content completely blocked due to severe violations</div>
        </div>
      </div>

      <h2 className="mt-6 text-xl font-semibold">Quick test</h2>
      <Code code={curl} />
    </main>
  );
}