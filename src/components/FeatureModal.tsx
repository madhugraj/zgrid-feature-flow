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
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

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
    status: 'passed' | 'blocked' | 'fixed' | null;
    redactedText?: string;
    cleanText?: string;
    entities?: Array<{ type: string; text: string; start: number; end: number }>;
    flagged?: Array<{ type: string; score: number; span: number[]; sentence: string }>;
    scores?: Record<string, number>;
    error?: string;
  }>({ status: null });

  const handleAddToCart = () => {
    addItem(feature);
    toast({
      title: "Added to Cart",
      description: `${feature.name} has been added to your collection.`,
    });
    onClose();
  };

  const detectPII = async (text: string) => {
    const response = await fetch('https://your-ngrok-url-for-8000.ngrok-free.app/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({ text })
    });
    return response.json();
  };

  const detectToxicity = async (text: string) => {
    const response = await fetch('https://your-ngrok-url-for-8001.ngrok-free.app/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({ text })
    });
    return response.json();
  };

  const handleSimulate = async () => {
    setIsLoading(true);
    setSimulationResult({ status: null });

    try {
      // Check if this is PII Protection feature
      if (feature.featureCode === 'ZG0001' || feature.name.toLowerCase().includes('pii')) {
        if (!apiKey.trim()) {
          setSimulationResult({ 
            status: 'blocked', 
            error: 'API key is required for PII Protection' 
          });
          toast({
            title: "API Key Required",
            description: "Please enter your API key to test PII Protection.",
            variant: "destructive"
          });
          return;
        }

        try {
          const result = await detectPII(tryItInput);
          setSimulationResult({
            status: result.entities?.length > 0 ? 'blocked' : 'passed',
            redactedText: result.redacted_text,
            entities: result.entities
          });
          
          toast({
            title: "PII Detection Complete",
            description: `Found ${result.entities?.length || 0} PII entities.`,
          });
        } catch (error) {
          setSimulationResult({ 
            status: 'blocked', 
            error: 'Failed to connect to PII service. Make sure the service is running on localhost:8000.' 
          });
          toast({
            title: "Service Error",
            description: "Could not connect to PII detection service.",
            variant: "destructive"
          });
        }
      } else if (feature.featureCode === 'ZG0004' || feature.name.toLowerCase().includes('toxicity')) {
        if (!apiKey.trim()) {
          setSimulationResult({ 
            status: 'blocked', 
            error: 'API key is required for Toxicity Detection' 
          });
          toast({
            title: "API Key Required",
            description: "Please enter your API key to test Toxicity Detection.",
            variant: "destructive"
          });
          return;
        }

        try {
          const result = await detectToxicity(tryItInput);
          setSimulationResult({
            status: result.status,
            cleanText: result.clean_text,
            flagged: result.flagged,
            scores: result.scores
          });
          
          toast({
            title: "Toxicity Detection Complete",
            description: `Status: ${result.status}. Found ${result.flagged?.length || 0} toxic elements.`,
          });
        } catch (error) {
          setSimulationResult({ 
            status: 'blocked', 
            error: 'Failed to connect to Toxicity service. Make sure the service is running on localhost:8001.' 
          });
          toast({
            title: "Service Error",
            description: "Could not connect to toxicity detection service.",
            variant: "destructive"
          });
        }
      } else {
        // Simple simulation logic for other features
        const isModeration = feature.category.includes('Moderation') || feature.category.includes('Safety');
        const isBanList = feature.name.toLowerCase().includes('bias') || feature.name.toLowerCase().includes('ban');
        
        if (isModeration || isBanList) {
          const input = tryItInput.toLowerCase();
          const unsafePatterns = ['harm', 'violence', 'hate', 'attack', '****', 'kill', 'destroy'];
          const hasUnsafeContent = unsafePatterns.some(pattern => input.includes(pattern));
          
          setSimulationResult({ status: hasUnsafeContent ? 'blocked' : 'passed' });
        } else {
          setSimulationResult({ status: 'passed' });
        }

        toast({
          title: "Simulation Complete",
          description: `Feature ${feature.name} simulation executed successfully.`,
        });
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

          {/* Try It Playground */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5" />
              Try It
            </h3>
            <div className="space-y-4">
              {/* API Key input for PII Protection and Toxicity Detection */}
              {(feature.featureCode === 'ZG0001' || feature.name.toLowerCase().includes('pii') || 
                feature.featureCode === 'ZG0004' || feature.name.toLowerCase().includes('toxicity')) && (
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your API key (e.g., supersecret123)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for connecting to the {feature.featureCode === 'ZG0004' ? 'toxicity detection' : 'PII detection'} service
                  </p>
                </div>
              )}
              
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
                    {simulationResult.status === 'blocked' ? (feature.featureCode === 'ZG0001' ? 'PII Detected' : 'Content Blocked') : 
                     simulationResult.status === 'fixed' ? 'Toxic Content Removed' : 'Clean'}
                  </Badge>
                )}
              </div>
              
              {/* PII Detection Results */}
              {simulationResult.redactedText && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Redacted Text</label>
                    <div className="bg-background p-3 rounded border font-mono text-sm">
                      {simulationResult.redactedText}
                    </div>
                  </div>
                  
                  {simulationResult.entities && simulationResult.entities.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Detected Entities</label>
                      <div className="flex flex-wrap gap-2">
                        {simulationResult.entities.map((entity, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {entity.type}: {entity.text}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Toxicity Detection Results */}
              {simulationResult.cleanText && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Clean Text</label>
                    <div className="bg-background p-3 rounded border font-mono text-sm">
                      {simulationResult.cleanText}
                    </div>
                  </div>
                  
                  {simulationResult.flagged && simulationResult.flagged.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Flagged Content</label>
                      <div className="space-y-2">
                        {simulationResult.flagged.map((item, index) => (
                          <div key={index} className="bg-destructive/10 p-2 rounded border border-destructive/20">
                            <div className="flex justify-between items-center">
                              <Badge variant="destructive" className="text-xs">
                                {item.type}: {(item.score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="text-sm mt-1 font-mono">"{item.sentence}"</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {simulationResult.scores && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Toxicity Scores</label>
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
                </div>
              )}
              
              {simulationResult.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  {simulationResult.error}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                {(feature.featureCode === 'ZG0001' || feature.name.toLowerCase().includes('pii')) 
                  ? '* This connects to your real PII detection service running on localhost:8000'
                  : (feature.featureCode === 'ZG0004' || feature.name.toLowerCase().includes('toxicity'))
                  ? '* This connects to your real toxicity detection service running on localhost:8001'
                  : '* This is a demo simulation for UX purposes only. Actual implementation would use the specified repository dependency.'
                }
              </p>
            </div>
          </div>

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