import { X, Minus, Plus, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();

  const handleExport = () => {
    const exportData = {
      collection: items.map(item => ({
        feature: item.feature,
        quantity: item.quantity,
        standardInputs: item.feature.standardInputs,
        outputPlaceholder: item.feature.defaultOutputPlaceholder
      })),
      totalFeatures: totalItems,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `z-grid-collection-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Your Collection</h2>
                <p className="text-sm text-muted-foreground">
                  {totalItems} feature{totalItems !== 1 ? 's' : ''} selected
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Your collection is empty</p>
                <p className="text-sm mt-1">Add features to get started</p>
              </div>
            ) : (
              items.map((item) => (
                <Card key={item.id} className="glass-card border-0">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-tight">
                          {item.feature.name}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.feature.featureCode}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.feature.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        → {item.feature.defaultOutputPlaceholder}
                      </div>
                    </div>

                    {/* Input Types */}
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {item.feature.standardInputs.slice(0, 3).map((input, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {input}
                          </Badge>
                        ))}
                        {item.feature.standardInputs.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.feature.standardInputs.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {items.length > 0 && (
            <div className="p-4 border-t bg-muted/30 space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleExport}
                  className="flex-1 btn-gradient text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="text-xs text-center text-muted-foreground">
                Collection will include standard inputs and output placeholders
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}