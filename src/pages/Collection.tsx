import { useState, useMemo } from 'react';
import { ExternalLink, Download, Copy, FileText, Grid, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navbar } from '@/components/Navbar';
import { Cart } from '@/components/Cart';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import * as yaml from 'js-yaml';

const ALL_INPUT_TYPES = ['text', 'messages', 'document', 'json', 'sql', 'code'];
const OUTPUT_PLACEHOLDERS = [
  'validated_json',
  'cleaned_text', 
  'guarded_reply',
  'evaluation_report',
  'safe_text',
  'moderated_text',
  'validated_input',
  'bounded_text',
  'normalized_text',
  'validated_summary',
  'validated_answer',
  'relevant_context',
  'provenance_report',
  'original_text',
  'qa_score',
  'scoped_text',
  'safe_action'
];

export default function Collection() {
  const { items, isOpen: isCartOpen, toggleCart } = useCart();
  const { toast } = useToast();
  
  // Get union of all selected features' standard inputs
  const allSelectedInputs = useMemo(() => {
    return [...new Set(items.flatMap(item => item.feature.standardInputs))];
  }, [items]);

  const [selectedInputs, setSelectedInputs] = useState<string[]>(allSelectedInputs);
  const [defaultOutput, setDefaultOutput] = useState('validated_json');
  const [autoWireDefaults, setAutoWireDefaults] = useState(true);
  const [collectionName, setCollectionName] = useState('Z-Grid Selection');

  // Update selected inputs when cart changes
  useMemo(() => {
    setSelectedInputs(allSelectedInputs);
  }, [allSelectedInputs]);

  const handleInputToggle = (input: string) => {
    setSelectedInputs(prev => 
      prev.includes(input) 
        ? prev.filter(i => i !== input)
        : [...prev, input]
    );
  };

  const generateExportData = () => {
    return {
      collectionName,
      createdAt: new Date().toISOString(),
      inputs: selectedInputs,
      defaultOutputPlaceholder: defaultOutput,
      validators: items.map(item => ({
        code: item.feature.featureCode,
        name: item.feature.name,
        category: item.feature.category,
        inputs: autoWireDefaults ? item.feature.standardInputs : selectedInputs,
        outputPlaceholder: autoWireDefaults ? item.feature.defaultOutputPlaceholder : defaultOutput,
        reference: item.feature.referenceLink,
        tags: item.feature.tags,
        dependency: item.feature.repoDependency
      }))
    };
  };

  const handleExportJSON = () => {
    const data = generateExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported JSON",
      description: "Collection has been exported as JSON file.",
    });
  };

  const handleExportYAML = () => {
    const data = generateExportData();
    const yamlStr = yaml.dump(data, { indent: 2 });
    const blob = new Blob([yamlStr], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported YAML",
      description: "Collection has been exported as YAML file.",
    });
  };

  const handleCopyToClipboard = () => {
    const data = generateExportData();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    
    toast({
      title: "Copied to Clipboard",
      description: "Collection data has been copied as JSON.",
    });
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-secondary to-accent text-white">
              <Grid className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Collection Builder
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Configure and export your feature collection with custom settings.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Grid className="h-8 w-8 text-muted-foreground" />
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
            {/* Selected Features Table */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Selected Features ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Standard Inputs</TableHead>
                        <TableHead>Default Output</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.feature.featureCode}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.feature.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.feature.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.feature.standardInputs.map((input, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {input}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-mono">
                              {item.feature.defaultOutputPlaceholder}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={item.feature.referenceLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Panel */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Collection Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Collection Name */}
                <div>
                  <Label htmlFor="collection-name">Collection Name</Label>
                  <input
                    id="collection-name"
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  />
                </div>

                {/* Auto-wire Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-wire"
                    checked={autoWireDefaults}
                    onCheckedChange={setAutoWireDefaults}
                  />
                  <Label htmlFor="auto-wire">
                    Auto-wire defaults (use each feature's original settings)
                  </Label>
                </div>

                {!autoWireDefaults && (
                  <>
                    {/* Global Standard Inputs */}
                    <div>
                      <Label className="text-base font-medium">Global Standard Inputs</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select input types that will apply to all features in this collection
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ALL_INPUT_TYPES.map((input) => (
                          <div key={input} className="flex items-center space-x-2">
                            <Checkbox
                              id={`input-${input}`}
                              checked={selectedInputs.includes(input)}
                              onCheckedChange={() => handleInputToggle(input)}
                            />
                            <Label htmlFor={`input-${input}`} className="text-sm">
                              {input}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Global Output Placeholder */}
                    <div>
                      <Label htmlFor="output-placeholder" className="text-base font-medium">
                        Global Output Placeholder
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Default output format that will apply to all features
                      </p>
                      <Select value={defaultOutput} onValueChange={setDefaultOutput}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {OUTPUT_PLACEHOLDERS.map((placeholder) => (
                            <SelectItem key={placeholder} value={placeholder}>
                              {placeholder}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Export Actions */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleExportJSON} className="btn-gradient text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button onClick={handleExportYAML} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Export YAML
                  </Button>
                  <Button onClick={handleCopyToClipboard} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
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