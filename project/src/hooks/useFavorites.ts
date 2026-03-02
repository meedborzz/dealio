import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const FAVORITES_KEY = 'dealio-favorites';

function getLocalFavorites(): string[] {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    } catch {
        return [];
    }
}

function setLocalFavorites(ids: string[]) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function useFavorites() {
    const { user } = useAuth();
    const [favoriteIds, setFavoriteIds] = useState<string[]>(getLocalFavorites());
    const [loading, setLoading] = useState(false);

    // Sync favorites from Supabase when user is logged in
    useEffect(() => {
        if (!user) {
            setFavoriteIds(getLocalFavorites());
            return;
        }

        const fetchFavorites = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('favorites')
                    .select('target_id')
                    .eq('user_id', user.id);

                if (error) throw error;

                const ids = (data || []).map((f: { target_id: string }) => f.target_id);
                setFavoriteIds(ids);
                setLocalFavorites(ids);
            } catch (err) {
                console.error('Error fetching favorites:', err);
                // Fall back to local storage
                setFavoriteIds(getLocalFavorites());
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    const isFavorite = useCallback(
        (id: string) => favoriteIds.includes(id),
        [favoriteIds]
    );

    const toggleFavorite = useCallback(
        async (id: string) => {
            const isCurrentlyFavorite = favoriteIds.includes(id);
            const newIds = isCurrentlyFavorite
                ? favoriteIds.filter((fid) => fid !== id)
                : [...favoriteIds, id];

            // Optimistic update
            setFavoriteIds(newIds);
            setLocalFavorites(newIds);

            if (!user) return; // Guest: local only

            try {
                if (isCurrentlyFavorite) {
                    await supabase
                        .from('favorites')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('target_id', id);
                } else {
                    await supabase.from('favorites').insert({
                        user_id: user.id,
                        target_id: id,
                    });
                }
            } catch (err) {
                console.error('Error toggling favorite:', err);
                // Revert on error
                setFavoriteIds(favoriteIds);
                setLocalFavorites(favoriteIds);
            }
        },
        [user, favoriteIds]
    );

    return { favoriteIds, isFavorite, toggleFavorite, loading };
}
