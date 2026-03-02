import React from 'react';
import { MapPin, Clock, Calendar, Store } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from './ui/card';
import { Deal, TimeSlot } from '../shared/types/contracts';

interface BookingSummaryPanelProps {
  deal: Deal;
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot | null;
  businessName?: string;
  businessAddress?: string;
}

export const BookingSummaryPanel: React.FC<BookingSummaryPanelProps> = ({
  deal,
  selectedDate,
  selectedTimeSlot,
  businessName,
  businessAddress,
}) => {
  return (
    <Card className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {deal.image_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={deal.image_url}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{deal.title}</h3>

            {businessName && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Store className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{businessName}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              {selectedDate && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(parseISO(selectedDate), 'EEE d MMM', { locale: fr })}</span>
                </div>
              )}

              {selectedTimeSlot && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{selectedTimeSlot.start_time?.slice(0, 5)}</span>
                </div>
              )}

              {deal.duration_minutes && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {deal.duration_minutes} min
                </span>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-primary">
              {deal.discounted_price} DH
            </div>
            {deal.original_price > deal.discounted_price && (
              <div className="text-xs text-muted-foreground line-through">
                {deal.original_price} DH
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSummaryPanel;
