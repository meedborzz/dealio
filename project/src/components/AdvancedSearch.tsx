import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, Users, Target, Zap, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, className = '' }) => {
  const [filters, setFilters] = useState({
    query: '',
    priceRange: [0, 1000],
    availableNow: false,
    walkingDistance: false,
    rating: 0,
    category: '',
    targetGender: 'all',
    duration: '',
    sortBy: 'relevance'
  });

  const quickFilters = [
    { 
      id: 'available-now', 
      label: 'Disponible maintenant', 
      icon: Timer,
      active: filters.availableNow,
      onClick: () => setFilters(prev => ({ ...prev, availableNow: !prev.availableNow }))
    },
    { 
      id: 'walking-distance', 
      label: 'À pied (500m)', 
      icon: MapPin,
      active: filters.walkingDistance,
      onClick: () => setFilters(prev => ({ ...prev, walkingDistance: !prev.walkingDistance }))
    }
  ];

  const durationOptions = [
    { value: '', label: 'Toute durée' },
    { value: '0-30', label: 'Express (≤30min)' },
    { value: '30-60', label: 'Standard (30-60min)' },
    { value: '60-120', label: 'Complet (1-2h)' },
    { value: '120+', label: 'Premium (2h+)' }
  ];

  const handleApplyFilters = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      query: '',
      priceRange: [0, 1000],
      availableNow: false,
      walkingDistance: false,
      rating: 0,
      category: '',
      targetGender: 'all',
      duration: '',
      sortBy: 'relevance'
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Search className="h-5 w-5 mr-2" />
          Recherche Avancée
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Rechercher
          </label>
          <Input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            placeholder="Service, salon, quartier..."
            className="w-full"
          />
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Filtres rapides
          </label>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  onClick={filter.onClick}
                  variant={filter.active ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center space-x-2 ${filter.active ? 'bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] text-white border-0' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{filter.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Gamme de prix
          </label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
            max={1000}
            min={0}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{filters.priceRange[0]} DH</span>
            <Badge variant="secondary">{filters.priceRange[1]} DH max</Badge>
          </div>
        </div>

        {/* Duration Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Durée du service
          </label>
          <Select value={filters.duration} onValueChange={(value) => setFilters(prev => ({ ...prev, duration: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une durée" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Gender */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Public cible
          </label>
          <Select value={filters.targetGender} onValueChange={(value) => setFilters(prev => ({ ...prev, targetGender: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="women">Femmes</SelectItem>
              <SelectItem value="men">Hommes</SelectItem>
              <SelectItem value="unisex">Mixte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1"
          >
            Réinitialiser
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="flex-1"
          >
            <Filter className="h-4 w-4 mr-2" />
            Appliquer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;