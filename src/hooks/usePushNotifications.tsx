import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | 'default';
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: 'default',
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 
      'Notification' in window && 
      'serviceWorker' in navigator && 
      'PushManager' in window;
    
    return isSupported;
  }, []);

  // Check current subscription status
  const checkSubscription = useCallback(async () => {
    if (!checkSupport()) {
      setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSupported: true,
        isSubscribed: !!subscription,
        permission: Notification.permission,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error checking push subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkSupport]);

  // Request notification permission and subscribe
  const subscribe = useCallback(async () => {
    if (!checkSupport()) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported on this device/browser.",
        variant: "destructive",
      });
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, permission, isLoading: false }));
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push - using local notifications only (no server push)
      // Store subscription preference in localStorage
      localStorage.setItem('push_notifications_enabled', 'true');
      localStorage.setItem('push_notifications_user', user?.id || '');

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        isLoading: false,
      }));

      toast({
        title: "Notifications Enabled",
        description: "You'll receive alerts when policies are about to expire.",
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Subscription Failed",
        description: "Could not enable push notifications. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [checkSupport, user?.id, toast]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Clear localStorage preference
      localStorage.removeItem('push_notifications_enabled');
      localStorage.removeItem('push_notifications_user');

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications anymore.",
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [toast]);

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    if (!state.isSubscribed) {
      toast({
        title: "Not Subscribed",
        description: "Please enable notifications first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('PolicyTracker', {
        body: 'Test notification - Push notifications are working!',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'test-notification',
      });

      toast({
        title: "Test Sent",
        description: "Check your notifications!",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }, [state.isSubscribed, toast]);

  // Check localStorage on mount
  useEffect(() => {
    const checkStoredPreference = async () => {
      const enabled = localStorage.getItem('push_notifications_enabled') === 'true';
      const storedUser = localStorage.getItem('push_notifications_user');
      
      if (enabled && storedUser === user?.id) {
        await checkSubscription();
        setState(prev => ({ ...prev, isSubscribed: true }));
      } else {
        await checkSubscription();
      }
    };
    
    checkStoredPreference();
  }, [checkSubscription, user?.id]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkSubscription,
  };
};

export default usePushNotifications;
