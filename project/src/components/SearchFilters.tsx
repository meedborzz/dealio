import React, { useState } from 'react';
import { Filter, X, MapPin, DollarSign, Clock, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  isOpen,
  onClose,
  onApplyFilters
}) => {
  const [filters, setFilters] = useState({
    priceRange: [1000],
    distance: 50,
    availability: 'any',
    sortBy: 'relevance',
    serviceType: [] as string[],
    gender: 'all',
    discountLevel: 'all'
  });

  const serviceTypes = [
    { id: 'Coiffure', name: 'Coiffure' },
    { id: 'Spa', name: 'Spa' },
    { id: 'Massage', name: 'Massage' },
    { id: 'Ongles', name: 'Ongles' },
    { id: 'Esthetique', name: 'Esthétique' },
    { id: 'Barbier', name: 'Barbier' }
  ];

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      priceRange: [0, filters.priceRange[0]]
    });
    onClose();
  };

  const handleReset = () => {
    setFilters({
      priceRange: [1000],
      distance: 50,
      availability: 'any',
      sortBy: 'relevance',
      serviceType: [],
      gender: 'all',
      discountLevel: 'all'
    });
  };

  const handleServiceTypeToggle = (serviceId: string) => {
    setFilters(prev => ({
      ...prev,
      serviceType: prev.serviceType.includes(serviceId)
        ? prev.serviceType.filter(id => id !== serviceId)
        : [...prev.serviceType, serviceId]
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basique</TabsTrigger>
              <TabsTrigger value="advanced">Avancé</TabsTrigger>
              <TabsTrigger value="sort">Tri</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              {/* Price Range */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Prix maximum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                    max={1000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0 DH</span>
                    <Badge variant="secondary">
                      {filters.priceRange[0]} DH
                    </Badge>
                    <span>1000+ DH</span>
                  </div>
                </CardContent>
              </Card>

              {/* Discount Level */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Niveau de réduction</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={filters.discountLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, discountLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les offres</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40plus">40% et plus</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              {/* Service Types */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Types de services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {serviceTypes.map((service) => (
                      <Button
                        key={service.id}
                        variant={filters.serviceType.includes(service.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleServiceTypeToggle(service.id)}
                        className="text-xs"
                      >
                        {service.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gender Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Public cible
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
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
                </CardContent>
              </Card>

              {/* Availability */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Disponibilité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Toutes les disponibilités</SelectItem>
                      <SelectItem value="today">Disponible aujourd'hui</SelectItem>
                      <SelectItem value="tomorrow">Disponible demain</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="weekend">Ce week-end</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sort" className="space-y-6 mt-6">
              {/* Sort Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Trier par</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Pertinence</SelectItem>
                      <SelectItem value="price">Prix croissant</SelectItem>
                      <SelectItem value="discount">Meilleure réduction</SelectItem>
                      <SelectItem value="newest">Plus récents</SelectItem>
                      <SelectItem value="expiring">Expire bientôt</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Distance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Distance maximale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Slider
                    value={[filters.distance]}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, distance: value[0] }))}
                    max={100}
                    min={1}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-center">
                    <Badge variant="secondary">
                      Dans un rayon de {filters.distance} km
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 left-0 right-0 p-6 bg-background border-t mt-8">
          <div className="flex space-x-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1"
            >
              Appliquer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SearchFilters;