import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard, Check, Zap, Shield, Bell, BarChart3, Users, Sparkles, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SubscriptionCard = () => {
  const { subscribed, subscription_tier, subscription_end, loading, checkSubscription } = useSubscription();
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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
      // Clear search params
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
        // Create and submit PayU form
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-8">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-3/4"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const freeFeatures = [
    { icon: Users, text: "Up to 200 Policies" },
    { icon: Sparkles, text: "50 OCR Scans/Month" },
    { icon: BarChart3, text: "Basic Analytics" },
    { icon: Shield, text: "2GB Storage" },
  ];

  const premiumFeatures = [
    { icon: Zap, text: "Unlimited Policies", highlight: true },
    { icon: Sparkles, text: "Unlimited OCR Scans", highlight: true },
    { icon: BarChart3, text: "Advanced Analytics & Reports" },
    { icon: Bell, text: "WhatsApp Reminder Automation" },
    { icon: Shield, text: "10GB Storage" },
    { icon: Users, text: "Commission Tracking & Forecasting" },
  ];

  const monthlyPrice = 199;
  const yearlyPrice = 1999;
  const currentPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
  const savings = billingCycle === 'yearly' ? Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 mb-4">
          Select the perfect plan for your insurance management needs
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            {savings > 0 && (
              <span className="ml-1 text-xs text-green-600 font-semibold">
                Save {savings}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Current Plan Badge */}
      {subscribed && subscription_end && (
        <div className="mb-6 flex justify-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-6 py-3 inline-flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-left">
              <p className="text-sm font-medium text-green-800">Pro Plan Active</p>
              <p className="text-xs text-green-600">
                Valid until {format(new Date(subscription_end), "PPP")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${!subscribed ? 'ring-2 ring-blue-500' : ''}`}>
          {!subscribed && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Current Plan
              </Badge>
            </div>
          )}
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Free</h3>
              <p className="text-sm text-gray-500">Perfect for getting started</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">₹0</span>
                <span className="text-gray-500">/forever</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">{feature.text}</span>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12"
              disabled
            >
              {!subscribed ? 'Current Plan' : 'Free Plan'}
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${subscribed ? 'ring-2 ring-yellow-500' : 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/10'}`}>
          {/* Popular Badge */}
          {!subscribed && (
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-bl-lg">
                RECOMMENDED
              </div>
            </div>
          )}
          {subscribed && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          )}

          <CardContent className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
              </div>
              <p className="text-sm text-gray-500">For professional agents</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">₹{currentPrice}</span>
                <span className="text-gray-500">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-green-600 mt-1">
                  ₹{Math.round(yearlyPrice / 12)}/month • Save ₹{monthlyPrice * 12 - yearlyPrice}/year
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    feature.highlight 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                      : 'bg-blue-100'
                  }`}>
                    <Check className={`w-3 h-3 ${feature.highlight ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <span className={`text-sm ${feature.highlight ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {!subscribed ? (
              <Button 
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="w-full h-12 border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
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
      <div className="mt-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Secure Payments via PayU</span>
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
      </div>
    </div>
  );
};

export default SubscriptionCard;
