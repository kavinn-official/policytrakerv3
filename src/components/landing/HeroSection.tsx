import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Play, Star, Users, Shield, TrendingUp } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-labelledby="hero-heading">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-teal-50 -z-10" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-teal-100/30 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>Trusted by 1,500+ Insurance Agents Across India</span>
            </div>

            {/* Main Headline - H1 for SEO */}
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              All-in-One Business
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600 mt-2">
                CRM for Insurance Agents
              </span>
            </h1>

            {/* Value Proposition - AEO optimized */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              The <strong>complete insurance agent software</strong> to manage policies, track renewals, 
              calculate commissions, and grow your business. Built for <strong>Motor, Health, Life, 
              and General Insurance Agents</strong>.
            </p>

            {/* Key Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-teal-600">98%</div>
                <div className="text-xs sm:text-sm text-gray-600">Renewal Rate</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-teal-600">5hrs</div>
                <div className="text-xs sm:text-sm text-gray-600">Saved Weekly</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-bold text-teal-600">25%</div>
                <div className="text-xs sm:text-sm text-gray-600">More Renewals</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-8 py-6 shadow-lg shadow-teal-200/50 transition-all hover:shadow-xl">
                  Start Free - No Credit Card
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-gray-300 hover:border-teal-500 hover:bg-teal-50 group">
                  <Play className="mr-2 h-5 w-5 text-teal-600 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                <span>Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                <span>WhatsApp Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                <span>PDF Auto-Fill</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual/Stats */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Policy Dashboard</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Live</span>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-teal-600">847</div>
                    <div className="text-sm text-gray-600">Active Policies</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-amber-600">24</div>
                    <div className="text-sm text-gray-600">Due This Week</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">₹1.2L</div>
                    <div className="text-sm text-gray-600">Commission</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-gray-600">Renewal Rate</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-3">Recent Renewals</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Motor - MH12AB1234</span>
                      <span className="text-green-600">Renewed ✓</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Health - Sharma Family</span>
                      <span className="text-green-600">Renewed ✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">+25% Renewals</div>
                    <div className="text-xs text-gray-500">This month</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">234 Clients</div>
                    <div className="text-xs text-gray-500">Managed</div>
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

export default HeroSection;
