import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface SatisfactionRatingProps {
  bookingId: string;
  dealId: string;
  businessId: string;
  userId?: string;
  guestBookingToken?: string;
  onRated?: () => void;
}

export const SatisfactionRating: React.FC<SatisfactionRatingProps> = ({
  bookingId,
  dealId,
  businessId,
  userId,
  guestBookingToken,
  onRated
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRating = async (rating: 1 | -1) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackData: any = {
        booking_id: bookingId,
        deal_id: dealId,
        business_id: businessId,
        rating,
      };

      if (userId) {
        feedbackData.user_id = userId;
      }

      if (guestBookingToken) {
        feedbackData.guest_booking_token = guestBookingToken;
      }

      const { error: insertError } = await supabase
        .from('booking_feedback')
        .insert(feedbackData);

      if (insertError) {
        console.error('Error submitting feedback:', insertError);
        if (insertError.code === '23505') {
          setError('Vous avez déjà évalué cette réservation');
        } else {
          setError(`Erreur: ${insertError.message || insertError.details || JSON.stringify(insertError)}`);
        }
        return;
      }

      setHasRated(true);
      if (onRated) {
        onRated();
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Erreur lors de l\'envoi de votre évaluation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasRated) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Merci pour votre avis!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Votre feedback aide à améliorer nos services
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="space-y-3">
          <p className="font-medium text-foreground text-center">
            Votre expérience?
          </p>

          {error && (
            <div className="text-sm text-destructive text-center bg-destructive/10 rounded-lg p-2">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => handleRating(1)}
              disabled={isSubmitting}
              className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <ThumbsUp className="h-5 w-5 mr-2" />
              Satisfait
            </Button>
            <Button
              onClick={() => handleRating(-1)}
              disabled={isSubmitting}
              className="flex-1 h-14 bg-gray-600 hover:bg-gray-700 text-white"
              size="lg"
              variant="secondary"
            >
              <ThumbsDown className="h-5 w-5 mr-2" />
              Pas satisfait
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Votre avis compte pour nous
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
