-- Create enum for all 25 services
CREATE TYPE public.service_name AS ENUM (
  'PII', 'TOXICITY', 'JAILBREAK', 'BAN', 'POLICY', 'SECRETS', 'FORMAT',
  'PHISHING', 'MALWARE', 'SPAM', 'FRAUD', 'NSFW', 'VIOLENCE', 'HARASSMENT',
  'HATE_SPEECH', 'MISINFORMATION', 'COPYRIGHT', 'PRIVACY', 'FINANCIAL',
  'MEDICAL', 'LEGAL', 'PROFANITY', 'SENTIMENT', 'LANGUAGE', 'COMPLIANCE'
);

-- Create the service_configurations table
CREATE TABLE public.service_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name service_name NOT NULL,
  config_type TEXT NOT NULL,
  config_data JSONB NOT NULL,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  sample_inputs TEXT[],
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an admin/config system)
CREATE POLICY "Allow public read access to service configurations"
ON public.service_configurations
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to service configurations"
ON public.service_configurations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access to service configurations"
ON public.service_configurations
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete access to service configurations"
ON public.service_configurations
FOR DELETE
USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_service_configurations_updated_at
  BEFORE UPDATE ON public.service_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_service_configurations_service_name ON public.service_configurations(service_name);
CREATE INDEX idx_service_configurations_config_type ON public.service_configurations(config_type);
CREATE INDEX idx_service_configurations_is_active ON public.service_configurations(is_active);
CREATE INDEX idx_service_configurations_ai_generated ON public.service_configurations(ai_generated);