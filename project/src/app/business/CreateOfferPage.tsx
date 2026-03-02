import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Search, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getQuotaForDiscount, calculateDiscountedPrice, getOfferExpiryDate, type DiscountTier } from '../../config/offerQuota';
import { getAvailableCategories, DISCOUNT_OPTIONS, generateOfferTitle, getServicesByCategory, getServiceName, validateCategory, validateService } from '../../config/servicePresets';
import { usePhotoUpload } from '../../hooks/usePhotoUpload';
import { getMaxActiveOffers } from '../../config/launchMode';

const CreateOfferPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessId, business } = useBusinessContext();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [selectedTier, setSelectedTier] = useState<DiscountTier>(10);
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
  const [offerImageUrl, setOfferImageUrl] = useState<string>('');
  const [activeOffersCount, setActiveOffersCount] = useState<number>(0);
  const [checkingOffers, setCheckingOffers] = useState(true);
  const { uploadPhoto, uploading: uploadingPhoto } = usePhotoUpload();

  useEffect(() => {
    if (businessId) {
      checkActiveOffersCount();
    }
  }, [businessId]);

  const checkActiveOffersCount = async () => {
    if (!businessId) return;

    try {
      setCheckingOffers(true);
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('deals')
        .select('id', { count: 'exact', head: false })
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('booking_enabled', true)
        .gt('booking_quota_remaining', 0)
        .gte('valid_until', today);

      if (error) throw error;

      setActiveOffersCount(data?.length || 0);
    } catch (error) {
      console.error('Error checking active offers:', error);
      setActiveOffersCount(0);
    } finally {
      setCheckingOffers(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      const services = getServicesByCategory(selectedCategory);
      if (services.length > 0 && selectedServices.length === 0) {
        setSelectedServices([services[0].id]);
      }
    }
  }, [selectedCategory]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;

    try {
      const url = await uploadPhoto(file, businessId, 'offer-images');
      if (url) {
        setOfferImageUrl(url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors du téléchargement de l\'image');
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        if (prev.length >= 3) return prev;
        return [...prev, serviceId];
      }
    });
  };

  const handleCreateOffer = async () => {
    if (!businessId || !business) return;

    if (activeOffersCount >= getMaxActiveOffers()) {
      alert(`Vous avez déjà ${getMaxActiveOffers()} offres actives. Attendez qu'une offre expire ou soit épuisée.`);
      return;
    }

    if (!validateCategory(selectedCategory)) {
      alert('Catégorie non valide pour le mode lancement.');
      return;
    }

    for (const serviceId of selectedServices) {
      if (!validateService(serviceId, selectedCategory)) {
        alert('Un ou plusieurs services sélectionnés ne sont pas valides.');
        return;
      }
    }

    try {
      setSaving(true);

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

      navigate('/business');
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Erreur lors de la création de l\'offre');
    } finally {
      setSaving(false);
    }
  };

  const canProceedToStep2 = selectedCategory !== '';
  const canProceedToStep3 = selectedServices.length > 0;
  const canProceedToStep4 = originalPrice > 0;

  const serviceNames = selectedServices.map(id => getServiceName(id));
  const generatedTitle = serviceNames.length > 0 ? generateOfferTitle(serviceNames, selectedTier) : '';
  const computedDiscountedPrice = originalPrice > 0 ? calculateDiscountedPrice(originalPrice, selectedTier) : 0;

  const formatPrice = (price: number) => `${price.toFixed(0)} DH`;

  if (!businessId || checkingOffers) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const maxOffers = getMaxActiveOffers();
  const isAtLimit = activeOffersCount >= maxOffers;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Créer une offre</h1>
          <p className="text-muted-foreground">
            Choisissez vos services, entrez votre prix habituel, Dealio s'occupe du reste.
          </p>
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className={`${activeOffersCount >= maxOffers ? 'text-destructive' : 'text-muted-foreground'}`}>
              Offres actives: {activeOffersCount} / {maxOffers}
            </span>
          </div>
        </div>

        {isAtLimit && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Limite atteinte</p>
              <p className="text-sm text-destructive/90 mt-1">
                Vous avez déjà {maxOffers} offres actives. Attendez qu'une offre expire ou soit épuisée avant d'en créer une nouvelle.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/business/offers')}
                className="mt-3"
              >
                Voir mes offres
              </Button>
            </div>
          </div>
        )}

        {!isAtLimit && (
          <>
        <div className="flex items-center justify-between mb-8 px-1">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s === step
                    ? 'bg-primary text-primary-foreground'
                    : s < step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    s < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                      <div className="font-semibold text-foreground">{category.name}</div>
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
                  onClick={() => navigate('/business')}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="flex-1"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
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

                <div className="max-h-96 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
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
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canProceedToStep3}
                  className="flex-1"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
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

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!canProceedToStep4}
                  className="flex-1"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
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
                    <label className="text-xs text-muted-foreground">Prix Dealio</label>
                    <p className="font-bold text-primary text-lg">{formatPrice(computedDiscountedPrice)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <label className="text-xs text-muted-foreground">Nombre de réservations possibles</label>
                  <p className="font-semibold text-foreground">{getQuotaForDiscount(selectedTier)} places</p>
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  Votre offre disparaît automatiquement quand les places sont épuisées (7 jours max).
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
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
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default CreateOfferPage;
