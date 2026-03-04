import { supabase } from './supabase';
import {
  NotificationPayload,
  NotificationType,
  NotificationChannelType,
  Notification as AppNotification
} from '../types';
import { FEATURES } from '../config/features';

// Default notification templates
const DEFAULT_TEMPLATES: Record<NotificationType, {
  subject: string;
  email: string;
  sms: string;
  in_app: string;
}> = {
  booking_confirmation: {
    subject: 'Réservation confirmée - {{deal_title}}',
    email: `
      Bonjour {{customer_name}},
      
      Votre réservation a été confirmée avec succès !
      
      Détails de votre rendez-vous :
      • Service : {{deal_title}}
      • Salon : {{business_name}}
      • Date : {{booking_date}}
      • Heure : {{booking_time}}
      • Adresse : {{business_address}}
      • Prix : {{deal_price}} DH

      Merci de choisir Dealio !
    `,
    sms: 'Réservation confirmée ! {{deal_title}} chez {{business_name}} le {{booking_date}} à {{booking_time}}.',
    in_app: 'Votre réservation pour {{deal_title}} chez {{business_name}} est confirmée pour le {{booking_date}} à {{booking_time}}.'
  },
  booking_reminder: {
    subject: 'Rappel - Rendez-vous dans {{time_until}}',
    email: `
      Bonjour {{customer_name}},
      
      Nous vous rappelons votre rendez-vous prévu dans {{time_until}} :
      
      • Service : {{deal_title}}
      • Salon : {{business_name}}
      • Date : {{booking_date}}
      • Heure : {{booking_time}}
      • Adresse : {{business_address}}

      À bientôt,
      L'équipe Dealio
    `,
    sms: 'Rappel : RDV {{deal_title}} chez {{business_name}} dans {{time_until}}.',
    in_app: 'Rappel : Votre rendez-vous {{deal_title}} chez {{business_name}} est dans {{time_until}}.'
  },
  booking_cancellation: {
    subject: 'Réservation annulée - {{deal_title}}',
    email: `
      Bonjour {{customer_name}},
      
      Votre réservation a été annulée :
      
      • Service : {{deal_title}}
      • Salon : {{business_name}}
      • Date : {{booking_date}}
      • Heure : {{booking_time}}
      {{#if cancellation_fee}}
      • Frais d'annulation : {{cancellation_fee}} DH
      {{/if}}
      
      Nous espérons vous revoir bientôt !
    `,
    sms: 'Réservation annulée : {{deal_title}} chez {{business_name}} le {{booking_date}}.',
    in_app: 'Votre réservation {{deal_title}} chez {{business_name}} a été annulée.'
  },
  booking_rescheduled: {
    subject: 'Réservation reportée - {{deal_title}}',
    email: `
      Bonjour {{customer_name}},
      
      Votre réservation a été reportée :
      
      Ancienne date : {{old_booking_date}} à {{old_booking_time}}
      Nouvelle date : {{new_booking_date}} à {{new_booking_time}}
      
      • Service : {{deal_title}}
      • Salon : {{business_name}}
      • Adresse : {{business_address}}
    `,
    sms: 'RDV reporté : {{deal_title}} chez {{business_name}} maintenant le {{new_booking_date}} à {{new_booking_time}}.',
    in_app: 'Votre rendez-vous {{deal_title}} a été reporté au {{new_booking_date}} à {{new_booking_time}}.'
  },
  booking_completed: {
    subject: 'Merci pour votre visite - {{business_name}}',
    email: `
      Bonjour {{customer_name}},
      
      Merci d'avoir choisi {{business_name}} !
      
      Nous espérons que vous avez apprécié votre {{deal_title}}.
      
      N'hésitez pas à laisser un avis pour aider d'autres clients.
      
      À bientôt sur Dealio !
    `,
    sms: 'Merci pour votre visite chez {{business_name}} ! Laissez un avis sur Dealio.',
    in_app: 'Merci pour votre visite chez {{business_name}} ! Comment s\'est passé votre {{deal_title}} ?'
  },
  deal_expiring_soon: {
    subject: 'Offre expire bientôt - {{deal_title}}',
    email: `
      Bonjour {{customer_name}},
      
      L'offre {{deal_title}} chez {{business_name}} expire bientôt !
      
      • Prix : {{deal_price}} DH (au lieu de {{original_price}} DH)
      • Expire le : {{expiry_date}}
      
      Réservez maintenant avant qu'il ne soit trop tard !
    `,
    sms: 'Offre expire bientôt ! {{deal_title}} chez {{business_name}} - {{deal_price}} DH. Expire le {{expiry_date}}.',
    in_app: 'L\'offre {{deal_title}} chez {{business_name}} expire le {{expiry_date}} !'
  },
  promotional_offer: {
    subject: 'Nouvelle offre spéciale - {{business_name}}',
    email: `
      Bonjour {{customer_name}},
      
      {{business_name}} a une nouvelle offre spéciale pour vous !
      
      {{custom_message}}
      
      Découvrez cette offre sur Dealio.
    `,
    sms: 'Nouvelle offre chez {{business_name}} ! {{custom_message}}',
    in_app: '{{business_name}} : {{custom_message}}'
  },
  business_message: {
    subject: 'Message de {{business_name}}',
    email: `
      Bonjour {{customer_name}},
      
      Vous avez reçu un message de {{business_name}} :
      
      "{{custom_message}}"
      
      Répondez directement dans l'application Dealio.
    `,
    sms: 'Message de {{business_name}} : {{custom_message}}',
    in_app: 'Nouveau message de {{business_name}}'
  },
  system_update: {
    subject: 'Mise à jour Dealio',
    email: `
      Bonjour {{customer_name}},
      
      {{custom_message}}
      
      L'équipe Dealio
    `,
    sms: 'Dealio : {{custom_message}}',
    in_app: '{{custom_message}}'
  }
};

