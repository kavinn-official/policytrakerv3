import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600" aria-labelledby="cta-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
          <Zap className="h-4 w-4" />
          Start Free Today - No Credit Card Required
        </div>

        {/* Heading */}
        <h2 id="cta-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Get Free Policy Reminder Setup — Start Tracking Today
        </h2>
        
        <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
          Join 1,500+ insurance agents who've streamlined their workflow 
          and increased renewals by 25%. Talk to an insurance expert now.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-cyan-200" />
            <span>Free Forever Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-cyan-200" />
            <span>2-Minute Setup</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-cyan-200" />
            <span>WhatsApp Reminders</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-cyan-200" />
            <span>OCR PDF Auto-Fill</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto bg-white text-teal-700 hover:bg-gray-100 text-lg px-10 py-7 shadow-xl">
              Start Tracking Your Policies Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/enquiry">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white bg-white/10 text-white hover:bg-white hover:text-teal-700 text-lg px-10 py-7 backdrop-blur-sm">
              Talk to an Expert
            </Button>
          </Link>
        </div>

        {/* Trust Note */}
        <p className="mt-8 text-cyan-100 text-sm">
          Trusted by agents from LIC, HDFC, ICICI, Bajaj, and 50+ insurance companies
        </p>
      </div>
    </section>
  );
};

export default CTASection;
