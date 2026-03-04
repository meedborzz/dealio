import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { FEATURES } from '../config/features';

import { UserProfile } from '../types';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isAdmin: () => boolean;
    isBusinessOwner: () => boolean;
    isClient: () => boolean;
    signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
    signUp: (email: string, password: string, name?: string) => Promise<{ data: any; error: any }>;
    signOut: () => Promise<{ error: any }>;
    refreshProfile: () => Promise<void>;
    getRedirectPath: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const sessionInitialized = useRef(false);
    const authStateChangeHandled = useRef(false);
    const fetchingProfile = useRef(false);
    const lastFetchedUserId = useRef<string | null>(null);

    const fetchUserProfile = async (userId: string) => {
        if (fetchingProfile.current) return;
        if (lastFetchedUserId.current === userId && userProfile) return;

        fetchingProfile.current = true;
        lastFetchedUserId.current = userId;
        setProfileLoading(true);

        try {
            const selectFields = ['id', 'full_name', 'phone', 'role', 'completed_bookings_count'];
            if (FEATURES.LOYALTY) selectFields.push('loyalty_points');
            if (FEATURES.WALLET) selectFields.push('wallet_balance', 'total_spent');
            if (FEATURES.REFERRAL) selectFields.push('referral_code');

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
                    await createDefaultProfile(userId);
                } else {
                    setUserProfile(null);
                }
            } else {
                setUserProfile(data);
            }
        } catch (error) {
            console.error('Error in fetchUserProfile:', error);
            // Fallback
            setUserProfile({
                id: userId,
                role: 'client',
                completed_bookings_count: 0,
                loyalty_points: 0,
                wallet_balance: 0,
                total_spent: 0
            } as any);
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
                    role: 'client',
                    completed_bookings_count: 0,
                    loyalty_points: 0,
                    wallet_balance: 0,
                    total_spent: 0
                } as any)
                .select()
                .single();

            if (!createError) {
                setUserProfile(newProfile);
            }
        } catch (error) {
            console.error('Error creating default profile:', error);
        }
    };

    useEffect(() => {
        if (sessionInitialized.current) return;
        sessionInitialized.current = true;

        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    await fetchUserProfile(currentUser.id);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (authStateChangeHandled.current && event === 'INITIAL_SESSION') {
                return;
            }
            authStateChangeHandled.current = true;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchUserProfile(currentUser.id);
            } else {
                setUserProfile(null);
                lastFetchedUserId.current = null;
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const getRedirectPath = () => {
        const stored = localStorage.getItem('dealio-redirect-after-login');
        if (stored && stored !== '/login' && stored !== '/register') {
            localStorage.removeItem('dealio-redirect-after-login');
            return stored;
        }
        return null;
    };

    const isAdmin = () => userProfile?.role === 'admin';
    const isBusinessOwner = () => userProfile?.role === 'business_owner';
    const isClient = () => userProfile?.role === 'client';

    const signIn = async (email: string, password: string) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async (email: string, password: string, name?: string) => {
        return supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
        });
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
            keysToRemove.forEach(k => localStorage.removeItem(k));

            await supabase.auth.signOut();
            window.location.href = '/';
            return { error: null };
        } catch (error) {
            window.location.href = '/';
            return { error: null };
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchUserProfile(user.id);
    };

    const value = {
        user,
        userProfile,
        loading: loading || profileLoading,
        isAdmin,
        isBusinessOwner,
        isClient,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        getRedirectPath
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
