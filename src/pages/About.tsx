import { Grid3X3, Shield, Zap, Users, Target, Code, Database } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Cart } from '@/components/Cart';
import { useCart } from '@/hooks/useCart';

export default function About() {
  const { isOpen: isCartOpen, toggleCart } = useCart();

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Security First",
      description: "All features include security validation and best practices to protect your applications."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "High Performance",
      description: "Optimized implementations designed for production environments with minimal overhead."
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Easy Integration", 
      description: "Simple APIs and clear documentation make integration straightforward for any project."
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Comprehensive Data Support",
      description: "Support for text, JSON, SQL, code, documents, and custom data formats."
    }
  ];

  const categories = [
    { name: "Text Validation", count: "3+", color: "bg-blue-100 text-blue-800" },
    { name: "Content Safety", count: "2+", color: "bg-red-100 text-red-800" },
    { name: "Data Validation", count: "2+", color: "bg-green-100 text-green-800" },
    { name: "Security", count: "2+", color: "bg-yellow-100 text-yellow-800" },
    { name: "Privacy", count: "1+", color: "bg-purple-100 text-purple-800" },
    { name: "Code Analysis", count: "1+", color: "bg-indigo-100 text-indigo-800" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar 
        onSearchChange={() => {}}
        onCategoryChange={() => {}}
        onCartToggle={toggleCart}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-primary to-primary-glow text-white">
              <Grid3X3 className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              About Z-Grid
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Z-Grid is a modern feature marketplace that helps developers discover, explore, and integrate 
            powerful validation, security, and analysis tools into their applications. Our curated collection 
            of features provides everything you need to build robust, secure, and reliable software.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="glass-card border-0 mb-16">
          <CardHeader>
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground text-center leading-relaxed">
              We believe that building secure, reliable software shouldn't require reinventing the wheel. 
              Z-Grid provides a comprehensive marketplace of pre-built, tested, and documented features 
              that developers can easily discover, understand, and integrate into their projects.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Z-Grid?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-0 feature-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="glass-card border-0 text-center">
                <CardContent className="pt-6">
                  <Badge className={`mb-3 ${category.color}`}>
                    {category.name}
                  </Badge>
                  <p className="text-2xl font-bold text-primary mb-1">{category.count}</p>
                  <p className="text-sm text-muted-foreground">Features Available</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary to-primary-glow text-white flex items-center justify-center">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover</h3>
              <p className="text-muted-foreground">
                Browse our marketplace of features with detailed descriptions, examples, and documentation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-secondary to-accent text-white flex items-center justify-center">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Collect</h3>
              <p className="text-muted-foreground">
                Add features to your collection and customize input/output specifications for your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-accent to-primary text-white flex items-center justify-center">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Implement</h3>
              <p className="text-muted-foreground">
                Generate code templates and integration guides to quickly implement features in your project.
              </p>
            </div>
          </div>
        </div>

        {/* Community */}
        <Card className="glass-card border-0 text-center">
          <CardHeader>
            <Users className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Z-Grid is built by developers, for developers. We're constantly adding new features 
              and improving existing ones based on community feedback and real-world usage.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="outline">Open Source</Badge>
              <Badge variant="outline">Community Driven</Badge>
              <Badge variant="outline">Production Ready</Badge>
              <Badge variant="outline">Well Documented</Badge>
            </div>
          </CardContent>
        </Card>
      </main>

      <Cart isOpen={isCartOpen} onClose={toggleCart} />
    </div>
  );
}