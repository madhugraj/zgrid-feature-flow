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

    // Get the authorization header to pass user context
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with user context
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

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
        maxOutputTokens: 2048, // Reduced to prevent timeouts
      }
    };
    
    // Add timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    console.log('Request body structure:', JSON.stringify({
      contents: requestBody.contents.map(c => ({ parts: c.parts.map(p => ({ textLength: p.text.length })) })),
      generationConfig: requestBody.generationConfig
    }));

    // Use the official Gemini API endpoint with proper authentication
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
    
    console.log(`Making request to: ${apiUrl}`);
    console.log(`Using header-based authentication for Gemini API`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal, // Add timeout signal
    });
    
    clearTimeout(timeoutId); // Clear timeout if request completes

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
      hasText: !!geminiData.candidates?.[0]?.content?.parts?.[0]?.text,
      finishReason: geminiData.candidates?.[0]?.finishReason
    }));
    
    if (!geminiData.candidates || !geminiData.candidates[0]) {
      console.error('No candidates in Gemini response:', JSON.stringify(geminiData, null, 2));
      throw new Error('No candidates in Gemini API response');
    }
    
    const candidate = geminiData.candidates[0];
    
    // Check if response was truncated
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.error('Gemini response was truncated due to token limit');
      throw new Error('Response was truncated due to token limit. Please try with a shorter prompt.');
    }
    
    if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0] || !candidate.content.parts[0].text) {
      console.error('Invalid Gemini response structure:', JSON.stringify(geminiData, null, 2));
      throw new Error('Invalid response structure from Gemini API - missing content parts');
    }
    
    const generatedText = candidate.content.parts[0].text;
    
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
  // Shortened prompt to reduce token usage and prevent timeouts
  const basePrompt = `Generate ${configType} for ${serviceName} service.

Samples:
${sampleInputs.map((input, i) => `${i + 1}. "${input}"`).join('\n')}

${description ? `Context: ${description}` : ''}`;

  const serviceSpecificInstructions = getServiceInstructions(serviceName, configType);
  
  return `${basePrompt}

${serviceSpecificInstructions}

JSON format:
{
  "confidence": 0.85,
  "reasoning": "Brief explanation",
  "config": {
    // configuration here
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