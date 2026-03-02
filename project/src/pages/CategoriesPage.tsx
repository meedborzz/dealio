import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Scissors, Bath, Hand, Sparkles, Palette, Eye, Filter, Heart, TrendingUp, Clock, Star, Gift } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeals } from '../hooks/useDeals';
import { trackInteraction } from '../lib/trackInteraction';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import DealCard from '../components/DealCard';
import SearchFilters from '../components/SearchFilters';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { FEATURES } from '../config/features';
import { getAvailableCategories } from '../config/servicePresets';

interface CategoryWithCount {
  id: string;
  name: string;
  icon: any;
  image_url: string;
  gradient: string;
  dealCount: number;
}

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<CategoryWithCount[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'new'>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  const dealsQuery = React.useMemo(() => {
    const query: any = {};

    if (slug) query.category = slug;
    if (searchQuery) query.query = searchQuery;

    if (appliedFilters.priceRange) {
      query.maxPrice = appliedFilters.priceRange[1];
    }
    if (appliedFilters.rating) {
      query.minRating = appliedFilters.rating;
    }
    if (appliedFilters.discountLevel && appliedFilters.discountLevel !== 'all') {
      if (appliedFilters.discountLevel === '10') {
        query.minDiscountPercentage = 10;
        query.maxDiscountPercentage = 19;
      } else if (appliedFilters.discountLevel === '20') {
        query.minDiscountPercentage = 20;
        query.maxDiscountPercentage = 29;
      } else if (appliedFilters.discountLevel === '30') {
        query.minDiscountPercentage = 30;
        query.maxDiscountPercentage = 39;
      } else if (appliedFilters.discountLevel === '40plus') {
        query.minDiscountPercentage = 40;
      }
    }
    if (appliedFilters.sortBy) {
      query.sortBy = appliedFilters.sortBy;
    }

    return Object.keys(query).length > 0 ? query : undefined;
  }, [slug, searchQuery, appliedFilters]);

  const { deals, loading } = useDeals(dealsQuery);

  const getCategoryVisuals = (categoryId: string) => {
    const visuals: Record<string, { icon: any; image_url: string; gradient: string }> = {
      'Coiffure': {
        icon: Scissors,
        image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600',
        gradient: 'from-pink-500 via-rose-500 to-red-500'
      },
      'Soins du Visage': {
        icon: Sparkles,
        image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=600',
        gradient: 'from-amber-500 via-orange-500 to-yellow-500'
      },
      'Onglerie': {
        icon: Hand,
        image_url: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=600',
        gradient: 'from-rose-400 via-rose-500 to-pink-500'
      },
      'Spa & Corps': {
        icon: Bath,
        image_url: 'https://images.pexels.com/photos/6663589/pexels-photo-6663589.jpeg?auto=compress&cs=tinysrgb&w=600',
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500'
      },
      'Esthetique & Regard': {
        icon: Eye,
        image_url: 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=600',
        gradient: 'from-rose-500 via-pink-500 to-red-400'
      },
      'Maquillage': {
        icon: Palette,
        image_url: 'https://images.pexels.com/photos/4041397/pexels-photo-4041397.jpeg?auto=compress&cs=tinysrgb&w=600',
        gradient: 'from-rose-500 via-pink-500 to-fuchsia-500'
      },
      'Bien-être & Minceur': {
        icon: Heart,
        image_url: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=600',
        gradient: 'from-blue-500 via-cyan-500 to-teal-500'
      },
      'Forfaits Spéciaux': {
        icon: Gift,
        image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=600',
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-500'
      }
    };
    return visuals[categoryId] || {
      icon: Sparkles,
      image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=600',
      gradient: 'from-gray-500 via-gray-600 to-gray-700'
    };
  };

  const categories: CategoryWithCount[] = getAvailableCategories().map(cat => {
    const visuals = getCategoryVisuals(cat.id);
    return {
      id: cat.id,
      name: cat.name,
      icon: visuals.icon,
      image_url: visuals.image_url,
      gradient: visuals.gradient,
      dealCount: 0
    };
  });

  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  const fetchCategoryCounts = async () => {
    try {
      setLoadingCounts(true);

      const categoryPromises = categories.map(async (category) => {
        const { count, error } = await supabase
          .from('deals')
          .select('*', { count: 'exact', head: true })
          .eq('category', category.id)
          .eq('is_active', true);

        if (error) {
          console.error(`Error fetching count for ${category.id}:`, error);
          return { ...category, dealCount: 0 };
        }

        return { ...category, dealCount: count || 0 };
      });

      const categoriesWithCounts = await Promise.all(categoryPromises);
      setCategoriesWithCounts(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching category counts:', error);
      setCategoriesWithCounts(categories);
    } finally {
      setLoadingCounts(false);
    }
  };

  const handleDealClick = (deal: any) => {
    if (user) {
      trackInteraction(deal.id, 'view');
    }
    navigate(`/deal/${deal.id}`);
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setVisibleCount(10);
  };

  React.useEffect(() => {
    setVisibleCount(10);
  }, [slug, searchQuery, activeTab]);

  const selectedCategory = categoriesWithCounts.find(cat => cat.id === slug);

  const filteredDeals = React.useMemo(() => {
    if (activeTab === 'all') return deals;
    if (activeTab === 'trending') {
      return [...deals].sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
    }
    if (activeTab === 'new') {
      return [...deals].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return deals;
  }, [deals, activeTab]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="safe-area-top" />
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-9 w-9 rounded-full flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">
                {selectedCategory ? selectedCategory.name : 'Explorer'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {selectedCategory
                  ? `${selectedCategory.dealCount} services`
                  : 'Discover the best offers'}
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="pl-10 pr-10 h-10 bg-muted border-0 rounded-xl text-sm"
            />
            {FEATURES.ADVANCED_FILTERS && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(true)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 z-10"
              >
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!slug && (
          <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="rounded-full px-4 h-8 text-xs flex-shrink-0"
            >
              All
            </Button>
            <Button
              variant={activeTab === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('trending')}
              className="rounded-full px-4 h-8 text-xs flex-shrink-0"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Button>
            <Button
              variant={activeTab === 'new' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('new')}
              className="rounded-full px-4 h-8 text-xs flex-shrink-0"
            >
              <Clock className="h-3 w-3 mr-1" />
              New
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {/* Categories Grid */}
        {!slug && !searchQuery && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Categories</h2>
              <Badge variant="secondary" className="text-xs">
                {categoriesWithCounts.reduce((sum, cat) => sum + cat.dealCount, 0)} offers
              </Badge>
            </div>

            {loadingCounts ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categoriesWithCounts.slice(0, 6).map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Card
                      key={category.id}
                      className="cursor-pointer group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                      onClick={() => navigate(`/categories/${category.id}`)}
                    >
                      <div className="relative h-40 overflow-hidden">
                        {/* Background Image */}
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>

                        {/* Content */}
                        <div className="absolute inset-0 p-4 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                              <IconComponent className="h-5 w-5 text-gray-700" />
                            </div>
                            <Badge className="bg-white/90 text-gray-900 font-semibold backdrop-blur-sm border-0">
                              {category.dealCount}
                            </Badge>
                          </div>

                          <div>
                            <h3 className="font-bold text-white text-lg drop-shadow-md">
                              {category.name}
                            </h3>
                            <p className="text-white/90 text-xs mt-1">
                              {category.dealCount} service{category.dealCount > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* See All Categories */}
            {categoriesWithCounts.length > 6 && (
              <Button
                variant="outline"
                className="w-full mt-4 rounded-xl py-6 border-2 hover:bg-muted"
                onClick={() => {
                  const modal = document.getElementById('all-categories-modal');
                  if (modal) modal.classList.remove('hidden');
                }}
              >
                Voir toutes les catégories ({categoriesWithCounts.length})
              </Button>
            )}
          </div>
        )}

        {/* Applied Filters */}
        {Object.keys(appliedFilters).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {appliedFilters.priceRange && appliedFilters.priceRange[1] < 1000 && (
              <Badge variant="secondary" className="rounded-full">
                Max {appliedFilters.priceRange[1]} DH
              </Badge>
            )}
            {appliedFilters.rating > 0 && (
              <Badge variant="secondary" className="rounded-full">
                <Star className="h-3 w-3 mr-1" />
                {appliedFilters.rating}+
              </Badge>
            )}
            {appliedFilters.discountLevel && appliedFilters.discountLevel !== 'all' && (
              <Badge variant="secondary" className="rounded-full">
                {appliedFilters.discountLevel === '10' ? '10%' :
                  appliedFilters.discountLevel === '20' ? '20%' :
                    appliedFilters.discountLevel === '30' ? '30%' : '40%+'}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAppliedFilters({})}
              className="h-7 rounded-full px-3 text-xs"
            >
              Effacer tout
            </Button>
          </div>
        )}

        {/* Deals Section */}
        <div className="mb-6">
          {/* Deals List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <Card className="border-2 border-dashed rounded-2xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Aucune offre trouvée
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? `Essayez d'autres mots-clés ou explorez nos catégories.`
                    : selectedCategory
                      ? `Aucune offre disponible dans ${selectedCategory.name} pour le moment.`
                      : 'Aucune offre disponible pour le moment.'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {searchQuery && (
                    <Button onClick={() => setSearchQuery('')} className="rounded-full">
                      Effacer la recherche
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="rounded-full"
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {filteredDeals.slice(0, visibleCount).map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onClick={() => handleDealClick(deal)}
                    distance={deal.distance}
                    variant="default"
                  />
                ))}
              </div>

              {visibleCount < filteredDeals.length && (
                <Button
                  variant="outline"
                  className="w-full mt-4 rounded-xl h-11"
                  onClick={() => setVisibleCount(prev => prev + 10)}
                >
                  Charger plus ({filteredDeals.length - visibleCount} restants)
                </Button>
              )}
            </>
          )}
        </div>

        {/* Popular Deals Section */}
        {!slug && !searchQuery && filteredDeals.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Popular offers</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/categories')}
                className="text-primary"
              >
                See all
              </Button>
            </div>
            <div className="space-y-3">
              {filteredDeals.slice(0, 5).map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onClick={() => handleDealClick(deal)}
                  distance={deal.distance}
                  variant="default"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Filters Modal */}
      {FEATURES.ADVANCED_FILTERS && (
        <SearchFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {/* All Categories Modal */}
      <div id="all-categories-modal" className="hidden fixed inset-0 bg-black/50 z-50 flex items-end">
        <div className="bg-background w-full rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-background border-b px-4 py-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Toutes les catégories</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const modal = document.getElementById('all-categories-modal');
                if (modal) modal.classList.add('hidden');
              }}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4 pb-24">
            {categoriesWithCounts.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className="cursor-pointer group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
                  onClick={() => {
                    navigate(`/categories/${category.id}`);
                    const modal = document.getElementById('all-categories-modal');
                    if (modal) modal.classList.add('hidden');
                  }}
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-60`}></div>
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-gray-700" />
                        </div>
                        <Badge className="bg-white/90 text-gray-900 text-xs backdrop-blur-sm">
                          {category.dealCount}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm drop-shadow-md">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
