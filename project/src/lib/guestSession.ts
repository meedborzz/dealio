const GUEST_SESSION_KEY = 'dealio-guest-session-id';
const CURRENT_VERSION = 1;

interface VersionedPayload {
  v: number;
  data: string;
}

function isValidPayload(parsed: unknown): parsed is VersionedPayload {
  return (
    typeof parsed === 'object' &&
    parsed !== null &&
    (parsed as any).v === CURRENT_VERSION &&
    typeof (parsed as any).data === 'string' &&
    (parsed as any).data.length > 0
  );
}

function readStore(): string | null {
  try {
    const raw = localStorage.getItem(GUEST_SESSION_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (isValidPayload(parsed)) return parsed.data;
    } catch {
      // noop
    }

    if (typeof raw === 'string' && raw.length > 0 && raw.length < 100 && !raw.startsWith('{')) {
      const migrated: VersionedPayload = { v: CURRENT_VERSION, data: raw };
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(migrated));
      return raw;
    }

    localStorage.removeItem(GUEST_SESSION_KEY);
    return null;
  } catch {
    return null;
  }
}

function writeStore(sessionId: string): void {
  const payload: VersionedPayload = { v: CURRENT_VERSION, data: sessionId };
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(payload));
}

export function getGuestSessionId(): string | null {
  return readStore();
}

export function ensureGuestSessionId(): string {
  try {
    const existing = readStore();
    if (existing) return existing;

    const sessionId = crypto.randomUUID();
    writeStore(sessionId);
    return sessionId;
  } catch {
    return crypto.randomUUID();
  }
}

export function clearGuestSession(): void {
  try {
    localStorage.removeItem(GUEST_SESSION_KEY);
  } catch {
    // noop
  }
}

export function hasGuestSession(): boolean {
  return !!getGuestSessionId();
}
