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
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {availableSlots.map((slot) => {
              const isFull = !slot.is_available || slot.available_spots <= 0;
              const isSelected = selectedTimeSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  onClick={() => { if (!isFull) onSelectSlot(slot); }}
                  disabled={isFull}
                  className={`flex flex-col items-center justify-center h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 font-bold transition-all duration-300 ${isSelected
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.03]'
                    : isFull
                      ? 'bg-muted/10 border-border/30 opacity-40 cursor-not-allowed'
                      : 'bg-card border-border/50 hover:border-primary/30 text-foreground'
                    }`}
                >
                  <span className="text-[13px] sm:text-[15px]">{slot.start_time?.slice(0, 5) || 'N/A'}</span>
                  {isFull && (
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider mt-0.5 opacity-80 truncate px-1 max-w-full">
                      {!slot.is_available ? 'Indisponible' : 'Complet'}
                    </span>
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
