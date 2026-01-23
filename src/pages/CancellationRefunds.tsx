import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const CancellationRefunds = () => {
  return (
    <>
      <SEOHead
        title="Cancellation & Refunds - Policy Tracker.in"
        description="Cancellation and refund policy for Policy Tracker.in subscription plans. 7-day money back guarantee. Learn about our refund process."
        canonicalPath="/cancellation-refunds"
        keywords="policy tracker refund, subscription cancellation, money back guarantee"
      />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Cancellation & Refunds Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Subscription Cancellation</h3>
                <p>
                  You can cancel your premium subscription at any time through your account settings. 
                  Upon cancellation, you will continue to have access to premium features until the end 
                  of your current billing period.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Policy</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Refunds are processed within 7-10 business days</li>
                  <li>Full refund available within 24 hours of purchase</li>
                  <li>Partial refunds may be considered on a case-by-case basis</li>
                  <li>No refunds for services already consumed or used</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Request a Refund</h3>
                <p>
                  To request a refund, please contact our support team at policytracker.in@gmail.com 
                  with your order details and reason for the refund request.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Processing Time</h3>
                <p>
                  Refund requests are typically processed within 2-3 business days. 
                  The refunded amount will appear in your original payment method within 7-10 business days.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default CancellationRefunds;
