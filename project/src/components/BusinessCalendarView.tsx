import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIMEZONE = 'Africa/Casablanca';

export interface CalendarBooking {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_summary: string;
  start_at: string;
  end_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'noshow' | 'requested' | 'checked_in';
  staff_id?: string;
  notes?: string;
  total_price: number;
  user_id?: string | null;
  deal_id?: string | null;
}

interface BusinessCalendarViewProps {
  bookings: CalendarBooking[];
  onAddBooking: (date: Date, time: string) => void;
  onBookingClick: (booking: CalendarBooking) => void;
  loading?: boolean;
}

interface PositionedBooking extends CalendarBooking {
  top: number;
  height: number;
  column: number;
  totalColumns: number;
}

const HOUR_HEIGHT = 60;
const START_HOUR = 9;
const END_HOUR = 21;

const BusinessCalendarView: React.FC<BusinessCalendarViewProps> = ({
  bookings,
  onAddBooking,
  onBookingClick,
  loading = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');

  const daysToShow = useMemo(() => {
    if (view === 'day') {
      return [currentDate];
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }
  }, [currentDate, view]);

  const calculateBookingPosition = (booking: CalendarBooking, dayStart: Date): { top: number; height: number } | null => {
    const bookingStartUTC = parseISO(booking.start_at);

    const bookingStart = toZonedTime(bookingStartUTC, TIMEZONE);

    if (!isSameDay(bookingStart, dayStart)) {
      return null;
    }

    const startHour = bookingStart.getHours();
    const startMinute = bookingStart.getMinutes();

    if (startHour < START_HOUR || startHour >= END_HOUR) {
      return null;
    }

    const minutesFromStart = (startHour - START_HOUR) * 60 + startMinute;
    const top = (minutesFromStart / 60) * HOUR_HEIGHT;

    const height = HOUR_HEIGHT;

    return { top, height };
  };

  const detectOverlaps = (dayBookings: Array<{ booking: CalendarBooking; position: { top: number; height: number } }>): PositionedBooking[] => {
    const sortedBookings = [...dayBookings].sort((a, b) => a.position.top - b.position.top);
    const positioned: PositionedBooking[] = [];
    const columns: Array<{ end: number }> = [];

    sortedBookings.forEach(({ booking, position }) => {
      let column = 0;

      while (column < columns.length && columns[column].end > position.top) {
        column++;
      }

      if (column === columns.length) {
        columns.push({ end: position.top + position.height });
      } else {
        columns[column].end = position.top + position.height;
      }

      let totalColumns = columns.filter(col => col.end > position.top).length;

      positioned.push({
        ...booking,
        ...position,
        column,
        totalColumns: Math.max(totalColumns, column + 1)
      });
    });

    positioned.forEach(item => {
      const overlapping = positioned.filter(other =>
        other.top < item.top + item.height && other.top + other.height > item.top
      );
      const maxColumns = Math.max(...overlapping.map(o => o.totalColumns));
      overlapping.forEach(o => o.totalColumns = maxColumns);
    });

    return positioned;
  };

  const getBookingsForDay = (day: Date): PositionedBooking[] => {
    const dayBookings: Array<{ booking: CalendarBooking; position: { top: number; height: number } }> = [];

    bookings.forEach(booking => {
      const position = calculateBookingPosition(booking, day);
      if (position) {
        dayBookings.push({ booking, position });
      }
    });

    return detectOverlaps(dayBookings);
  };

  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else {
      setCurrentDate(prev => addDays(prev, -7));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'requested':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'confirmed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'checked_in':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      case 'completed':
        return 'bg-secondary text-secondary-foreground border-border';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'noshow':
        return 'bg-muted/50 text-muted-foreground border-border grayscale';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCurrentTimeIndicator = () => {
    const nowUTC = new Date();
    const now = toZonedTime(nowUTC, TIMEZONE);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour < START_HOUR || currentHour >= END_HOUR) return null;

    const minutesFromStart = (currentHour - START_HOUR) * 60 + currentMinute;
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    const percentage = (minutesFromStart / totalMinutes) * 100;

    return percentage;
  };

  const nowIndicator = getCurrentTimeIndicator();

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Controls */}
      <div className="border-b border-border bg-card">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <h2 className="text-sm font-semibold text-foreground">
              {view === 'day'
                ? format(currentDate, 'd MMM yyyy', { locale: fr })
                : format(daysToShow[0], 'd MMM', { locale: fr })
              }
            </h2>

            <div className="flex items-center space-x-1">
              <Button
                variant={view === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('day')}
                className="h-8 px-2 text-xs"
              >
                J
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('week')}
                className="h-8 px-2 text-xs"
              >
                S
              </Button>
            </div>
          </div>
          <div className="px-3 pb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="w-full"
            >
              Aujourd'hui
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
            >
              Aujourd'hui
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-foreground">
              {view === 'day'
                ? format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
                : `Semaine du ${format(daysToShow[0], 'd MMM', { locale: fr })}`
              }
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Jour
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Semaine
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className={view === 'week' ? 'min-w-[1200px]' : 'min-w-full'}>
              {/* Days Header */}
              <div className="grid sticky top-0 bg-card/80 backdrop-blur-md border-b border-border z-30 shadow-sm" style={{
                gridTemplateColumns: view === 'week'
                  ? `80px repeat(${daysToShow.length}, minmax(160px, 1fr))`
                  : `80px repeat(${daysToShow.length}, 1fr)`
              }}>
                <div className="p-4 border-r border-border w-[80px]"></div>
                {daysToShow.map((day, idx) => (
                  <div key={idx} className={`p-4 text-center border-r border-border transition-colors ${view === 'week' ? 'min-w-[160px]' : ''} ${isSameDay(day, toZonedTime(new Date(), TIMEZONE)) ? 'bg-primary/5' : ''}`}>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                    <div className={`text-2xl font-black ${isSameDay(day, toZonedTime(new Date(), TIMEZONE))
                      ? 'text-primary'
                      : 'text-foreground'
                      }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
                {/* Hour Lines */}
                {hours.map((hour, idx) => (
                  <div
                    key={hour}
                    className="grid border-b border-border absolute left-0 right-0"
                    style={{
                      gridTemplateColumns: view === 'week'
                        ? `80px repeat(${daysToShow.length}, minmax(160px, 1fr))`
                        : `80px repeat(${daysToShow.length}, 1fr)`,
                      height: `${HOUR_HEIGHT}px`,
                      top: `${idx * HOUR_HEIGHT}px`
                    }}
                  >
                    {/* Time Label */}
                    <div className="pr-2 pt-1 text-sm text-muted-foreground border-r border-border text-right flex items-start justify-end w-[80px]">
                      {`${hour.toString().padStart(2, '0')}:00`}
                    </div>

                    {/* Day Columns */}
                    {daysToShow.map((day, dayIdx) => {
                      const isToday = isSameDay(day, toZonedTime(new Date(), TIMEZONE));

                      return (
                        <div
                          key={dayIdx}
                          className={`relative border-r border-border hover:bg-accent/50 transition-colors cursor-pointer ${isToday ? 'bg-primary/5' : ''
                            }`}
                          onClick={() => {
                            onAddBooking(day, `${hour.toString().padStart(2, '0')}:00`);
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Bookings */}
                {daysToShow.map((day, dayIdx) => {
                  const dayBookings = getBookingsForDay(day);

                  return (
                    <div
                      key={`bookings-${dayIdx}`}
                      className="absolute"
                      style={{
                        left: dayIdx === 0 ? '80px' : `calc(80px + (100% - 80px) * ${dayIdx} / ${daysToShow.length})`,
                        width: `calc((100% - 80px) / ${daysToShow.length})`,
                        top: 0,
                        bottom: 0,
                        pointerEvents: 'none'
                      }}
                    >
                      {dayBookings.map(booking => (
                        <div
                          key={booking.id}
                          className={`absolute border-l-[6px] rounded-3xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:z-20 active:scale-95 transition-all duration-300 pointer-events-auto overflow-hidden border border-white/20 dark:border-white/5 backdrop-blur-md ${getStatusColor(booking.status)}`}
                          style={{
                            top: `${booking.top + 4}px`,
                            height: `${booking.height - 8}px`,
                            left: `${(booking.column / booking.totalColumns) * 100}%`,
                            width: `${(100 / booking.totalColumns) - 1}%`,
                            minHeight: '40px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookingClick(booking);
                          }}
                        >
                          <div className="p-3 h-full overflow-hidden flex flex-col justify-center">
                            <div className="text-[11px] font-black truncate leading-none mb-1.5 opacity-90 uppercase tracking-tight">
                              {format(toZonedTime(parseISO(booking.start_at), TIMEZONE), 'HH:mm')} • {booking.customer_name}
                            </div>
                            {booking.height > 60 && (
                              <div className="text-[10px] font-bold truncate leading-tight opacity-70">
                                {booking.service_summary}
                              </div>
                            )}
                            {(booking.status === 'pending' || booking.status === 'requested') && booking.height > 80 && (
                              <div className="mt-2 text-[8px] font-black bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-full w-fit uppercase tracking-tighter shadow-sm border border-white/10">
                                À confirmer
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Current Time Indicator */}
                {nowIndicator !== null && daysToShow.some(day => isSameDay(day, toZonedTime(new Date(), TIMEZONE))) && (
                  <div
                    className="absolute left-0 right-0 border-t-2 border-red-500 pointer-events-none z-20"
                    style={{ top: `${(nowIndicator / 100) * hours.length * HOUR_HEIGHT}px` }}
                  >
                    <div className="absolute left-20 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCalendarView;
