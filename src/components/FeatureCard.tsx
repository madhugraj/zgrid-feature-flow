import { ExternalLink, Plus, Code, Tag, Database } from 'lucide-react';
import { Feature } from '@/types/Feature';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface FeatureCardProps {
  feature: Feature;
  onFeatureClick?: (feature: Feature) => void;
}

export function FeatureCard({ feature, onFeatureClick }: FeatureCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(feature);
    toast({
      title: "Added to Cart",
      description: `${feature.name} has been added to your collection.`,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Privacy / Leakage': 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-400/10 dark:text-purple-400 dark:border-purple-400/20',
      'Safety / Security': 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/20',
      'Safety / Moderation': 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20',
      'Safety / Fairness': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/20',
      'Safety / Quality': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-400/10 dark:text-cyan-400 dark:border-cyan-400/20',
      'Input Validation': 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/20',
      'Formatting / Usability': 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20',
      'Formatting / Language': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:border-indigo-400/20',
      'Factuality / Language': 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:bg-teal-400/10 dark:text-teal-400 dark:border-teal-400/20',
      'Factuality / Reasoning': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20',
      'Summarization / RAG': 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-400/10 dark:text-violet-400 dark:border-violet-400/20',
      'Relevance / QA': 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-400/10 dark:text-rose-400 dark:border-rose-400/20',
      'Relevance / RAG': 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:bg-pink-400/10 dark:text-pink-400 dark:border-pink-400/20',
      'Provenance / RAG': 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20',
      'Originality / Citation': 'bg-lime-500/10 text-lime-600 border-lime-500/20 dark:bg-lime-400/10 dark:text-lime-400 dark:border-lime-400/20',
      'Relevance / Custom QA': 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-400/10 dark:text-sky-400 dark:border-sky-400/20',
      'Relevance / Scope': 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/20',
      'Security / Agents': 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:bg-zinc-400/10 dark:text-zinc-400 dark:border-zinc-400/20',
      'Conversational Safety': 'bg-stone-500/10 text-stone-600 border-stone-500/20 dark:bg-stone-400/10 dark:text-stone-400 dark:border-stone-400/20',
      'Security / Leakage': 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20 dark:bg-neutral-400/10 dark:text-neutral-400 dark:border-neutral-400/20',
      'Testing / QA': 'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-400/10 dark:text-gray-400 dark:border-gray-400/20',
    };
    return colors[category as keyof typeof colors] || 'bg-muted/50 text-muted-foreground border-border';
  };

  return (
    <Card 
      className="h-full feature-card glass-card group fade-in"
      onClick={() => onFeatureClick?.(feature)}
    >
        <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Badge 
                variant="outline" 
                className={`mb-3 interactive-badge text-xs font-medium ${getCategoryColor(feature.category)}`}
              >
                {feature.category}
              </Badge>
              <h3 className="font-semibold text-base leading-tight mb-1 text-card-foreground">{feature.name}</h3>
              <p className="text-xs text-muted-foreground font-mono opacity-70">
                {feature.featureCode}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="btn-gradient shrink-0 h-8 w-8 p-0 opacity-80 group-hover:opacity-100"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 px-4 pb-4 space-y-3">
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-snug">
            {feature.description}
          </p>

          <div className="space-y-2.5">
            {/* Input Types - Minimalist */}
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-muted-foreground/60" />
              <div className="flex flex-wrap gap-1">
                {feature.standardInputs.slice(0, 2).map((input, index) => (
                  <Badge key={index} variant="secondary" className="text-xs py-0.5 px-1.5 bg-muted/30">
                    {input}
                  </Badge>
                ))}
                {feature.standardInputs.length > 2 && (
                  <Badge variant="secondary" className="text-xs py-0.5 px-1.5 bg-muted/30">
                    +{feature.standardInputs.length - 2}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags - Minimalist */}
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground/60" />
              <div className="flex flex-wrap gap-1">
                {feature.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="text-xs text-muted-foreground/70 bg-muted/20 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                {feature.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground/70 bg-muted/20 px-1.5 py-0.5 rounded">
                    +{feature.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-border/30">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2 text-muted-foreground/80 hover:text-foreground" 
              asChild
            >
              <a href={feature.referenceLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Docs
              </a>
            </Button>
            
            <div className="text-xs text-muted-foreground/60 font-mono">
              → {feature.defaultOutputPlaceholder}
            </div>
          </div>
        </CardContent>
      </Card>
  );
}