// Template variable replacement utility
function replaceTemplateVariables(template: string, data: any): string {
  let result = template;

  // Simple template replacement (in production, use a proper template engine like Handlebars)
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });

  // Handle conditional blocks (basic implementation)
  result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
    return data[condition] ? content : '';
  });

  return result.trim();
}

// Format booking data for templates
function formatBookingData(payload: NotificationPayload) {
  const { booking, deal, business, user } = payload.data;

  const bookingDate = booking?.booking_date ? new Date(booking.booking_date) : null;

  return {
    customer_name: booking?.customer_name || user?.full_name || 'Client',
    deal_title: deal?.title || 'Service',
    business_name: business?.name || 'Salon',
    business_address: business?.address || '',
    business_phone: business?.phone || '',
    booking_date: bookingDate ? bookingDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '',
    booking_time: bookingDate ? bookingDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '',
    deal_price: deal?.discounted_price || 0,
    original_price: deal?.original_price || 0,
    discount_percentage: deal?.discount_percentage || 0,
    duration_minutes: deal?.duration_minutes || 0,
    expiry_date: deal?.valid_until ? new Date(deal.valid_until).toLocaleDateString('fr-FR') : '',
    custom_message: payload.data.custom_message || '',
    cancellation_fee: payload.data.cancellation_fee || 0,
    old_booking_date: payload.data.old_booking_date || '',
    old_booking_time: payload.data.old_booking_time || '',
    new_booking_date: payload.data.new_booking_date || '',
    new_booking_time: payload.data.new_booking_time || '',
    time_until: payload.data.time_until || ''
  };
}

