import { WorkingHours, DayHours, SpecialDate } from '../types';
import { format, getDay } from 'date-fns';

interface TimeSlotParams {
  date: string;
  workingHours: WorkingHours;
  serviceDuration: number;
  maxBookingsPerSlot: number;
  specialDates?: Record<string, SpecialDate>;
}

interface GeneratedSlot {
  start_time: string;
  end_time: string;
  available_spots: number;
  is_available: boolean;
}

const DAY_NAMES: Array<keyof WorkingHours> = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function generateTimeSlotsForDay(params: TimeSlotParams): GeneratedSlot[] {
  const { date, workingHours, serviceDuration, maxBookingsPerSlot, specialDates } = params;

  if (specialDates && specialDates[date]) {
    const specialDate = specialDates[date];

    if (specialDate.closed) {
      return [];
    }

    if (specialDate.open && specialDate.close) {
      return generateSlotsForHours(
        specialDate.open,
        specialDate.close,
        serviceDuration,
        maxBookingsPerSlot
      );
    }
  }

  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = getDay(dateObj);
  const dayName = DAY_NAMES[dayOfWeek];

  const dayHours = workingHours[dayName];

  if (!dayHours || dayHours.closed) {
    return [];
  }

  return generateSlotsForHours(
    dayHours.open,
    dayHours.close,
    serviceDuration,
    maxBookingsPerSlot,
    dayHours.breakStart,
    dayHours.breakEnd
  );
}

function generateSlotsForHours(
  openTime: string,
  closeTime: string,
  serviceDuration: number,
  maxBookingsPerSlot: number,
  breakStart?: string,
  breakEnd?: string
): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];

  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  const openTimeInMinutes = openHour * 60 + openMinute;
  const closeTimeInMinutes = closeHour * 60 + closeMinute;

  let currentTimeInMinutes = openTimeInMinutes;

  while (currentTimeInMinutes + serviceDuration <= closeTimeInMinutes) {
    const startHour = Math.floor(currentTimeInMinutes / 60);
    const startMinute = currentTimeInMinutes % 60;

    const endTimeInMinutes = currentTimeInMinutes + serviceDuration;
    const endHour = Math.floor(endTimeInMinutes / 60);
    const endMinute = endTimeInMinutes % 60;

    const skipSlot = breakStart && breakEnd && (() => {
      const [breakStartHour, breakStartMinute] = breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = breakEnd.split(':').map(Number);
      const breakStartInMinutes = breakStartHour * 60 + breakStartMinute;
      const breakEndInMinutes = breakEndHour * 60 + breakEndMinute;

      return (
        (currentTimeInMinutes >= breakStartInMinutes && currentTimeInMinutes < breakEndInMinutes) ||
        (endTimeInMinutes > breakStartInMinutes && endTimeInMinutes <= breakEndInMinutes) ||
        (currentTimeInMinutes < breakStartInMinutes && endTimeInMinutes > breakEndInMinutes)
      );
    })();

    if (!skipSlot) {
      slots.push({
        start_time: `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}:00`,
        end_time: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`,
        available_spots: maxBookingsPerSlot,
        is_available: true,
      });
    }

    currentTimeInMinutes += serviceDuration;
  }

  return slots;
}
