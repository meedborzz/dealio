export function assertEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  
  if (!url || !key) {
    throw new Error(
      `Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n` +
      `Add them to your .env (Vite requires the VITE_ prefix), then restart dev server.\n` +
      `VITE_SUPABASE_URL=https://xxxx.supabase.co\n` +
      `VITE_SUPABASE_ANON_KEY=eyJ...`
    );
  }
  
  return { url, key };
}