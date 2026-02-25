import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Mail, Phone, CheckCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

const EnquiryPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send enquiry email
      const { error } = await supabase.functions.invoke("send-enquiry-email", {
        body: formData,
      });

      if (error) throw error;

      // Send WhatsApp notification for enquiry
      try {
        await supabase.functions.invoke("send-whatsapp-notification", {
          body: {
            type: "enquiry",
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
          },
        });
      } catch (notifyError) {
        // Don't fail enquiry if notification fails
        console.error("WhatsApp notification failed:", notifyError);
      }

      setIsSubmitted(true);
      toast.success("Your enquiry has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error("Failed to submit enquiry. Please try again or contact us directly.");
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
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
              Thank You!
            </h2>
            <p className="text-slate-600 mb-8 font-medium">
              Your enquiry has been submitted successfully. Our team will get back to you within 24 hours.
            </p>
            <div className="space-y-3">
              <Link to="/">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 h-12 text-base font-semibold">
                  Back to Home
                </Button>
              </Link>
              <a
                href="https://wa.me/916381615829"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
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
        title="Contact Us - Agent Policy Tracker | Get Support & Enquiries"
        description="Have questions about Policy Tracker.in? Contact our support team via email, phone, or WhatsApp. We respond within 24 hours. Best support for insurance agents in India."
        canonicalPath="/enquiry"
        keywords="policy tracker contact, insurance software support, agent policy tracker enquiry, customer support India"
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
              {/* Left: Contact Info */}
              <div className="space-y-10">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
                    Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Touch</span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed font-medium">
                    We're here to help you manage your insurance policies more efficiently.
                    Reach out to us through any of the following channels.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-5 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-200/50">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Email Us</h3>
                      <a
                        href="mailto:policytracker.in@gmail.com"
                        className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium text-lg block mt-1"
                      >
                        policytracker.in@gmail.com
                      </a>
                      <p className="text-sm text-slate-500 mt-1 font-medium">We respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-200/50">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Call Us</h3>
                      <a
                        href="tel:+916381615829"
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-lg block mt-1"
                      >
                        +91 6381615829
                      </a>
                      <p className="text-sm text-slate-500 mt-1 font-medium">Mon-Fri, 9 AM - 6 PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5 p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-200/50">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">WhatsApp</h3>
                      <a
                        href="https://wa.me/916381615829"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium text-lg block mt-1"
                      >
                        Chat with us
                      </a>
                      <p className="text-sm text-slate-500 mt-1 font-medium">Quick responses via WhatsApp</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/40 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <h3 className="font-bold text-indigo-900 mb-4 text-lg">Why Choose Policy Tracker.in?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center text-slate-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                      Free to get started - no credit card required
                    </li>
                    <li className="flex items-center text-slate-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                      WhatsApp reminders for policy renewals
                    </li>
                    <li className="flex items-center text-slate-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                      Excel reports for easy client management
                    </li>
                    <li className="flex items-center text-slate-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                      Trusted by 1000+ insurance agents
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Enquiry Form */}
              <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6 pt-8 px-8">
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Send Us an Enquiry
                  </CardTitle>
                  <CardDescription className="text-base text-slate-500 mt-2">
                    Have questions about Policy Tracker.in? Fill out the form below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name <span className="text-rose-500">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                          className="h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number <span className="text-rose-500">*</span></Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          required
                          className="h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address <span className="text-rose-500">*</span></Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject <span className="text-rose-500">*</span></Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What's your enquiry about?"
                        required
                        className="h-12 border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold text-slate-700">Message <span className="text-rose-500">*</span></Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your requirements..."
                        rows={5}
                        required
                        className="resize-none border-slate-200 bg-white focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 rounded-xl text-lg mt-4"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Submit Enquiry
                        </>
                      )}
                    </Button>
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

export default EnquiryPage;
