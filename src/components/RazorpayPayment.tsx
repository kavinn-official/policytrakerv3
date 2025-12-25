
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RazorpayPaymentProps {
  amount: number;
  planType: string;
  onPaymentInitiated: () => void;
  onCancel: () => void;
}

const RazorpayPayment = ({
  amount,
  planType,
  onPaymentInitiated,
  onCancel
}: RazorpayPaymentProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Check for payment status in URL params when component mounts
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated successfully",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
      toast({
        title: "Payment Failed",
        description: "Your payment was not successful. Please try again.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handlePayment = () => {
    onPaymentInitiated();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl">Razorpay Payment</CardTitle>
        </div>
        <CardDescription>
          Secure payment powered by Razorpay
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Plan:</span>
              <span className="font-medium">{planType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Duration:</span>
              <span className="font-medium">1 Month</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-bold text-blue-600">₹{amount}</span>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            Secure Payment Features
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>PCI DSS compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>No card details stored</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 text-base"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ₹{amount} with Razorpay
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </div>

        {/* Payment Methods Info */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">
            Supports UPI, Credit/Debit Cards, Net Banking, and Wallets
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RazorpayPayment;
