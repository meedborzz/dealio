import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Flag, Reply, Send, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Review {
  id: string;
  booking_id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  business_reply?: string;
  business_reply_at?: string;
  is_reported?: boolean;
  report_reason?: string;
  booking?: {
    customer_name: string;
    deal?: {
      title: string;
    };
  };
}

const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const { businessId } = useBusinessContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (businessId) {
      fetchReviews();
    }
  }, [businessId]);

  const fetchReviews = async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          business_id,
          user_id,
          rating,
          comment,
          created_at,
          business_reply,
          business_reply_at,
          is_reported,
          report_reason,
          booking:bookings!reviews_booking_id_fkey(
            customer_name,
            deal:deals!bookings_deal_id_fkey(title)
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyToReview = async () => {
    if (!selectedReview || !replyText.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('reviews')
        .update({
          business_reply: replyText.trim(),
          business_reply_at: new Date().toISOString()
        })
        .eq('id', selectedReview.id);

      if (error) throw error;
      
      setShowReplyDialog(false);
      setReplyText('');
      setSelectedReview(null);
      fetchReviews();
      
      // Show success message
      alert('Réponse publiée avec succès!');
    } catch (error) {
      console.error('Error replying to review:', error);
      alert('Erreur lors de la publication de la réponse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportReview = async () => {
    if (!selectedReview || !reportReason.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('reviews')
        .update({
          is_reported: true,
          report_reason: reportReason.trim()
        })
        .eq('id', selectedReview.id);

      if (error) throw error;
      
      setShowReportDialog(false);
      setReportReason('');
      setSelectedReview(null);
      fetchReviews();
      
      // Show success message
      alert('Avis signalé avec succès. Notre équipe va examiner le contenu.');
    } catch (error) {
      console.error('Error reporting review:', error);
      alert('Erreur lors du signalement');
    } finally {
      setSubmitting(false);
    }
  };

  const openReplyDialog = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.business_reply || '');
    setShowReplyDialog(true);
  };

  const openReportDialog = (review: Review) => {
    setSelectedReview(review);
    setReportReason('');
    setShowReportDialog(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">Reviews from completed bookings will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {review.booking?.customer_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {review.booking?.customer_name || 'Client anonyme'}
                        </h4>
                        {review.booking?.deal?.title && (
                          <p className="text-sm text-muted-foreground">
                            Service: {review.booking.deal.title}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium text-foreground">
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <div className="bg-muted rounded-lg p-4 mb-3">
                        <p className="text-foreground leading-relaxed">{review.comment}</p>
                      </div>
                    )}
                    
                    {/* Business Reply */}
                    {review.business_reply && (
                      <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            Réponse du salon
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.business_reply_at!), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">{review.business_reply}</p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReplyDialog(review)}
                        className="flex-1"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        {review.business_reply ? 'Modifier réponse' : 'Répondre'}
                      </Button>
                      
                      {!review.is_reported && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReportDialog(review)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Signaler
                        </Button>
                      )}
                      
                      {review.is_reported && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Signalé
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedReview?.business_reply ? 'Modifier votre réponse' : 'Répondre à l\'avis'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              {/* Original Review */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm font-medium">
                    {selectedReview.booking?.customer_name || 'Client anonyme'}
                  </span>
                </div>
                {selectedReview.comment && (
                  <p className="text-muted-foreground text-sm">{selectedReview.comment}</p>
                )}
              </div>
              
              {/* Reply Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Votre réponse
                </label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Répondez de manière professionnelle et courtoise..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {replyText.length}/500 caractères
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReplyDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleReplyToReview}
                  disabled={!replyText.trim() || submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Publication...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Publier la réponse
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <Flag className="h-5 w-5 mr-2" />
              Signaler cet avis
            </DialogTitle>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              {/* Review to Report */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm font-medium">
                    {selectedReview.booking?.customer_name || 'Client anonyme'}
                  </span>
                </div>
                {selectedReview.comment && (
                  <p className="text-muted-foreground text-sm">{selectedReview.comment}</p>
                )}
              </div>
              
              {/* Report Reason */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Raison du signalement
                </label>
                <div className="space-y-2 mb-3">
                  {[
                    'Contenu inapproprié',
                    'Langage offensant',
                    'Faux avis',
                    'Spam',
                    'Autre'
                  ].map((reason) => (
                    <label key={reason} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="h-4 w-4 text-destructive focus:ring-destructive"
                      />
                      <span className="text-sm">{reason}</span>
                    </label>
                  ))}
                </div>
                
                {reportReason === 'Autre' && (
                  <Textarea
                    placeholder="Décrivez le problème..."
                    rows={3}
                    onChange={(e) => setReportReason(`Autre: ${e.target.value}`)}
                  />
                )}
              </div>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div className="text-sm text-destructive">
                    <p className="font-medium mb-1">Attention</p>
                    <p>Le signalement sera examiné par notre équipe. Les signalements abusifs peuvent entraîner des sanctions.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReportDialog(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleReportReview}
                  disabled={!reportReason.trim() || submitting}
                  variant="destructive"
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Signalement...
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4 mr-2" />
                      Signaler
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsPage;