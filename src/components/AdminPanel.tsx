import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Play, Pause, Sparkles, Plus, RefreshCw, Settings, LogOut, User, TestTube, Download, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";
import {
  ServiceName,
  ServiceConfiguration,
  generateAIConfig,
  getServiceConfigurations,
  getAllConfigurations,
  saveConfiguration,
  updateConfiguration,
  deleteConfiguration,
  toggleConfigurationStatus,
  clearServiceConfigurations,
  applyConfigurationsToService
} from "@/lib/serviceConfigApi";

// All 25 services with their display names and config types
const ALL_SERVICES: { value: ServiceName; label: string; configTypes: string[] }[] = [
  // Core Services (Original 7)
  { value: 'PII', label: 'PII Protection', configTypes: ['entities', 'patterns', 'rules'] },
  { value: 'TOXICITY', label: 'Toxicity Detection', configTypes: ['keywords', 'rules', 'thresholds'] },
  { value: 'JAILBREAK', label: 'Jailbreak Detection', configTypes: ['patterns', 'rules', 'signatures'] },
  { value: 'BAN', label: 'Ban/Bias Safety', configTypes: ['rules', 'keywords', 'allowlist'] },
  { value: 'POLICY', label: 'Policy Moderation', configTypes: ['rules', 'categories', 'policies'] },
  { value: 'SECRETS', label: 'Secrets Detection', configTypes: ['signatures', 'patterns', 'rules'] },
  { value: 'FORMAT', label: 'Format Validation', configTypes: ['expressions', 'schemas', 'rules'] },
  
  // Extended Services (Additional 18)
  { value: 'PHISHING', label: 'Phishing Detection', configTypes: ['patterns', 'rules', 'domains'] },
  { value: 'MALWARE', label: 'Malware Detection', configTypes: ['signatures', 'patterns', 'rules'] },
  { value: 'SPAM', label: 'Spam Filtering', configTypes: ['keywords', 'rules', 'scoring'] },
  { value: 'FRAUD', label: 'Fraud Detection', configTypes: ['patterns', 'rules', 'scoring'] },
  { value: 'NSFW', label: 'NSFW Content Detection', configTypes: ['keywords', 'rules', 'categories'] },
  { value: 'VIOLENCE', label: 'Violence Detection', configTypes: ['keywords', 'patterns', 'rules'] },
  { value: 'HARASSMENT', label: 'Harassment Detection', configTypes: ['patterns', 'rules', 'categories'] },
  { value: 'HATE_SPEECH', label: 'Hate Speech Detection', configTypes: ['patterns', 'keywords', 'rules'] },
  { value: 'MISINFORMATION', label: 'Misinformation Detection', configTypes: ['patterns', 'rules', 'sources'] },
  { value: 'COPYRIGHT', label: 'Copyright Protection', configTypes: ['patterns', 'rules', 'signatures'] },
  { value: 'PRIVACY', label: 'Privacy Protection', configTypes: ['patterns', 'rules', 'entities'] },
  { value: 'FINANCIAL', label: 'Financial Data Protection', configTypes: ['patterns', 'rules', 'entities'] },
  { value: 'MEDICAL', label: 'Medical Data Protection', configTypes: ['patterns', 'rules', 'entities'] },
  { value: 'LEGAL', label: 'Legal Compliance', configTypes: ['rules', 'patterns', 'regulations'] },
  { value: 'PROFANITY', label: 'Profanity Filtering', configTypes: ['keywords', 'patterns', 'rules'] },
  { value: 'SENTIMENT', label: 'Sentiment Analysis', configTypes: ['rules', 'thresholds', 'categories'] },
  { value: 'LANGUAGE', label: 'Language Detection', configTypes: ['patterns', 'rules', 'models'] },
  { value: 'COMPLIANCE', label: 'Compliance Checking', configTypes: ['rules', 'regulations', 'standards'] }
];

