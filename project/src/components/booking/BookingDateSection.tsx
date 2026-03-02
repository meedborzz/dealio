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
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        Choisir une date
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {availableDates.map((dateOption) => (
          <button
            key={dateOption.date}
            onClick={() => onSelectDate(dateOption.date)}
            className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedDate === dateOption.date
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-foreground hover:border-primary/40'
            } ${dateOption.isToday ? 'ring-1 ring-primary/20' : ''}`}
          >
            <div className="text-xs opacity-75">{dateOption.display.split(' ')[0]}</div>
            <div className="font-semibold">{dateOption.display.split(' ')[1]} {dateOption.display.split(' ')[2]}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(BookingDateSection);
