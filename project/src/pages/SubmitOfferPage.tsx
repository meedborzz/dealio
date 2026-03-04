import React, { useState } from 'react';
import { Upload, MapPin, Calendar, DollarSign, Tag, Building2, CheckCircle, AlertCircle, Scissors, Sparkles, Waves, Eye } from 'lucide-react';
import { getAvailableCategories } from '../config/servicePresets';
import { getAvailableCities } from '../config/location';

// Derive categories and cities from real config
const CATEGORY_ICONS: Record<string, any> = {
  'Coiffure': Scissors,
  'Soins du Visage': Sparkles,
  'Onglerie': Sparkles,
  'Spa & Corps': Waves,
  'Esthetique & Regard': Eye,
  'Maquillage': Sparkles,
  'Bien-être & Minceur': Sparkles,
  'Forfaits Spéciaux': Tag,
};
const categories = getAvailableCategories().map(c => ({ id: c.id, name: c.name, icon: CATEGORY_ICONS[c.id] || Tag }));
const cities = getAvailableCities().map(c => c.name);

import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DISCOUNT_TIERS, getQuotaForDiscount, calculateDiscountedPrice, getOfferExpiryDate, type DiscountTier } from '../config/offerQuota';

const SubmitOfferPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<DiscountTier>(10);
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    city: '',
    address: '',
    offerTitle: '',
    description: '',
    originalPrice: '',
    phone: '',
    email: '',
    website: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Check if business already exists by email
      const { data: existingBusiness, error: businessCheckError } = await supabase
        .from('businesses')
        .select('id')
        .eq('email', formData.email)
        .single();

      let businessId: string;

      if (businessCheckError && businessCheckError.code === 'PGRST116') {
        // Business doesn't exist, create new one
        const { data: newBusiness, error: createBusinessError } = await supabase
          .from('businesses')
          .insert({
            name: formData.businessName,
            address: formData.address,
            city: formData.city,
            phone: formData.phone,
            email: formData.email,
            website: formData.website || null,
            category: formData.category,
            owner_id: user?.id || null,
            status: 'pending',
            rating: 0,
            review_count: 0
          })
          .select('id')
          .single();

        if (createBusinessError) throw createBusinessError;
        businessId = newBusiness.id;
      } else if (businessCheckError) {
        throw businessCheckError;
      } else {
        businessId = existingBusiness.id;
      }

      // Handle image upload if provided
      let imageUrl = null;
      if (imagePreview) {
        try {
          // Convert base64 to blob
          const response = await fetch(imagePreview);
          const blob = await response.blob();

          // Generate unique filename
          const fileName = `deal_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('deal-images')
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.warn('Image upload failed, continuing without image:', uploadError);
          } else {
            const { data: urlData } = supabase.storage
              .from('deal-images')
              .getPublicUrl(uploadData.path);
            imageUrl = urlData.publicUrl;
          }
        } catch (imageError) {
          console.warn('Image processing failed, continuing without image:', imageError);
        }
      }

      // Create the deal
      const discountedPrice = calculateDiscountedPrice(parseFloat(formData.originalPrice), selectedTier);
      const expiryDate = getOfferExpiryDate();
      const quota = getQuotaForDiscount(selectedTier);

      const { error: dealError } = await supabase
        .from('deals')
        .insert({
          business_id: businessId,
          title: formData.offerTitle,
          description: formData.description,
          image_url: imageUrl,
          original_price: parseFloat(formData.originalPrice),
          discounted_price: discountedPrice,
          discount_percentage: selectedTier,
          duration_minutes: 60,
          valid_until: expiryDate,
          is_active: false,
          booking_enabled: true,
          max_bookings_per_slot: 1,
          category: formData.category,
          booking_quota_total: quota,
          booking_quota_remaining: quota,
          quota_enabled: true,
          expires_at: new Date(new Date(expiryDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (dealError) throw dealError;

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting offer:', error);
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success state
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-[#c8a2c9]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-[#c8a2c9]" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Offre soumise avec succès!</h2>
            <p className="text-muted-foreground mb-6">
              Votre offre sera examinée par notre équipe dans les 24-48h. Vous recevrez un email de confirmation une fois approuvée.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                Retour à l'accueil
              </Button>
              <Button onClick={() => navigate('/register')} variant="outline" className="w-full">
                Créer un compte business
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const computedDiscountedPrice = formData.originalPrice
    ? calculateDiscountedPrice(parseFloat(formData.originalPrice), selectedTier)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Proposer une offre</h1>
          <p className="text-lg text-gray-600">
            Partagez vos services avec notre communauté de clients
          </p>
        </div>

        {/* Error Message */}
        {submitError && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{submitError}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Business Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-teal-600" />
                  Informations sur votre établissement
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'établissement *
                    </label>
                    <Input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      required
                      placeholder="Salon de beauté Chic & Style"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    >
                      <option value="">Sélectionnez une ville</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse complète *
                    </label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="123 Rue Mohammed V, Casablanca"
                    />
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-teal-600" />
                  Détails de l'offre
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'offre *
                    </label>
                    <Input
                      type="text"
                      name="offerTitle"
                      value={formData.offerTitle}
                      onChange={handleInputChange}
                      required
                      placeholder="Coupe + Brushing Femme"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description de l'offre *
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Décrivez votre offre en détail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix original (DH) *
                    </label>
                    <Input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Réduction *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {DISCOUNT_TIERS.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setSelectedTier(tier)}
                          className={`p-4 rounded-xl border-2 transition-all ${selectedTier === tier
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                            }`}
                        >
                          <div className="text-2xl font-bold text-gray-900">{tier}%</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {getQuotaForDiscount(tier)} places
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.originalPrice && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Prix après réduction:</span>
                        <span className="font-bold text-lg text-gray-900">{computedDiscountedPrice} DH</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/50 border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      L'offre expire automatiquement après 7 jours ou quand les places sont épuisées.
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-teal-600" />
                  Image de l'offre
                </h2>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#c8a2c9] transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="max-w-full h-48 object-cover rounded-lg mx-auto mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Ajoutez une image attrayante de votre offre</p>
                      <p className="text-sm text-gray-500">PNG, JPG jusqu'à 10MB</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="mt-4 bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 cursor-pointer inline-block"
                  >
                    Choisir une image
                  </label>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Informations de contact
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+212 6 XX XX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="contact@monsalon.com"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                    J'accepte les <a href="#" className="text-[#c8a2c9] hover:underline dark:text-[#d6aad7]">conditions d'utilisation</a> et
                    confirme que les informations fournies sont exactes. Mon offre sera examinée par l'équipe Dealio
                    avant publication.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    'Soumettre l\'offre'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitOfferPage;