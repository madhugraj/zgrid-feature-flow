import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate and sanitize API key
  const rawGeminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!rawGeminiApiKey) {
    console.error('GEMINI_API_KEY environment variable is not set');
    return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Clean and validate the API key
  const geminiApiKey = rawGeminiApiKey.trim();
  if (geminiApiKey.length < 20) {
    console.error(`GEMINI_API_KEY appears to be too short: ${geminiApiKey.length} characters`);
    return new Response(JSON.stringify({ error: 'Invalid Gemini API key format - key too short' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Log API key info for debugging (first 6 and last 4 characters)
  console.log(`Using API Key: ${geminiApiKey.substring(0, 6)}...${geminiApiKey.substring(geminiApiKey.length - 4)} (length: ${geminiApiKey.length})`);
  
  // Check if key looks like a valid Google AI API key format
  if (!geminiApiKey.match(/^[A-Za-z0-9_-]+$/)) {
    console.error('GEMINI_API_KEY contains invalid characters');
    return new Response(JSON.stringify({ error: 'Invalid Gemini API key format - invalid characters' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const requestData = await req.json();
    const { serviceName, sampleInputs, configType, description } = requestData;
    
    // Validate required fields
    if (!serviceName || !sampleInputs || !configType) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: serviceName, sampleInputs, and configType are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate sampleInputs is an array
    if (!Array.isArray(sampleInputs) || sampleInputs.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'sampleInputs must be a non-empty array' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Sanitize and validate sample inputs
    const sanitizedInputs = sampleInputs
      .filter(input => typeof input === 'string' && input.trim().length > 0)
      .map(input => input.trim())
      .slice(0, 10); // Limit to 10 samples max
    
    if (sanitizedInputs.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No valid sample inputs provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Generating AI config for service: ${serviceName}, type: ${configType}, samples: ${sanitizedInputs.length}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Generate service-specific prompt
    const prompt = generateServicePrompt(serviceName, configType, sanitizedInputs, description);
    
    // Call Gemini API
    console.log('Calling Gemini API with prompt length:', prompt.length);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };
    
    console.log('Request body structure:', JSON.stringify({
      contents: requestBody.contents.map(c => ({ parts: c.parts.map(p => ({ textLength: p.text.length })) })),
      generationConfig: requestBody.generationConfig
    }));

    // Try the official Gemini API endpoint with proper authentication
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;
    
    console.log(`Making request to: ${apiUrl}`);
    console.log(`Request headers will include API key in Authorization header`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,  // Try header-based auth
      },
      body: JSON.stringify(requestBody),
    });
    
    // If header auth fails, try query parameter
    if (!response.ok && response.status === 400) {
      console.log('Header auth failed, trying query parameter method...');
      const queryUrl = `${apiUrl}?key=${encodeURIComponent(geminiApiKey)}`;
      
      const fallbackResponse = await fetch(queryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // Use the fallback response for the rest of the function
      if (fallbackResponse.ok || fallbackResponse.status !== 400) {
        console.log('Query parameter method used');
        Object.defineProperty(response, 'ok', { value: fallbackResponse.ok });
        Object.defineProperty(response, 'status', { value: fallbackResponse.status });
        Object.defineProperty(response, 'statusText', { value: fallbackResponse.statusText });
        Object.defineProperty(response, 'text', { value: fallbackResponse.text.bind(fallbackResponse) });
        Object.defineProperty(response, 'json', { value: fallbackResponse.json.bind(fallbackResponse) });
        Object.defineProperty(response, 'headers', { value: fallbackResponse.headers });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      
      console.error('=== GEMINI API ERROR DEBUG ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Response Headers:', Object.fromEntries(response.headers.entries()));
      console.error('Response Body:', errorText);
      console.error('API Key Used (masked):', `${geminiApiKey.substring(0, 6)}...${geminiApiKey.substring(geminiApiKey.length - 4)}`);
      console.error('Request URL used:', apiUrl);
      console.error('================================');
      
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
      let apiError = 'Unknown API error';
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          apiError = errorData.error.message || errorData.error.code || 'API error without message';
          errorMessage += ` - ${apiError}`;
          
          // Special handling for authentication errors
          if (errorData.error.message && errorData.error.message.includes('API key')) {
            console.error('API Key validation failed. Please check:');
            console.error('1. API key is correctly set in Supabase secrets');
            console.error('2. API key has correct permissions for Gemini API');
            console.error('3. API key is not expired or disabled');
          }
        }
      } catch (e) {
        apiError = errorText;
        errorMessage += ` - ${errorText}`;
      }
      
      // Return detailed error for debugging
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: {
          status: response.status,
          statusText: response.statusText,
          apiError: apiError,
          timestamp: new Date().toISOString(),
          debugInfo: 'Check edge function logs for full details'
        }
      }), {
        status: response.status >= 500 ? 500 : response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await response.json();
    console.log('Gemini response structure:', JSON.stringify({
      candidatesCount: geminiData.candidates?.length || 0,
      hasContent: !!geminiData.candidates?.[0]?.content,
      hasText: !!geminiData.candidates?.[0]?.content?.parts?.[0]?.text
    }));
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content || !geminiData.candidates[0].content.parts || !geminiData.candidates[0].content.parts[0]) {
      console.error('Invalid Gemini response structure:', JSON.stringify(geminiData, null, 2));
      throw new Error('Invalid response structure from Gemini API');
    }
    
    const generatedText = geminiData.candidates[0].content.parts[0].text;
    
    console.log('Generated text:', generatedText);

    // Parse the generated configuration
    const { configData, confidence } = parseGeneratedConfig(generatedText, serviceName, configType);

    // Store in Supabase
    const { data, error } = await supabase
      .from('service_configurations')
      .insert({
        service_name: serviceName,
        config_type: configType,
        config_data: configData,
        ai_generated: true,
        sample_inputs: sanitizedInputs,
        confidence_score: confidence,
        description: description || `AI-generated ${configType} for ${serviceName}`,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Successfully stored configuration:', data.id);

    return new Response(JSON.stringify({
      success: true,
      configuration: data,
      configData,
      confidence,
      rawGeneration: generatedText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-config-generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateServicePrompt(serviceName: string, configType: string, sampleInputs: string[], description?: string): string {
  const basePrompt = `You are an expert AI safety and content moderation specialist. Generate a ${configType} configuration for the ${serviceName} service.

Sample inputs provided:
${sampleInputs.map((input, i) => `${i + 1}. "${input}"`).join('\n')}

${description ? `Additional context: ${description}` : ''}

Based on the service type and samples, generate the appropriate configuration:`;

  const serviceSpecificInstructions = getServiceInstructions(serviceName, configType);
  
  return `${basePrompt}

${serviceSpecificInstructions}

IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "confidence": 0.85,
  "reasoning": "Brief explanation of the pattern analysis",
  "config": {
    // The actual configuration object here
  }
}`;
}

function getServiceInstructions(serviceName: string, configType: string): string {
  const instructions: Record<string, Record<string, string>> = {
    'PII': {
      'entities': 'Generate regex patterns for PII detection (SSN, credit cards, emails, phone numbers, etc.). Format: {"entities": [{"name": "ssn", "pattern": "\\\\d{3}-\\\\d{2}-\\\\d{4}", "description": "Social Security Number"}]}',
      'rules': 'Generate PII detection rules with confidence thresholds and actions.'
    },
    'TOXICITY': {
      'keywords': 'Generate toxic keyword lists and severity scoring. Format: {"keywords": [{"word": "example", "severity": 0.8, "category": "harassment"}]}',
      'rules': 'Generate toxicity detection rules with ML model thresholds.'
    },
    'JAILBREAK': {
      'patterns': 'Generate regex patterns for prompt injection attempts. Format: {"patterns": [{"name": "role_override", "pattern": "(?i)(ignore|forget).+(instructions|rules)", "description": "Role override attempt"}]}',
      'rules': 'Generate jailbreak detection logic with escape sequence detection.'
    },
    'SECRETS': {
      'signatures': 'Generate regex patterns for API keys, tokens, passwords. Format: {"signatures": [{"name": "api_key", "pattern": "[A-Za-z0-9]{32}", "description": "32-character API key"}]}',
      'rules': 'Generate secrets detection rules with entropy analysis.'
    },
    'FORMAT': {
      'expressions': 'Generate validation regex for input formats. Format: {"expressions": [{"name": "email", "pattern": "^[^@]+@[^@]+\\\\.[^@]+$", "description": "Email validation"}]}',
      'schemas': 'Generate JSON schema validation rules.'
    },
    'PHISHING': {
      'patterns': 'Generate patterns for phishing URLs, deceptive text, urgency language.',
      'rules': 'Generate phishing detection logic with domain reputation checks.'
    },
    'SPAM': {
      'keywords': 'Generate spam keyword detection patterns.',
      'rules': 'Generate spam scoring algorithms with frequency analysis.'
    },
    'NSFW': {
      'keywords': 'Generate adult content keyword patterns.',
      'rules': 'Generate NSFW detection rules with context analysis.'
    },
    'HATE_SPEECH': {
      'patterns': 'Generate hate speech detection patterns for various target groups.',
      'rules': 'Generate hate speech classification rules with severity levels.'
    },
    'FINANCIAL': {
      'patterns': 'Generate patterns for financial data (bank accounts, routing numbers, financial advice).',
      'rules': 'Generate financial compliance rules.'
    },
    'MEDICAL': {
      'patterns': 'Generate patterns for medical information (diagnosis codes, treatment data).',
      'rules': 'Generate HIPAA compliance rules.'
    },
    'LEGAL': {
      'patterns': 'Generate patterns for legal advice, case numbers, legal entities.',
      'rules': 'Generate legal compliance validation rules.'
    }
  };

  return instructions[serviceName]?.[configType] || 
    `Generate ${configType} configuration for ${serviceName} service. Create appropriate patterns, rules, or validation logic based on the sample inputs.`;
}

function parseGeneratedConfig(generatedText: string, serviceName: string, configType: string): { configData: any, confidence: number } {
  try {
    // Extract JSON from the generated text
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in generated response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      configData: parsed.config || parsed,
      confidence: parsed.confidence || 0.7
    };
  } catch (error) {
    console.error('Failed to parse generated config:', error);
    
    // Fallback: create a basic configuration
    const fallbackConfig = createFallbackConfig(serviceName, configType, generatedText);
    
    return {
      configData: fallbackConfig,
      confidence: 0.5
    };
  }
}

function createFallbackConfig(serviceName: string, configType: string, rawText: string): any {
  // Create basic fallback configurations
  const fallbacks: Record<string, any> = {
    'PII': { entities: [{ name: 'generic', pattern: '\\b[A-Za-z0-9]+\\b', description: 'Generic pattern' }] },
    'TOXICITY': { keywords: [{ word: 'toxic', severity: 0.5, category: 'general' }] },
    'JAILBREAK': { patterns: [{ name: 'generic', pattern: '.*', description: 'Generic pattern' }] },
    'SECRETS': { signatures: [{ name: 'generic', pattern: '[A-Za-z0-9]+', description: 'Generic secret pattern' }] },
    'FORMAT': { expressions: [{ name: 'generic', pattern: '.*', description: 'Generic format' }] }
  };

  return fallbacks[serviceName] || { rules: [{ description: 'AI-generated rule', pattern: '.*' }] };
}