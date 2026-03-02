import { createClient } from 'npm:@supabase/supabase-js@2.56.0';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VAPID_PUBLIC_KEY = 'BIupDCyJKPeFTF4ATVu3KYFTr1lQi8wQyovCDfKtBSk5GpEdAq48rgU3ty3xZZj3nrGx7tKI4LApnvKGYphKK-s';
const VAPID_PRIVATE_KEY = '4_4l3zJWQJhSjZ8ZE8fGvDiWOtpmvPcm-qhJ_fxCCVs';
const VAPID_SUBJECT = 'mailto:benhammadalbachir@gmail.com';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  image?: string;
  requireInteraction?: boolean;
}

interface PushNotificationRequest {
  user_ids?: string[];
  subscriptions?: PushSubscription[];
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  image?: string;
  requireInteraction?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      user_ids,
      subscriptions: providedSubscriptions,
      title,
      body,
      icon = '/icon-192x192.png',
      badge = '/icon-192x192.png',
      tag = 'default',
      data = {},
      actions = [],
      image,
      requireInteraction = false
    }: PushNotificationRequest = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'title and body are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let subscriptions: PushSubscription[] = providedSubscriptions || [];

    if (user_ids && user_ids.length > 0) {
      const { data: dbSubscriptions, error } = await supabaseClient
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .in('user_id', user_ids);

      if (error) {
        console.error('Error fetching subscriptions:', error);
      } else if (dbSubscriptions) {
        subscriptions = [...subscriptions, ...dbSubscriptions];
      }
    }

    if (subscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No subscriptions found',
          sent_count: 0,
          failed_count: 0
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const payload: NotificationPayload = {
      title,
      body,
      icon,
      badge,
      tag,
      data,
      actions,
      image,
      requireInteraction
    };

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload),
            {
              TTL: 60 * 60 * 24,
            }
          );

          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          console.error('Push send error:', error);

          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabaseClient
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);

            console.log('Deleted expired subscription:', sub.endpoint);
          }

          return {
            success: false,
            endpoint: sub.endpoint,
            error: error.message
          };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedCount = results.length - successCount;

    console.log('Push notification results:', {
      total: subscriptions.length,
      success: successCount,
      failed: failedCount,
      title
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Push notifications processed',
        sent_count: successCount,
        failed_count: failedCount,
        total: subscriptions.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Push notification error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});