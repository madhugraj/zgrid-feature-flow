import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Code, Database, Tag, Plus, Play, Shield, CheckCircle, XCircle, Key } from 'lucide-react';
import { Feature } from '@/types/Feature';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { validatePII, validateTox, validateJailbreak, validatePolicy, validateBan, validateSecrets, validateFormat, validateGibberish,
  addPIIEntities, addJailbreakRules, addPolicyRules, addBanRules, addSecretsSignatures, addFormatExpressions, addGibberishRules } from '@/lib/zgridClient';

const getStatusDescription = (result: any, featureName: string) => {
  const status = result.status;
  const reasons = result.reasons || [];
  
  if (status === 'pass') {
    return `✅ Content passed - No issues detected`;
  } else if (status === 'fixed') {
    if (reasons.length > 0) {
      return `🔧 Content fixed - ${reasons.join(', ')}`;
    }
    return `🔧 Content fixed - Issues detected and processed`;
  } else if (status === 'blocked') {
    if (reasons.length > 0) {
      return `🚫 Content blocked - ${reasons.join(', ')}`;
    }
    return `🚫 Content blocked - Policy violation detected`;
  }
  
  return `Status: ${status}`;
};


interface FeatureModalProps {
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
}

export function FeatureModal({ feature, isOpen, onClose }: FeatureModalProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [tryItInput, setTryItInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{ 
    status: 'pass' | 'blocked' | 'fixed' | null;
    processedText?: string;
    entities?: Array<{ type: string; text: string; start: number; end: number; value?: string }>;
    flagged?: Array<{ type: string; score: number; span?: number[]; sentence?: string; value?: string; category?: string }>;
    scores?: Record<string, number>;
    isGibberish?: boolean;
    confidence?: number;
    reasons?: string[];
    steps?: string[];
    error?: string;
    serviceType?: 'pii' | 'other';
  }>({ status: null });
  const [useLocalServices, setUseLocalServices] = useState(true); // Default to true for FastAPI services
  const [adminConfig, setAdminConfig] = useState('');
  const [isAddingConfig, setIsAddingConfig] = useState(false);

  const handleAddToCart = () => {
    addItem(feature);
    toast({
      title: "Added to Cart",
      description: `${feature.name} has been added to your collection.`,
    });
    onClose();
  };

  const detectPII = async (text: string) => {
    try {
      return await validatePII(text);
    } catch (error) {
      console.error('PII Detection Error:', error);
      throw error;
    }
  };

  const detectToxicity = async (text: string) => {
    try {
      return await validateTox(text);
    } catch (error) {
      console.error('Toxicity Detection Error:', error);
      throw error;
    }
  };

  const handleAddCustomConfig = async () => {
    if (!adminConfig.trim()) return;
    
    setIsAddingConfig(true);
    try {
      const config = JSON.parse(adminConfig);
      
      if (feature.featureCode === 'ZG0001' || feature.name.toLowerCase().includes('pii')) {
        await addPIIEntities(config);
        toast({ title: "PII Config Added", description: "Custom PII entities added successfully." });
      } else if (feature.featureCode === 'ZG0002' || feature.name.toLowerCase().includes('jailbreak')) {
        await addJailbreakRules(config);
        toast({ title: "Jailbreak Rules Added", description: "Custom jailbreak rules added successfully." });
      } else if (feature.featureCode === 'ZG0003' || feature.name.toLowerCase().includes('policy')) {
        await addPolicyRules(config);
        toast({ title: "Policy Rules Added", description: "Custom policy rules added successfully." });
      } else if (feature.featureCode === 'ZG0005' || feature.name.toLowerCase().includes('ban')) {
        await addBanRules(config);
        toast({ title: "Ban Rules Added", description: "Custom ban rules added successfully." });
      } else if (feature.featureCode === 'ZG0006' || feature.name.toLowerCase().includes('secret')) {
        await addSecretsSignatures(config);
        toast({ title: "Secret Signatures Added", description: "Custom secret signatures added successfully." });
      } else if (feature.featureCode === 'ZG0007' || feature.name.toLowerCase().includes('format')) {
        await addFormatExpressions(config);
        toast({ title: "Format Expressions Added", description: "Custom format expressions added successfully." });
      } else if (feature.featureCode === 'ZG0008' || feature.name.toLowerCase().includes('gibberish')) {
        await addGibberishRules(config);
        toast({ title: "Gibberish Rules Added", description: "Custom gibberish rules added successfully." });
      }
      
      setAdminConfig('');
    } catch (error) {
      toast({
        title: "Configuration Error",
        description: "Failed to add custom configuration. Please check your JSON format.",
        variant: "destructive"
      });
    } finally {
      setIsAddingConfig(false);
    }
  };

  const getServiceApiFunction = (featureCode: string) => {
    switch (featureCode) {
      case 'ZG0002': return (text: string) => validateJailbreak(text);
      case 'ZG0003': return (text: string) => validatePolicy(text);
      case 'ZG0005': return (text: string) => validateBan(text);
      case 'ZG0006': return (text: string) => validateSecrets(text);
      case 'ZG0007': return (text: string) => validateFormat(text);
      case 'ZG0008': return (text: string) => validateGibberish(text);
      default: return null;
    }
  };

  const getAdminConfigExample = (featureCode: string) => {
    switch (featureCode) {
      case 'ZG0001':
        return `{
  "custom_entities": [
    {
      "type": "EMPLOYEE_ID",
      "pattern": "\\\\bEMP\\\\d{6}\\\\b",
      "description": "Employee ID format"
    }
  ],
  "custom_placeholders": [
    {
      "entity_type": "EMPLOYEE_ID",
      "placeholder": "[EMP_ID]"
    }
  ]
}`;
      case 'ZG0002':
        return `{
  "custom_rules": [
    {
      "id": "COMPANY_SECRETS",
      "pattern": "\\\\b(ignore|disregard)\\\\s+(company|internal)\\\\s+(policies|rules)\\\\b",
      "flags": "i"
    }
  ]
}`;
      case 'ZG0003':
        return `{
  "custom_policies": [
    {
      "category": "COMPANY_SECRETS",
      "keywords": ["confidential", "proprietary"],
      "severity": "HIGH"
    }
  ]
}`;
      case 'ZG0005':
        return `{
  "custom_bans": [
    {
      "pattern": "competitor_name",
      "type": "literal",
      "category": "COMPETITOR",
      "severity": 4
    }
  ]
}`;
      case 'ZG0006':
        return `{
  "custom_signatures": [
    {
      "id": "CUSTOM_API_KEY",
      "category": "INTERNAL",
      "type": "regex",
      "pattern": "\\\\bck_[A-Za-z0-9]{32}\\\\b",
      "severity": 4
    }
  ]
}`;
      case 'ZG0007':
        return `{
  "custom_expressions": [
    "Email {email}, phone {phone}",
    "Name: {word}, Age: {int}"
  ]
}`;
      case 'ZG0008':
        return `{
  "threshold": 0.8,
  "min_length": 10,
  "custom_patterns": [
    {
      "pattern": "[a-z]{8,}",
      "description": "Long random letter sequences", 
      "weight": 0.3
    }
  ]
}`;
      default:
        return '{}';
    }
  };

  const handleSimulate = async () => {
    setIsLoading(true);
    setSimulationResult({ status: null });

    try {
      // Check if this is PII Protection feature
      if (feature.featureCode === 'ZG0001' || feature.name.toLowerCase().includes('pii')) {
        if (useLocalServices) {
          try {
            const result = await validatePII(tryItInput, 
              ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "US_SSN", "PERSON", "LOCATION", "IN_AADHAAR", "IN_PAN"],
              true
            );
            
            // Process PII service response - use redacted_text for display
            const piiResult = result.results?.pii || result;
            const entities = piiResult.entities || [];
            const status = result.status || (entities.length > 0 ? 'blocked' : 'pass');
            
            setSimulationResult({
              status,
              processedText: piiResult.redacted_text || result.clean_text,
              entities: entities,
              reasons: result.reasons || [],
              serviceType: 'pii'
            });
            
            const statusDetails = getStatusDescription(result, feature.name);
            toast({
              title: "PII Detection Complete",
              description: statusDetails,
            });
          } catch (error) {
            console.error('PII Validation Error Details:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setSimulationResult({ 
              status: 'blocked', 
              error: `PII service error: ${errorMessage}` 
            });
            toast({
              title: "Service Connection Error", 
              description: `Cannot connect to PII service: ${errorMessage}`,
              variant: "destructive"
            });
          }
        } else {
          // Mock PII detection for demo
          const mockEntities = [];
          const input = tryItInput.toLowerCase();
          if (input.includes('@') || input.includes('email')) {
            mockEntities.push({ type: 'EMAIL', text: 'detected email', start: 0, end: 10 });
          }
          if (input.includes('phone') || /\d{3}-\d{3}-\d{4}/.test(input)) {
            mockEntities.push({ type: 'PHONE', text: 'detected phone', start: 0, end: 10 });
          }
          if (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(tryItInput)) {
            mockEntities.push({ type: 'PERSON', text: 'detected name', start: 0, end: 10 });
          }
          
          setSimulationResult({
            status: mockEntities.length > 0 ? 'blocked' : 'pass',
            processedText: mockEntities.length > 0 ? tryItInput.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[PERSON]').replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]') : tryItInput,
            entities: mockEntities,
            serviceType: 'pii'
          });
          
          toast({
            title: "PII Detection Complete (Demo Mode)",
            description: `Found ${mockEntities.length} PII entities in demo simulation.`,
          });
        }
      } else if (feature.featureCode === 'ZG0004' || feature.name.toLowerCase().includes('toxicity')) {
        if (useLocalServices) {
          try {
            const result = await detectToxicity(tryItInput);
            setSimulationResult({
              status: result.status,
              processedText: result.clean_text,
              flagged: result.flagged,
              scores: result.scores,
              reasons: result.reasons || [],
              serviceType: 'other'
            });
            
            const statusDetails = getStatusDescription(result, feature.name);
            toast({
              title: "Toxicity Detection Complete", 
              description: statusDetails,
            });
          } catch (error) {
            console.error('Toxicity Detection Error:', error);
            
            let errorMessage = "Toxicity service error occurred.";
            let errorTitle = "Service Error";
            
            if (error instanceof Error) {
              if (error.message.includes('timed out')) {
                errorMessage = "Toxicity service request timed out. The service may be slow or overloaded.";
                errorTitle = "Service Timeout";
              } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
                errorMessage = "Cannot connect to toxicity service. Check that the service is running.";
                errorTitle = "Connection Error";
              } else {
                errorMessage = `Toxicity service error: ${error.message}`;
              }
            }
            
            setSimulationResult({ 
              status: 'blocked', 
              error: errorMessage
            });
            toast({
              title: errorTitle,
              description: errorMessage,
              variant: "destructive"
            });
          }
        } else {
          // Mock toxicity detection for demo
          const input = tryItInput.toLowerCase();
          const toxicPatterns = ['hate', 'kill', 'stupid', 'idiot', 'attack', 'destroy', 'violence'];
          const flaggedItems = [];
          let cleanText = tryItInput;
          
          toxicPatterns.forEach(pattern => {
            if (input.includes(pattern)) {
              flaggedItems.push({
                type: 'TOXICITY',
                score: 0.85 + Math.random() * 0.1, // Random score between 0.85-0.95
                span: [input.indexOf(pattern), input.indexOf(pattern) + pattern.length],
                sentence: tryItInput
              });
              cleanText = cleanText.replace(new RegExp(pattern, 'gi'), '[REMOVED]');
            }
          });
          
          setSimulationResult({
            status: flaggedItems.length > 0 ? 'fixed' : 'pass',
            processedText: flaggedItems.length > 0 ? cleanText : tryItInput,
            flagged: flaggedItems,
            scores: {
              toxicity: flaggedItems.length > 0 ? 0.85 : 0.05,
              severe_toxicity: flaggedItems.length > 0 ? 0.12 : 0.01,
              obscene: flaggedItems.length > 0 ? 0.45 : 0.02,
              threat: flaggedItems.length > 0 ? 0.25 : 0.01,
              insult: flaggedItems.length > 0 ? 0.65 : 0.02,
              identity_attack: flaggedItems.length > 0 ? 0.15 : 0.01
            },
            serviceType: 'other'
          });
          
          toast({
            title: "Toxicity Detection Complete (Demo Mode)",
            description: `Status: ${flaggedItems.length > 0 ? 'fixed' : 'passed'}. Found ${flaggedItems.length} toxic elements in demo simulation.`,
          });
        }
      } else if (feature.featureCode === 'ZG0008' || feature.name.toLowerCase().includes('gibberish')) {
        if (useLocalServices) {
          try {
            const result = await validateGibberish(tryItInput, 0.8, 10, true);
            
            // Handle both individual service response and combined gateway response
            let gibberishResult = result;
            if (result.results && result.results.gibberish) {
              // Combined gateway response - extract gibberish service result
              gibberishResult = result.results.gibberish;
            }
            
            setSimulationResult({
              status: result.status || gibberishResult.status,
              processedText: gibberishResult.clean_text,
              isGibberish: gibberishResult.is_gibberish,
              confidence: gibberishResult.confidence,
              flagged: gibberishResult.flagged,
              reasons: result.reasons || gibberishResult.reasons || [],
              serviceType: 'other'
            });
            
            const statusDetails = getStatusDescription(result, feature.name);
            toast({
              title: "Gibberish Detection Complete", 
              description: statusDetails,
            });
          } catch (error) {
            console.error('Gibberish Detection Error:', error);
            
            let errorMessage = "Gibberish service error occurred.";
            let errorTitle = "Service Error";
            
            if (error instanceof Error) {
              if (error.message.includes('timed out')) {
                errorMessage = "Gibberish service request timed out. The service may be slow or overloaded.";
                errorTitle = "Service Timeout";
              } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
                errorMessage = "Cannot connect to gibberish service. Check that the service is running.";
                errorTitle = "Connection Error";
              } else {
                errorMessage = `Gibberish service error: ${error.message}`;
              }
            }
            
            setSimulationResult({ 
              status: 'blocked', 
              error: errorMessage
            });
            toast({
              title: errorTitle,
              description: errorMessage,
              variant: "destructive"
            });
          }
        } else {
          // Mock gibberish detection for demo
          const input = tryItInput.toLowerCase();
          const gibberishPatterns = [
            /[qwerty]{4,}/i,
            /[asdf]{4,}/i, 
            /[zxcv]{4,}/i,
            /(.)\1{4,}/,  // Repeated characters
            /[bcdfghjklmnpqrstvwxyz]{8,}/i // Long consonant sequences
          ];
          
          let hasGibberish = false;
          let confidence = 0.1;
          const flaggedItems = [];
          
          gibberishPatterns.forEach((pattern, index) => {
            const matches = tryItInput.match(pattern);
            if (matches) {
              hasGibberish = true;
              confidence = 0.7 + (index * 0.05);
              flaggedItems.push({
                type: 'gibberish',
                category: 'GIBBERISH',
                value: matches[0],
                start: tryItInput.indexOf(matches[0]),
                end: tryItInput.indexOf(matches[0]) + matches[0].length,
                score: confidence,
                engine: 'pattern_matching'
              });
            }
          });
          
          setSimulationResult({
            status: hasGibberish ? 'blocked' : 'pass',
            processedText: hasGibberish ? '' : tryItInput,
            isGibberish: hasGibberish,
            confidence: confidence,
            flagged: flaggedItems,
            serviceType: 'other'
          });
          
          toast({
            title: "Gibberish Detection Complete (Demo Mode)",
            description: `Status: ${hasGibberish ? 'blocked' : 'passed'}. Confidence: ${Math.round(confidence * 100)}%`,
          });
        }
      } else {
        // Handle other services with FastAPI integration
        const apiFunction = getServiceApiFunction(feature.featureCode);
        
        if (useLocalServices && apiFunction) {
          try {
            const result = await apiFunction(tryItInput);
            setSimulationResult({
              status: result.status || 'pass',
              processedText: result.clean_text || result.cleaned_text,
              flagged: result.flagged || result.violations,
              scores: result.scores,
              reasons: result.reasons || [],
              serviceType: 'other'
            });
            
            const statusDetails = getStatusDescription(result, feature.name);
            toast({
              title: `${feature.name} Detection Complete`,
              description: statusDetails,
            });
          } catch (error) {
            console.error(`${feature.name} test failed:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setSimulationResult({ 
              status: 'blocked', 
              error: `${feature.name} test failed: ${errorMessage}` 
            });
            toast({
              title: "Test Failed", 
              description: errorMessage,
              variant: "destructive"
            });
          }
        } else {
          // Mock simulation for other features
          const isModeration = feature.category.includes('Moderation') || feature.category.includes('Safety');
          const isBanList = feature.name.toLowerCase().includes('bias') || feature.name.toLowerCase().includes('ban');
          
          if (isModeration || isBanList) {
            const input = tryItInput.toLowerCase();
            const unsafePatterns = ['harm', 'violence', 'hate', 'attack', '****', 'kill', 'destroy'];
            const hasUnsafeContent = unsafePatterns.some(pattern => input.includes(pattern));
            
            setSimulationResult({ 
              status: hasUnsafeContent ? 'blocked' : 'pass',
              processedText: hasUnsafeContent ? '' : tryItInput,
              serviceType: 'other'
            });
          } else {
            setSimulationResult({ 
              status: 'pass',
              processedText: tryItInput,
              serviceType: 'other'
            });
          }

          toast({
            title: "Simulation Complete (Demo Mode)",
            description: `Feature ${feature.name} simulation executed successfully.`,
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Privacy / Leakage': 'bg-purple-100 text-purple-800',
      'Safety / Security': 'bg-red-100 text-red-800',
      'Safety / Moderation': 'bg-orange-100 text-orange-800',
      'Safety / Fairness': 'bg-yellow-100 text-yellow-800',
      'Safety / Quality': 'bg-cyan-100 text-cyan-800',
      'Input Validation': 'bg-green-100 text-green-800',
      'Formatting / Usability': 'bg-blue-100 text-blue-800',
      'Formatting / Language': 'bg-indigo-100 text-indigo-800',
      'Factuality / Language': 'bg-teal-100 text-teal-800',
      'Factuality / Reasoning': 'bg-emerald-100 text-emerald-800',
      'Summarization / RAG': 'bg-violet-100 text-violet-800',
      'Relevance / QA': 'bg-rose-100 text-rose-800',
      'Relevance / RAG': 'bg-pink-100 text-pink-800',
      'Provenance / RAG': 'bg-amber-100 text-amber-800',
      'Originality / Citation': 'bg-lime-100 text-lime-800',
      'Relevance / Custom QA': 'bg-sky-100 text-sky-800',
      'Relevance / Scope': 'bg-slate-100 text-slate-800',
      'Security / Agents': 'bg-zinc-100 text-zinc-800',
      'Conversational Safety': 'bg-stone-100 text-stone-800',
      'Security / Leakage': 'bg-neutral-100 text-neutral-800',
      'Testing / QA': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge className={`mb-2 ${getCategoryColor(feature.category)}`}>
                {feature.category}
              </Badge>
              <DialogTitle className="text-2xl">{feature.name}</DialogTitle>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {feature.featureCode}
              </p>
            </div>
            <Button onClick={handleAddToCart} className="btn-gradient text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>

          <Separator />

          {/* Example Input/Output */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Example Input
              </h4>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {feature.exampleInput}
                </pre>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Example Output
              </h4>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {feature.exampleOutput}
                </pre>
              </div>
            </div>
          </div>

          <Separator />

          {/* Configuration and Testing */}
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="test">Test & Try</TabsTrigger>
              <TabsTrigger value="configure">Configure</TabsTrigger>
            </TabsList>
            
            <TabsContent value="test" className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5" />
                Try It Live
              </h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useLocalServices"
                    checked={useLocalServices}
                    onChange={(e) => setUseLocalServices(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="useLocalServices" className="text-sm font-medium">
                    Use FastAPI Services
                  </label>
                </div>
                
                
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Test Input</label>
                <Textarea
                  placeholder="Enter text to test this feature..."
                  value={tryItInput}
                  onChange={(e) => setTryItInput(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSimulate} 
                  disabled={!tryItInput.trim() || isLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {isLoading ? 'Testing...' : 'Simulate'}
                </Button>
                
                {simulationResult.status && (
                  <Badge 
                    variant={simulationResult.status === 'blocked' || simulationResult.status === 'fixed' ? 'destructive' : 'default'}
                    className="flex items-center gap-1"
                  >
                    {simulationResult.status === 'blocked' || simulationResult.status === 'fixed' ? (
                      <XCircle className="h-3 w-3" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {simulationResult.status === 'blocked' ? (simulationResult.serviceType === 'pii' ? 'PII Detected' : 'Content Blocked') : 
                     simulationResult.status === 'fixed' ? 'Content Fixed' : 'Clean'}
                  </Badge>
                )}
              </div>
              
              {/* Service Results */}
              {simulationResult.processedText !== undefined && simulationResult.status && simulationResult.status !== null && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {simulationResult.serviceType === 'pii' ? 'Redacted Text' : 'Processed Text'}
                    </label>
                    <div className="bg-background p-3 rounded border font-mono text-sm">
                      {simulationResult.processedText || (simulationResult.status === 'blocked' ? 'Content blocked by service' : 'No text returned')}
                    </div>
                  </div>
                  
                  {/* Show reasons if available */}
                  {simulationResult.reasons && simulationResult.reasons.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Reasons</label>
                      <div className="flex flex-wrap gap-2">
                        {simulationResult.reasons.map((reason, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* PII Entities */}
                  {simulationResult.entities && simulationResult.entities.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Detected Entities</label>
                      <div className="flex flex-wrap gap-2">
                        {simulationResult.entities.map((entity, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {entity.type}: {entity.text || '[REDACTED]'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Flagged Content */}
                  {simulationResult.flagged && simulationResult.flagged.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Flagged Content</label>
                      <div className="space-y-2">
                        {simulationResult.flagged.map((item, index) => (
                          <div key={index} className="bg-destructive/10 p-2 rounded border border-destructive/20">
                            <div className="flex justify-between items-center">
                              <Badge variant="destructive" className="text-xs">
                                {item.type}{item.category ? ` (${item.category})` : ''}: {item.score ? (item.score * 100).toFixed(1) + '%' : 'Detected'}
                              </Badge>
                            </div>
                            {(item.sentence || item.value) && (
                              <div className="text-sm mt-1 font-mono">"{item.sentence || item.value}"</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toxicity Scores */}
                  {simulationResult.scores && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Confidence Scores</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(simulationResult.scores).map(([key, score]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="capitalize">{key.replace('_', ' ')}</span>
                            <span className="font-mono">{(score * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Gibberish specific info */}
                  {simulationResult.isGibberish !== undefined && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Detection Info</label>
                      <div className="text-xs space-y-1">
                        <div>Is Gibberish: {simulationResult.isGibberish ? 'Yes' : 'No'}</div>
                        {simulationResult.confidence && (
                          <div>Confidence: {(simulationResult.confidence * 100).toFixed(1)}%</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {simulationResult.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  {simulationResult.error}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                * This connects to your deployed service for real-time validation and processing.
              </p>
            </div>
            </TabsContent>

            <TabsContent value="configure" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Custom Configuration
                  </CardTitle>
                  <CardDescription>
                    Add custom rules and patterns for {feature.name} before adding to cart.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="adminConfig">Configuration JSON</Label>
                    <Textarea
                      id="adminConfig"
                      placeholder={getAdminConfigExample(feature.featureCode)}
                      value={adminConfig}
                      onChange={(e) => setAdminConfig(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddCustomConfig}
                      disabled={!adminConfig.trim() || isAddingConfig}
                      variant="outline"
                    >
                      {isAddingConfig ? 'Adding...' : 'Add Configuration'}
                    </Button>
                    <Button 
                      onClick={() => setAdminConfig('')}
                      variant="ghost"
                      size="sm"
                    >
                      Clear
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                    <strong>Note:</strong> Custom configurations are added to the service immediately and will affect all future requests.
                    Test your configuration using the "Test & Try" tab before adding to cart.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Technical Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Standard Inputs
              </h4>
              <div className="flex flex-wrap gap-2">
                {feature.standardInputs.map((input, index) => (
                  <Badge key={index} variant="outline">
                    {input}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Default Output</h4>
              <Badge variant="secondary" className="font-mono">
                {feature.defaultOutputPlaceholder}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {feature.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Repository & Reference */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="h-4 w-4" />
                Repository Dependency
              </h4>
              <p className="font-mono text-sm bg-muted/50 p-3 rounded">
                {feature.repoDependency}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Reference Documentation</h4>
              <Button variant="outline" size="sm" asChild>
                {(feature.featureCode === 'ZG0001' || feature.name.toLowerCase().includes('pii')) ? (
                  <Link to="/docs/pii-protection">
                    <Code className="h-4 w-4 mr-2" />
                    View Documentation
                  </Link>
                ) : (feature.featureCode === 'ZG0004' || feature.name.toLowerCase().includes('toxicity')) ? (
                  <Link to="/docs/toxicity-protection">
                    <Code className="h-4 w-4 mr-2" />
                    View Documentation
                  </Link>
                ) : (
                  <a href={feature.referenceLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Documentation
                  </a>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}