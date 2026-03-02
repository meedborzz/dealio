import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Tag, AlertTriangle, ChevronRight, CheckCircle2, Search, Upload, Image as ImageIcon } from 'lucide-react';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Deal } from '../../types';
import { getQuotaForDiscount, calculateDiscountedPrice, getOfferExpiryDate, type DiscountTier } from '../../config/offerQuota';
import LegacyOfferMigrationModal from '../../components/LegacyOfferMigrationModal';
import { getAvailableCategories, DISCOUNT_OPTIONS, generateOfferTitle, getServicesByCategory, getServiceName, validateCategory, validateService } from '../../config/servicePresets';
import { usePhotoUpload } from '../../hooks/usePhotoUpload';
import { getMaxActiveOffers } from '../../config/launchMode';

const OffersPage: React.FC = () => {
  const { businessId, business } = useBusinessContext();
  const [offers, setOffers] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Deal | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedTier, setSelectedTier] = useState<DiscountTier>(10);
  const [showLegacyMigrationModal, setShowLegacyMigrationModal] = useState(false);
  const [selectedLegacyOffer, setSelectedLegacyOffer] = useState<Deal | null>(null);

  const [creationStep, setCreationStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
  const [offerImageUrl, setOfferImageUrl] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchOffers();
    }
  }, [businessId]);

  const fetchOffers = async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(0)} DH`;
  };

  const resetForm = () => {
    setCreationStep(1);
    setSelectedCategory('');
    setSelectedServices([]);
    setOriginalPrice(0);
    setSelectedTier(10);
    setEditingOffer(null);
    setServiceSearchQuery('');
    setOfferImageUrl('');
    setFormError('');
    setUploadingPhoto(false);
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Le fichier doit être une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('L\'image doit faire moins de 5MB');
      return;
    }

    try {
      setFormError('');
      setUploadingPhoto(true);
      const fileName = `${businessId}/offer-${Date.now()}.${file.name.split('.').pop()}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deal-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('deal-images')
        .getPublicUrl(uploadData.path);

      setOfferImageUrl(urlData.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setFormError('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!businessId || !business) return;

    try {
      setSaving(true);
      setFormError('');

      const today = new Date().toISOString().split('T')[0];
      const { data: activeOffers, error: countError } = await supabase
        .from('deals')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('booking_enabled', true)
        .gt('booking_quota_remaining', 0)
        .gte('valid_until', today);

      if (countError) throw countError;

      if (activeOffers && activeOffers.length >= 2) {
        setFormError('Vous avez déjà 2 offres actives. Attendez qu\'une offre expire ou soit épuisée.');
        setSaving(false);
        return;
      }

      const serviceNames = selectedServices.map(id => getServiceName(id));
      const generatedTitle = generateOfferTitle(serviceNames, selectedTier);
      const discountedPrice = calculateDiscountedPrice(originalPrice, selectedTier);
      const expiryDate = getOfferExpiryDate();
      const quota = getQuotaForDiscount(selectedTier);

      const { error } = await supabase
        .from('deals')
        .insert({
          business_id: businessId,
          title: generatedTitle,
          description: 'Réservable via Dealio',
          image_url: offerImageUrl || business.image_url || null,
          original_price: originalPrice,
          discounted_price: discountedPrice,
          discount_percentage: selectedTier,
          duration_minutes: 60,
          valid_until: expiryDate,
          is_active: true,
          booking_enabled: true,
          max_bookings_per_slot: 1,
          category: selectedCategory,
          booking_quota_total: quota,
          booking_quota_remaining: quota,
          quota_enabled: true,
          expires_at: new Date(new Date(expiryDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      setShowCreateModal(false);
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error creating offer:', error);
      setFormError('Erreur lors de la création de l\'offre. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre?')) return;

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', offerId);

      if (error) throw error;
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatusBadgeVariant = (offer: Deal) => {
    if (!offer.is_active || offer.booking_quota_remaining <= 0) return 'secondary';
    return 'default';
  };

  const getStatusText = (offer: Deal) => {
    if (offer.booking_quota_remaining <= 0) return 'Épuisé';
    if (!offer.is_active) return 'Inactif';
    return 'Actif';
  };

  const computedDiscountedPrice = originalPrice > 0
    ? calculateDiscountedPrice(originalPrice, selectedTier)
    : 0;

  const canProceedToStep2 = selectedCategory !== '';
  const canProceedToStep3 = selectedServices.length > 0;
  const canProceedToStep4 = originalPrice > 0;

  const serviceNames = selectedServices.map(id => getServiceName(id));
  const generatedTitle = serviceNames.length > 0 ? generateOfferTitle(serviceNames, selectedTier) : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const legacyOffers = offers.filter(o => o.is_legacy_offer);
  const hasLegacyOffers = legacyOffers.length > 0;

  return (
    <div className="space-y-6">
      {hasLegacyOffers && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                {legacyOffers.length} offre{legacyOffers.length > 1 ? 's' : ''} nécessite{legacyOffers.length > 1 ? 'nt' : ''} une migration
              </h4>
              <p className="text-sm text-muted-foreground">
                Certaines de vos offres utilisent des réductions non-standards. Veuillez les migrer vers le nouveau système (10%, 20%, ou 30%).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Offres</h1>
          <p className="text-sm text-muted-foreground mt-1">Max 2 offres actives en même temps.</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Offre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une offre en {creationStep}/4</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Choisissez vos services, entrez votre prix habituel, Dealio s'occupe du reste.
              </p>
            </DialogHeader>

            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-200">{formError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6 px-1">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                      step === creationStep
                        ? 'bg-primary text-primary-foreground'
                        : step < creationStep
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step < creationStep ? <CheckCircle2 className="h-4 w-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-0.5 mx-1 ${
                        step < creationStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {creationStep === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Image de l'offre (optionnel)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                      {offerImageUrl ? (
                        <div className="relative">
                          <img
                            src={offerImageUrl}
                            alt="Offer preview"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setOfferImageUrl('')}
                            className="absolute top-2 right-2"
                          >
                            Supprimer
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center cursor-pointer">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                            {uploadingPhoto ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm text-foreground font-medium">Ajouter une photo</span>
                          <span className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingPhoto}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Si aucune image n'est fournie, l'image du salon sera utilisée.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Sélectionnez une catégorie *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {getAvailableCategories().map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedCategory === category.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-semibold text-foreground text-sm">{category.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {category.services.length} services
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setFormError('');
                        setCreationStep(2);
                      }}
                      disabled={!canProceedToStep2}
                      className="flex-1"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}

              {creationStep === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Sélectionnez les services * <span className="text-muted-foreground font-normal">(max 3)</span>
                    </label>

                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={serviceSearchQuery}
                        onChange={(e) => setServiceSearchQuery(e.target.value)}
                        placeholder="Rechercher un service..."
                        className="pl-10"
                      />
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
                      {getServicesByCategory(selectedCategory)
                        .filter(service =>
                          service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                        )
                        .map((service) => (
                          <label
                            key={service.id}
                            className={`flex items-center space-x-3 p-2.5 rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                              selectedServices.includes(service.id) ? 'bg-primary/5' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(service.id)}
                              onChange={() => toggleService(service.id)}
                              disabled={!selectedServices.includes(service.id) && selectedServices.length >= 3}
                              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                            />
                            <span className="text-sm text-foreground flex-1">{service.name}</span>
                          </label>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {selectedServices.length}/3 service{selectedServices.length > 1 ? 's' : ''} sélectionné{selectedServices.length > 1 ? 's' : ''}
                      </p>
                      {selectedServices.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedServices([])}
                          className="text-xs h-7 px-2"
                        >
                          Tout effacer
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormError('');
                        setCreationStep(1);
                      }}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setFormError('');
                        setCreationStep(3);
                      }}
                      disabled={!canProceedToStep3}
                      className="flex-1"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}

              {creationStep === 3 && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Prix habituel (DH) *
                      </label>
                      <Input
                        type="number"
                        value={originalPrice || ''}
                        onChange={(e) => setOriginalPrice(Number(e.target.value))}
                        placeholder="200"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Réduction *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {DISCOUNT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedTier(option.value as DiscountTier)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedTier === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="text-2xl font-bold text-foreground">{option.label}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {getQuotaForDiscount(option.value as DiscountTier)} places
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Plus la réduction est élevée, plus votre offre obtient de réservations.
                      </p>
                    </div>

                    {originalPrice > 0 && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Prix après réduction:</span>
                          <span className="font-bold text-lg text-foreground">{formatPrice(computedDiscountedPrice)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormError('');
                        setCreationStep(2);
                      }}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setFormError('');
                        setCreationStep(4);
                      }}
                      disabled={!canProceedToStep4}
                      className="flex-1"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </>
              )}

              {creationStep === 4 && (
                <>
                  <div className="space-y-4">
                    {(offerImageUrl || business?.image_url) && (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <img
                          src={offerImageUrl || business?.image_url}
                          alt="Offer preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Titre de l'offre</label>
                        <p className="font-bold text-foreground text-lg">{generatedTitle}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                        <div>
                          <label className="text-xs text-muted-foreground">Prix habituel</label>
                          <p className="font-semibold text-foreground">{formatPrice(originalPrice)}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Prix final</label>
                          <p className="font-bold text-primary text-lg">{formatPrice(computedDiscountedPrice)}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <label className="text-xs text-muted-foreground">Réservations disponibles</label>
                        <p className="font-semibold text-foreground">{getQuotaForDiscount(selectedTier)} places</p>
                      </div>
                    </div>

                    <div className="bg-muted/50 border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">
                        Votre offre disparaît automatiquement quand les places sont épuisées (7 jours max).
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormError('');
                        setCreationStep(3);
                      }}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateOffer}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-b from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                    >
                      {saving ? 'Publication...' : 'Publier l\'offre'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Aucune offre</h3>
            <p className="text-muted-foreground mb-6">Créez votre première offre pour attirer des clients.</p>
            <Button onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}>
              Créer votre première offre
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {offer.image_url ? (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge variant={getStatusBadgeVariant(offer)}>
                    {getStatusText(offer)}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  {offer.is_legacy_offer && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Legacy
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-black/60 text-white border-0">
                    -{offer.discount_percentage}%
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-foreground mb-2">{offer.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{offer.description}</p>

                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(offer.discounted_price)}
                  </span>
                  {offer.original_price > offer.discounted_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(offer.original_price)}
                    </span>
                  )}
                </div>

                <div className="mb-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Places restantes:</span>
                    <span className="font-semibold text-foreground">
                      {offer.booking_quota_remaining} / {offer.booking_quota_total}
                    </span>
                  </div>
                  {offer.valid_until && (
                    <div className="text-xs text-muted-foreground">
                      Expire le {format(new Date(offer.valid_until), 'd MMM yyyy')}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {offer.is_legacy_offer && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedLegacyOffer(offer);
                        setShowLegacyMigrationModal(true);
                      }}
                      className="flex-1"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Migrer
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedLegacyOffer && (
        <LegacyOfferMigrationModal
          offer={selectedLegacyOffer}
          isOpen={showLegacyMigrationModal}
          onClose={() => {
            setShowLegacyMigrationModal(false);
            setSelectedLegacyOffer(null);
          }}
          onMigrated={() => {
            fetchOffers();
            setShowLegacyMigrationModal(false);
            setSelectedLegacyOffer(null);
          }}
        />
      )}
    </div>
  );
};

export default OffersPage;
