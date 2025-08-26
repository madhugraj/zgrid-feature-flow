import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid3X3, Filter } from 'lucide-react';
import { mockFeatures } from '@/data/mockFeatures';
import { Feature } from '@/types/Feature';
import { FeatureCard } from '@/components/FeatureCard';
import { FeatureModal } from '@/components/FeatureModal';
import { Navbar } from '@/components/Navbar';
import { Cart } from '@/components/Cart';
import { QAPanel } from '@/components/QAPanel';
import { useCart } from '@/hooks/useCart';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('z-grid-search') || '';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('z-grid-category') || 'All Categories';
  });
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isOpen: isCartOpen, toggleCart } = useCart();

  // Persist search and category to localStorage
  useEffect(() => {
    localStorage.setItem('z-grid-search', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('z-grid-category', selectedCategory);
  }, [selectedCategory]);

  // Handle deep linking
  useEffect(() => {
    const featureCode = searchParams.get('feature');
    if (featureCode) {
      const feature = mockFeatures.find(f => f.featureCode === featureCode);
      if (feature) {
        setSelectedFeature(feature);
        setIsModalOpen(true);
      }
    }
  }, [searchParams]);

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
    setSearchParams({ feature: feature.featureCode });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFeature(null);
    setSearchParams({});
  };

  const filteredFeatures = useMemo(() => {
    return mockFeatures.filter((feature: Feature) => {
      const matchesSearch = !searchQuery || 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        feature.featureCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All Categories' || 
        feature.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const cats = mockFeatures.reduce((acc: Record<string, number>, feature) => {
      acc[feature.category] = (acc[feature.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar 
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onCartToggle={toggleCart}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary to-primary-glow text-white">
              <Grid3X3 className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Z-Grid Feature Marketplace
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover, explore, and collect powerful features for your projects. 
            Build better applications with our curated collection of validation, security, and analysis tools.
          </p>
        </div>

        {/* Stats & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-6">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredFeatures.length}</span> features found
            </div>
            {selectedCategory !== 'All Categories' && (
              <div className="flex items-center gap-2 text-sm">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Filtered by:</span>
                <span className="font-medium text-primary">{selectedCategory}</span>
              </div>
            )}
          </div>

          {/* Category Stats */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 4).map(([category, count]) => (
              <div key={category} className="text-xs bg-muted/50 px-3 py-1 rounded-full">
                <span className="font-medium">{category}</span>
                <span className="text-muted-foreground ml-1">({count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        {filteredFeatures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFeatures.map((feature) => (
              <FeatureCard 
                key={feature.featureCode} 
                feature={feature} 
                onFeatureClick={handleFeatureClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No features found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="glass-card p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">Ready to build your collection?</h3>
            <p className="text-sm text-muted-foreground">
              Select features that match your project needs. Each feature includes detailed examples, 
              input/output specifications, and integration guidelines.
            </p>
          </div>
        </div>
      </main>

      <Cart isOpen={isCartOpen} onClose={toggleCart} />
      
      {selectedFeature && (
        <FeatureModal
          feature={selectedFeature}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      <QAPanel />
    </div>
  );
}