
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RazorpayPayment from "./RazorpayPayment";
import { useToast } from "@/hooks/use-toast";

// Razorpay script loading
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
    // Load Razorpay script
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
      const paymentData = await createRazorpayPayment(99, "Premium");
      
      if (paymentData) {
        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "Agent Prime Hub",
          description: "Premium Subscription - Unlimited Policies",
          order_id: paymentData.orderId,
          handler: async function (response: any) {
            console.log('Payment successful:', response);
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
              console.log('Payment cancelled by user');
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
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className={`h-6 w-6 ${subscribed ? 'text-yellow-500' : 'text-gray-400'}`} />
            <CardTitle className="text-xl">
              {subscribed ? 'Premium Plan' : 'Free Plan'}
            </CardTitle>
          </div>
          <CardDescription>
            {subscribed ? 'Unlimited Policies' : 'Up to 50 Policies'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Badge 
              variant={subscribed ? "default" : "secondary"}
              className={`px-4 py-2 text-sm font-medium ${
                subscribed 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {subscribed ? 'ACTIVE' : 'FREE'}
            </Badge>
          </div>

          {subscribed && subscription_end && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Valid until {format(new Date(subscription_end), "PPP")}
                </span>
              </div>
              {subscription_tier && (
                <p className="text-xs text-green-600 mt-1">
                  Current plan: {subscription_tier}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">
                {subscribed ? 'Premium Features:' : 'Upgrade to Premium:'}
              </h4>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  {subscribed ? 'Unlimited Policies' : 'Up to 50 Policies'}
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  {subscribed ? '✓ Unlimited policy management' : 'Upgrade for unlimited policies'}
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  Advanced analytics & reports
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  Priority customer support
                </li>
                <li className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${subscribed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  Email notifications & reminders
                </li>
              </ul>
            </div>

            {!subscribed && (
              <div className="pt-4 border-t">
                <div className="text-center mb-3">
                  <span className="text-2xl font-bold text-blue-600">₹99</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <Button 
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Upgrade to Premium'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-sm w-[95vw] mx-auto">
          <RazorpayPayment
            amount={99}
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
