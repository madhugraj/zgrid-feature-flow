import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ngrok-skip-browser-warning',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log('PII Proxy: Received request', { method: req.method, url: req.url })
  
  if (req.method === 'OPTIONS') {
    console.log('PII Proxy: Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('PII Proxy: Parsing request body')
    const requestBody = await req.json()
    console.log('PII Proxy: Request body:', requestBody)
    
    const { text, entities, return_spans, action_on_fail } = requestBody
    
    const piiServiceUrl = 'http://52.170.163.62:8000/validate'
    const apiKey = Deno.env.get('PII_SERVICE_API_KEY')
    console.log('PII Proxy: Making request to PII service:', piiServiceUrl)
    console.log('PII Proxy: API Key present:', !!apiKey)
    
    if (!apiKey) {
      console.error('PII Proxy: API Key not configured')
      return new Response(
        JSON.stringify({ error: 'PII service API key not configured' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    const response = await fetch(piiServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        text,
        entities,
        return_spans,
        action_on_fail
      })
    })

    const result = await response.json()
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('PII Proxy Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'PII service proxy error', 
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