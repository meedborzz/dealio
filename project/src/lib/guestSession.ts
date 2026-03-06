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

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function ensureGuestSessionId(): string {
  try {
    const existing = readStore();
    if (existing) return existing;

    const sessionId = generateUUID();
    writeStore(sessionId);
    return sessionId;
  } catch {
    return generateUUID();
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
