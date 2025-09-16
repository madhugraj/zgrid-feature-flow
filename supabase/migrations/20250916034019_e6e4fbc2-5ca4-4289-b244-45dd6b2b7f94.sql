-- First, let's check what's actually in the service_name column and fix it
ALTER TABLE service_configurations ALTER COLUMN service_name TYPE text;

-- Add any missing configurations that might be needed
CREATE INDEX IF NOT EXISTS idx_service_configurations_service_name ON service_configurations(service_name);
CREATE INDEX IF NOT EXISTS idx_service_configurations_config_type ON service_configurations(config_type);
CREATE INDEX IF NOT EXISTS idx_service_configurations_is_active ON service_configurations(is_active);