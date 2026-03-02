import type { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

type SafeResult<T> = { data: T | null; error: string | null };

export async function safeQuery<T>(
  promise: PromiseLike<PostgrestResponse<T>>
): Promise<SafeResult<T[]>> {
  try {
    const { data, error } = await promise;
    if (error) {
      if (import.meta.env.DEV) console.error('[safeQuery]', error.message);
      return { data: null, error: error.message };
    }
    return { data: data ?? [], error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (import.meta.env.DEV) console.error('[safeQuery] unexpected', msg);
    return { data: null, error: msg };
  }
}

export async function safeSingle<T>(
  promise: PromiseLike<PostgrestSingleResponse<T>>
): Promise<SafeResult<T>> {
  try {
    const { data, error } = await promise;
    if (error) {
      if (import.meta.env.DEV) console.error('[safeSingle]', error.message);
      return { data: null, error: error.message };
    }
    return { data: data ?? null, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (import.meta.env.DEV) console.error('[safeSingle] unexpected', msg);
    return { data: null, error: msg };
  }
}
