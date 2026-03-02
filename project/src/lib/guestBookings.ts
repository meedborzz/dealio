const GUEST_BOOKINGS_KEY = 'dealio-guest-bookings';
const CURRENT_VERSION = 1;

export interface GuestBookingReference {
  booking_token: string;
  created_at: string;
  deal_title?: string;
  business_name?: string;
}

interface VersionedPayload {
  v: number;
  tokens: string[];
}

function isValidPayload(parsed: unknown): parsed is VersionedPayload {
  return (
    typeof parsed === 'object' &&
    parsed !== null &&
    (parsed as any).v === CURRENT_VERSION &&
    Array.isArray((parsed as any).tokens) &&
    (parsed as any).tokens.every((t: unknown) => typeof t === 'string')
  );
}

function readTokens(): string[] {
  try {
    const raw = localStorage.getItem(GUEST_BOOKINGS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (isValidPayload(parsed)) return parsed.tokens;

    if (Array.isArray(parsed)) {
      const tokens = parsed
        .map((item: any) => item?.booking_token)
        .filter((t: unknown): t is string => typeof t === 'string' && t.length > 0);
      writeTokens(tokens);
      return tokens;
    }

    localStorage.removeItem(GUEST_BOOKINGS_KEY);
    return [];
  } catch {
    localStorage.removeItem(GUEST_BOOKINGS_KEY);
    return [];
  }
}

function writeTokens(tokens: string[]): void {
  const payload: VersionedPayload = { v: CURRENT_VERSION, tokens };
  localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(payload));
}

export function saveGuestBooking(token: string, _dealTitle?: string, _businessName?: string) {
  try {
    const tokens = readTokens();
    if (!tokens.includes(token)) {
      tokens.push(token);
      writeTokens(tokens);
    }
  } catch {
    // noop
  }
}

export function getGuestBookings(): GuestBookingReference[] {
  return readTokens().map(token => ({
    booking_token: token,
    created_at: ''
  }));
}

export function removeGuestBooking(token: string) {
  try {
    const tokens = readTokens().filter(t => t !== token);
    writeTokens(tokens);
  } catch {
    // noop
  }
}

export function clearGuestBookings() {
  try {
    localStorage.removeItem(GUEST_BOOKINGS_KEY);
  } catch {
    // noop
  }
}

export function getGuestBookingTokens(): string[] {
  return readTokens();
}
