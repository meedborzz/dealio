import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Calendar, Users, TrendingUp, Award, Heart, MessageSquare, Share2, MessageCircle, Tag } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import DealCard from '../components/DealCard';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FEATURES } from '../config/features';
import { useFavorites } from '../hooks/useFavorites';
import InAppMessaging from '../components/InAppMessaging';

interface BusinessProfile {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  category: string;
  status: string;
  created_at: string;
}

interface BusinessDeal {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  duration_minutes: number;
  valid_until: string;
  is_active: boolean;
}

const BusinessProfilePage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [deals, setDeals] = useState<BusinessDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    if (businessId) {
      fetchBusinessProfile();
      fetchBusinessDeals();
    }
  }, [businessId]);

  const fetchBusinessProfile = async () => {
    if (!businessId) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business profile:', error);
      navigate('/');
    }
  };

  const fetchBusinessDeals = async () => {
    if (!businessId) return;

    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching business deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const openChatWithBusiness = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Salon non trouvé</h2>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 pt-12 pb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="flex-shrink-0 text-white hover:bg-white/20">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-white text-center flex-1 px-4 truncate">Profil du salon</h1>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => { }} className="h-8 w-8 text-white hover:bg-white/20">
              <Share2 className="h-4 w-4" />
            </Button>
            {FEATURES.FAVORITES && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => toggleFavorite(businessId!)}
              >
                <Heart className={`h-4 w-4 ${user && isFavorite(businessId!) ? 'text-destructive fill-current' : 'text-muted-foreground'}`} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Business Hero */}
      <div className="relative">
        <div className="h-48 sm:h-56 bg-gradient-to-br from-primary/20 to-primary/5"></div>
        <div className="absolute inset-0 flex items-end p-4 sm:p-6 pb-8 sm:pb-12">
          <div className="flex items-end space-x-3 sm:space-x-4 w-full">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-2xl border-4 border-background shadow-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 pb-2 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 truncate">
                {business.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{business.category}</Badge>
                <Badge variant="outline" className="text-xs">{business.city}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="px-4 mt-2 sm:mt-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Button onClick={openChatWithBusiness} className="flex-1">
            <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
            Contacter
          </Button>
          {business.phone && (
            <Button variant="outline" onClick={() => window.open(`tel:${business.phone}`)}>
              <Phone className="h-4 w-4 mr-1 sm:mr-2" />
              Appeler
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', ' + business.city)}`, '_blank')}
          >
            <MapPin className="h-4 w-4 mr-1 sm:mr-2" />
            Direction
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="about" className="text-xs sm:text-sm px-2">À propos</TabsTrigger>
            <TabsTrigger value="offers" className="text-xs sm:text-sm px-2">Offres ({deals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-4 sm:mt-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                {business.description ? (
                  <p className="text-muted-foreground leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    {business.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic mb-4 sm:mb-6 text-sm">
                    Aucune description disponible
                  </p>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-foreground text-sm sm:text-base">Adresse</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{business.address}, {business.city}</p>
                    </div>
                  </div>

                  {business.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base">Téléphone</p>
                        <a href={`tel:${business.phone}`} className="text-primary hover:underline">
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base">Email</p>
                        <a href={`mailto:${business.email}`} className="text-primary hover:underline text-sm break-all">
                          {business.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.website && (
                    <div className="flex items-start space-x-3">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base">Site web</p>
                        <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm break-all">
                          {business.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-foreground text-sm sm:text-base">Membre depuis</p>
                      <p className="text-muted-foreground text-sm">
                        {format(parseISO(business.created_at), 'MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-foreground text-sm sm:text-base">Catégorie</p>
                      <p className="text-muted-foreground text-sm">{business.category}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="mt-4 sm:mt-6">
            {deals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 sm:py-12">
                  <Award className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Aucune offre active</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">Ce salon n'a pas d'offres disponibles pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={{
                      ...deal,
                      business: business
                    }}
                    variant="compact"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20 sm:h-8"></div>

      {/* Chat Modal */}
      {showChat && (
        <InAppMessaging
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          businessId={businessId}
          businessName={business.name}
        />
      )}
    </div>
  );
};

export default BusinessProfilePage;