import { useState } from 'react';
import { Search, ShoppingCart, Menu, Grid3X3, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCart } from '@/hooks/useCart';

interface NavbarProps {
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onCartToggle: () => void;
}

const categories = [
  'All Categories',
  'Privacy / Leakage',
  'Safety / Security', 
  'Safety / Moderation',
  'Safety / Fairness',
  'Safety / Quality',
  'Input Validation',
  'Formatting / Usability',
  'Formatting / Language',
  'Factuality / Language',
  'Factuality / Reasoning',
  'Summarization / RAG',
  'Relevance / QA',
  'Relevance / RAG',
  'Provenance / RAG',
  'Originality / Citation',
  'Relevance / Custom QA',
  'Relevance / Scope',
  'Security / Agents',
  'Conversational Safety',
  'Security / Leakage',
  'Testing / QA'
];

export function Navbar({ onSearchChange, onCategoryChange, onCartToggle }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { totalItems } = useCart();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Grid3X3 className="h-6 w-6" />
            Z-Grid
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/collection" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/collection') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Collection
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/about') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              About
            </Link>
            <Link 
              to="/admin" 
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                isActive('/admin') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 search-input border-0"
              />
            </div>
            
            <Select onValueChange={onCategoryChange}>
              <SelectTrigger className="w-40 glass-card border-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Toggle & Cart */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={onCartToggle}
              className="relative glass-card border-0 hover:bg-primary/10"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}