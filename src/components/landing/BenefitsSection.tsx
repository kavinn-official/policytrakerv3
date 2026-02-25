import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  BarChart3,
  FolderOpen,
  MessageCircle,
  Upload,
  FileSpreadsheet,
  Shield,
  Scan,
  ArrowRight,
  RefreshCw,
  TrendingUp
} from "lucide-react";

const benefits = [
  {
    icon: RefreshCw,
    title: "Automated Renewal Tracking",
    description: "Never miss a policy renewal again. Get alerts 30, 15, and 7 days before expiry. Achieve 98% renewal rate.",
    stat: "98%",
    statLabel: "Renewal Rate"
  },
  {
    icon: BarChart3,
    title: "Commission Analytics",
    description: "Track first-year and renewal commissions. Know exactly how much you're earning from each policy and company.",
    stat: "₹2L+",
    statLabel: "Avg. Commission Tracked"
  },
  {
    icon: FolderOpen,
    title: "Secure Document Storage",
    description: "Store all policy documents in the cloud. Access PDFs, images, and files from anywhere, anytime.",
    stat: "10GB",
    statLabel: "Storage Space"
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Reminders",
    description: "Send personalized renewal reminders to clients via WhatsApp with one click. Keep clients engaged.",
    stat: "1-Click",
    statLabel: "Client Communication"
  },
  {
    icon: Upload,
    title: "Bulk Policy Upload",
    description: "Import hundreds of policies from Excel or CSV files. Migrate your existing data in minutes.",
    stat: "80%",
    statLabel: "Time Saved"
  },
  {
    icon: Scan,
    title: "OCR PDF Auto-Fill",
    description: "Upload policy PDFs and let AI extract details automatically. Reduce manual data entry by 80%.",
    stat: "AI",
    statLabel: "Powered"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50" id="benefits" aria-labelledby="benefits-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-4">
            Why Choose PolicyTracker?
          </span>
          <h2 id="benefits-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Grow Your Insurance Business Faster
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stop wasting time on spreadsheets and manual tracking.
            PolicyTracker automates your workflow so you can focus on what matters — selling and servicing policies.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all duration-300">
                    <benefit.icon className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{benefit.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">{benefit.stat}</span>
                      <span className="text-sm text-slate-500">{benefit.statLabel}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ROI Calculator Teaser */}
        <div className="mt-16 bg-white overflow-hidden rounded-[2rem] p-8 sm:p-12 shadow-sm border border-slate-200/60 relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                Calculate Your Time Savings
              </h3>
              <p className="text-slate-600 mb-6 text-lg">
                Insurance agents save an average of <strong className="text-slate-900">5 hours per week</strong> using PolicyTracker.
                That's 20+ hours a month you can spend on growing your business.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-4 text-slate-700">
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="font-medium">Save 30 minutes per policy with OCR auto-fill</span>
                </li>
                <li className="flex items-center gap-4 text-slate-700">
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="font-medium">Reduce renewal follow-ups by 80%</span>
                </li>
                <li className="flex items-center gap-4 text-slate-700">
                  <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="font-medium">Generate reports in seconds, not hours</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-md text-base px-8">
                  Start Saving Time Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Dark premium stat block */}
            <div className="bg-slate-900 rounded-2xl p-8 text-center shadow-xl border border-slate-800 relative overflow-hidden group">
              {/* Gradient Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative">
                <div className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-blue-400 mb-2 font-mono">
                  5+
                </div>
                <div className="text-xl text-slate-300 font-medium mb-8">Hours Saved Weekly</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-white font-mono">20+</div>
                    <div className="text-slate-400 mt-1">Hours/Month</div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-white font-mono">240+</div>
                    <div className="text-slate-400 mt-1">Hours/Year</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
