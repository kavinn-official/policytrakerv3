import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Bell,
  MessageCircle,
  Users,
  BarChart3,
  Smartphone,
  Upload,
  Shield,
  Zap,
  Globe,
  Headphones,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Car,
  Heart,
  Home as HomeIcon,
  FileSpreadsheet,
  Lock
} from "lucide-react";
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

const FeaturesPage = () => {
  const mainFeatures = [
    {
      icon: FileText,
      title: "Complete Insurance Policy Management",
      description: "Store and manage all your motor, health, life, and general insurance policies in one centralized dashboard. Our policy management software helps insurance agents organize policies by client, type, company, and expiry date.",
      benefits: [
        "Track motor insurance (car, bike, commercial vehicles)",
        "Manage health insurance policies with family details",
        "Store life insurance and term plan information",
        "Add vehicle details: make, model, registration number"
      ],
      keywords: "insurance policy management, policy tracking app, agent policy tracker"
    },
    {
      icon: Bell,
      title: "Automated Policy Renewal Reminders",
      description: "Never miss a policy renewal with our intelligent reminder system. The policy renewal reminder app automatically tracks expiry dates and sends alerts before policies lapse, helping you retain more clients.",
      benefits: [
        "Automatic expiry tracking for all policies",
        "Customizable reminder schedules (7, 15, 30 days)",
        "Dashboard alerts for upcoming renewals",
        "Priority sorting by urgency"
      ],
      keywords: "policy renewal reminder app, renewal alerts, expiry tracking"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integration for Client Communication",
      description: "Send personalized WhatsApp reminders to clients with one click. Our WhatsApp integration helps insurance agents communicate effectively with clients about policy renewals, boosting retention and customer satisfaction.",
      benefits: [
        "One-click WhatsApp reminder messages",
        "Pre-formatted professional templates",
        "Include policy details in messages",
        "Track reminder history per client"
      ],
      keywords: "WhatsApp policy reminders, client communication, insurance agent WhatsApp"
    },
    {
      icon: Users,
      title: "Insurance Agent CRM",
      description: "A complete client relationship management system designed specifically for insurance agents. Maintain detailed records, track policy history, and build stronger client relationships with our insurance agent CRM.",
      benefits: [
        "Store client contact information",
        "View complete policy history per client",
        "Track all communications and reminders",
        "Manage client documents and notes"
      ],
      keywords: "insurance agent CRM, client management, insurance broker software"
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics & Premium Reports",
      description: "Get actionable insights into your insurance business with our visual dashboard. Track total policies, pending renewals, monthly premium collection, and business growth with comprehensive analytics.",
      benefits: [
        "Visual dashboard with key metrics",
        "Monthly premium collection reports",
        "Policy distribution by type and company",
        "Export reports to Excel anytime"
      ],
      keywords: "insurance analytics, premium reports, business dashboard"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Policy Tracking App",
      description: "Access your policy data anywhere - desktop, tablet, or mobile phone. Our responsive design ensures you can manage policies on the go. Install as a PWA for native app-like experience.",
      benefits: [
        "Works on all devices and screen sizes",
        "Install as Progressive Web App (PWA)",
        "Offline access to policy data",
        "Fast and responsive interface"
      ],
      keywords: "mobile policy tracker, policy tracking app, insurance agent app"
    },
    {
      icon: Upload,
      title: "Smart PDF Auto-Fill Technology",
      description: "Upload policy PDFs and let our AI automatically extract policy details. Save hours of manual data entry with our smart auto-fill feature that populates policy information from documents.",
      benefits: [
        "Upload policy PDFs for auto-extraction",
        "AI-powered data recognition",
        "Reduce manual data entry errors",
        "Save 80% time on policy additions"
      ],
      keywords: "PDF auto-fill, document scanning, policy data extraction"
    },
    {
      icon: FileSpreadsheet,
      title: "Excel Import & Export",
      description: "Bulk import existing policies from Excel files and export comprehensive reports. Perfect for migrating from spreadsheets or sharing data with your team and management.",
      benefits: [
        "Import policies from Excel/CSV files",
        "Export policies to Excel with one click",
        "Generate monthly reports",
        "Share data with stakeholders"
      ],
      keywords: "Excel import, policy export, bulk upload, data migration"
    }
  ];

  const additionalFeatures = [
    {
      icon: Shield,
      title: "Secure Data Storage",
      description: "Your data is protected with industry-standard 256-bit SSL encryption and secure cloud storage."
    },
    {
      icon: Lock,
      title: "Privacy Protected",
      description: "Your client and policy data is private and never shared with third parties."
    },
    {
      icon: Globe,
      title: "Access Anywhere",
      description: "Cloud-based platform accessible from any device with internet connection."
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Optimized for speed - load thousands of policies in milliseconds."
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Dedicated support via WhatsApp, email, and phone for premium users."
    },
    {
      icon: TrendingUp,
      title: "Regular Updates",
      description: "Continuous improvements with new features added based on user feedback."
    }
  ];

  const insuranceTypes = [
    { icon: Car, title: "Motor Insurance", types: ["Car", "Bike", "Commercial Vehicle", "Two Wheeler"] },
    { icon: Heart, title: "Health Insurance", types: ["Individual", "Family Floater", "Senior Citizen", "Critical Illness"] },
    { icon: Shield, title: "Life Insurance", types: ["Term Plans", "Endowment", "ULIP", "Whole Life"] },
    { icon: HomeIcon, title: "General Insurance", types: ["Home", "Travel", "Fire", "Marine"] }
  ];

  return (
    <>
      <SEOHead
        title="Features - Agent Policy Tracker | Insurance Management Software India"
        description="Discover all features of Policy Tracker.in - policy management, WhatsApp reminders, renewal alerts, PDF auto-fill, client CRM, Excel reports. Best agent policy tracker for Indian insurance agents."
        canonicalPath="/features"
        keywords="agent policy tracker features, insurance policy management, WhatsApp reminders, policy renewal alerts, insurance agent CRM, PDF auto-fill, Excel reports"
      />
      <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900">

        {/* Background Mesh/Noise */}
        <div className="absolute inset-x-0 top-0 h-[800px] z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#e2e8f0,transparent_50%)] opacity-60"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/3 -translate-x-1/3"></div>
        </div>

        <Navigation />

        {/* Hero Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative z-10" aria-labelledby="features-hero">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100/50 px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <Star className="h-4 w-4 fill-indigo-600 text-indigo-600" />
              <span>Trusted by 1000+ Insurance Agents in India</span>
            </div>
            <h1 id="features-hero" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Features of India's Best
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-indigo-600 mt-2 pb-2">
                Agent Policy Tracker
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
              Discover all the powerful capabilities that make PolicyTracker.in the #1 choice for professionals.
              From <strong className="text-slate-800">policy CRM workflows</strong> to <strong className="text-slate-800">WhatsApp reminders</strong>, we build what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 text-base h-12 px-10 transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo-request" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 border-slate-200 text-slate-700 hover:bg-slate-50">
                  Try Live Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-20 bg-white relative z-10 border-t border-slate-100" aria-labelledby="main-features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 lg:mb-24">
              <h2 id="main-features" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                Powerful Features for Pro Agents
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                Every detail is designed to save time, reduce errors, and help you scale your insurance business seamlessly.
              </p>
            </div>

            <div className="space-y-24">
              {mainFeatures.map((feature, index) => (
                <article
                  key={index}
                  className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center group`}
                >
                  <div className="w-full lg:w-1/2 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/50 to-slate-100/50 rounded-3xl blur-2xl transform group-hover:scale-105 transition-transform duration-500"></div>
                    <div className="bg-white border border-slate-200/60 shadow-xl rounded-3xl p-10 flex items-center justify-center relative overflow-hidden aspect-[4/3]">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                      <div className="relative z-10 w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/30 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 border border-slate-800">
                        <feature.icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 pt-6 lg:pt-0">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {feature.title}
                    </h2>
                    <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-4 mb-6">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                          <div className="bg-indigo-50 border border-indigo-100/50 rounded-full p-1 mt-0.5 shrink-0">
                            <CheckCircle className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-slate-700 font-medium">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Insurance Types Supported */}
        <section className="py-24 bg-slate-900 relative overflow-hidden" aria-labelledby="insurance-types">
          {/* Background Gradients */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 id="insurance-types" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                Track All Types of Policies
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Engineered to support all major insurance categories standard to the Indian market.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {insuranceTypes.map((type, index) => (
                <Card key={index} className="bg-white/[0.03] backdrop-blur-md border-slate-800 text-white hover:bg-white/[0.05] transition-colors group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center mb-6 border border-slate-700 group-hover:scale-110 transition-transform">
                      <type.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{type.title}</h3>
                    <ul className="space-y-3">
                      {type.types.map((t, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                          <CheckCircle className="w-4 h-4 text-indigo-500/70" />
                          <span className="font-medium text-sm">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-24 bg-slate-50" aria-labelledby="additional-features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="additional-features" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                Platform Benefits You'll Love
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => (
                <Card key={index} className="bg-white border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-100/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white border-t border-slate-200/60 relative overflow-hidden">
          {/* Subtle mesh pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to Transform Your Insurance Business?
            </h2>
            <p className="text-xl text-slate-600 mb-10 font-medium">
              Join thousands of modern insurance teams unifying their workflow with PolicyTracker.in
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 text-base h-14 px-10 transition-all">
                  Start Free - No Credit Card Required
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-10 border-slate-200 text-slate-700 hover:bg-slate-50">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
        <WhatsAppFloatingButton />
      </div>
    </>
  );
};

export default FeaturesPage;
