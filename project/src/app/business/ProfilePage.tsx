import React, { useState, useEffect } from 'react';
import { Building2, Edit3, Save, X, Phone, Mail, MapPin, Tag, Star, Globe, Calendar, TrendingUp, DollarSign, Users, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentBusiness } from '../../hooks/useCurrentBusiness';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { categories as allCategories, cities } from '../../data/mockData';
import WorkingHoursEditor from '../../components/WorkingHoursEditor';
import SpecialDatesManager from '../../components/SpecialDatesManager';
import { WorkingHours, SpecialDate } from '../../types';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BusinessMetrics {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
  repeatCustomers: number;
}

const BusinessProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { biz, loading: bizLoading, err: bizError } = useCurrentBusiness();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    category: ''
  });
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    conversionRate: 0,
    repeatCustomers: 0
  });
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null);
  const [specialDates, setSpecialDates] = useState<Record<string, SpecialDate>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (biz) {
      setEditForm({
        name: biz.name || '',
        description: biz.description || '',
        address: biz.address || '',
        city: biz.city || '',
        phone: biz.phone || '',
        email: biz.email || '',
        website: biz.website || '',
        category: biz.category || ''
      });
      setWorkingHours(biz.working_hours || {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      });
      setSpecialDates(biz.special_dates || {});
      fetchBusinessMetrics();
    }
  }, [biz]);

  const fetchBusinessMetrics = async () => {
    if (!biz) return;

    try {
      // Fetch bookings for metrics
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .select('id')
        .eq('business_id', biz.id);

      if (dealsError) throw dealsError;

      const dealIds = dealsData?.map(d => d.id) || [];
      console.log(`[Profile] Business ID: ${biz.id}, Deals found: ${dealIds.length}`);

      if (dealIds.length > 0) {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, status, total_price, user_id')
          .in('deal_id', dealIds);

        if (bookingsError) throw bookingsError;
        console.log(`[Profile] Bookings found: ${bookingsData?.length || 0}`);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('business_id', biz.id);

        if (reviewsError) {
          console.error('[Profile] Reviews fetch error:', reviewsError);
        } else {
          console.log(`[Profile] Reviews found: ${reviewsData?.length || 0}`);
        }

        // Calculate metrics
        const totalBookings = bookingsData?.length || 0;
        const completedBookings = bookingsData?.filter(b => b.status === 'completed') || [];
        const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        const averageRating = reviewsData && reviewsData.length > 0
          ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
          : 0;

        // Calculate repeat customers
        const customerCounts = new Map();
        bookingsData?.forEach(booking => {
          if (booking.user_id) {
            customerCounts.set(booking.user_id, (customerCounts.get(booking.user_id) || 0) + 1);
          }
        });
        const repeatCustomers = Array.from(customerCounts.values()).filter(count => count > 1).length;

        setMetrics({
          totalBookings,
          totalRevenue,
          averageRating,
          totalReviews: reviewsData?.length || 0,
          conversionRate: totalBookings > 0 ? (completedBookings.length / totalBookings) * 100 : 0,
          repeatCustomers
        });
      }
    } catch (error) {
      console.error('Error fetching business metrics:', error);
    }
  };

  const handleSave = async () => {
    if (!biz) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('businesses')
        .update({
          name: editForm.name,
          description: editForm.description,
          address: editForm.address,
          city: editForm.city,
          phone: editForm.phone,
          email: editForm.email,
          website: editForm.website || null,
          category: editForm.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', biz.id);

      if (error) throw error;

      setIsEditing(false);
      alert('Profil mis à jour avec succès');
      window.location.reload();
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWorkingHours = async (hours: WorkingHours) => {
    if (!biz) return;

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          working_hours: hours,
          updated_at: new Date().toISOString()
        })
        .eq('id', biz.id);

      if (error) throw error;

      alert('Horaires mis à jour avec succès');
    } catch (error) {
      console.error('Error updating working hours:', error);
      alert('Erreur lors de la mise à jour des horaires');
    }
  };

  const handleSaveSpecialDates = async (dates: Record<string, SpecialDate>) => {
    if (!biz) return;

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          special_dates: dates,
          updated_at: new Date().toISOString()
        })
        .eq('id', biz.id);

      if (error) throw error;

      setSpecialDates(dates);
      alert('Dates spéciales mises à jour avec succès');
    } catch (error) {
      console.error('Error updating special dates:', error);
      alert('Erreur lors de la mise à jour des dates spéciales');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      default: return 'draft';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Vérifié et Actif';
      case 'pending': return 'En cours de vérification';
      case 'rejected': return 'Demande rejetée';
      case 'suspended': return 'Compte suspendu';
      default: return 'Statut inconnu';
    }
  };

  if (bizLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bizError) {
    return (
      <div className="min-h-screen bg-background">
        <ErrorState message={bizError} />
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Aucun établissement trouvé</h2>
          <p className="text-muted-foreground mb-6">Veuillez créer votre établissement</p>
          <Button onClick={() => navigate('/register')}>
            Créer mon établissement
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile: Single column layout */}
      <div className="md:hidden">
        <div className="p-3 space-y-4">
          {/* Business Header Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-lg font-bold text-foreground truncate">{biz.name}</h1>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0"
                    >
                      {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{biz.city} • {biz.category}</p>
                  <Badge variant={getStatusVariant(biz.status)} className="text-xs">
                    {getStatusText(biz.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold">{metrics.totalBookings}</p>
                <p className="text-xs text-muted-foreground">Réservations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold">{metrics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Revenus DH</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Star className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold">{metrics.averageRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Note moyenne</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold">{metrics.conversionRate.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Taux succès</p>
              </CardContent>
            </Card>
          </div>

          {/* Business Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nom</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Ville</label>
                      <Select value={editForm.city} onValueChange={(value) => setEditForm(prev => ({ ...prev, city: value }))}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.filter(city => city && city.trim() !== '').map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Catégorie</label>
                      <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.filter(cat => cat.id && cat.id.trim() !== '').map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Adresse</label>
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Téléphone</label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email</label>
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Site web</label>
                    <Input
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{biz.address}</span>
                  </div>
                  {biz.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{biz.phone}</span>
                    </div>
                  )}
                  {biz.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{biz.email}</span>
                    </div>
                  )}
                  {biz.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {biz.website}
                      </a>
                    </div>
                  )}
                  {biz.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">{biz.description}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Working Hours */}
          <div className="space-y-4">
            <WorkingHoursEditor
              workingHours={workingHours || {
                monday: { open: '09:00', close: '18:00', closed: false },
                tuesday: { open: '09:00', close: '18:00', closed: false },
                wednesday: { open: '09:00', close: '18:00', closed: false },
                thursday: { open: '09:00', close: '18:00', closed: false },
                friday: { open: '09:00', close: '18:00', closed: false },
                saturday: { open: '09:00', close: '17:00', closed: false },
                sunday: { open: '10:00', close: '16:00', closed: true }
              }}
              onChange={handleSaveWorkingHours}
            />
            <SpecialDatesManager
              specialDates={specialDates}
              onChange={handleSaveSpecialDates}
            />
          </div>

          {/* Account Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Membre depuis</span>
                <span className="text-sm font-medium">
                  {format(parseISO(biz.created_at), 'MMM yyyy', { locale: fr })}
                </span>
              </div>


            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop: Original tabbed layout */}
      <div className="hidden md:block p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{biz.name}</CardTitle>
                  <p className="text-muted-foreground">{biz.city} • {biz.category}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={getStatusVariant(biz.status)}>
                      {getStatusText(biz.status)}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{(biz.rating ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Réservations</p>
                  <p className="text-2xl font-bold">{metrics.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenus</p>
                  <p className="text-2xl font-bold">{metrics.totalRevenue.toLocaleString()} DH</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Note moyenne</p>
                  <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux succès</p>
                  <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="hours">Horaires</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="account">Compte</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Informations de l'établissement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom de l'établissement</label>
                      {isEditing ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nom de votre salon"
                        />
                      ) : (
                        <p className="text-sm p-3 bg-muted rounded-md">{biz.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Catégorie</label>
                      {isEditing ? (
                        <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {allCategories.filter(cat => cat.id && cat.id.trim() !== '').map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm p-3 bg-muted rounded-md">{biz.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Ville</label>
                      {isEditing ? (
                        <Select value={editForm.city} onValueChange={(value) => setEditForm(prev => ({ ...prev, city: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une ville" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.filter(city => city && city.trim() !== '').map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm p-3 bg-muted rounded-md">{biz.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Adresse</label>
                      {isEditing ? (
                        <Input
                          value={editForm.address}
                          onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Adresse complète"
                        />
                      ) : (
                        <p className="text-sm p-3 bg-muted rounded-md">{biz.address}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Téléphone</label>
                      {isEditing ? (
                        <Input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+212 6XX XXX XXX"
                        />
                      ) : (
                        <p className="text-sm p-3 bg-muted rounded-md">{biz.phone || 'Non renseigné'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="contact@salon.com"
                        />
                      ) : (
                        <p className="text-sm p-3 bg-muted rounded-md">{biz.email || 'Non renseigné'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Site web</label>
                      {isEditing ? (
                        <Input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://www.monsalon.com"
                        />
                      ) : (
                        <p className="text-sm p-3 bg-muted rounded-md">
                          {biz.website ? (
                            <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {biz.website}
                            </a>
                          ) : (
                            'Non renseigné'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder="Décrivez votre salon, vos spécialités, votre ambiance..."
                    />
                  ) : (
                    <p className="text-sm p-3 bg-muted rounded-md">{biz.description || 'Aucune description'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-6 mt-6">
            <WorkingHoursEditor
              workingHours={workingHours || {
                monday: { open: '09:00', close: '18:00', closed: false },
                tuesday: { open: '09:00', close: '18:00', closed: false },
                wednesday: { open: '09:00', close: '18:00', closed: false },
                thursday: { open: '09:00', close: '18:00', closed: false },
                friday: { open: '09:00', close: '18:00', closed: false },
                saturday: { open: '09:00', close: '17:00', closed: false },
                sunday: { open: '10:00', close: '16:00', closed: true }
              }}
              onChange={handleSaveWorkingHours}
            />
            <SpecialDatesManager
              specialDates={specialDates}
              onChange={handleSaveSpecialDates}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Métriques de performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taux de conversion:</span>
                    <span className="font-medium">{metrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Clients fidèles:</span>
                    <span className="font-medium">{metrics.repeatCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total avis:</span>
                    <span className="font-medium">{metrics.totalReviews}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Réputation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Note moyenne:</span>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{metrics.averageRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nombre d'avis:</span>
                    <span className="font-medium">{biz.review_count ?? 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Informations du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Membre depuis</label>
                      <p className="font-medium">
                        {format(parseISO(biz.created_at), 'MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Statut du compte</label>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusVariant(biz.status)}>
                          {getStatusText(biz.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>



                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessProfilePage;