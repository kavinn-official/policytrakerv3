import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, CheckCircle, MessageCircle, Loader2, Shield, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import { z } from "zod";

const demoRequestSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().min(10, "Please enter a valid 10-digit phone number").max(15),
  companyType: z.string().min(1, "Please select your agent type"),
  message: z.string().max(1000).optional(),
});

type DemoFormData = z.infer<typeof demoRequestSchema>;

const DemoRequestPage = () => {
  const [formData, setFormData] = useState<DemoFormData>({
    name: "",
    email: "",
    phone: "",
    companyType: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DemoFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof DemoFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = demoRequestSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DemoFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof DemoFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to database
      const { error: dbError } = await supabase
        .from("demo_requests")
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company_type: formData.companyType,
          status: "new",
        } as any);

      if (dbError) {
        console.error("DB error:", dbError);
      }

      // Send email notification to admin
      const { error: emailError } = await supabase.functions.invoke("send-enquiry-email", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: "New Demo Request - PolicyTracker.in",
          message: `Agent Type: ${formData.companyType}\n\nMessage: ${formData.message || "No additional message"}`,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
      }

      setIsSubmitted(true);
      toast.success("Demo request submitted successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-xl border-0">
          <CardContent className="pt-10 pb-10 px-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Demo Request Received!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for your interest! Our team will contact you within 24 hours to schedule your personalized demo.
            </p>
            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 h-12">
                  Back to Home
                </Button>
              </Link>
              <a href="https://wa.me/916381615829" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full mt-2 h-12">
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
        title="Request a Demo - PolicyTracker.in | See It In Action"
        description="Schedule a personalized demo of PolicyTracker.in. See how our insurance policy management software can help you manage policies and grow your business."
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
                  <h1 className="text-xl font-bold text-gray-900">PolicyTracker.in</h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Insurance Management</p>
                </div>
              </Link>
              <div className="flex items-center space-x-3">
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

        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Info Section */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  Request a{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
                    Personalized Demo
                  </span>
                </h1>
                <p className="mt-4 text-lg text-gray-600">
                  See how PolicyTracker can transform your insurance business with a free, personalized walkthrough.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick 15-Min Demo</h3>
                    <p className="text-sm text-gray-600">We'll show you the key features tailored to your needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">1,500+ Agents Trust Us</h3>
                    <p className="text-sm text-gray-600">Join India's fastest growing insurance management platform</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">No Commitment Required</h3>
                    <p className="text-sm text-gray-600">Free demo with no credit card or signup needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Fill in your details</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`h-11 ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className={`h-11 ${errors.phone ? "border-red-500" : ""}`}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Agent Type / Company <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.companyType}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, companyType: value }));
                        if (errors.companyType) setErrors((prev) => ({ ...prev, companyType: undefined }));
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.companyType ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select your type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual Agent">Individual Agent</SelectItem>
                        <SelectItem value="Insurance Agency">Insurance Agency</SelectItem>
                        <SelectItem value="Broker">Insurance Broker</SelectItem>
                        <SelectItem value="Corporate Agent">Corporate Agent</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.companyType && <p className="text-sm text-red-500">{errors.companyType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message / Requirements <span className="text-gray-400">(Optional)</span></Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your specific requirements..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-base font-semibold shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Demo Request
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    By submitting, you agree to our{" "}
                    <Link to="/privacy" className="text-cyan-600 hover:underline">Privacy Policy</Link>.
                    We'll never spam you.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <WhatsAppFloatingButton />
      </div>
    </>
  );
};

export default DemoRequestPage;
