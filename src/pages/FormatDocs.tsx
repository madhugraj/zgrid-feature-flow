import { Code } from "@/components/Code";

const endpoint = "http://localhost:8006";

const curlExample = `curl -X POST ${endpoint}/validate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: supersecret123" \\
  -d '{
    "text": "Given I open the page, When I click login, Then I see dashboard",
    "expressions": ["Given {word}, When {word}, Then {word}"],
    "action_on_fail": "filter",
    "return_spans": true
  }'`;

export default function FormatDocs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Format Validation API</h1>
          <p className="text-lg text-muted-foreground">
            Validates text against specific format patterns using Cucumber expressions and regex.
          </p>
        </div>

        {/* Service Overview */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Service Overview</h2>
          <div className="bg-muted/50 rounded-lg p-6">
            <p className="mb-4">
              The Format Validation service validates input text against predefined format patterns. 
              It uses Cucumber expressions for natural language format validation and supports custom regex patterns.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Cucumber Expression pattern matching</li>
              <li>Custom regex pattern validation</li>
              <li>Format compliance checking</li>
              <li>Business logic validation rules</li>
            </ul>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Health Check</h3>
              <Code code={`GET ${endpoint}/health`} />
              <p className="text-sm text-muted-foreground mt-2">
                Returns the service health status.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Validate Format</h3>
              <Code code={`POST ${endpoint}/validate`} />
              <p className="text-sm text-muted-foreground mt-2">
                Validates text against format patterns and expressions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Admin: Add Custom Expressions</h3>
              <Code code={`POST ${endpoint}/admin/expressions`} />
              <p className="text-sm text-muted-foreground mt-2">
                Add custom Cucumber expressions for format validation.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Admin: Get Custom Expressions</h3>
              <Code code={`GET ${endpoint}/admin/expressions`} />
              <p className="text-sm text-muted-foreground mt-2">
                Retrieve current custom expressions configuration.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Admin: Clear Custom Expressions</h3>
              <Code code={`DELETE ${endpoint}/admin/expressions`} />
              <p className="text-sm text-muted-foreground mt-2">
                Clear all custom expressions.
              </p>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
          <p className="mb-4">
            All requests require an API key in the header:
          </p>
          <Code code={`x-api-key: supersecret123`} />
          <p className="text-sm text-muted-foreground mt-2">
            Admin functions require the admin key: <code>formatprivileged123</code>
          </p>
        </section>

        {/* Request Format */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Request Format</h2>
          <Code code={`{
  "text": "Given I open the page, When I click login, Then I see dashboard",
  "expressions": ["Given {word}, When {word}, Then {word}"],
  "action_on_fail": "filter",
  "return_spans": true
}`} />
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>text:</strong> Input text to validate</p>
            <p><strong>expressions:</strong> Array of Cucumber expressions to match against</p>
            <p><strong>action_on_fail:</strong> Action when validation fails (filter, refrain, reask)</p>
            <p><strong>return_spans:</strong> Include position information in response</p>
          </div>
        </section>

        {/* Response Format */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Response Format</h2>
          <Code code={`{
  "status": "pass",
  "clean_text": "Given I open the page, When I click login, Then I see dashboard",
  "matched_expressions": ["Given {word}, When {word}, Then {word}"],
  "steps": [
    {
      "name": "cucumber_expressions",
      "passed": true,
      "details": {
        "expressions_checked": 1
      }
    }
  ],
  "reasons": []
}`} />
        </section>

        {/* Status Values */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Status Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-medium text-green-800 dark:text-green-200">pass</h3>
              <p className="text-sm text-green-600 dark:text-green-300">Text matches format patterns</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-medium text-red-800 dark:text-red-200">blocked</h3>
              <p className="text-sm text-red-600 dark:text-red-300">Text doesn't match required format</p>
            </div>
          </div>
        </section>

        {/* Cucumber Expressions */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cucumber Expressions</h2>
          <div className="bg-muted/50 rounded-lg p-6">
            <p className="mb-4">Common Cucumber expression patterns:</p>
            <div className="space-y-2 text-sm font-mono">
              <p><code>{"{word}"}</code> - Matches any word</p>
              <p><code>{`{int}`}</code> - Matches any integer</p>
              <p><code>{"{string}"}</code> - Matches quoted strings</p>
              <p><code>{"{email}"}</code> - Matches email addresses</p>
              <p><code>{"{phone}"}</code> - Matches phone numbers</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Example Expressions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Email {"{email}"}, phone {"{phone}"}</li>
                <li>Name: {"{word}"}, Age: {`{int}`}</li>
                <li>Given I open {"{string}"}, When I click {"{word}"}, Then I see {"{word}"}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Test */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Test</h2>
          <p className="mb-4">
            Test the Format Validation API with this example request:
          </p>
          <Code code={curlExample} />
        </section>

        {/* Configuration & Admin */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Configuration & Admin Features</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Custom Expressions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add custom Cucumber expressions for your specific format validation needs.
              </p>
              <Code code={`{
  "custom_expressions": [
    "Email {email}, phone {phone}",
    "Name: {word}, Age: {int}",
    "Order #\\{int} for \\{string} costs $\\{int}"
  ]
}`} />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Environment Variables</h3>
              <Code code={`FORMAT_API_KEYS=supersecret123,formatprivileged123
CORS_ALLOWED_ORIGINS=*
DEFAULT_EXPRESSIONS=["Given {word}, When {word}, Then {word}"]
ACTION_ON_FAIL=filter`} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}