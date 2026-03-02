import React from 'react';
import { Clock } from 'lucide-react';
import { TimeSlot } from '../../shared/types/contracts';

interface BookingHourSectionProps {
  slotsLoading: boolean;
  availableSlots: TimeSlot[];
  businessClosed: boolean;
  selectedTimeSlotId: string | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

const BookingHourSection = React.forwardRef<HTMLDivElement, BookingHourSectionProps>(
  ({ slotsLoading, availableSlots, businessClosed, selectedTimeSlotId, onSelectSlot }, ref) => {
    return (
      <div ref={ref}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Choisir un horaire
        </h3>

        {slotsLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="py-2.5 px-2 rounded-xl bg-muted animate-pulse h-10"
              />
            ))}
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-6 bg-muted/50 rounded-xl">
            {businessClosed ? (
              <>
                <p className="text-muted-foreground text-sm mb-1">Le salon est ferme ce jour-la</p>
                <p className="text-xs text-muted-foreground">Selectionnez une autre date</p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun créneau disponible pour cette date</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {availableSlots.map((slot) => {
              const isFull = !slot.is_available || slot.available_spots <= 0;
              const isSelected = selectedTimeSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  onClick={() => { if (!isFull) onSelectSlot(slot); }}
                  disabled={isFull}
                  className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all ${isSelected
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : isFull
                      ? 'bg-muted/30 text-muted-foreground/50 cursor-not-allowed'
                      : 'bg-card border border-border text-foreground hover:border-primary/40'
                    }`}
                >
                  {slot.start_time?.slice(0, 5) || 'N/A'}
                  {isFull && (
                    <div className="text-[10px] mt-0.5">
                      {!slot.is_available ? 'Indisponible' : 'Complet'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

BookingHourSection.displayName = 'BookingHourSection';

export default React.memo(BookingHourSection);
