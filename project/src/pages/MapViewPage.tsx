import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MapPin, Navigation, X, Building2, Star, Phone, MessageSquare, Layers, Eye, Filter, Map as MapIcon, List, Grid, Sparkles, Clock, Mail, Maximize, Minimize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Business, Deal } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BusinessWithDeals extends Business {
  deals?: Deal[];
  activeDealsCount?: number;
}

// Default center: Casablanca, Morocco
const defaultCenter: [number, number] = [33.5731, -7.5898];

// Enhanced category configuration with beautiful colors
const categoryConfig = {
  'Coiffure': {
    name: 'Coiffure',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    emoji: '✂️',
    description: 'Coupes & coiffage'
  },
  'Ongles': {
    name: 'Ongles',
    color: '#8B5CF6',
    bgColor: '#F3F4F6',
    emoji: '💅',
    description: 'Manucure & nail art'
  },
  'Massage': {
    name: 'Massage',
    color: '#10B981',
    bgColor: '#ECFDF5',
    emoji: '💆‍♀️',
    description: 'Relaxation & bien-être'
  },
  'Spa': {
    name: 'Spa',
    color: '#06B6D4',
    bgColor: '#F0F9FF',
    emoji: '🛁',
    description: 'Hammam & soins spa'
  },
  'Esthetique': {
    name: 'Esthétique',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    emoji: '✨',
    description: 'Soins visage & corps'
  },
  'Barbier': {
    name: 'Barbier',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    emoji: '🧔',
    description: 'Coiffure homme'
  },
  'Manucure': {
    name: 'Manucure',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    emoji: '💅',
    description: 'Soins des ongles'
  },
  'Epilation': {
    name: 'Épilation',
    color: '#F97316',
    bgColor: '#FFF7ED',
    emoji: '⚡',
    description: 'Épilation laser & cire'
  },
  'Maquillage': {
    name: 'Maquillage',
    color: '#D946EF',
    bgColor: '#FAF5FF',
    emoji: '💄',
    description: 'Maquillage pro'
  },
  'Fitness': {
    name: 'Fitness',
    color: '#059669',
    bgColor: '#ECFDF5',
    emoji: '🏋️‍♀️',
    description: 'Sport & yoga'
  },
  'Sourcils': {
    name: 'Sourcils & Cils',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    emoji: '👁️',
    description: 'Restructuration'
  },
  'Soins': {
    name: 'Soins Corps',
    color: '#0EA5E9',
    bgColor: '#F0F9FF',
    emoji: '💧',
    description: 'Gommages & hydratation'
  }
};

const MapViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithDeals | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [zoom, setZoom] = useState(15);
  const [showCategoryLegend, setShowCategoryLegend] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showFullOverlay, setShowFullOverlay] = useState(false);

  // Hide bottom navigation when in full screen
  useEffect(() => {
    if (isFullScreen) {
      document.body.classList.add('map-fullscreen');
    } else {
      document.body.classList.remove('map-fullscreen');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('map-fullscreen');
    };
  }, [isFullScreen]);

  useEffect(() => {
    fetchBusinessesWithDeals();
    detectUserLocation();
  }, []);

  const fetchBusinessesWithDeals = async () => {
    try {
      setLoading(true);

      console.log('🔍 Fetching businesses for map...');

      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          description,
          address,
          city,
          phone,
          email,
          category,
          rating,
          review_count,
         coordinates,
         status
        `)
        .in('status', ['approved', 'pending']); // Include pending businesses too

      if (businessesError) throw businessesError;

      console.log('📊 Fetched businesses:', businessesData?.length || 0);
      businessesData?.forEach(b => {
        console.log(`- ${b.name} (${b.city}) - Status: ${b.status} - Coords: ${b.coordinates ? 'Yes' : 'No'}`);
      });
      // Enhanced mock coordinates for businesses
      const businessesWithCoords = (businessesData || []).map((business, index) => {
        let coordinates;

        if (business.coordinates && typeof business.coordinates === 'object') {
          const coords = business.coordinates as any;
          if (coords.lat && coords.lng) {
            coordinates = [coords.lat, coords.lng] as [number, number];
            console.log(`✅ Using existing coordinates for ${business.name}:`, coordinates);
          }
        }

        if (!coordinates) {
          console.log(`🗺️ Generating coordinates for ${business.name} in ${business.city}`);
          // Generate better spread coordinates based on city and business ID
          const hash = business.id.split('-')[0].split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);

          const cityOffsets = {
            'Casablanca': { lat: 33.5731, lng: -7.5898 },
            'Rabat': { lat: 34.0209, lng: -6.8416 },
            'Marrakech': { lat: 31.6295, lng: -7.9811 },
            'Fès': { lat: 34.0181, lng: -5.0078 },
            'Tanger': { lat: 35.7595, lng: -5.8340 },
            'Agadir': { lat: 30.4278, lng: -9.5981 }
          };

          const cityCenter = cityOffsets[business.city as keyof typeof cityOffsets] || cityOffsets['Casablanca'];
          const offsetLat = (Math.sin(hash) * 0.008); // Smaller spread
          const offsetLng = (Math.cos(hash) * 0.008);

          coordinates = [
            cityCenter.lat + offsetLat,
            cityCenter.lng + offsetLng
          ] as [number, number];

          console.log(`📍 Generated coordinates for ${business.name}:`, coordinates);
        }

        return {
          ...business,
          coordinates
        };
      });

      // Fetch deals for each business
      console.log('🔍 Fetching deals for each business...');
      const businessesWithDeals = await Promise.all(
        businessesWithCoords.map(async (business) => {
          try {
            const { data: dealsData } = await supabase
              .from('deals')
              .select(`
                id,
                title,
                description,
                image_url,
                original_price,
                discounted_price,
                discount_percentage,
                duration_minutes,
                valid_until,
                category
              `)
              .eq('business_id', business.id)
              .eq('is_active', true)
              .order('discount_percentage', { ascending: false });

            console.log(`💼 ${business.name} has ${dealsData?.length || 0} deals`);
            if (dealsData && dealsData.length > 0) {
              console.log(`  📋 Deals: ${dealsData.map(d => d.title).join(', ')}`);
            }
            return {
              ...business,
              deals: dealsData || [],
              activeDealsCount: dealsData?.length || 0
            };
          } catch (dealError) {
            console.warn('Error fetching deals for business:', business.name, dealError);
            return {
              ...business,
              deals: [],
              activeDealsCount: 0
            };
          }
        })
      );

      console.log('🗺️ Final businesses with deals:', businessesWithDeals.length);
      console.log('📊 Business summary:');
      businessesWithDeals.forEach(b => {
        console.log(`  - ${b.name}: ${b.activeDealsCount} deals, coords: [${b.coordinates?.[0]?.toFixed(4)}, ${b.coordinates?.[1]?.toFixed(4)}]`);
      });

      setBusinesses(businessesWithDeals);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCurrentLocation(location);
          setMapCenter(location); // Center map on user location
          console.log('📍 User location detected:', location);
        },
        (error) => {
          console.warn('Location detection failed:', error);
        }
      );
    }
  };

  const handleMarkerClick = useCallback((business: BusinessWithDeals) => {
    console.log('✅ HANDLE MARKER CLICK - Setting selected business:', business.name);
    console.log('📊 Active deals:', business.activeDealsCount);
    console.log('📋 Deal titles:', business.deals?.map(d => d.title).join(', ') || 'None');
    setSelectedBusiness(business);
    setShowFullOverlay(true);
    console.log('🎯 Selected business updated - overlay should appear');
  }, []);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = !searchTerm ||
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || business.category === selectedCategory;

    const hasDeals = business.activeDealsCount && business.activeDealsCount > 0;
    const hasCoordinates = business.coordinates && Array.isArray(business.coordinates) && business.coordinates.length === 2;

    return matchesSearch && matchesCategory && hasDeals && hasCoordinates;
  });

  const categoriesInUse = Array.from(new Set(
    businesses
      .filter(b => b.activeDealsCount && b.activeDealsCount > 0)
      .map(b => b.category)
  )).filter(Boolean);

  const getMarkerColor = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig]?.color || '#6B7280';
  };

  const calculateOverlayOffset = (coordinates: [number, number]): [number, number] => {
    // Calculate better offset based on marker position to avoid nav overlap
    const [lat, lng] = coordinates;

    // If marker is in bottom third of screen, show overlay above
    if (lat < mapCenter[0] - 0.01) {
      return [0, -200]; // Show above marker
    }
    // If marker is in top third, show below
    if (lat > mapCenter[0] + 0.01) {
      return [0, 80]; // Show below marker
    }
    // Default: show to the right
    return [180, -120];
  };

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'h-screen'} flex flex-col bg-background`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => isFullScreen ? setIsFullScreen(false) : navigate('/')}
            className="text-white hover:bg-white/20"
          >
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">Carte interactive</h1>
            <p className="text-sm text-white/80">
              Explorez les salons autour de vous
            </p>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (isFullScreen) {
                  setIsFullScreen(false);
                } else {
                  setViewMode(viewMode === 'map' ? 'list' : 'map');
                }
              }}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              {isFullScreen ? <Minimize className="h-4 w-4" /> :
                viewMode === 'map' ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Map or List View */}
      <div className="flex-1 relative">
        {viewMode === 'map' ? (
          <div className="h-full w-full relative">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-muted">
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Chargement de la carte...</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Map
                center={mapCenter}
                zoom={zoom}
                onBoundsChanged={({ center, zoom }) => {
                  setMapCenter(center);
                  setZoom(zoom);
                }}
              >
                {/* User Location Marker */}
                {currentLocation && (
                  <Marker anchor={currentLocation} width={20} height={20}>
                    <div className="relative">
                      <div className="w-5 h-5 bg-[#c8a2c9] border-2 border-white rounded-full shadow-lg animate-pulse"></div>
                      <div className="absolute -top-1 -left-1 w-7 h-7 bg-[#c8a2c9]/20 rounded-full"></div>
                    </div>
                  </Marker>
                )}

                {/* Business Markers */}
                {filteredBusinesses.map((business) => {
                  const coordinates = business.coordinates as [number, number];

                  if (!coordinates || coordinates.length !== 2) {
                    console.warn('⚠️ Invalid coordinates for business:', business.name, coordinates);
                    return null;
                  }

                  const categoryInfo = categoryConfig[business.category as keyof typeof categoryConfig];

                  return (
                    <Marker
                      key={business.id}
                      anchor={coordinates}
                      width={32}
                      height={32}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          console.log('🎯 MARKER BUTTON CLICKED:', business.name);
                          handleMarkerClick(business);
                        }}
                        className="relative w-10 h-10 cursor-pointer transform hover:scale-110 transition-transform duration-200"
                        style={{
                          zIndex: 1000,
                          pointerEvents: 'auto',
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: 0
                        }}
                      >
                        {/* Main marker */}
                        <div
                          className="w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white text-lg font-bold"
                          style={{
                            backgroundColor: categoryInfo?.color || '#EF4444',
                            pointerEvents: 'none',
                            userSelect: 'none',
                            position: 'relative'
                          }}
                        >
                          {categoryInfo?.emoji || '🏪'}
                        </div>

                        {/* Deal count badge */}
                        {business.activeDealsCount && business.activeDealsCount > 0 && (
                          <div
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                            style={{ pointerEvents: 'none' }}
                          >
                            <span className="text-white text-xs font-bold">
                              {business.activeDealsCount > 9 ? '9+' : business.activeDealsCount}
                            </span>
                          </div>
                        )}
                      </button>
                    </Marker>
                  );
                })}
              </Map>
            )}

            {/* Floating Category Button */}
            {!isFullScreen && !showFullOverlay && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="outline"
                  onClick={() => setShowCategoryLegend(true)}
                  className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg"
                  size="sm"
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="p-4 space-y-3 overflow-y-auto">
            {filteredBusinesses.flatMap(business =>
              business.deals?.map(deal => (
                <Card
                  key={deal.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/deal/${deal.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={deal.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-foreground text-sm">{deal.title}</h3>
                          <Badge variant="destructive" className="text-xs">
                            -{deal.discount_percentage}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{business.name}</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-muted-foreground">
                            {business.rating?.toFixed(1)} ({business.review_count} avis)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-primary text-sm">
                              {deal.discounted_price} DH
                            </span>
                            <span className="text-xs text-muted-foreground line-through ml-2">
                              {deal.original_price} DH
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || []
            )}
          </div>
        )}

        {/* Full Screen Business Overlay */}
        {showFullOverlay && selectedBusiness && (
          <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Full Overlay Header */}
            <div className="bg-card border-b border-border px-4 pt-12 pb-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowFullOverlay(false);
                    setSelectedBusiness(null);
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="text-center">
                  <h1 className="text-lg font-bold text-foreground">{selectedBusiness.name}</h1>
                  <p className="text-sm text-muted-foreground">{selectedBusiness.city} • {selectedBusiness.category}</p>
                </div>
                <div className="w-10"></div>
              </div>
            </div>

            {/* Business Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg"
                  style={{ backgroundColor: getMarkerColor(selectedBusiness.category) }}
                >
                  {categoryConfig[selectedBusiness.category as keyof typeof categoryConfig]?.emoji || '🏪'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-foreground">
                      {selectedBusiness.rating?.toFixed(1) || '0.0'} ({selectedBusiness.review_count || 0} avis)
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{selectedBusiness.address}, {selectedBusiness.city}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <Button
                  onClick={() => navigate(`/business/${selectedBusiness.id}`)}
                  variant="outline"
                  size="sm"
                >
                  <Building2 className="h-4 w-4 mr-1" />
                  Profil
                </Button>
                {selectedBusiness.phone && (
                  <Button
                    onClick={() => window.open(`tel:${selectedBusiness.phone}`)}
                    variant="outline"
                    size="sm"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Appeler
                  </Button>
                )}
                <Button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedBusiness.address + ', ' + selectedBusiness.city)}`, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Itinéraire
                </Button>
              </div>
            </div>

            {/* Deals List */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedBusiness.deals && selectedBusiness.deals.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-primary" />
                      Offres disponibles
                    </h3>
                    <Badge className="bg-primary text-primary-foreground">
                      {selectedBusiness.deals.length} offre{selectedBusiness.deals.length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {selectedBusiness.deals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
                      onClick={() => navigate(`/deal/${deal.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={deal.image_url || 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={deal.title}
                            className="w-20 h-20 rounded-lg object-cover shadow-sm"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-foreground text-base">
                                {deal.title}
                              </h4>
                              <Badge variant="destructive" className="font-bold">
                                -{deal.discount_percentage}%
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {deal.description}
                            </p>

                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <span className="text-xl font-bold text-primary">
                                  {deal.discounted_price} DH
                                </span>
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  {deal.original_price} DH
                                </span>
                              </div>
                            </div>

                            <div className="text-sm text-[#c8a2c9] dark:text-[#d6aad7] font-semibold">
                              Économie: {deal.original_price - deal.discounted_price} DH
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Aucune offre active</h3>
                  <p className="text-muted-foreground mb-6">Ce salon n'a pas d'offres disponibles actuellement</p>
                  <Button
                    onClick={() => navigate(`/business/${selectedBusiness.id}`)}
                    variant="outline"
                  >
                    Voir le profil du salon
                  </Button>
                </div>
              )}
            </div>

            {/* Contact Info Footer */}
            {(selectedBusiness.phone || selectedBusiness.email) && (
              <div className="p-4 border-t border-border bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  {selectedBusiness.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{selectedBusiness.phone}</span>
                    </div>
                  )}
                  {selectedBusiness.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate">{selectedBusiness.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hide Pigeon Maps Copyright */}
        <style>{`
          .pigeon-attribution {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          
          .pigeon-attribution a {
            display: none !important;
          }
          
          /* Additional override for any attribution elements */
          [class*="attribution"] {
            display: none !important;
          }
        `}</style>
      </div>

      {/* Category Legend Modal */}
      {showCategoryLegend && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-end justify-center p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Layers className="h-5 w-5 mr-2" />
                  Filtrer par catégorie
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCategoryLegend(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {categoriesInUse.map((category) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                const businessCount = businesses.filter(b => b.category === category && b.activeDealsCount && b.activeDealsCount > 0).length;

                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === category ? '' : category);
                      setShowCategoryLegend(false);
                    }}
                    className={`w-full p-2 rounded-lg border transition-all duration-200 text-left ${selectedCategory === category
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: config?.color || '#6B7280' }}
                      >
                        {config?.emoji || '🏪'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground text-sm">{config?.name || category}</h4>
                          <Badge variant="outline" className="text-xs">
                            {businessCount}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Clear Filter Button */}
              {selectedCategory && (
                <div className="pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('');
                      setShowCategoryLegend(false);
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Effacer le filtre
                  </Button>
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 bg-[#c8a2c9] rounded-full"></div>
                  <span>Votre position (si partagée)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Badge = nombre d'offres</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Filter Indicator */}
      {selectedCategory && !showFullOverlay && (
        <div className={`absolute ${isFullScreen ? 'bottom-6' : 'bottom-6'} left-4 right-4 z-10`}>
          <Card className="shadow-lg bg-card/95 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: getMarkerColor(selectedCategory) }}
                  >
                    {categoryConfig[selectedCategory as keyof typeof categoryConfig]?.emoji}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Filtré: {selectedCategory}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom spacing for nav */}
      {!isFullScreen && !showFullOverlay && (
        <div className="h-20"></div>
      )}
    </div>
  );
};

export default MapViewPage;