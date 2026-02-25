import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star, Users, ShieldCheck, Zap, TrendingUp, Presentation } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50 font-sans" aria-labelledby="hero-heading">

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center border-0">

          {/* Left Column - Content */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-slate-200/60 shadow-sm text-slate-800 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-8 animate-fade-in hover:shadow-md transition-shadow">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse mr-1"></span>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>Ranked #1 Insurance CRM in India</span>
            </div>

            {/* Main Headline - H1 for SEO/GEO */}
            <h1 id="hero-heading" className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
              The Ultimate <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 animate-gradient-x">
                Agent Workspace
              </span>
            </h1>

            {/* Value Proposition - AEO optimized */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8 font-medium">
              Transform your insurance business with the smartest platform built for Indian agents.
              Automate WhatsApp renewals, track commissions instantly, and manage Motor, Health, & Life policies—<strong className="text-slate-900 font-semibold">all from one unified dashboard.</strong>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start mb-10">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-base sm:text-lg px-8 py-7 rounded-2xl shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 group border border-slate-700 font-semibold">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/demo-request" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-8 py-7 rounded-2xl border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 bg-white/50 backdrop-blur-sm text-slate-700 transition-all font-semibold">
                  <Presentation className="mr-2 h-5 w-5 text-indigo-500" />
                  See it in Action
                </Button>
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center lg:justify-start text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>2-Min Setup</span>
              </div>
            </div>
          </div>

          {/* Right Column - Premium Visual Simulation */}
          <div className="relative w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 xl:ml-10">
            {/* Core Mockup Container */}
            <div className="relative z-10 bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 lg:p-8 transform transition-transform hover:scale-[1.02] duration-500">

              {/* Fake Browser Header */}
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Live Dashboard
                </div>
              </div>

              {/* Premium Dashboard Stats Grid */}
              <div className="grid grid-cols-2 gap-4 lg:gap-5 mb-8">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-[100%] transition-transform group-hover:scale-150 duration-500"></div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-slate-800 font-sans tracking-tight mb-1">847</div>
                  <div className="text-sm font-medium text-slate-500">Active Policies</div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 border border-indigo-400/30 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20 group">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                  <div className="absolute top-0 right-0 p-3 opacity-50"><TrendingUp className="w-8 h-8" /></div>
                  <div className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-1 relative z-10">₹1.2L</div>
                  <div className="text-sm font-medium text-indigo-100 relative z-10">Monthly Comm.</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-slate-800">24</div>
                    <div className="p-1.5 bg-rose-100 rounded-lg"><Zap className="w-4 h-4 text-rose-600" /></div>
                  </div>
                  <div className="text-sm font-medium text-slate-500">Due This Week</div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-slate-800">98%</div>
                    <div className="p-1.5 bg-emerald-100 rounded-lg"><ShieldCheck className="w-4 h-4 text-emerald-600" /></div>
                  </div>
                  <div className="text-sm font-medium text-slate-500">Renewal Rate</div>
                </div>
              </div>

              {/* Fake Recent Activity List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">SK</div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Sanjay Kumar</div>
                      <div className="text-xs font-medium text-slate-500">Motor • MH12AB1234</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Renewed</div>
                    <div className="text-xs font-medium text-slate-400">Just now</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-6 -right-6 lg:-right-10 z-20 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-4 border border-white animate-[bounce_6s_infinite]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-inner">
                  <img src="https://cdn-icons-png.flaticon.com/512/3670/3670051.png" alt="WhatsApp" className="w-7 h-7 filter brightness-0 invert" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Reminder Sent</div>
                  <div className="text-xs font-medium text-slate-500">To 45 clients today</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-6 lg:-left-12 z-20 bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1 2)] p-4 border border-slate-700 animate-[bounce_7s_infinite_0.5s]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Client Portfolio</div>
                  <div className="text-xs font-medium text-slate-400">+12 this month</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