// Core notification sending function
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    const uniqueChannels = [...new Set(payload.channels)];

    console.log('🔔 Sending notification:', {
      type: payload.type,
      recipient: payload.recipient_id,
      channels: uniqueChannels
    });

    const templateData = formatBookingData(payload);
    const template = DEFAULT_TEMPLATES[payload.type];

    for (const channel of uniqueChannels) {
      switch (channel) {
        case 'email':
          await sendEmailNotification(payload, template, templateData);
          break;
        case 'sms':
          await sendSMSNotification(payload, template, templateData);
          break;
        case 'in_app':
          await sendInAppNotification(payload, template, templateData);
          break;
        case 'push':
          await sendPushNotification(payload, template, templateData);
          break;
        default:
          console.warn(`Unknown notification channel: ${channel}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Email notification handler (placeholder)
async function sendEmailNotification(
  payload: NotificationPayload,
  template: any,
  data: any
): Promise<void> {
  const subject = payload.template_override?.subject ||
    replaceTemplateVariables(template.subject, data);
  const body = payload.template_override?.body ||
    replaceTemplateVariables(template.email, data);

  console.log('📧 EMAIL NOTIFICATION:', {
    to: payload.recipient_id,
    subject,
    body: body.substring(0, 100) + '...',
    type: payload.type
  });

  // NOTE: In production, this should be handled by a Supabase Edge Function
  // to keep API keys secure and centralized.
  // Example: 
  // await supabase.functions.invoke('send-email', { body: { ... } });
}

// SMS notification handler
async function sendSMSNotification(
  payload: NotificationPayload,
  template: any,
  data: any
): Promise<void> {
  const message = replaceTemplateVariables(template.sms, data);

  console.log('📱 [NotificationService] SMS:', {
    to: payload.recipient_id,
    message,
    type: payload.type
  });

  // NOTE: In production, use an Edge Function with Twilio or similar.
}

// In-app notification handler
async function sendInAppNotification(
  payload: NotificationPayload,
  template: any,
  data: any
): Promise<void> {
  const title = replaceTemplateVariables(template.subject, data);
  const content = replaceTemplateVariables(template.in_app, data);

  console.log('🔔 IN-APP NOTIFICATION:', {
    to: payload.recipient_id,
    title,
    content,
    type: payload.type
  });

  try {
    // Store notification in database
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.recipient_id,
        type: payload.type,
        channel: 'in_app',
        title,
        content,
        data: payload.data || {},
        related_booking_id: payload.data?.booking?.id || null,
        related_deal_id: payload.data?.deal?.id || null,
        related_business_id: payload.data?.business?.id || null
      } as any);

    if (error) {
      console.error('Error storing in-app notification:', error);
    } else {
      console.log('💾 In-app notification stored successfully');
    }

  } catch (error) {
    console.error('Error sending in-app notification:', error);
  }
}

async function sendPushNotification(
  payload: NotificationPayload,
  template: any,
  data: any
): Promise<void> {
  const title = replaceTemplateVariables(template.subject, data);
  const body = replaceTemplateVariables(template.in_app, data);

  console.log('🔔 PUSH NOTIFICATION:', {
    to: payload.recipient_id,
    title,
    body,
    type: payload.type
  });

  try {
    const { data: response, error: pushError } = await supabase.functions.invoke('send-push-notification', {
      body: {
        user_ids: [payload.recipient_id],
        title,
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: payload.type,
        data: {
          type: payload.type,
          url: getNotificationUrl(payload),
          ...payload.data
        },
        actions: getNotificationActions(payload.type),
        requireInteraction: payload.type === 'booking_reminder'
      }
    });

    if (pushError) {
      console.error('Error sending push notification:', pushError);
    } else {
      console.log('✅ Push notification sent:', response);
    }
  } catch (error) {
    console.error('Error in push notification handler:', error);
  }
}

function getNotificationUrl(payload: NotificationPayload): string {
  switch (payload.type) {
    case 'booking_confirmation':
    case 'booking_reminder':
    case 'booking_cancellation':
    case 'booking_rescheduled':
    case 'booking_completed':
      return payload.data?.booking?.id ? `/bookings/${payload.data.booking.id}` : '/bookings';
    case 'deal_expiring_soon':
      return payload.data?.deal?.id ? `/deals/${payload.data.deal.id}` : '/';
    case 'business_message':
      if (!FEATURES.MESSAGING) {
        return '/bookings';
      }
      return payload.data?.business?.id ? `/messages?business=${payload.data.business.id}` : '/messages';
    default:
      return '/';
  }
}

function getNotificationActions(type: NotificationType): Array<{ action: string; title: string }> {
  switch (type) {
    case 'booking_reminder':
      return [
        { action: 'view', title: 'Voir la réservation' },
        { action: 'dismiss', title: 'Fermer' }
      ];
    case 'booking_completed':
      return [
        { action: 'view', title: 'Laisser un avis' },
        { action: 'dismiss', title: 'Fermer' }
      ];
    case 'business_message':
      return [
        { action: 'view', title: 'Répondre' },
        { action: 'dismiss', title: 'Fermer' }
      ];
    default:
      return [
        { action: 'view', title: 'Voir' },
        { action: 'dismiss', title: 'Fermer' }
      ];
  }
}

export async function getUserNotificationPreferences(userId: string): Promise<NotificationChannelType[]> {
  try {
    const { data: prefs, error } = await supabase
      .from('notification_preferences')
      .select('push_enabled, email_enabled, sms_enabled')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return ['in_app'];
    }

    if (!prefs) {
      return ['in_app', 'push'];
    }

    const channels: NotificationChannelType[] = ['in_app'];
    if ((prefs as any).push_enabled) channels.push('push');
    if ((prefs as any).email_enabled) channels.push('email');
    if ((prefs as any).sms_enabled) channels.push('sms');

    return channels;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return ['in_app'];
  }
}

// Convenience functions for common notification types
export async function sendBookingConfirmation(
  userId: string,
  booking: any,
  deal: any,
  business: any
): Promise<boolean> {
  const channels = await getUserNotificationPreferences(userId);

  return sendNotification({
    type: 'booking_confirmation',
    recipient_id: userId,
    channels,
    data: { booking, deal, business }
  });
}

export async function sendBookingReminder(
  userId: string,
  booking: any,
  deal: any,
  business: any,
  timeUntil: string
): Promise<boolean> {
  const channels = await getUserNotificationPreferences(userId);

  return sendNotification({
    type: 'booking_reminder',
    recipient_id: userId,
    channels,
    data: { booking, deal, business, time_until: timeUntil }
  });
}

export async function sendBookingCancellation(
  userId: string,
  booking: any,
  deal: any,
  business: any,
  cancellationFee?: number
): Promise<boolean> {
  const channels = await getUserNotificationPreferences(userId);

  return sendNotification({
    type: 'booking_cancellation',
    recipient_id: userId,
    channels,
    data: { booking, deal, business, cancellation_fee: cancellationFee }
  });
}

export async function sendBookingRescheduled(
  userId: string,
  booking: any,
  deal: any,
  business: any,
  oldDate: string,
  newDate: string
): Promise<boolean> {
  const channels = await getUserNotificationPreferences(userId);

  return sendNotification({
    type: 'booking_rescheduled',
    recipient_id: userId,
    channels,
    data: {
      booking,
      deal,
      business,
      old_booking_date: oldDate,
      new_booking_date: newDate
    }
  });
}

// Function to mark in-app notifications as read
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// Function to get unread in-app notifications for a user
export async function getUnreadNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('channel', 'in_app')
      .eq('is_read', false)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
}