export default function AdminPanel() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceName>('PII');
  const [selectedConfigType, setSelectedConfigType] = useState('entities');
  const [configurations, setConfigurations] = useState<ServiceConfiguration[]>([]);
  
  // AI Generation State
  const [sampleInputs, setSampleInputs] = useState('');
  const [description, setDescription] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState('');
  
  // Manual Configuration State
  const [manualConfig, setManualConfig] = useState('');
  
  // Testing State
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, [selectedService]);

  useEffect(() => {
    // Reset config type when service changes
    const serviceConfig = ALL_SERVICES.find(s => s.value === selectedService);
    if (serviceConfig && !serviceConfig.configTypes.includes(selectedConfigType)) {
      setSelectedConfigType(serviceConfig.configTypes[0]);
    }
  }, [selectedService]);

  const loadConfigurations = async () => {
    try {
      const configs = await getServiceConfigurations(selectedService);
      setConfigurations(configs);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load configurations: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleGenerateAI = async () => {
    if (!sampleInputs.trim()) {
      toast({
        title: "Error",
        description: "Please provide sample inputs for AI analysis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const inputs = sampleInputs.split('\n').filter(line => line.trim());
      const result = await generateAIConfig({
        serviceName: selectedService,
        configType: selectedConfigType,
        sampleInputs: inputs,
        description: description || undefined
      });

      setGeneratedConfig(JSON.stringify(result.configData, null, 2));
      await loadConfigurations();
      
      toast({
        title: "Success",
        description: `AI configuration generated with ${Math.round(result.confidence * 100)}% confidence`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate AI config: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManual = async () => {
    if (!manualConfig.trim()) {
      toast({
        title: "Error",
        description: "Please provide configuration data",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let configData;
      try {
        configData = JSON.parse(manualConfig);
      } catch {
        throw new Error('Invalid JSON format');
      }

      await saveConfiguration({
        service_name: selectedService,
        config_type: selectedConfigType,
        config_data: configData,
        ai_generated: false,
        description: description || `Manual ${selectedConfigType} configuration`,
        is_active: true
      });

      await loadConfigurations();
      setManualConfig('');
      
      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save configuration: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfig = async (id: string) => {
    try {
      await toggleConfigurationStatus(id);
      await loadConfigurations();
      toast({
        title: "Success",
        description: "Configuration status updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to toggle configuration: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      await deleteConfiguration(id);
      await loadConfigurations();
      toast({
        title: "Success",
        description: "Configuration deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete configuration: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      await clearServiceConfigurations(selectedService);
      await loadConfigurations();
      toast({
        title: "Success",
        description: `All ${selectedService} configurations cleared`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to clear configurations: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyConfigs = async () => {
    setLoading(true);
    try {
      await applyConfigurationsToService(selectedService);
      toast({
        title: "Success",
        description: `Configurations applied to ${selectedService} service`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to apply configurations: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceConfig = ALL_SERVICES.find(s => s.value === selectedService);

  const handleTestConfiguration = async (configId: string) => {
    try {
      setIsTesting(true);
      const config = configurations.find(c => c.id === configId);
      if (!config) return;

      // Import test suite dynamically
      const { runServiceTestSuite } = await import("@/lib/serviceTestSuite");
      const results = await runServiceTestSuite(selectedService);
      
      setTestResults(results);
      toast({
        title: "Configuration Test Complete",
        description: `Test completed: ${results.passedTests}/${results.totalTests} tests passed`,
        variant: results.passedTests === results.totalTests ? "default" : "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const exportConfigurations = () => {
    const data = {
      service: selectedService,
      configurations: configurations,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedService}-configurations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfigurations = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.configurations && Array.isArray(data.configurations)) {
          // Save each configuration
          for (const config of data.configurations) {
            const { id, created_at, updated_at, ...configData } = config;
            await saveConfiguration(configData);
          }
          
          await loadConfigurations();
          toast({
            title: "Configurations Imported",
            description: `Successfully imported ${data.configurations.length} configurations`
          });
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid configuration file format",
          variant: "destructive"
        });
      }
    };
    input.click();
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-center space-y-2 flex-1">
          <h1 className="text-3xl font-bold">zGrid Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage configurations for all 25 zGrid AI safety services with AI-powered generation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {user?.email}
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Selection
          </CardTitle>
          <CardDescription>
            Choose the service and configuration type you want to manage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select value={selectedService} onValueChange={(value: ServiceName) => setSelectedService(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_SERVICES.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="configType">Configuration Type</Label>
              <Select value={selectedConfigType} onValueChange={setSelectedConfigType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select config type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedServiceConfig?.configTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Configuration Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Configuration Generator
            </CardTitle>
            <CardDescription>
              Generate configurations using Gemini AI from sample inputs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sampleInputs">Sample Inputs (one per line)</Label>
              <Textarea
                id="sampleInputs"
                placeholder="Enter sample inputs that should trigger this service..."
                value={sampleInputs}
                onChange={(e) => setSampleInputs(e.target.value)}
                rows={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Describe what this configuration should detect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handleGenerateAI}
              disabled={loading || !sampleInputs.trim()}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            
            {generatedConfig && (
              <div className="space-y-2">
                <Label>Generated Configuration</Label>
                <Textarea
                  value={generatedConfig}
                  readOnly
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Manual Configuration
            </CardTitle>
            <CardDescription>
              Create configurations manually with JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manualConfig">Configuration JSON</Label>
              <Textarea
                id="manualConfig"
                placeholder='{"patterns": [{"name": "example", "pattern": "...", "description": "..."}]}'
                value={manualConfig}
                onChange={(e) => setManualConfig(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            
            <Button
              onClick={handleSaveManual}
              disabled={loading || !manualConfig.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Saved Configurations ({configurations.length})
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleApplyConfigs}
                disabled={loading || configurations.filter(c => c.is_active).length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Apply Active
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAll}
                disabled={loading || configurations.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage and apply configurations for {selectedServiceConfig?.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configurations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No configurations found for {selectedServiceConfig?.label}
            </p>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <div
                  key={config.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{config.config_type}</h4>
                        {config.ai_generated && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                        <Badge 
                          variant={config.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {config.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {config.confidence_score && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(config.confidence_score * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(config.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleConfig(config.id)}
                      >
                        {config.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConfiguration(config.id)}
                        disabled={isTesting}
                        className="flex items-center gap-1"
                      >
                        <TestTube className="h-3 w-3" />
                        Test
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <details className="space-y-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Configuration
                    </summary>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(config.config_data, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Test Results Display */}
      {testResults && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Service Test Results - {testResults.service}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.passedTests}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.failedTests}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{testResults.totalTests}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(testResults.averageResponseTime)}ms</div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}