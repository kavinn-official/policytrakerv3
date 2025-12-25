
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Shipping = () => {
  return (
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
              Shipping Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Digital Service</h3>
                <p>
                  Agent Prime Hub is a digital insurance management platform. All our services are 
                  delivered electronically, and no physical shipping is required.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instant Access</h3>
                <p>
                  Upon successful payment and account verification, you will receive instant access 
                  to all premium features. No waiting time or shipping delays.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Activation</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Premium features are activated immediately after payment confirmation</li>
                  <li>You will receive an email confirmation of your subscription</li>
                  <li>Access is available across all supported devices</li>
                  <li>No additional downloads or installations required</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Support</h3>
                <p>
                  If you experience any issues accessing your premium features after payment, 
                  please contact our technical support team for immediate assistance.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Shipping;
