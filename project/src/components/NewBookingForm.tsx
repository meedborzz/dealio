import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Deal, TimeSlot, WorkingHours, SpecialDate } from '../types';
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateTimeSlotsForDay } from '../utils/timeSlotGenerator';

interface NewBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  onBookingCreated: () => void;
}

const NewBookingForm: React.FC<NewBookingFormProps> = ({
  isOpen,
  onClose,
  businessId,
  onBookingCreated
}) => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessWorkingHours, setBusinessWorkingHours] = useState<WorkingHours | null>(null);
  const [businessSpecialDates, setBusinessSpecialDates] = useState<Record<string, SpecialDate>>({});

  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      display: format(date, 'EEE d MMM', { locale: fr }),
      isToday: i === 0
    };
  });

  useEffect(() => {
    if (isOpen && businessId) {
      fetchBusinessInfo();
      fetchDeals();
    }
  }, [isOpen, businessId]);

  useEffect(() => {
    if (selectedDeal && selectedDate) {
      fetchTimeSlots();
    }
  }, [selectedDeal, selectedDate, businessWorkingHours]);

  const fetchBusinessInfo = async () => {
    try {
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('working_hours, special_dates')
        .eq('id', businessId)
        .single();

      if (businessError) throw businessError;

      if (business) {
        setBusinessWorkingHours(business.working_hours as WorkingHours || null);
        setBusinessSpecialDates(business.special_dates as Record<string, SpecialDate> || {});
      }
    } catch (error) {
      console.error('Error fetching business info:', error);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('title');

      if (dealsError) throw dealsError;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setError('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedDeal || !selectedDate) return;

    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('deal_id', selectedDeal.id)
        .eq('date', selectedDate)
        .order('start_time');

      if (error) throw error;

      if (!data || data.length === 0) {
        const workingHours = businessWorkingHours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: true }
        };

        const generatedSlots = generateTimeSlotsForDay({
          date: selectedDate,
          workingHours,
          serviceDuration: selectedDeal.duration_minutes || 60,
          maxBookingsPerSlot: selectedDeal.max_bookings_per_slot || 1,
          specialDates: businessSpecialDates
        });

        if (generatedSlots.length === 0) {
          setAvailableSlots([]);
          return;
        }

        const slotsToInsert = generatedSlots.map(slot => ({
          deal_id: selectedDeal.id,
          date: selectedDate,
          start_time: slot.start_time,
          end_time: slot.end_time,
          available_spots: slot.available_spots,
          is_available: slot.is_available
        }));

        const { data: insertedSlots, error: insertError } = await supabase
          .from('time_slots')
          .insert(slotsToInsert)
          .select('*')
          .order('start_time');

        if (insertError) {
          console.error('Error generating time slots:', insertError);
          setAvailableSlots([]);
        } else {
          setAvailableSlots(insertedSlots || []);
        }
      } else {
        setAvailableSlots(data);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDeal || !selectedTimeSlot || !customerData.name.trim() || !customerData.phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          deal_id: selectedDeal.id,
          time_slot_id: selectedTimeSlot.id,
          user_id: null, // POS booking, no user account
          customer_name: customerData.name.trim(),
          customer_phone: customerData.phone.trim(),
          customer_email: customerData.email.trim() || null,
          notes: customerData.notes.trim() || null,
          booking_date: new Date(`${selectedDate}T${selectedTimeSlot.start_time}`).toISOString(),
          total_price: selectedDeal.discounted_price,
          status: 'confirmed' // POS bookings are automatically confirmed
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update available spots
      const { error: updateError } = await supabase
        .from('time_slots')
        .update({
          available_spots: selectedTimeSlot.available_spots - 1,
          is_available: selectedTimeSlot.available_spots - 1 > 0
        })
        .eq('id', selectedTimeSlot.id);

      if (updateError) throw updateError;

      await fetchTimeSlots();

      setSuccess(true);
      onBookingCreated();
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Erreur lors de la création de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDeal(null);
    setSelectedDate('');
    setSelectedTimeSlot(null);
    setCustomerData({ name: '', phone: '', email: '', notes: '' });
    setError(null);
    setSuccess(false);
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#c8a2c9]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-[#c8a2c9]" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Réservation créée!
            </h3>
            <p className="text-muted-foreground mb-6">
              La réservation pour {customerData.name} a été créée avec succès.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  resetForm();
                  onClose();
                }} 
                className="w-full"
              >
                Nouvelle réservation
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                Fermer
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
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Nouvelle Réservation (POS)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sélectionner le service</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground text-sm">Chargement des services...</p>
                </div>
              ) : deals.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun service actif disponible
                </p>
              ) : (
                <Select value={selectedDeal?.id || ''} onValueChange={(value) => {
                  const deal = deals.find(d => d.id === value);
                  setSelectedDeal(deal || null);
                  setSelectedTimeSlot(null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un service" />
                  </SelectTrigger>
                  <SelectContent>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{deal.title}</span>
                          <span className="text-primary font-medium">{deal.discounted_price} DH</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Date Selection */}
          {selectedDeal && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Choisir la date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                  {availableDates.map((dateOption) => (
                    <Button
                      key={dateOption.date}
                      type="button"
                      variant={selectedDate === dateOption.date ? "default" : "outline"}
                      onClick={() => {
                        setSelectedDate(dateOption.date);
                        setSelectedTimeSlot(null);
                      }}
                      className="h-auto p-2 flex-col text-xs"
                    >
                      {dateOption.display}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Selection */}
          {selectedDate && selectedDeal && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Choisir l'heure</CardTitle>
              </CardHeader>
              <CardContent>
                {availableSlots.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucun créneau disponible pour cette date
                  </p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => {
                      const isFull = !slot.is_available || slot.available_spots <= 0;
                      const isSelected = selectedTimeSlot?.id === slot.id;

                      return (
                        <Button
                          key={slot.id}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => !isFull && setSelectedTimeSlot(slot)}
                          disabled={isFull}
                          className={`text-sm h-12 flex-col justify-center ${
                            isFull ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <div>{slot.start_time?.slice(0, 5)}</div>
                          {isFull && (
                            <div className="text-xs text-muted-foreground mt-1">Complet</div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customer Info */}
          {selectedTimeSlot && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom complet *
                  </label>
                  <Input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nom du client"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Téléphone *
                    </label>
                    <Input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+212 6XX XXX XXX"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email (optionnel)
                    </label>
                    <Input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes (optionnel)
                  </label>
                  <Textarea
                    value={customerData.notes}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Demandes spéciales..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Summary */}
          {selectedDeal && selectedTimeSlot && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{selectedDeal.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {format(parseISO(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Heure:</span>
                    <span className="font-medium">{selectedTimeSlot.start_time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée:</span>
                    <span className="font-medium">{selectedDeal.duration_minutes} minutes</span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{selectedDeal.discounted_price} DH</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-start space-x-2">
                <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedDeal || !selectedTimeSlot || !customerData.name.trim() || !customerData.phone.trim()}
              className="flex-1 bg-gradient-to-r from-[#c8a2c9] to-[#b892b9] hover:from-[#b892b9] hover:to-[#a67ba8] text-white"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Création...
                </>
              ) : (
                'Créer la réservation'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingForm;