import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  Check, 
  Zap, 
  Shield, 
  Bell, 
  BarChart3, 
  Users, 
  Sparkles, 
  Loader2,
  Star,
  ArrowRight
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SubscriptionPageRevamped = () => {
  const { subscribed, subscription_tier, subscription_end, loading, checkSubscription } = useSubscription();
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle payment callback
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const error = searchParams.get('error');

    if (paymentStatus === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated. Enjoy unlimited features!",
      });
      checkSubscription();
      setSearchParams({});
    } else if (paymentStatus === 'failed') {
      let errorMessage = "Payment could not be completed. Please try again.";
      if (error === 'cancelled') {
        errorMessage = "Payment was cancelled.";
      } else if (error === 'failure') {
        errorMessage = "Payment failed. Please try with a different payment method.";
      }
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setSearchParams({});
    }
  }, [searchParams]);

  const handleSubscribe = async () => {
    if (!session) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payu-payment', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { 
          planType: 'Pro',
          billingCycle: billingCycle,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.success && data?.paymentUrl && data?.params) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;

        Object.entries(data.params).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error(data?.error || 'Failed to create payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const monthlyPrice = 199;
  const yearlyPrice = 1999;
  const currentPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
  const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(yearlyPrice / 12) : monthlyPrice;
  const savings = billingCycle === 'yearly' ? Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100) : 0;

  const freeFeatures = [
    "Up to 200 Policies",
    "50 OCR Scans/Month",
    "Basic Analytics",
    "2GB Storage",
  ];

  const proFeatures = [
    "Unlimited Policies",
    "Unlimited OCR Scans",
    "Advanced Analytics & Reports",
    "WhatsApp Reminder Automation",
    "10GB Storage",
    "Commission Tracking",
    "Priority Support",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Subscription Banner */}
      {subscribed && subscription_end && (
        <Card className="border-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/30 rounded-full">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Pro Plan Active</h3>
                  <p className="text-sm text-amber-800">
                    Valid until {format(new Date(subscription_end), "dd MMM yyyy")}
                  </p>
                </div>
              </div>
              <Badge className="bg-white/30 text-amber-950 border-0 text-sm">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Premium Member
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Toggle */}
      {!subscribed && (
        <div className="flex justify-center">
          <div className="inline-flex items-center bg-muted rounded-full p-1 shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                Save {savings}%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Free Plan */}
        <Card className={`relative overflow-hidden transition-all duration-300 ${
          !subscribed ? 'ring-2 ring-primary' : 'opacity-75'
        }`}>
          {!subscribed && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary">Current Plan</Badge>
            </div>
          )}
          <CardContent className="p-4 sm:p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground">Free</h3>
              <p className="text-sm text-muted-foreground">Get started with basics</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-muted-foreground ml-2">/forever</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              {!subscribed ? 'Current Plan' : 'Free Plan'}
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative overflow-hidden transition-all duration-300 ${
          subscribed 
            ? 'ring-2 ring-amber-400 shadow-xl' 
            : 'ring-2 ring-primary shadow-xl'
        }`}>
          {/* Recommended Badge */}
          {!subscribed && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-1.5 text-xs font-semibold">
              ⭐ RECOMMENDED
            </div>
          )}
          {subscribed && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-center py-1.5 text-xs font-semibold">
              <Crown className="w-3 h-3 inline mr-1" />
              ACTIVE
            </div>
          )}

          <CardContent className={`p-4 sm:p-6 ${subscribed || !subscribed ? 'pt-10' : ''}`}>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-xl font-bold text-foreground">Pro</h3>
              </div>
              <p className="text-sm text-muted-foreground">For professional agents</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">₹{currentPrice}</span>
                <span className="text-muted-foreground ml-2">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-sm text-green-600 mt-1">
                  Just ₹{monthlyEquivalent}/month • Save ₹{monthlyPrice * 12 - yearlyPrice}/year
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {proFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {!subscribed ? (
              <Button 
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Upgrade Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 hover:from-amber-500 hover:to-yellow-600"
                disabled
              >
                <Crown className="h-4 w-4 mr-2" />
                Pro Active
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground py-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Secure Payments</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span>Instant Activation</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-500" />
          <span>Cancel Anytime</span>
        </div>
      </div>

      {/* Features Comparison */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What's included in Pro?
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Unlimited Policies</p>
                <p className="text-xs text-muted-foreground">Manage any number of policies without restrictions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Unlimited OCR</p>
                <p className="text-xs text-muted-foreground">Extract data from policy documents automatically</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Bell className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">WhatsApp Automation</p>
                <p className="text-xs text-muted-foreground">Send automatic renewal reminders to clients</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Advanced Analytics</p>
                <p className="text-xs text-muted-foreground">Detailed reports and commission tracking</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPageRevamped;
