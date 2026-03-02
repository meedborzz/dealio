import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '../config/features';

interface UserProfile {
  id: string;
  full_name?: string;
  phone?: string;
  role: 'client' | 'business_owner' | 'admin';
  loyalty_points: number;
  wallet_balance: number;
  total_spent: number;
  completed_bookings_count: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const sessionInitialized = useRef(false);

  // Debug: Monitor profile updates
  useEffect(() => {
    if (userProfile) {
      console.log('👤 useAuth: Profile updated:', { id: userProfile.id, role: userProfile.role });
    } else {
      console.log('👤 useAuth: Profile cleared');
    }
  }, [userProfile]);

  const fetchingProfile = useRef(false);
  const authStateChangeHandled = useRef(false);
  const lastFetchedUserId = useRef<string | null>(null);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string) => {
    if (fetchingProfile.current) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }
    if (lastFetchedUserId.current === userId) {
      console.log('Profile already fetched for this user, skipping...');
      return;
    }
    fetchingProfile.current = true;
    lastFetchedUserId.current = userId;
    setProfileLoading(true);

    try {
      if (import.meta.env.DEV) {
        console.log('🔍 Attempting to fetch user profile for:', userId);
      }

      // Check if Supabase is properly configured before attempting fetch
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Missing Supabase environment variables!');
        console.error('Please check your .env file contains:');
        console.error('VITE_SUPABASE_URL=https://your-project.supabase.co');
        console.error('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
        setUserProfile(null);
        return;
      }

      // Skip API calls if using placeholder values
      if (supabaseUrl.includes('your-project.supabase.co') || supabaseAnonKey.includes('your-anon-key-here')) {
        if (import.meta.env.DEV) {
          console.warn('⚠️ Using placeholder Supabase credentials - skipping API calls');
        }
        setUserProfile({
          id: userId,
          full_name: 'Demo User',
          phone: null,
          role: 'client',
          completed_bookings_count: 0,
          loyalty_points: 0,
          wallet_balance: 0.00,
          total_spent: 0.00
        });
        return;
      }
      // Use faster, optimized profile query
      // Build select string based on enabled features
      const selectFields = ['id', 'full_name', 'phone', 'role', 'completed_bookings_count'];
      if (FEATURES.LOYALTY) selectFields.push('loyalty_points');
      if (FEATURES.WALLET) selectFields.push('wallet_balance', 'total_spent');
      if (FEATURES.REFERRAL) selectFields.push('referral_code');

      // Add timeout to profile query
      const profilePromise = supabase
        .from('user_profiles')
        .select(selectFields.join(', '))
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile exists, create one
          console.log('No profile found, creating default profile...');
          await createDefaultProfile(userId);
          return;
        }

        if (import.meta.env.DEV) {
          console.error('❌ Error fetching user profile:', error.message);
          if (error.message.includes('Failed to fetch') || error.message.includes('timeout')) {
            console.error('🌐 This appears to be a network/configuration issue:');
            console.error('1. Check your VITE_SUPABASE_URL in .env file');
            console.error('2. Verify your Supabase project is active');
            console.error('3. Check network connectivity');
          }
        }
        setUserProfile(null);
      } else {
        if (import.meta.env.DEV) {
          console.log('✅ User profile found:', data);
        }
        setUserProfile(data);
      }
    } catch (error: any) {
      if (error.message?.includes('infinite recursion')) {
        console.error('🚨 CRITICAL DATABASE ERROR: Infinite recursion in RLS policies.');
        console.error('You MUST run the fix_permissions_recursion.sql script in Supabase.');
        // Stop fetching to prevent loop
        fetchingProfile.current = false;
        lastFetchedUserId.current = userId; // Mark as fetched so we don't try again
        setUserProfile(null);
        return;
      }

      if (import.meta.env.DEV) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          console.warn('⚠️ Cannot connect to Supabase - using offline mode');
        } else if (error.message.includes('timeout')) {
          console.error('⏱️ Profile fetch timed out after 5 seconds');
        } else {
          console.error('❌ Network error in fetchUserProfile:', error?.message);
        }
      }
      // Set a default profile when offline or on error
      setUserProfile({
        id: userId,
        full_name: 'Error User',
        phone: null,
        role: 'client', // Default to client on error to be safe
        completed_bookings_count: 0,
        loyalty_points: 0,
        wallet_balance: 0.00,
        total_spent: 0.00
      });
    } finally {
      fetchingProfile.current = false;
      setProfileLoading(false);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          full_name: null,
          phone: null,
          role: 'client',
          completed_bookings_count: 0,
          loyalty_points: 0,
          wallet_balance: 0.00,
          total_spent: 0.00
        })
        .select('id, full_name, phone, role, completed_bookings_count, loyalty_points, wallet_balance, total_spent')
        .single();

      if (!createError) {
        setUserProfile(newProfile);
        lastFetchedUserId.current = userId;
      }
    } catch (error) {
      console.error('Error creating default profile:', error);
    }
  };

  // Generate a unique referral code
  const generateReferralCode = (userId: string): string => {
    return 'DEAL' + userId.substring(0, 6).toUpperCase();
  };

  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;
    authStateChangeHandled.current = false;

    const initializeAuth = async () => {
      // Safety timeout to ensure we never get stuck in loading state
      const safetyTimeout = setTimeout(() => {
        if (loading) {
          console.warn('⚠️ Safety timeout triggered: Forcing loading to false');
          setLoading(false);
        }
      }, 7000);

      try {
        // Check if Supabase is properly configured
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          if (import.meta.env.DEV) {
            console.warn('⚠️ Supabase environment variables not configured - running in offline mode');
            console.warn('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
            console.warn('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
          }
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          clearTimeout(safetyTimeout);
          return;
        }

        // Skip session check if using placeholder values
        if (import.meta.env.VITE_SUPABASE_URL.includes('your-project.supabase.co') ||
          import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-anon-key-here')) {
          if (import.meta.env.DEV) {
            console.warn('⚠️ Using placeholder Supabase credentials - running in demo mode');
          }
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          clearTimeout(safetyTimeout);
          return;
        }
        if (import.meta.env.DEV) {
          console.log('🔄 Initializing authentication...');
        }

        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );

        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;

        if (error) {
          console.error('❌ Session error:', error.message);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          clearTimeout(safetyTimeout);
          return;
        }

        if (import.meta.env.DEV) {
          console.log('📋 Session check result:', session ? 'User found' : 'No session');
        }
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
        clearTimeout(safetyTimeout);
      } catch (error) {
        if (import.meta.env.DEV) {
          if (error instanceof Error && error.message.includes('Failed to fetch')) {
            console.warn('⚠️ Cannot connect to Supabase - running in offline mode');
          } else {
            console.error('❌ Auth initialization error:', error instanceof Error ? error.message : 'Unknown error');
          }
        }

        setUser(null);
        setUserProfile(null);
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    };

    initializeAuth();

    const subscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Prevent duplicate handling of auth state changes
        if (authStateChangeHandled.current && event === 'INITIAL_SESSION') {
          return;
        }
        authStateChangeHandled.current = true;

        if (import.meta.env.DEV) {
          console.log('🔄 Auth state change:', event, session ? 'User present' : 'No user');
        }
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
          setLoading(false);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.data.subscription.unsubscribe();
  }, []);

  const getRedirectPath = () => {
    const stored = localStorage.getItem('dealio-redirect-after-login');
    if (stored && stored !== '/login' && stored !== '/register') {
      localStorage.removeItem('dealio-redirect-after-login');
      return stored;
    }
    return null;
  };

  const isAdmin = () => {
    return userProfile?.role === 'admin';
  };

  const isBusinessOwner = () => {
    return userProfile?.role === 'business_owner';
  };

  const isClient = () => {
    return userProfile?.role === 'client';
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Profile will be fetched by onAuthStateChange listener
      // No need to fetch it here to avoid duplicate calls

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setUserProfile(null);
      lastFetchedUserId.current = null;

      sessionStorage.clear();

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== 'dealio-preferences') {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      await supabase.auth.signOut();

      navigate('/');

      return { error: null };
    } catch {
      setUser(null);
      setUserProfile(null);
      lastFetchedUserId.current = null;
      navigate('/');
      return { error: null };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setProfileLoading(true);
      await fetchUserProfile(user.id);
      setProfileLoading(false);
    }
  };

  return {
    user,
    userProfile,
    loading: loading || profileLoading,
    getRedirectPath,
    isAdmin,
    isBusinessOwner,
    isClient,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };
}