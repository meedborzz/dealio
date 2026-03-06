import React from 'react';
import { Calendar } from 'lucide-react';

interface DateOption {
  date: string;
  display: string;
  isToday: boolean;
}

interface BookingDateSectionProps {
  availableDates: DateOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const BookingDateSection: React.FC<BookingDateSectionProps> = ({
  availableDates,
  selectedDate,
  onSelectDate,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-[17px] font-black tracking-tight text-foreground uppercase">
          Choisir une date
        </h3>
      </div>
      <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-hide">
        {availableDates.map((dateOption) => {
          const isSelected = selectedDate === dateOption.date;
          return (
            <button
              key={dateOption.date}
              onClick={() => onSelectDate(dateOption.date)}
              className={`flex flex-col items-center justify-center min-w-[76px] sm:min-w-[80px] h-[86px] sm:h-[90px] rounded-[1.75rem] sm:rounded-[2rem] border-2 transition-all duration-300 ${isSelected
                ? 'bg-primary border-primary shadow-lg shadow-primary/30 scale-[1.03]'
                : 'bg-card border-border/50 hover:border-primary/30'
                } ${dateOption.isToday && !isSelected ? 'ring-2 ring-primary/20 ring-offset-1' : ''}`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {dateOption.display.split(' ')[0]}
              </span>
              <span className={`text-xl font-black tracking-tighter ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {dateOption.display.split(' ')[1]}
              </span>
              <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {dateOption.display.split(' ')[2]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(BookingDateSection);
