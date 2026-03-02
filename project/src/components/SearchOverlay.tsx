import React, { useState, useEffect } from 'react';
import { X, Search, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDeals } from '../hooks/useDeals';
import { useRecommendations } from '../hooks/useRecommendations';
import DealCard from './DealCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  initialQuery = ''
}) => {
  const { user } = useAuth();
  const { trackInteraction } = useRecommendations();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const { deals: searchResults, loading: searchLoading } = useDeals(
    searchQuery.length >= 2 ? { query: searchQuery } : undefined
  );

  const frequentSearches = [
    'Coiffure femme',
    'Manucure',
    'Massage relaxant',
    'Hammam',
    'Barbier',
    'Épilation',
    'Soin visage',
    'Coloration'
  ];

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFrequentSearchClick = (term: string) => {
    setSearchQuery(term);
  };

  const handleDealClick = (deal: any) => {
    if (user) {
      trackInteraction(deal.id, 'view');
    }
    onClose();
    navigate(`/deal/${deal.id}`);
  };

  const handleBookingClick = (dealId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate(`/booking/${dealId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <h1 className="text-lg font-semibold text-foreground">Recherche</h1>
          
          <div className="w-10"></div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Rechercher services, salons..."
            className="w-full pl-10 pr-4 py-3 text-base bg-background border-border"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery.length >= 2 ? (
          /* Search Results */
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Résultats pour "{searchQuery}"
              </h3>
              {searchResults.length > 0 && (
                <Badge variant="secondary">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {(searchLoading || isSearching) ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    Aucun résultat
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Essayez avec d'autres mots-clés
                  </p>
                  <Button variant="outline" onClick={clearSearch}>
                    Effacer la recherche
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {searchResults.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    variant="search"
                    onClick={() => handleDealClick(deal)}
                    distance={undefined}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Search Suggestions */
          <div className="p-4 space-y-6">
            {/* Frequent Searches */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">
                Recherches fréquentes
              </h3>
              <div className="flex flex-wrap gap-2">
                {frequentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleFrequentSearchClick(search)}
                    className="h-8 px-3 text-xs bg-muted hover:bg-accent rounded-full"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;