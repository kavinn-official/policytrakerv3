import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Heart, Shield, Building2, ArrowRight, CheckCircle } from "lucide-react";

const insuranceTypes = [
  {
    id: "motor",
    icon: Car,
    title: "Motor Insurance Agents",
    subtitle: "Two-wheeler, Car, Commercial Vehicle",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    painPoints: [
      "Tracking hundreds of vehicle policies manually",
      "Missing renewal dates and losing customers",
      "No visibility into commission earnings",
      "Difficulty managing RC and policy documents"
    ],
    solutions: [
      "Auto-track all motor policies with vehicle details",
      "WhatsApp reminders 30, 15, 7 days before expiry",
      "Commission calculator for each policy",
      "OCR to auto-fill from policy PDFs"
    ],
    keywords: "motor insurance agent software, vehicle policy tracker, car insurance renewal reminder"
  },
  {
    id: "health",
    icon: Heart,
    title: "Health Insurance Agents",
    subtitle: "Individual, Family Floater, Group Health",
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50",
    iconColor: "text-rose-600",
    painPoints: [
      "Managing family floater policies for multiple members",
      "Tracking sum insured and coverage details",
      "Remembering policy anniversaries",
      "No organized way to manage health portfolios"
    ],
    solutions: [
      "Track members covered and sum insured",
      "Anniversary reminders for policy renewals",
      "Health portfolio analytics dashboard",
      "Bulk upload from insurance company reports"
    ],
    keywords: "health insurance agent CRM, health policy management, family floater tracker"
  },
  {
    id: "life",
    icon: Shield,
    title: "Life Insurance Agents",
    subtitle: "Term, ULIP, Endowment, Whole Life",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    painPoints: [
      "Tracking premium payment schedules",
      "Managing long policy terms (20-30 years)",
      "Calculating first year vs renewal commissions",
      "No visibility into policy maturity dates"
    ],
    solutions: [
      "Track sum assured and policy term",
      "Premium due date reminders",
      "Commission tracking for FY and renewal",
      "Long-term policy portfolio management"
    ],
    keywords: "life insurance agent software, LIC policy tracker, term insurance management"
  },
  {
    id: "general",
    icon: Building2,
    title: "General Insurance Agents",
    subtitle: "Fire, Marine, Liability, Property",
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    painPoints: [
      "Managing diverse policy types",
      "Tracking commercial insurance renewals",
      "No centralized business insurance database",
      "Complex commission structures"
    ],
    solutions: [
      "Flexible policy fields for any insurance type",
      "Custom categorization and tagging",
      "Business portfolio reports",
      "Multi-product commission analytics"
    ],
    keywords: "general insurance software, commercial policy tracker, business insurance CRM"
  }
];

const InsuranceTypesSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-white" id="insurance-types" aria-labelledby="insurance-types-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - SEO optimized */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-sm mb-4 border border-indigo-100/50">
            For Every Insurance Professional
          </span>
          <h2 id="insurance-types-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Built for All Types of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Insurance Agents</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Whether you sell motor, health, life, or general insurance — PolicyTracker.in adapts to your workflow.
            One platform for your entire insurance business.
          </p>
        </div>

        {/* Insurance Type Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {insuranceTypes.map((type) => (
            <Card key={type.id} className="overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white relative">
              <CardContent className="p-0">
                {/* Header with Darker Subtle Gradient */}
                <div className={`bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden`}>
                  {/* Abstract Shape Background */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${type.color} rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3`} />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <type.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{type.title}</h3>
                      <p className="text-slate-300 text-sm mt-0.5">{type.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    {/* Pain Points */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        Common Challenges
                      </h4>
                      <ul className="space-y-3">
                        {type.painPoints.map((pain, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                            <span className="text-slate-300 mt-0.5 mt-1 block h-4 w-4 shrink-0 text-center text-lg leading-none">×</span>
                            {pain}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Solutions */}
                    <div>
                      <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Our Solution
                      </h4>
                      <ul className="space-y-3">
                        {type.solutions.map((solution, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium leading-relaxed">
                            <CheckCircle className={`h-4 w-4 ${type.iconColor} mt-0.5 flex-shrink-0`} />
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <Link to="/auth">
                      <Button
                        variant="outline"
                        className={`w-full group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 border-slate-200 shadow-sm`}
                      >
                        Start Managing {type.title.split(' ')[0]} Policies
                        <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-6 text-lg">
            Manage multiple insurance types? PolicyTracker handles it all in one powerful platform.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg text-base px-8 h-12">
              Start Free Multi-Product Tracking
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InsuranceTypesSection;
