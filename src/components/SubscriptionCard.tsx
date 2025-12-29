import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard, Check, Zap, Shield, Bell, BarChart3, Users, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RazorpayPayment from "./RazorpayPayment";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SubscriptionCard = () => {
  const { subscribed, subscription_tier, subscription_end, loading, createRazorpayPayment, verifyRazorpayPayment } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async () => {
    setPaymentDialog(true);
  };

  const handlePaymentInitiated = async () => {
    setIsProcessing(true);
    setPaymentDialog(false);
    
    try {
      const paymentData = await createRazorpayPayment(199, "Premium");
      
      if (paymentData) {
        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "Policy Tracker",
          description: "Premium Subscription - Unlimited Policies",
          order_id: paymentData.orderId,
          handler: async function (response: any) {
            try {
              await verifyRazorpayPayment(response);
            } catch (error) {
              console.error('Verification failed:', error);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: "Customer",
            email: "customer@example.com"
          },
          theme: {
            color: "#3B82F6"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
              toast({
                title: "Payment Cancelled",
                description: "You can upgrade to Premium anytime from this page.",
                variant: "destructive",
              });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setIsProcessing(false);
        toast({
          title: "Payment Initialization Failed",
          description: "Unable to start payment process. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentCancel = () => {
    setPaymentDialog(false);
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
    { icon: Users, text: "Up to 50 Policies" },
    { icon: BarChart3, text: "Basic Dashboard" },
    { icon: Shield, text: "Secure Data Storage" },
  ];

  const premiumFeatures = [
    { icon: Zap, text: "Unlimited Policies", highlight: true },
    { icon: BarChart3, text: "Advanced Analytics & Reports" },
    { icon: Bell, text: "Email Notifications & Reminders" },
    { icon: Shield, text: "Priority Customer Support" },
    { icon: Sparkles, text: "Smart PDF Auto-Fill" },
  ];

  return (
    <>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h2>
          <p className="text-gray-600">
            Select the perfect plan for your insurance management needs
          </p>
        </div>

        {/* Current Plan Badge */}
        {subscribed && subscription_end && (
          <div className="mb-6 flex justify-center">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-6 py-3 inline-flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-left">
                <p className="text-sm font-medium text-green-800">Premium Active</p>
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

          {/* Premium Plan */}
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
                  <h3 className="text-xl font-semibold text-gray-900">Premium</h3>
                </div>
                <p className="text-sm text-gray-500">For professional agents</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">₹199</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-xs text-green-600 mt-1">Best value for professional agents</p>
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
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Upgrade Now'}
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full h-12 border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  disabled
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Premium Active
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
        </div>
      </div>

      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-sm w-[95vw] mx-auto">
          <RazorpayPayment
            amount={199}
            planType="Premium"
            onPaymentInitiated={handlePaymentInitiated}
            onCancel={handlePaymentCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionCard;
