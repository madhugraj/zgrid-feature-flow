import { supabase } from "@/integrations/supabase/client";

export type ServiceName = 
  'PII' | 'TOXICITY' | 'JAILBREAK' | 'BAN' | 'POLICY' | 'SECRETS' | 'FORMAT' |
  'PHISHING' | 'MALWARE' | 'SPAM' | 'FRAUD' | 'NSFW' | 'VIOLENCE' | 'HARASSMENT' |
  'HATE_SPEECH' | 'MISINFORMATION' | 'COPYRIGHT' | 'PRIVACY' | 'FINANCIAL' |
  'MEDICAL' | 'LEGAL' | 'PROFANITY' | 'SENTIMENT' | 'LANGUAGE' | 'COMPLIANCE';

export interface ServiceConfiguration {
  id: string;
  service_name: string; // Changed from ServiceName to string to match database
  config_type: string;
  config_data: any;
  ai_generated: boolean;
  sample_inputs?: string[];
  confidence_score?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerateConfigRequest {
  serviceName: ServiceName;
  configType: string;
  sampleInputs: string[];
  description?: string;
}

export interface GenerateConfigResponse {
  success: boolean;
  configuration: ServiceConfiguration;
  configData: any;
  confidence: number;
  rawGeneration: string;
}

// AI Configuration Generator
export async function generateAIConfig(request: GenerateConfigRequest): Promise<GenerateConfigResponse> {
  const { data, error } = await supabase.functions.invoke('ai-config-generator', {
    body: request
  });

  if (error) {
    throw new Error(`Failed to generate AI config: ${error.message}`);
  }

  return data;
}

// Get configurations for a service
export async function getServiceConfigurations(serviceName: ServiceName): Promise<ServiceConfiguration[]> {
  const { data, error } = await supabase
    .from('service_configurations')
    .select('*')
    .eq('service_name', serviceName)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch configurations: ${error.message}`);
  }

  return data || [];
}

// Get all configurations
export async function getAllConfigurations(): Promise<ServiceConfiguration[]> {
  const { data, error } = await supabase
    .from('service_configurations')
    .select('*')
    .order('service_name', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch all configurations: ${error.message}`);
  }

  return data || [];
}

// Save configuration manually
export async function saveConfiguration(config: Omit<ServiceConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceConfiguration> {
  const { data, error } = await supabase
    .from('service_configurations')
    .insert(config)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save configuration: ${error.message}`);
  }

  return data;
}

// Update configuration
export async function updateConfiguration(id: string, updates: Partial<ServiceConfiguration>): Promise<ServiceConfiguration> {
  const { data, error } = await supabase
    .from('service_configurations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update configuration: ${error.message}`);
  }

  return data;
}

// Delete configuration
export async function deleteConfiguration(id: string): Promise<void> {
  const { error } = await supabase
    .from('service_configurations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete configuration: ${error.message}`);
  }
}

// Toggle configuration active status
export async function toggleConfigurationStatus(id: string): Promise<ServiceConfiguration> {
  // First get current status
  const { data: current, error: fetchError } = await supabase
    .from('service_configurations')
    .select('is_active')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch configuration: ${fetchError.message}`);
  }

  // Update with opposite status
  const { data, error } = await supabase
    .from('service_configurations')
    .update({ is_active: !current.is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to toggle configuration status: ${error.message}`);
  }

  return data;
}

// Clear all configurations for a service
export async function clearServiceConfigurations(serviceName: ServiceName): Promise<void> {
  const { error } = await supabase
    .from('service_configurations')
    .delete()
    .eq('service_name', serviceName);

  if (error) {
    throw new Error(`Failed to clear configurations: ${error.message}`);
  }
}

// Apply configurations to service (placeholder for integration with actual services)
export async function applyConfigurationsToService(serviceName: ServiceName): Promise<void> {
  const configurations = await getServiceConfigurations(serviceName);
  const activeConfigs = configurations.filter(config => config.is_active);
  
  // TODO: Implement actual service integration
  // This would call the respective service's admin API to update configurations
  console.log(`Applying ${activeConfigs.length} configurations to ${serviceName}:`, activeConfigs);
  
  // For now, we'll just log the action
  // In the future, this would integrate with the actual service APIs
}