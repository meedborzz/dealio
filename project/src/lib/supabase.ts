import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Get environment variables with proper validation and fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Log environment variable status for debugging
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Configuration Check:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('');
  console.error('Please check your .env file contains:');
  console.error('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  console.error('');
  console.error('Get these from your Supabase Dashboard:');
  console.error('1. Go to https://supabase.com/dashboard');
  console.error('2. Select your project');
  console.error('3. Go to Settings → API');
  console.error('4. Copy Project URL and Anon Public Key');
  console.error('Please check your .env file and restart the dev server.');
}

// Create mock client for fallback scenarios
const createMockClient = (): SupabaseClient<Database> => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      })
    })
  })
} as unknown as SupabaseClient<Database>);

// Create the real Supabase client
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase configuration, using mock client');
    return createMockClient();
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ VITE_SUPABASE_URL must start with https://');
    console.error('Current value:', supabaseUrl);
    return createMockClient();
  }

  if (import.meta.env.DEV) {
    console.log('✅ Creating Supabase client with URL:', supabaseUrl.substring(0, 30) + '...');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'dealio-app'
      },
      fetch: (url, options = {}) => {
        // Ensure apikey is always included in headers
        const headers = new Headers(options.headers);
        if (!headers.has('apikey')) {
          headers.set('apikey', supabaseAnonKey);
        }
        if (!headers.has('Authorization') && supabaseAnonKey) {
          headers.set('Authorization', `Bearer ${supabaseAnonKey}`);
        }

        return fetch(url, {
          ...options,
          headers: headers
        });
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
};

// Initialize client with error handling
let supabase: SupabaseClient<Database>;

try {
  supabase = createSupabaseClient() as SupabaseClient<Database>;
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
  console.warn('⚠️ Using fallback mock client');
  supabase = createMockClient();
}

export { supabase };