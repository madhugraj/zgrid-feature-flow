import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-target-url',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('Gateway Proxy: Received request', { method: req.method, url: req.url })

  if (req.method === 'OPTIONS') {
    console.log('Gateway Proxy: Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.pathname.split('/').pop() // Gets 'validate', 'health', or 'proxy'

    console.log('Gateway Proxy: Endpoint requested:', endpoint)

    // Check for generic proxy mode via header
    const targetUrl = req.headers.get('x-target-url');

    if (targetUrl) {
      console.log(`Gateway Proxy: Generic proxy to ${targetUrl}`);

      const requestBody = req.method !== 'GET' ? await req.text() : undefined;

      // Forward headers (excluding host and connection related ones)
      const forwardHeaders = new Headers();
      req.headers.forEach((value, key) => {
        if (!['host', 'connection', 'content-length', 'x-target-url'].includes(key.toLowerCase())) {
          forwardHeaders.set(key, value);
        }
      });

      // Ensure API key is present if needed
      if (!forwardHeaders.has('x-api-key')) {
        forwardHeaders.set('x-api-key', 'supersecret123');
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders,
        body: requestBody
      });

      console.log(`Gateway Proxy: Target response status: ${response.status}`);

      // Get response body
      const responseText = await response.text();

      // Try to parse as JSON if possible for logging
      try {
        console.log('Gateway Proxy: Target response:', JSON.parse(responseText));
      } catch {
        console.log('Gateway Proxy: Target response (text):', responseText.substring(0, 200));
      }

      return new Response(responseText, {
        status: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('Content-Type') || 'application/json'
        }
      });
    }

    // Legacy Gateway configuration (fallback)
    const gatewayBase = 'http://172.171.49.238:8008'
    const gatewayKey = 'supersecret123'

    if (endpoint === 'health') {
      // Health check
      console.log('Gateway Proxy: Handling health check')

      const response = await fetch(`${gatewayBase}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': gatewayKey,
        }
      })

      const result = await response.json()
      console.log('Gateway Proxy: Health response:', result)

      return new Response(
        JSON.stringify(result),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } else if (endpoint === 'validate') {
      // Content validation
      console.log('Gateway Proxy: Handling validation request')
      const requestBody = await req.json()
      console.log('Gateway Proxy: Request body:', JSON.stringify(requestBody))

      const response = await fetch(`${gatewayBase}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': gatewayKey,
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Gateway Proxy: Gateway response status:', response.status)
      const result = await response.json()
      console.log('Gateway Proxy: Gateway response:', JSON.stringify(result))

      return new Response(
        JSON.stringify(result),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported endpoint: ${endpoint}` }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }
  } catch (error) {
    console.error('Gateway Proxy Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Gateway proxy error',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})