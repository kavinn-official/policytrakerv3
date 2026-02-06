import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Send, CheckCircle, Calendar, Users, FileText, Bell, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

const DemoRequestPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    agencySize: "",
    insuranceTypes: [] as string[],
    currentMethod: "",
    challenges: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const insuranceTypeOptions = [
    "Motor Insurance",
    "Health Insurance",
    "Life Insurance",
    "Commercial Insurance",
    "Other Insurance",
  ];

  const challengeOptions = [
    "Tracking policy renewals",
    "Sending reminders to clients",
    "Managing client information",
    "Generating reports",
    "Bulk policy import",
    "Mobile access",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field: "insuranceTypes" | "challenges", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send demo request email
      const { error } = await supabase.functions.invoke("send-enquiry-email", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: "Demo Request - Policy Tracker",
          message: `
Demo Request Details:
- Agency Size: ${formData.agencySize}
- Insurance Types: ${formData.insuranceTypes.join(", ") || "Not specified"}
- Current Method: ${formData.currentMethod}
- Key Challenges: ${formData.challenges.join(", ") || "Not specified"}
          `.trim(),
        },
      });

      if (error) throw error;

      // Send WhatsApp notification
      try {
        await supabase.functions.invoke("send-whatsapp-notification", {
          body: {
            type: "enquiry",
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: "Demo Request",
            message: `Agency Size: ${formData.agencySize}, Insurance: ${formData.insuranceTypes.join(", ")}`,
          },
        });
      } catch (notifyError) {
        console.error("WhatsApp notification failed:", notifyError);
      }

      setIsSubmitted(true);
      toast.success("Your demo request has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast.error("Failed to submit demo request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo Request Received!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest! Our team will contact you within 24 hours to schedule your personalized demo.
            </p>
            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  Back to Home
                </Button>
              </Link>
              <a href="https://wa.me/916381615829" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full mt-2">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
        <WhatsAppFloatingButton />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Request a Demo - Agent Policy Tracker | See It In Action"
        description="Schedule a personalized demo of Policy Tracker.in. See how our insurance policy management software can help you manage policies, send reminders, and grow your business."
        canonicalPath="/demo-request"
        keywords="policy tracker demo, insurance software demo, agent policy tracker trial"
      />
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-3">
                <img src={logo} alt="Policy Tracker" className="w-10 h-10" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Policy Tracker.in</h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Insurance Management</p>
                </div>
              </Link>
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Request a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">Personalized Demo</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Answer a few quick questions and we'll show you how Policy Tracker can transform your insurance business.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= stepNum
                        ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 mx-2 transition-colors ${step > stepNum ? "bg-teal-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "About your business"}
                {step === 3 && "Your needs"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "We'll use this to contact you for the demo"}
                {step === 2 && "Help us understand your insurance business"}
                {step === 3 && "What challenges can we help you solve?"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Step 1: Contact Info */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Business Info */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>How many policies do you manage?</Label>
                      <RadioGroup
                        value={formData.agencySize}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, agencySize: value }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1-50" id="size-1" />
                          <Label htmlFor="size-1" className="font-normal">1-50 policies</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="51-200" id="size-2" />
                          <Label htmlFor="size-2" className="font-normal">51-200 policies</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="201-500" id="size-3" />
                          <Label htmlFor="size-3" className="font-normal">201-500 policies</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="500+" id="size-4" />
                          <Label htmlFor="size-4" className="font-normal">500+ policies</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>Which insurance types do you handle?</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {insuranceTypeOptions.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={type}
                              checked={formData.insuranceTypes.includes(type)}
                              onCheckedChange={() => handleCheckboxChange("insuranceTypes", type)}
                            />
                            <Label htmlFor={type} className="font-normal">{type}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Needs */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>How do you currently track policies?</Label>
                      <RadioGroup
                        value={formData.currentMethod}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, currentMethod: value }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Excel/Spreadsheet" id="method-1" />
                          <Label htmlFor="method-1" className="font-normal">Excel/Spreadsheet</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Paper/Diary" id="method-2" />
                          <Label htmlFor="method-2" className="font-normal">Paper/Diary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Other Software" id="method-3" />
                          <Label htmlFor="method-3" className="font-normal">Other Software</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No system yet" id="method-4" />
                          <Label htmlFor="method-4" className="font-normal">No system yet</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label>What are your key challenges? (Select all that apply)</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {challengeOptions.map((challenge) => (
                          <div key={challenge} className="flex items-center space-x-2">
                            <Checkbox
                              id={challenge}
                              checked={formData.challenges.includes(challenge)}
                              onCheckedChange={() => handleCheckboxChange("challenges", challenge)}
                            />
                            <Label htmlFor={challenge} className="font-normal">{challenge}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  ) : (
                    <div />
                  )}
                  
                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                      disabled={
                        (step === 1 && (!formData.name || !formData.email || !formData.phone))
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Demo Request
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Setup</h3>
              <p className="text-sm text-gray-600">Get started in minutes, not hours</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalized Demo</h3>
              <p className="text-sm text-gray-600">Tailored to your business needs</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">24hr Response</h3>
              <p className="text-sm text-gray-600">Our team will reach out quickly</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm">© 2025 policytracker.in. All rights reserved.</p>
          </div>
        </footer>

        <WhatsAppFloatingButton />
      </div>
    </>
  );
};

export default DemoRequestPage;