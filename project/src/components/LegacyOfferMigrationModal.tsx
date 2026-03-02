import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '../lib/supabase';
import { Deal } from '../types';
import { DISCOUNT_TIERS, getQuotaForDiscount, calculateDiscountedPrice, type DiscountTier } from '../config/offerQuota';

interface LegacyOfferMigrationModalProps {
  offer: Deal;
  isOpen: boolean;
  onClose: () => void;
  onMigrated: () => void;
}

const LegacyOfferMigrationModal: React.FC<LegacyOfferMigrationModalProps> = ({
  offer,
  isOpen,
  onClose,
  onMigrated,
}) => {
  const [selectedTier, setSelectedTier] = useState<DiscountTier | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const formatPrice = (price: number) => `${price.toFixed(0)} DH`;

  const getRecommendedTier = (): DiscountTier => {
    const discount = offer.legacy_original_discount || offer.discount_percentage;
    if (discount < 15) return 10;
    if (discount < 25) return 20;
    return 30;
  };

  const getMigrationPreview = (tier: DiscountTier) => {
    const newPrice = calculateDiscountedPrice(offer.original_price, tier);
    const newQuota = getQuotaForDiscount(tier);
    return { newPrice, newQuota };
  };

  const handleMigrate = async () => {
    if (!selectedTier) return;

    try {
      setMigrating(true);

      const { data, error } = await supabase.rpc('migrate_legacy_offer_to_tier', {
        p_deal_id: offer.id,
        p_new_tier: selectedTier,
      });

      if (error) throw error;

      if (data && !data.success) {
        alert(data.error || 'Erreur lors de la migration');
        return;
      }

      onMigrated();
      onClose();
    } catch (error) {
      console.error('Error migrating offer:', error);
      alert('Erreur lors de la migration de l\'offre');
    } finally {
      setMigrating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette offre ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeactivating(true);

      const { error } = await supabase
        .from('deals')
        .update({
          is_active: false,
          booking_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', offer.id);

      if (error) throw error;

      onMigrated();
      onClose();
    } catch (error) {
      console.error('Error deactivating offer:', error);
      alert('Erreur lors de la désactivation de l\'offre');
    } finally {
      setDeactivating(false);
    }
  };

  const recommendedTier = getRecommendedTier();
  const originalDiscount = offer.legacy_original_discount || offer.discount_percentage;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Migration d'offre requise
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-2">Offre non-conforme détectée</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Cette offre utilise une réduction de <strong>{originalDiscount}%</strong>, qui n'est plus supportée.
                  Notre nouveau système utilise uniquement 3 niveaux de réduction standardisés.
                </p>
                <p className="text-sm text-muted-foreground">
                  Veuillez migrer cette offre vers un des niveaux standards ou la désactiver.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">Offre actuelle</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Titre:</span>
                <span className="font-medium text-foreground">{offer.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prix original:</span>
                <span className="font-medium text-foreground">{formatPrice(offer.original_price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Réduction actuelle:</span>
                <Badge variant="destructive">{originalDiscount}%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prix actuel:</span>
                <span className="font-medium text-foreground">{formatPrice(offer.discounted_price)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">Choisir un niveau de réduction</h3>
            <div className="grid grid-cols-3 gap-3">
              {DISCOUNT_TIERS.map((tier) => {
                const preview = getMigrationPreview(tier);
                const isRecommended = tier === recommendedTier;
                const isSelected = selectedTier === tier;

                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <Badge variant="default" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Recommandé
                        </Badge>
                      </div>
                    )}
                    <div className="text-2xl font-bold text-foreground">{tier}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getQuotaForDiscount(tier)} places
                    </div>
                    <div className="mt-2 pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">Nouveau prix</div>
                      <div className="font-bold text-sm text-foreground">
                        {formatPrice(preview.newPrice)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTier && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <ArrowRight className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-foreground">Résumé de la migration</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Réduction:</span>
                  <span>
                    <span className="line-through text-muted-foreground">{originalDiscount}%</span>
                    {' → '}
                    <span className="font-semibold text-foreground">{selectedTier}%</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Prix après réduction:</span>
                  <span>
                    <span className="line-through text-muted-foreground">{formatPrice(offer.discounted_price)}</span>
                    {' → '}
                    <span className="font-semibold text-foreground">
                      {formatPrice(getMigrationPreview(selectedTier).newPrice)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quota de réservations:</span>
                  <span className="font-semibold text-foreground">
                    {getMigrationPreview(selectedTier).newQuota} places
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={migrating || deactivating}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeactivate}
              disabled={migrating || deactivating}
            >
              {deactivating ? 'Désactivation...' : 'Désactiver l\'offre'}
            </Button>
            <Button
              type="button"
              onClick={handleMigrate}
              disabled={!selectedTier || migrating || deactivating}
              className="flex-1"
            >
              {migrating ? 'Migration...' : 'Migrer l\'offre'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LegacyOfferMigrationModal;
