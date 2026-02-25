import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Bell,
  Scan,
  Calculator,
  Shield,
  MessageCircle,
  Smartphone,
  ArrowRight,
  TrendingUp,
  Files
} from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-24 sm:py-32 bg-slate-50 relative overflow-hidden" id="features" aria-labelledby="features-heading">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 bg-white text-indigo-700 shadow-sm border border-indigo-100 rounded-full text-sm font-bold tracking-wide mb-6 uppercase">
            Everything You Need
          </span>
          <h2 id="features-heading" className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            A Complete Operating System <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">for Insurance Agents</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Replace your spreadsheets and fragmented tools with one beautifully unified dashboard designed explicitly for scale and automation.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">

          {/* Feature 1: Policy Management (Large spanning 2 columns) */}
          <article className="md:col-span-2 lg:col-span-2 row-span-1 bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-200/60 hover:shadow-lg transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>

            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Files className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Unified Policy Management</h3>
                <p className="text-slate-600 max-w-md font-medium">
                  Organize Motor, Health, Life, and General insurance portfolios centrally. Stop endless searching and access any client's policy in under 2 seconds.
                </p>
              </div>
            </div>
          </article>

          {/* Feature 2: WhatsApp Reminders (Tall spanning 2 rows) */}
          <article className="md:col-span-1 lg:col-span-1 row-span-1 md:row-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-8 sm:p-10 shadow-xl border border-slate-800 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full"></div>

            <div className="flex flex-col h-full relative z-10">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-emerald-500/50">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Automated WhatsApp Reminders</h3>
              <p className="text-slate-300 font-medium mb-auto">
                Send personalized renewal alerts with exactly one click. Boost your retention rates up to 98% with reliable follow-ups.
              </p>

              {/* Fake chat bubble decorative */}
              <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl rounded-tr-sm">
                <p className="text-sm font-medium">Hi Sanjeev, your Car Insurance is due for renewal on 15th...</p>
              </div>
            </div>
          </article>

          {/* Feature 3: OCR PDF Auto-Fill (Standard) */}
          <article className="md:col-span-1 lg:col-span-1 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 hover:shadow-lg transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
              <Scan className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Magic OCR PDF Auto-Fill</h3>
            <p className="text-slate-600 text-sm font-medium">
              Upload PDF documents and watch our AI instantly extract structured data. Save 80% of data entry time.
            </p>
          </article>

          {/* Feature 4: Commission Analytics (Wide spanning 2 columns) */}
          <article className="md:col-span-2 lg:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-slate-200/60 hover:shadow-lg transition-shadow relative overflow-hidden group text-center sm:text-left flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-5 mx-auto sm:mx-0">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Real-time Commission Analytics</h3>
              <p className="text-slate-600 font-medium">
                Track exact earnings down to the rupee. View splits by policy type, carrier, and distinguish between new acquisition vs. renewal commission easily.
              </p>
            </div>
            {/* Visual Decorative Element */}
            <div className="hidden sm:flex bg-slate-50 w-48 h-full rounded-2xl border border-slate-100 items-center justify-center p-4">
              <div className="w-full space-y-3">
                <div className="flex items-end gap-2 h-20 items-end border-b border-slate-200 pb-2">
                  <div className="w-1/3 bg-indigo-200 rounded-t-md h-[40%]"></div>
                  <div className="w-1/3 bg-indigo-400 rounded-t-md h-[70%]"></div>
                  <div className="w-1/3 bg-indigo-600 rounded-t-md h-[100%]"></div>
                </div>
                <div className="text-center text-xs font-bold text-slate-400 uppercase">Growth</div>
              </div>
            </div>
          </article>

          {/* Feature 5: Security (Standard) */}
          <article className="md:col-span-1 lg:col-span-1 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Bank-Grade Security</h3>
            <p className="text-slate-600 text-sm font-medium">
              256-bit SSL encryption and automatic daily cloud backups ensure your client data is never compromised.
            </p>
          </article>

          {/* Feature 6: Mobile Friendly (Standard) */}
          <article className="md:col-span-1 lg:col-span-1 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-5">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Fully Mobile Ready</h3>
            <p className="text-slate-600 text-sm font-medium">
              Access your workspace from anywhere. Installable as a Progressive Web App (PWA) directly to your home screen.
            </p>
          </article>

        </div>

        {/* Feature Highlight CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/features" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 py-6 rounded-2xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold">
                Explore All Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-base sm:text-lg px-8 py-6 rounded-2xl shadow-xl transition-transform hover:-translate-y-1 font-semibold">
                Try Free Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
