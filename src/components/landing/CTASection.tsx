import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-slate-900" aria-labelledby="cta-heading">
      <div className="absolute inset-0 bg-slate-900 overflow-hidden z-0">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,_#4f46e5_0%,_transparent_50%)] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_100%,_#3b82f6_0%,_transparent_50%)] opacity-20 pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-md shadow-sm">
          <Zap className="h-4 w-4" />
          Start Free Today - No Credit Card Required
        </div>

        {/* Heading */}
        <h2 id="cta-heading" className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
          Get Free Policy Reminder Setup
        </h2>

        <p className="text-xl sm:text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Join 1,500+ insurance agents who've streamlined their workflow
          and <span className="text-white font-semibold">increased renewals by 25%</span>. Talk to an expert now.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12 text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-indigo-400" />
            <span className="font-medium">Free Forever Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-indigo-400" />
            <span className="font-medium">2-Minute Setup</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-indigo-400" />
            <span className="font-medium">WhatsApp Reminders</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-indigo-400" />
            <span className="font-medium">OCR PDF Auto-Fill</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 text-lg px-10 h-14 shadow-2xl shadow-indigo-500/20 transition-all font-semibold">
              Start Tracking Your Policies Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/enquiry">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 hover:border-slate-600 text-lg px-10 h-14 backdrop-blur-md transition-all">
              Talk to an Expert
            </Button>
          </Link>
        </div>

        {/* Trust Note */}
        <p className="mt-12 text-slate-400 text-sm">
          Trusted by agents from LIC, HDFC, ICICI, Bajaj, and 50+ insurance companies
        </p>
      </div>
    </section>
  );
};

export default CTASection;
