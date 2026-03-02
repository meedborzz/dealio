import { format, addMinutes, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Africa/Casablanca';

export function formatMoney(cents: number): string {
  return `${(cents / 100).toFixed(2)} DH`;
}

export function addMinutesToDate(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function toLocalISO(date: Date): string {
  const zonedDate = utcToZonedTime(date, TIMEZONE);
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss");
}

export function fromLocalISO(isoString: string): Date {
  return zonedTimeToUtc(parseISO(isoString), TIMEZONE);
}

export function formatDateForCalendar(date: Date): string {
  return format(utcToZonedTime(date, TIMEZONE), 'yyyy-MM-dd HH:mm:ss');
}

export function getCurrentTimeInTimezone(): Date {
  return utcToZonedTime(new Date(), TIMEZONE);
}