import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = 'BLBz8K0r5hT1Y8qP9gE4w2M7nX3vJ6kL9mN1oQ4sU7wZ0xC3yB6aD9eF2gH5iJ8kL';

export const usePushNotifications = (userId: string | null) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    console.log('Push notifications supported:', supported);
  }, []);

  // Check existing subscription
  useEffect(() => {
    if (!isSupported || !userId) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        console.log('Existing subscription:', !!subscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [isSupported, userId]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!userId || !isSupported) {
      toast.error('পুশ নোটিফিকেশন সাপোর্টেড নয়');
      return false;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('নোটিফিকেশন অনুমতি দেওয়া হয়নি');
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      await navigator.serviceWorker.ready;

      // Get VAPID public key from edge function or use stored one
      const { data: vapidData } = await supabase.functions.invoke('get-vapid-key');
      const vapidKey = vapidData?.publicKey || VAPID_PUBLIC_KEY;

      // Convert VAPID key
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      console.log('Push subscription created:', subscription);

      // Extract keys
      const subscriptionJson = subscription.toJSON();
      const p256dh = subscriptionJson.keys?.p256dh || '';
      const auth = subscriptionJson.keys?.auth || '';

      // Save to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh,
          auth
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        console.error('Error saving subscription:', error);
        throw error;
      }

      setIsSubscribed(true);
      toast.success('পুশ নোটিফিকেশন চালু হয়েছে!');
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('পুশ নোটিফিকেশন চালু করতে সমস্যা হয়েছে');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSupported, registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!userId) return false;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      toast.success('পুশ নোটিফিকেশন বন্ধ হয়েছে');
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('পুশ নোটিফিকেশন বন্ধ করতে সমস্যা হয়েছে');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Send push notification to all users
  const sendPushToAll = useCallback(async (title: string, body: string, url?: string, postId?: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title,
          body,
          url,
          postId,
          excludeUserId: userId
        }
      });

      if (error) {
        console.error('Error sending push:', error);
      }
    } catch (error) {
      console.error('Error invoking push function:', error);
    }
  }, [userId]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendPushToAll
  };
};
