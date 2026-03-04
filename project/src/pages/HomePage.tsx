import React, { useState, useEffect, useMemo } from 'react';
import { Search, Scissors, Hand, Waves, Sparkles, Filter, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useDeals } from '../hooks/useDeals';
import { useNotifications } from '../hooks/useNotifications';
import { Deal } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import NotificationCenter from '../components/NotificationCenter';
import BookingModal from '../components/BookingModal';
import LocationSelector from '../components/LocationSelector';
import SearchFilters from '../components/SearchFilters';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { HomeHeader } from '@/components/home/HomeHeader';
import { CategoryChips } from '@/components/home/CategoryChips';
import { OfferCard } from '@/components/home/OfferCard';
import { BusinessCardSmall } from '@/components/home/BusinessCardSmall';
import { OfferSlider } from '@/components/home/OfferSlider';
import { AdvertisingBanner } from '@/components/home/AdvertisingBanner';
import { InstallButton } from '../components/InstallButton';
import { FEATURES } from '../config/features';
import { getStoredCity, DEFAULT_CITY } from '../config/location';
import { getAvailableCategories } from '../config/servicePresets';

const CATEGORIES = getAvailableCategories().map(cat => ({ id: cat.id, name: cat.name }));

const HomePage: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  // Handle role-based redirection
  useEffect(() => {
    // Wait for Auth loading to finish
    if (!loading && user) {
      if (userProfile?.role === 'admin') {
        console.log('➡️ Proactive Redirect: Admin Dashboard');
        navigate('/admin', { replace: true });
      } else if (userProfile?.role === 'business_owner') {
        console.log('➡️ Proactive Redirect: Business Dashboard');
        navigate('/business', { replace: true });
      } else if (location.state?.fromLogin) {
        // Specifically for clients after login, clear the state
        console.log('➡️ Login Redirection: Staying on Home Page (Customer)');
        navigate('/', { replace: true, state: {} });
      }
    }
  }, [user, userProfile, loading, navigate, location.state]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>(getStoredCity().name);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRange: [0, 1000] as [number, number],
    discountMin: 0,
    distance: 50,
  });

  const dealsQuery = useMemo(() => {
    if (searchQuery) return { query: searchQuery };
    if (userLocation) return { location: userLocation };
    return undefined;
  }, [searchQuery, userLocation]);

  const { deals: allDeals, loading: dealsLoading, error: dealsError, refetch: refetchDeals } = useDeals(dealsQuery);

  const requestNearbyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        reverseGeocode(position.coords.latitude, position.coords.longitude);
        setIsLoadingLocation(false);
        setLocationPermission('granted');
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoadingLocation(false);
        setLocationPermission('denied');
        alert('Active la localisation pour voir les salons près de toi. Sinon, on te montre ' + DEFAULT_CITY.name + '.');
      }
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
      setCurrentLocation(city);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setCurrentLocation('Casablanca');
    }
  };

  const heroDeals = useMemo(() => {
    return allDeals
      .filter(deal => deal.discount_percentage >= 20)
      .sort((a, b) => b.discount_percentage - a.discount_percentage)
      .slice(0, 5);
  }, [allDeals]);

  const sliderDeals = useMemo(() => {
    return allDeals
      .filter(deal => deal.discount_percentage >= 15)
      .sort((a, b) => b.discount_percentage - a.discount_percentage)
      .slice(0, 10);
  }, [allDeals]);

  const forYouDeals = useMemo(() => {
    let filtered = allDeals;

    if (selectedCategory) {
      filtered = filtered.filter(deal => {
        const businessCategory = deal.business?.category || deal.businesses?.category;
        return businessCategory === selectedCategory;
      });
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter(deal => {
        const businessCategory = deal.business?.category || deal.businesses?.category;
        return filters.categories.includes(businessCategory || '');
      });
    } else if (userProfile?.categories && userProfile.categories.length > 0 && !selectedCategory) {
      filtered = filtered.filter(deal => {
        const businessCategory = deal.business?.category || deal.businesses?.category;
        return userProfile.categories?.includes(businessCategory || '');
      });
    }

    if (filters.priceRange) {
      filtered = filtered.filter(deal =>
        deal.discounted_price >= filters.priceRange[0] &&
        deal.discounted_price <= filters.priceRange[1]
      );
    }

    if (filters.discountMin > 0) {
      filtered = filtered.filter(deal => deal.discount_percentage >= filters.discountMin);
    }

    activeQuickFilters.forEach(filterId => {
      switch (filterId) {
        case 'under_200':
          filtered = filtered.filter(deal => deal.discounted_price <= 200);
          break;
        case 'deals_today':
          filtered = filtered.filter(deal => deal.discount_percentage >= 20);
          break;
      }
    });

    return filtered.slice(0, 6);
  }, [allDeals, selectedCategory, userProfile, filters, activeQuickFilters]);


  const nearbyBusinesses = useMemo(() => {
    if (!userLocation) return [];

    const businessMap = new Map();

    allDeals.forEach(deal => {
      const business = deal.business || deal.businesses;
      if (business && !businessMap.has(business.id)) {
        businessMap.set(business.id, business);
      }
    });

    return Array.from(businessMap.values()).slice(0, 5);
  }, [allDeals, userLocation]);

  const calculateDistance = (deal: Deal): number => {
    if (!userLocation) return 0;

    const lat = deal.business?.latitude || deal.businesses?.latitude || deal.business?.coordinates?.lat || deal.businesses?.coordinates?.lat;
    const lng = deal.business?.longitude || deal.businesses?.longitude || deal.business?.coordinates?.lng || deal.businesses?.coordinates?.lng;

    if (!lat || !lng) return 0;

    const R = 6371;
    const dLat = ((lat - userLocation.lat) * Math.PI) / 180;
    const dLon = ((lng - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleBookDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowBookingModal(true);
  };

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleQuickFilterChange = (filterId: string) => {
    setActiveQuickFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(f => f !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <HomeHeader
        userName={userProfile?.full_name?.split(' ')[0]}
        userAvatar={userProfile?.avatar_url}
        location={currentLocation}
        unreadCount={unreadCount}
        isGuest={!user}
        onLocationClick={() => setShowLocationModal(true)}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={() => navigate(user ? '/profile' : '/login')}
      />

      <div className="px-4 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search services, salons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 rounded-full border-border bg-card"
          />
          {FEATURES.ADVANCED_FILTERS && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            >
              <Filter className="h-5 w-5" />
            </Button>
          )}
        </div>

        <section>
          <AdvertisingBanner />
        </section>

        {(dealsLoading || sliderDeals.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Offres du moment</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/categories')}
                className="text-primary hover:text-primary/80"
              >
                Voir tout
              </Button>
            </div>
            {dealsLoading && sliderDeals.length === 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36">
                    <div className="h-36 bg-muted rounded-xl mb-2 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-1 animate-pulse" />
                    <div className="h-2 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : sliderDeals.length > 0 ? (
              <OfferSlider deals={sliderDeals} />
            ) : null}
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {selectedCategory ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Offers` : 'Offers for you'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/categories')}
              className="text-primary"
            >
              See all
            </Button>
          </div>

          <div className="mb-4">
            <CategoryChips
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          </div>

          {dealsError ? (
            <ErrorState
              type="network"
              message="Unable to load offers. Please check your connection and try again."
              onRetry={refetchDeals}
              actionLabel="Retry"
            />
          ) : dealsLoading && forYouDeals.length === 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <SkeletonLoader type="deal-card" count={3} />
            </div>
          ) : forYouDeals.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="space-y-3"
            >
              {forYouDeals.map((deal) => (
                <motion.div
                  key={deal.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <OfferCard
                    deal={deal}
                    onBook={() => handleBookDeal(deal)}
                    distance={userLocation ? calculateDistance(deal) : undefined}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No offers available. Try adjusting your filters or location.
              </p>
            </Card>
          )}
        </section>


        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {userLocation ? 'Nearby' : `Près de ${currentLocation}`}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={requestNearbyLocation}
              disabled={isLoadingLocation}
              className="text-primary"
            >
              {isLoadingLocation ? 'Chargement...' : 'Près de moi'}
            </Button>
          </div>
          {nearbyBusinesses.length > 0 ? (
            <div className="space-y-3">
              {nearbyBusinesses.map((business: any) => (
                <BusinessCardSmall
                  key={business.id}
                  business={business}
                  distance={userLocation && business.latitude && business.longitude
                    ? calculateDistance({ business } as Deal)
                    : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground text-sm mb-3">
                Aucun salon trouvé près de {currentLocation}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={requestNearbyLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? 'Chargement...' : 'Utiliser ma position'}
              </Button>
            </Card>
          )}
        </section>

        <section className="mt-8 mb-4 px-1">
          <InstallButton />
        </section>

        <div className="h-24" />
      </div>

      {showLocationModal && (
        <LocationSelector
          currentLocation={currentLocation}
          onSelect={(location) => {
            setCurrentLocation(location);
            setShowLocationModal(false);
          }}
          onClose={() => setShowLocationModal(false)}
        />
      )}


      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {showBookingModal && selectedDeal && (
        <BookingModal
          deal={selectedDeal as any}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedDeal(null);
          }}
          onBookingComplete={() => {
            setShowBookingModal(false);
            setSelectedDeal(null);
            navigate('/bookings');
          }}
        />
      )}

      {FEATURES.ADVANCED_FILTERS && (
        <SearchFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={(newFilters) => {
            let discountMin = 0;
            if (newFilters.discountLevel === '10') discountMin = 10;
            else if (newFilters.discountLevel === '20') discountMin = 20;
            else if (newFilters.discountLevel === '30') discountMin = 30;
            else if (newFilters.discountLevel === '40plus') discountMin = 40;

            setFilters({
              categories: newFilters.serviceType || [],
              priceRange: newFilters.priceRange || [0, 1000],
              discountMin: discountMin,
              distance: newFilters.distance || 50,
            });
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
