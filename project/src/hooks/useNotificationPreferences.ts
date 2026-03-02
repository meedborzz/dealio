import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface NotificationPreferences {
  booking_reminders: boolean;
  deal_alerts: boolean;
  business_messages: boolean;
  promotional_offers: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  booking_reminders: true,
  deal_alerts: true,
  business_messages: true,
  promotional_offers: false,
  push_enabled: true,
  email_enabled: false,
  sms_enabled: false,
  quiet_hours_start: null,
  quiet_hours_end: null
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
      } else if (data) {
        setPreferences({
          booking_reminders: data.booking_reminders,
          deal_alerts: data.deal_alerts,
          business_messages: data.business_messages,
          promotional_offers: data.promotional_offers,
          push_enabled: data.push_enabled,
          email_enabled: data.email_enabled,
          sms_enabled: data.sms_enabled,
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end
        });
      } else {
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          ...DEFAULT_PREFERENCES
        });

      if (error) {
        console.error('Error creating default preferences:', error);
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user) return false;

    try {
      setSaving(true);

      const newPreferences = { ...preferences, ...updates };

      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating preferences:', error);
        return false;
      }

      setPreferences(newPreferences);
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean | string | null) => {
    return updatePreferences({ [key]: value } as Partial<NotificationPreferences>);
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    updatePreference,
    reloadPreferences: loadPreferences
  };
}
