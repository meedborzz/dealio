import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, Calendar, Users, TrendingUp, Award, Heart } from 'lucide-react';
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
import { useToast } from '@/components/ui/toast';

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
  const [activeTab, setActiveTab] = useState('about');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
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
      {/* Elegant Transparent Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-safe bg-transparent">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="flex-shrink-0 text-foreground hover:bg-foreground/10 rounded-full transition-all bg-background/20 backdrop-blur-md">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center space-x-2 flex-shrink-0">
            {FEATURES.FAVORITES && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-foreground hover:bg-foreground/10 rounded-full transition-all bg-background/20 backdrop-blur-md"
                onClick={() => toggleFavorite(businessId!)}
              >
                <Heart className={`h-5 w-5 transition-colors ${user && isFavorite(businessId!) ? 'text-destructive fill-current' : 'text-foreground/30'}`} strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Immersive Hero Section */}
      <div className="relative overflow-hidden">
        <div className="h-64 sm:h-80 bg-gradient-to-br from-primary/10 via-background to-primary/5 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(184,146,185,0.15),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-t from-background via-transparent to-transparent">
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-1000">
            <div className="text-center min-w-0 max-w-lg">
              <div className="flex flex-col gap-3 items-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em]">
                    {business.category}
                  </Badge>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="flex items-center text-muted-foreground text-[11px] font-bold tracking-tight uppercase opacity-70">
                    <MapPin className="h-3 w-3 mr-1.5" />
                    {business.city}
                  </div>
                </div>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-[-0.03em] text-foreground leading-[1.1] selection:bg-primary/20 transition-all duration-700">
                  {business.name}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Actions Area */}
      <div className="px-6 mb-10">
        <div className="max-w-2xl mx-auto flex justify-center gap-4">
          {business.phone && (
            <Button
              variant="outline"
              onClick={() => window.open(`tel:${business.phone}`)}
              className="flex-1 max-w-[160px] h-14 rounded-2xl border-border/60 hover:bg-ui-soft transition-all active:scale-95 shadow-sm group px-4"
            >
              <Phone className="h-4 w-4 mr-2.5 text-primary group-hover:scale-110 transition-transform" strokeWidth={2} />
              <span className="text-[13px] font-bold tracking-tight">Appeler</span>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', ' + business.city)}`, '_blank')}
            className="flex-1 max-w-[160px] h-14 rounded-2xl border-border/60 hover:bg-ui-soft transition-all active:scale-95 shadow-sm group px-4"
          >
            <MapPin className="h-4 w-4 mr-2.5 text-primary group-hover:scale-110 transition-transform" strokeWidth={2} />
            <span className="text-[13px] font-bold tracking-tight">Itinéraire</span>
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="px-6 max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full bg-ui-soft/40 p-1 rounded-[2rem] h-auto border border-ui-line/50 mb-8 overflow-hidden backdrop-blur-sm">
            <TabsTrigger
              value="about"
              className="flex-1 text-[12px] font-bold py-3 rounded-[1.1rem] data-[state=active]:bg-background data-[state=active]:shadow-premium transition-all uppercase tracking-[0.15em] text-muted-foreground data-[state=active]:text-foreground"
            >
              À propos
            </TabsTrigger>
            <TabsTrigger
              value="offers"
              className="flex-1 text-[12px] font-bold py-3 rounded-[1.1rem] data-[state=active]:bg-background data-[state=active]:shadow-premium transition-all uppercase tracking-[0.15em] text-muted-foreground data-[state=active]:text-foreground"
            >
              Offres ({deals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-0 outline-none">
            <div className="space-y-16 pb-16 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-ui-line/50" />
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-60">À propos</h3>
                  <div className="h-[1px] flex-1 bg-ui-line/50" />
                </div>
                {business.description ? (
                  <p className="text-foreground/90 leading-relaxed text-base font-normal text-center max-w-2xl mx-auto">
                    {business.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic text-sm text-center">
                    Aucune présentation disponible pour le salon.
                  </p>
                )}
              </section>

              <section>
                <div className="flex items-center gap-3 mb-10">
                  <div className="h-[1px] flex-1 bg-ui-line/50" />
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-60">Accessibilité</h3>
                  <div className="h-[1px] flex-1 bg-ui-line/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="flex items-start space-x-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 group hover:bg-primary/10 transition-all border border-primary/10 shadow-sm">
                      <MapPin className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground mb-1">Localisation</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{business.address}, {business.city}</p>
                    </div>
                  </div>

                  {business.phone && (
                    <div className="flex items-start space-x-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 group hover:bg-primary/10 transition-all border border-primary/10 shadow-sm">
                        <Phone className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-foreground mb-1">Téléphone</p>
                        <a href={`tel:${business.phone}`} className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.email && (
                    <div className="flex items-start space-x-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 group hover:bg-primary/10 transition-all border border-primary/10 shadow-sm">
                        <Mail className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-foreground mb-1">Email</p>
                        <a href={`mailto:${business.email}`} className="text-sm text-primary hover:text-primary-dark font-medium break-all transition-colors">
                          {business.email}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 group hover:bg-primary/10 transition-all border border-primary/10 shadow-sm">
                      <Calendar className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground mb-1">Partenaire depuis</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {format(parseISO(business.created_at), 'MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="offers" className="mt-0 pb-16 outline-none animate-in fade-in slide-in-from-bottom-3 duration-700">
            {deals.length === 0 ? (
              <div className="text-center py-20 px-6 glass-card rounded-3xl border-dashed border-2 border-ui-line">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10">
                  <Award className="h-10 w-10 text-primary/40" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Aucune offre active</h3>
                <p className="text-muted-foreground text-[15px] max-w-[240px] mx-auto">Revenez prochainement pour découvrir les nouveaux soins du salon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
      <div className="h-24 sm:h-12"></div>
    </div>
  );
};

export default BusinessProfilePage;