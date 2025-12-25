
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsConditions = () => {
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
              Terms and Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                <p>
                  By accessing and using Agent Prime Hub, you accept and agree to be bound by the terms 
                  and provision of this agreement.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Use License</h3>
                <p>
                  Permission is granted to temporarily download one copy of Agent Prime Hub per device 
                  for personal, non-commercial transitory viewing only.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained in the application</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Account</h3>
                <p>
                  You are responsible for maintaining the confidentiality of your account and password 
                  and for restricting access to your computer.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Privacy Policy</h3>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs 
                  your use of the Service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Disclaimer</h3>
                <p>
                  The materials on Agent Prime Hub are provided on an 'as is' basis. Agent Prime Hub 
                  makes no warranties, expressed or implied, and hereby disclaims and negates all other 
                  warranties including without limitation, implied warranties or conditions of merchantability, 
                  fitness for a particular purpose, or non-infringement of intellectual property or other 
                  violation of rights.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsConditions;
