import { supabase } from './supabase';

/**
 * Track a user interaction with a deal (view, click, book, etc.)
 * Silently fails — never throws, so it never breaks the UI.
 */
export async function trackInteraction(
    dealId: string,
    interactionType: 'view' | 'click' | 'book' | 'share' | 'favorite'
): Promise<void> {
    try {
        await supabase.from('deal_interactions').insert({
            deal_id: dealId,
            interaction_type: interactionType,
            created_at: new Date().toISOString(),
        });
    } catch {
        // Silently ignore — tracking should never break the user experience
    }
}
