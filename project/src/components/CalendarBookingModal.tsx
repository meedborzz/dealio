import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, Phone, MessageSquare, Check, Ban, User, Receipt } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarBooking } from './BusinessCalendarView';
import BookingReceipt from './BookingReceipt';
import { useToast } from '@/components/ui/toast';

interface CalendarBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: CalendarBooking | null;
  selectedDate?: Date;
  selectedTime?: string;
  deals: Array<{ id: string; title: string; duration_minutes: number; discounted_price: number }>;
  businessInfo?: { name: string; address?: string; phone?: string; email?: string };
  onSave: (bookingData: any) => Promise<void>;
  onConfirm?: (bookingId: string) => Promise<void>;
  onCancel?: (bookingId: string, reason?: string) => Promise<void>;
  onComplete?: (bookingId: string) => Promise<void>;
}

const CalendarBookingModal: React.FC<CalendarBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  selectedDate,
  selectedTime,
  deals,
  businessInfo = { name: 'Dealio', address: '', phone: '', email: '' },
  onSave,
  onConfirm,
  onCancel,
  onComplete
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    deal_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    notes: '',
    date: '',
    time: ''
  });
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      const bookingDate = new Date(booking.start_at);
      setFormData({
        deal_id: '',
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_email: '',
        notes: booking.notes || '',
        date: format(bookingDate, 'yyyy-MM-dd'),
        time: format(bookingDate, 'HH:mm')
      });
    } else if (selectedDate && selectedTime) {
      setFormData({
        deal_id: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        notes: '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime
      });
    }
  }, [booking, selectedDate, selectedTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedDeal = deals.find(d => d.id === formData.deal_id);
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 60);

      await onSave({
        deal_id: formData.deal_id,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        notes: formData.notes,
        start_at: startDateTime.toISOString(),
        end_at: endDateTime.toISOString(),
        booking_date: startDateTime.toISOString(),
        total_price: selectedDeal?.discounted_price || 0,
        status: 'confirmed'
      });

      onClose();
    } catch (error) {
      console.error('Error saving booking:', error);
      showToast('Erreur lors de la sauvegarde de la réservation', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!booking || !onConfirm) return;
    setIsSubmitting(true);
    try {
      await onConfirm(booking.id);
      onClose();
    } catch {
      // error toast already shown by parent handler
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !onCancel) return;
    setIsSubmitting(true);
    try {
      await onCancel(booking.id, cancelReason);
      setShowCancelDialog(false);
      onClose();
    } catch {
      // error toast already shown by parent handler
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteBooking = async () => {
    if (!booking || !onComplete) return;
    setIsSubmitting(true);
    try {
      await onComplete(booking.id);
      onClose();
    } catch {
      // error toast already shown by parent handler
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactWhatsApp = () => {
    if (booking) {
      const phone = booking.customer_phone.replace(/\s/g, '');
      const message = encodeURIComponent(`Bonjour ${booking.customer_name}, concernant votre réservation du ${format(new Date(booking.start_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}`);
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

  const handleCall = () => {
    if (booking) {
      window.location.href = `tel:${booking.customer_phone}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      pending: { label: 'En attente', variant: 'secondary' },
      confirmed: { label: 'Confirmé', variant: 'default' },
      completed: { label: 'Terminé', variant: 'default' },
      cancelled: { label: 'Annulé', variant: 'destructive' },
      noshow: { label: 'Absent', variant: 'destructive' }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (showCancelDialog && booking) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la réservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir annuler la réservation de <strong>{booking.customer_name}</strong> ?
            </p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Raison (optionnel)
              </label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Client a demandé l'annulation"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Retour
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Annulation...' : 'Confirmer l\'annulation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? 'Détails de la réservation' : 'Nouvelle réservation'}
          </DialogTitle>
        </DialogHeader>

        {booking ? (
          <div className="space-y-4">
            {showReceipt ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowReceipt(false)}
                  className="mb-4"
                >
                  Retour aux détails
                </Button>
                <BookingReceipt
                  booking={booking}
                  business={businessInfo}
                  receiptNumber={booking.id.slice(0, 8).toUpperCase()}
                />
              </>
            ) : (
              <>
            {/* Booking Info */}
            <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-4 space-y-3 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {booking.customer_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.start_at), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(booking.start_at), 'HH:mm')} - {format(new Date(booking.end_at), 'HH:mm')}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Service: </span>
                  <span className="font-medium text-foreground">{booking.service_summary}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Téléphone: </span>
                  <span className="font-medium text-foreground">{booking.customer_phone}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Prix: </span>
                  <span className="font-medium text-foreground">{booking.total_price} DH</span>
                </div>
                {booking.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notes: </span>
                    <span className="text-foreground">{booking.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleCall}
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
              <Button
                variant="outline"
                onClick={handleContactWhatsApp}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReceipt(true)}
                className="w-full"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Reçu
              </Button>
            </div>

            {/* Status Actions */}
            <div className="space-y-3">
              {booking.status === 'pending' && (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCompleteBooking}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marquer comme terminé
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Heure *
                </label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Service *
              </label>
              <select
                value={formData.deal_id}
                onChange={(e) => setFormData({ ...formData, deal_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="">Sélectionner un service</option>
                {deals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title} - {deal.discounted_price} DH
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom du client *
              </label>
              <Input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
                placeholder="Nom complet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Téléphone *
              </label>
              <Input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                required
                placeholder="+212 6XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email (optionnel)
              </label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (optionnel)
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Préférences, demandes spéciales..."
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Créer la réservation'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CalendarBookingModal;
