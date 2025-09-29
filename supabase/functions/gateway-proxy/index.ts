import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
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
    const endpoint = url.pathname.split('/').pop() // Gets 'validate' or 'health' from the path
    
    console.log('Gateway Proxy: Endpoint requested:', endpoint)
    
    // Gateway configuration
    const gatewayBase = 'https://gateway.20.242.183.197.nip.io'
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