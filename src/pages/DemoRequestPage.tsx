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
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";
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
      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-slate-200 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-10 pb-10 px-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Demo Request Received!</h2>
            <p className="text-slate-600 mb-8 font-medium">
              Thank you for your interest! Our team will contact you within 24 hours to schedule your personalized demo.
            </p>
            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 h-12 text-base font-semibold">
                  Back to Home
                </Button>
              </Link>
              <a href="https://wa.me/916381615829" target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full h-12 text-base font-semibold border-slate-300 hover:bg-slate-50 text-slate-700">
                  <MessageCircle className="h-5 w-5 mr-2 text-emerald-500" />
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

      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
        <Navigation />

        <main className="flex-grow py-12 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="mb-8 md:mb-12">
              <Link to="/">
                <Button variant="ghost" className="hover:bg-slate-100 text-slate-600 hover:text-slate-900 -ml-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left: Info Section */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                    Request a{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                      Personalized Demo
                    </span>
                  </h1>
                  <p className="mt-6 text-xl text-slate-600 leading-relaxed font-medium">
                    See how PolicyTracker can transform your insurance business with a free, personalized walkthrough.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-5 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-200/50">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Quick 15-Min Demo</h3>
                      <p className="text-base text-slate-600 mt-1">We'll show you the key features tailored to your unique agency needs.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-200/50">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">1,500+ Agents Trust Us</h3>
                      <p className="text-base text-slate-600 mt-1">Join India's fastest growing insurance management platform today.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-200/50">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">No Commitment Required</h3>
                      <p className="text-base text-slate-600 mt-1">Enjoy a free, comprehensive demo with no credit card or signup needed.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-8 sm:p-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Fill in your details</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name <span className="text-rose-500">*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={`h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl ${errors.name ? "border-rose-500 focus:ring-rose-500" : ""}`}
                      />
                      {errors.name && <p className="text-sm text-rose-500 font-medium">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address <span className="text-rose-500">*</span></Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className={`h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl ${errors.email ? "border-rose-500 focus:ring-rose-500" : ""}`}
                      />
                      {errors.email && <p className="text-sm text-rose-500 font-medium">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Mobile Number <span className="text-rose-500">*</span></Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        className={`h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl ${errors.phone ? "border-rose-500 focus:ring-rose-500" : ""}`}
                      />
                      {errors.phone && <p className="text-sm text-rose-500 font-medium">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Agent Type / Company <span className="text-rose-500">*</span></Label>
                      <Select
                        value={formData.companyType}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, companyType: value }));
                          if (errors.companyType) setErrors((prev) => ({ ...prev, companyType: undefined }));
                        }}
                      >
                        <SelectTrigger className={`h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl ${errors.companyType ? "border-rose-500" : ""}`}>
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
                      {errors.companyType && <p className="text-sm text-rose-500 font-medium">{errors.companyType}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold text-slate-700">Message / Requirements <span className="text-slate-400 font-normal">(Optional)</span></Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your specific requirements..."
                        rows={4}
                        className="resize-none border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 rounded-xl text-lg mt-4"
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

                    <p className="text-sm text-center text-slate-500 font-medium pt-2">
                      By submitting, you agree to our{" "}
                      <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 hover:underline">Privacy Policy</Link>.
                      We'll never spam you.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
        <WhatsAppFloatingButton />
      </div>
    </>
  );
};

export default DemoRequestPage;
