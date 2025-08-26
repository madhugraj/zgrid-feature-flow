import { ExternalLink, Code, Database, Tag, Plus } from 'lucide-react';
import { Feature } from '@/types/Feature';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';

interface FeatureModalProps {
  feature: Feature;
  isOpen: boolean;
  onClose: () => void;
}

export function FeatureModal({ feature, isOpen, onClose }: FeatureModalProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(feature);
    onClose();
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
                <a href={feature.referenceLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Documentation
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}