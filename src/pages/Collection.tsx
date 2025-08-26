import { useState } from 'react';
import { Download, FileText, Code, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Cart } from '@/components/Cart';
import { useCart } from '@/hooks/useCart';

export default function Collection() {
  const { items, isOpen: isCartOpen, toggleCart, totalItems } = useCart();

  const handleGenerateCode = () => {
    const codeTemplate = `# Z-Grid Feature Collection
# Generated on ${new Date().toLocaleString()}

import json
from typing import Dict, List, Any

class FeatureCollection:
    def __init__(self):
        self.features = ${JSON.stringify(
          items.map(item => ({
            code: item.feature.featureCode,
            name: item.feature.name,
            category: item.feature.category,
            inputs: item.feature.standardInputs,
            output: item.feature.defaultOutputPlaceholder,
            dependency: item.feature.repoDependency
          })), null, 12
        )}
    
    def process_features(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        results = {}
        
        ${items.map(item => `
        # ${item.feature.name}
        if '${item.feature.featureCode}' in self.features:
            # Process with ${item.feature.repoDependency}
            # Expected output: ${item.feature.defaultOutputPlaceholder}
            results['${item.feature.featureCode}'] = self.${item.feature.featureCode}(input_data)
        `).join('')}
        
        return results
${items.map(item => `
    def ${item.feature.featureCode}(self, input_data: Dict[str, Any]) -> str:
        """
        ${item.feature.description}
        
        Inputs: ${item.feature.standardInputs.join(', ')}
        Output: ${item.feature.defaultOutputPlaceholder}
        """
        # Implementation using ${item.feature.repoDependency}
        # TODO: Add your implementation here
        return "${item.feature.defaultOutputPlaceholder}"
`).join('')}

# Usage Example:
if __name__ == "__main__":
    collection = FeatureCollection()
    
    # Sample input data
    sample_data = {
        "text": "Your input text here",
        "code": "Your code here", 
        "json": "Your JSON here"
    }
    
    results = collection.process_features(sample_data)
    print(json.dumps(results, indent=2))
`;

    const blob = new Blob([codeTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z-grid-collection-${Date.now()}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateSpecs = () => {
    const specs = {
      collection_info: {
        name: "Z-Grid Feature Collection",
        generated_at: new Date().toISOString(),
        total_features: totalItems,
        unique_features: items.length
      },
      features: items.map(item => ({
        feature_code: item.feature.featureCode,
        name: item.feature.name,
        category: item.feature.category,
        description: item.feature.description,
        standard_inputs: item.feature.standardInputs,
        default_output_placeholder: item.feature.defaultOutputPlaceholder,
        repository_dependency: item.feature.repoDependency,
        reference_link: item.feature.referenceLink,
        tags: item.feature.tags,
        quantity: item.quantity,
        example_input: item.feature.exampleInput,
        example_output: item.feature.exampleOutput
      })),
      implementation_guide: {
        setup_instructions: "Install required dependencies for each feature",
        input_validation: "Ensure input data matches the standard_inputs specifications",
        output_format: "Process outputs according to default_output_placeholder patterns",
        error_handling: "Implement proper error handling for each feature validation"
      }
    };

    const blob = new Blob([JSON.stringify(specs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z-grid-specs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar 
        onSearchChange={() => {}}
        onCategoryChange={() => {}}
        onCartToggle={toggleCart}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-secondary to-accent text-white">
              <Layers className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Your Collection
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Review your selected features and generate implementation code or detailed specifications.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No features in collection</h3>
            <p className="text-muted-foreground mb-4">
              Add features from the marketplace to get started
            </p>
            <Button asChild>
              <a href="/">Browse Features</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Collection Summary */}
            <Card className="glass-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Collection Summary</h2>
                    <p className="text-muted-foreground">
                      {totalItems} feature{totalItems !== 1 ? 's' : ''} across {new Set(items.map(item => item.feature.category)).size} categories
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleGenerateSpecs}>
                      <FileText className="h-4 w-4 mr-2" />
                      Specs
                    </Button>
                    <Button onClick={handleGenerateCode} className="btn-gradient text-white">
                      <Code className="h-4 w-4 mr-2" />
                      Generate Code
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Features List */}
            <div className="grid gap-4">
              {items.map((item) => (
                <Card key={item.id} className="glass-card border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary/10 text-primary">
                            {item.feature.category}
                          </Badge>
                          <h3 className="font-semibold">{item.feature.name}</h3>
                          <span className="text-sm text-muted-foreground font-mono">
                            x{item.quantity}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {item.feature.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Inputs:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.feature.standardInputs.map((input, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {input}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium text-muted-foreground">Output:</span>
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-xs font-mono">
                                {item.feature.defaultOutputPlaceholder}
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium text-muted-foreground">Repository:</span>
                            <div className="mt-1 font-mono text-xs">
                              {item.feature.repoDependency}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Implementation Guide */}
            <Card className="glass-card border-0">
              <CardHeader>
                <h3 className="text-lg font-semibold">Implementation Guide</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Next Steps:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Download the generated code template or specifications</li>
                    <li>Install required dependencies for each feature</li>
                    <li>Implement the feature methods based on your requirements</li>
                    <li>Test with the provided example inputs and outputs</li>
                    <li>Integrate into your application workflow</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Standard Input Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(items.flatMap(item => item.feature.standardInputs))].map((input) => (
                      <Badge key={input} variant="outline" className="text-xs">
                        {input}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Cart isOpen={isCartOpen} onClose={toggleCart} />
    </div>
  );
}