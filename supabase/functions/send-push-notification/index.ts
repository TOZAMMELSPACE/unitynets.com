import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, body, url, postId, excludeUserId, targetUserId, type } = await req.json();

    console.log('Sending push notification:', { title, body, url, postId, excludeUserId, targetUserId, type });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query based on whether we're targeting a specific user or all users
    let query = supabase.from('push_subscriptions').select('*');
    
    if (targetUserId) {
      // Target specific user (e.g., for incoming call notification)
      query = query.eq('user_id', targetUserId);
    } else if (excludeUserId) {
      // Exclude sender (e.g., for broadcast notifications)
      query = query.neq('user_id', excludeUserId);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to notify`);

    const payload = JSON.stringify({
      title,
      body,
      url,
      postId,
      type: type || 'notification',
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      (subscriptions || []).map(async (sub) => {
        try {
          // Simple fetch to push endpoint
          const response = await fetch(sub.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
              'TTL': '86400',
            },
            body: payload,
          });

          if (response.status === 410 || response.status === 404) {
            // Subscription expired, remove it
            console.log('Removing expired subscription:', sub.id);
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }

          return { success: true, userId: sub.user_id };
        } catch (err) {
          console.error('Error sending to subscription:', sub.id, err);
          return { success: false, userId: sub.user_id, error: err.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`Push results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ success: true, sent: successful, failed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
