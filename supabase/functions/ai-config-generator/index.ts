import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY not found');
    return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { serviceName, sampleInputs, configType, description } = await req.json();
    
    console.log(`Generating AI config for service: ${serviceName}, type: ${configType}`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Generate service-specific prompt
    const prompt = generateServicePrompt(serviceName, configType, sampleInputs, description);
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData = await response.json();
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
        sample_inputs: sampleInputs,
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