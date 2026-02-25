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
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-sm mb-4 border border-indigo-100/50">
            Simple 3-Step Process
          </span>
          <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            How PolicyTracker Works
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            From policy chaos to organized business growth in 3 simple steps.
            Start managing your insurance business professionally today.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (desktop) */}
          <div className="hidden md:block absolute top-[100px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="relative group h-full flex flex-col">
                {/* Step Connector Dot (desktop) */}
                <div className="hidden md:block absolute top-[28px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-indigo-500 z-20 group-hover:scale-150 group-hover:bg-indigo-50 transition-all duration-300" />

                <div className="relative mt-12 md:mt-20 flex-grow flex flex-col">
                  {/* Step Number Badge */}
                  <div className="absolute -top-6 left-8 z-20">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-slate-900/20 group-hover:-translate-y-1 transition-transform border border-slate-800">
                      {step.number}
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] p-8 pt-10 shadow-sm border border-slate-200/60 hover:shadow-xl transition-all duration-300 relative overflow-hidden flex-grow flex flex-col">
                    {/* Subtle Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Icon */}
                    <div className="w-14 h-14 bg-indigo-50 border border-indigo-100/50 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all mb-6">
                      <step.icon className="h-6 w-6 text-indigo-600" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed text-sm flex-grow">{step.description}</p>

                    {/* Highlight */}
                    <div className="flex items-center gap-2 text-indigo-600 font-medium bg-indigo-50/50 p-3 rounded-lg border border-indigo-50 mt-auto">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span className="text-xs tracking-wide">{step.highlight}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-slate-600 mb-6 text-lg">
            Ready to streamline your insurance business?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg text-base px-10 h-12">
                Start Free - Takes 2 Minutes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-base px-10 h-12 border-slate-200 text-slate-700 hover:bg-slate-50">
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
