-- Fix security vulnerability: Replace overly permissive RLS policies with authentication-based ones
-- Remove all existing policies first
DROP POLICY IF EXISTS "Allow public delete access to service configurations" ON public.service_configurations;
DROP POLICY IF EXISTS "Allow public insert access to service configurations" ON public.service_configurations;
DROP POLICY IF EXISTS "Allow public read access to service configurations" ON public.service_configurations;
DROP POLICY IF EXISTS "Allow public update access to service configurations" ON public.service_configurations;

-- Create secure authentication-based policies
-- Only authenticated users can read configurations
CREATE POLICY "Authenticated users can read service configurations" 
ON public.service_configurations 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can insert configurations
CREATE POLICY "Authenticated users can insert service configurations" 
ON public.service_configurations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update configurations
CREATE POLICY "Authenticated users can update service configurations" 
ON public.service_configurations 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Only authenticated users can delete configurations
CREATE POLICY "Authenticated users can delete service configurations" 
ON public.service_configurations 
FOR DELETE 
TO authenticated
USING (true);