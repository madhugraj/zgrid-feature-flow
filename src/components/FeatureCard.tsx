import { useState } from 'react';
import { ExternalLink, Plus, Code, Tag, Database } from 'lucide-react';
import { Feature } from '@/types/Feature';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { FeatureModal } from './FeatureModal';

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(feature);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Text Validation': 'bg-blue-100 text-blue-800',
      'Content Safety': 'bg-red-100 text-red-800',
      'Data Validation': 'bg-green-100 text-green-800',
      'Security': 'bg-yellow-100 text-yellow-800',
      'Privacy': 'bg-purple-100 text-purple-800',
      'Code Analysis': 'bg-indigo-100 text-indigo-800',
      'Text Processing': 'bg-cyan-100 text-cyan-800',
      'Text Analysis': 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Card 
        className="h-full feature-card cursor-pointer glass-card border-0 hover:border-primary/20"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <Badge className={`mb-2 ${getCategoryColor(feature.category)}`}>
                {feature.category}
              </Badge>
              <h3 className="font-semibold text-lg leading-tight">{feature.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {feature.featureCode}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="btn-gradient text-white border-0 hover:scale-110 transition-transform"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {feature.description}
          </p>

          <div className="space-y-3">
            {/* Input Types */}
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {feature.standardInputs.slice(0, 3).map((input, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {input}
                  </Badge>
                ))}
                {feature.standardInputs.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{feature.standardInputs.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {feature.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {feature.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{feature.tags.length - 2}
                  </Badge>
                )}
              </div>
            </div>

            {/* Repository */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Code className="h-4 w-4" />
              <span className="font-mono truncate">{feature.repoDependency}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
              <a href={feature.referenceLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Reference
              </a>
            </Button>
            
            <div className="text-xs text-muted-foreground">
              → {feature.defaultOutputPlaceholder}
            </div>
          </div>
        </CardContent>
      </Card>

      <FeatureModal 
        feature={feature}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}