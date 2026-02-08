import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Bell, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Add Your Policies",
    description: "Upload policies via PDF (auto-fill with OCR), import from Excel, or add manually. All your motor, health, and life policies in one place.",
    highlight: "Save 80% of data entry time with OCR"
  },
  {
    number: "02",
    icon: Bell,
    title: "Track Renewals & Send Reminders",
    description: "Get automatic alerts before policy expiry. Send WhatsApp reminders to clients with one click. Never miss a renewal again.",
    highlight: "25% increase in renewal rate"
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Analyze commissions, track portfolio growth, generate reports, and identify opportunities. Make data-driven decisions.",
    highlight: "Complete business visibility"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-white" id="how-it-works" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
            Simple 3-Step Process
          </span>
          <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How PolicyTracker Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From policy chaos to organized business growth in 3 simple steps. 
            Start managing your insurance business professionally today.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-200 via-teal-200 to-emerald-200 -translate-y-1/2 z-0" />
          
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-6 left-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.number}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl flex items-center justify-center mt-4 mb-6">
                    <step.icon className="h-8 w-8 text-teal-600" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                  
                  {/* Highlight */}
                  <div className="flex items-center gap-2 text-teal-600 font-medium">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm">{step.highlight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Ready to streamline your insurance business?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-10 shadow-lg">
                Start Free - Takes 2 Minutes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-lg px-10">
                See It In Action
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
