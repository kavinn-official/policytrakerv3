
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
}

interface RazorpayPaymentData {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

interface UseSubscriptionReturn extends SubscriptionStatus {
  checkSubscription: () => Promise<void>;
  createRazorpayPayment: (amount?: number, planType?: string) => Promise<RazorpayPaymentData | void>;
  verifyRazorpayPayment: (paymentData: any) => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true,
  });

  const checkSubscription = async () => {
    if (!session || !user) {
      setSubscriptionStatus({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        loading: false,
      });
      return;
    }

    try {
      console.log('Checking subscription for user:', user.email);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subscription:', error);
      }

      const now = new Date();
      const isActive = data && 
                     data.status === 'active' && 
                     data.end_date && 
                     new Date(data.end_date) > now;

      console.log('Subscription data:', data);
      console.log('Is subscription active:', isActive);

      setSubscriptionStatus({
        subscribed: isActive || false,
        subscription_tier: isActive ? data.plan_name : null,
        subscription_end: data?.end_date || null,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionStatus({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        loading: false,
      });
    }
  };

  const createRazorpayPayment = async (amount = 50, planType = 'Premium'): Promise<RazorpayPaymentData | void> => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating Razorpay payment for amount:', amount, 'plan:', planType);

      const { data, error } = await supabase.functions.invoke('create-razorpay-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { amount, planType },
      });

      if (error) {
        console.error('Razorpay payment creation error:', error);
        throw error;
      }

      console.log('Razorpay payment response:', data);

      if (data && data.orderId && data.keyId && data.amount && data.currency) {
        return {
          orderId: data.orderId,
          keyId: data.keyId,
          amount: data.amount,
          currency: data.currency
        };
      }
    } catch (error: any) {
      console.error('Error creating Razorpay payment:', error);
      
      let errorMessage = "Failed to create Razorpay payment";
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const verifyRazorpayPayment = async (paymentData: any) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to verify payment",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Verifying Razorpay payment:', paymentData);

      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: paymentData,
      });

      if (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Failed",
          description: "Payment verification failed. Please contact support if amount was deducted.",
          variant: "destructive",
        });
        throw error;
      }

      console.log('Payment verification response:', data);

      if (data.success) {
        toast({
          title: "Payment Successful!",
          description: "Your account has been upgraded to Premium. Unlimited policies unlocked!",
        });
        // Refresh subscription status immediately
        await checkSubscription();
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      if (!error.handled) {
        toast({
          title: "Payment Failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      }
    }
  };

  // Check subscription when user or session changes
  useEffect(() => {
    if (user && session) {
      checkSubscription();
    } else {
      setSubscriptionStatus({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        loading: false,
      });
    }
  }, [user, session]);

  // Auto-refresh subscription status every 15 seconds when user is logged in
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 15000);

    return () => clearInterval(interval);
  }, [user, session]);

  return {
    subscribed: subscriptionStatus.subscribed,
    subscription_tier: subscriptionStatus.subscription_tier,
    subscription_end: subscriptionStatus.subscription_end,
    loading: subscriptionStatus.loading,
    checkSubscription,
    createRazorpayPayment,
    verifyRazorpayPayment,
  };
};
