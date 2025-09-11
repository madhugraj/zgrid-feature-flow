import { useState } from 'react';
import { ChevronLeft, ChevronRight, Grid3X3, TrendingUp, Users, Shield, Zap, Target, DollarSign, Rocket, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Slide {
  id: number;
  title: string;
  content: React.ReactNode;
}

export const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      title: "Z-Grid: The Future of AI Safety Infrastructure",
      content: (
        <div className="text-center space-y-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="p-6 rounded-full bg-gradient-to-r from-primary to-primary-glow text-white">
              <Grid3X3 className="h-16 w-16" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Z-Grid
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI Safety & Content Validation Platform
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Badge className="text-lg py-2 px-4">AI Safety First</Badge>
            <Badge className="text-lg py-2 px-4" variant="outline">Production Ready</Badge>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "The Problem",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-destructive">AI Safety Crisis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive mb-2">85%</div>
                  <p className="text-sm text-muted-foreground">of companies lack proper AI safety measures</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive mb-2">$4.5M</div>
                  <p className="text-sm text-muted-foreground">average cost of AI safety incidents</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <ul className="space-y-4 text-lg">
            <li className="flex items-start gap-3">
              <span className="text-destructive">•</span>
              <span>Companies struggle with toxic content, PII leaks, and security vulnerabilities</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-destructive">•</span>
              <span>Existing solutions are fragmented, expensive, and difficult to integrate</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-destructive">•</span>
              <span>Development teams waste months building custom validation systems</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 3,
      title: "Our Solution",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Unified AI Safety Platform</h2>
            <p className="text-xl text-muted-foreground">
              One platform for all your AI safety and content validation needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Shield className="h-6 w-6" />, title: "PII Protection", desc: "Automatic detection & redaction" },
              { icon: <Target className="h-6 w-6" />, title: "Toxicity Detection", desc: "Real-time content moderation" },
              { icon: <Zap className="h-6 w-6" />, title: "Jailbreak Prevention", desc: "Advanced prompt injection defense" },
              { icon: <CheckCircle className="h-6 w-6" />, title: "Policy Compliance", desc: "Custom business rules" },
              { icon: <Grid3X3 className="h-6 w-6" />, title: "Format Validation", desc: "Structured data verification" },
              { icon: <Users className="h-6 w-6" />, title: "Secrets Detection", desc: "API key & credential scanning" }
            ].map((feature, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-primary mb-2">{feature.icon}</div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Market Opportunity",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Massive Growing Market</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center border-primary/20">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">$42B</div>
                <p className="text-sm text-muted-foreground">AI Safety Market by 2028</p>
                <p className="text-xs text-muted-foreground mt-2">CAGR: 34.2%</p>
              </CardContent>
            </Card>
            <Card className="text-center border-secondary/20">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-secondary mb-2">$18B</div>
                <p className="text-sm text-muted-foreground">Content Moderation Market</p>
                <p className="text-xs text-muted-foreground mt-2">CAGR: 28.5%</p>
              </CardContent>
            </Card>
            <Card className="text-center border-accent/20">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-accent mb-2">500K+</div>
                <p className="text-sm text-muted-foreground">Companies Using AI</p>
                <p className="text-xs text-muted-foreground mt-2">Growing 40% YoY</p>
              </CardContent>
            </Card>
          </div>
          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Key Market Drivers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                <li>• Rapid AI adoption across industries</li>
                <li>• Increasing regulatory compliance requirements</li>
                <li>• Growing awareness of AI safety risks</li>
              </ul>
              <ul className="space-y-2">
                <li>• Need for unified safety platforms</li>
                <li>• Developer-friendly integration demands</li>
                <li>• Cost reduction pressures</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Business Model",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Scalable Revenue Model</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-3xl font-bold text-primary mb-2">$99</div>
                <p className="text-sm text-muted-foreground mb-4">/month</p>
                <ul className="text-sm space-y-1">
                  <li>• 100K API calls/month</li>
                  <li>• Basic features</li>
                  <li>• Standard support</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center border-primary">
              <CardContent className="pt-6">
                <Badge className="mb-2">Most Popular</Badge>
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="text-3xl font-bold text-primary mb-2">$499</div>
                <p className="text-sm text-muted-foreground mb-4">/month</p>
                <ul className="text-sm space-y-1">
                  <li>• 1M API calls/month</li>
                  <li>• All features</li>
                  <li>• Priority support</li>
                  <li>• Custom integrations</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-primary mb-2">Custom</div>
                <p className="text-sm text-muted-foreground mb-4">pricing</p>
                <ul className="text-sm space-y-1">
                  <li>• Unlimited API calls</li>
                  <li>• On-premise deployment</li>
                  <li>• Dedicated support</li>
                  <li>• Custom features</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Revenue Projections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">Year 1</div>
                <div className="text-3xl font-bold text-primary">$500K</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Year 2</div>
                <div className="text-3xl font-bold text-primary">$2.5M</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Year 3</div>
                <div className="text-3xl font-bold text-primary">$8M</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Traction & Metrics",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <Rocket className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Strong Early Traction</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <p className="text-sm text-muted-foreground">Beta Customers</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">1M+</div>
                <p className="text-sm text-muted-foreground">API Calls Processed</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
              </CardContent>
            </Card>
          </div>
          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Key Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Technical Milestones</h4>
                <ul className="space-y-1 text-sm">
                  <li>✓ 7 AI safety modules launched</li>
                  <li>✓ Sub-100ms response times</li>
                  <li>✓ 99.95% accuracy rates</li>
                  <li>✓ Multi-language support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Business Milestones</h4>
                <ul className="space-y-1 text-sm">
                  <li>✓ First paying customers acquired</li>
                  <li>✓ Partnership with major cloud providers</li>
                  <li>✓ SOC 2 compliance achieved</li>
                  <li>✓ Series A funding closed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: "Next Steps & Investment",
      content: (
        <div className="space-y-8">
          <div className="text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-3xl font-bold mb-4">Ready to Scale</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Investment Ask</h3>
                <div className="text-4xl font-bold text-primary mb-4">$5M</div>
                <p className="text-muted-foreground mb-4">Series A Funding Round</p>
                <h4 className="font-medium mb-2">Use of Funds:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 40% - Product development & R&D</li>
                  <li>• 30% - Sales & marketing expansion</li>
                  <li>• 20% - Team growth (15+ hires)</li>
                  <li>• 10% - Infrastructure & operations</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-secondary/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">12-Month Roadmap</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">Q1:</span>
                    <span className="text-sm">Launch enterprise features & on-premise deployment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">Q2:</span>
                    <span className="text-sm">Expand to 100+ enterprise customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">Q3:</span>
                    <span className="text-sm">International market expansion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">Q4:</span>
                    <span className="text-sm">Advanced AI model capabilities</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Join Us in Securing the Future of AI</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Be part of the solution that makes AI safe, secure, and reliable for everyone.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
                Schedule a Demo
              </Button>
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="w-full">
      {/* Slide Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide Content */}
      <Card className="min-h-[600px] relative overflow-hidden">
        <CardContent className="p-8">
          {slides[currentSlide].content}
        </CardContent>

        {/* Navigation Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentSlide + 1} of {slides.length}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Slide Title */}
      <div className="text-center mt-4">
        <h2 className="text-lg font-medium text-muted-foreground">
          {slides[currentSlide].title}
        </h2>
      </div>
    </div>
  );
};