import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, entities, return_spans, action_on_fail } = await req.json()
    
    const piiServiceUrl = 'http://52.170.163.62:8000/validate'
    
    const response = await fetch(piiServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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