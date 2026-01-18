import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Car,
  Heart,
  Home as HomeIcon,
  FileSpreadsheet,
  Lock,
  Globe,
  Headphones,
  TrendingUp
} from "lucide-react";
import logo from '@/assets/logo.png';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Policy Tracker - Best Agent Policy Tracker Software" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Policy Tracker.in</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Agent Policy Tracker</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
                Pricing
              </Link>
              <Link to="/demo" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
                Demo
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="features-hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4 fill-current" />
            <span>Trusted by 1000+ Insurance Agents in India</span>
          </div>
          <h1 id="features-hero" className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Features of India's Best
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
              Agent Policy Tracker
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover all the powerful features that make Policy Tracker.in the #1 choice for insurance agents. 
            From <strong>policy management</strong> to <strong>WhatsApp reminders</strong>, we've got everything you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                Try Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-16 bg-white" aria-labelledby="main-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="main-features" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Insurance Agents
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every feature is designed to save time, reduce errors, and help you grow your insurance business.
            </p>
          </div>

          <div className="space-y-16">
            {mainFeatures.map((feature, index) => (
              <article 
                key={index} 
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}
              >
                <div className="w-full lg:w-1/2">
                  <div className="bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl p-8 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center">
                      <feature.icon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-1/2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    {feature.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-400 italic">
                    Keywords: {feature.keywords}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Types Supported */}
      <section className="py-16 bg-gradient-to-br from-cyan-600 to-teal-600" aria-labelledby="insurance-types">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="insurance-types" className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Track All Types of Insurance Policies
            </h2>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto">
              Our policy tracker supports all major insurance categories used by agents in India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {insuranceTypes.map((type, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{type.title}</h3>
                  <ul className="space-y-1 text-sm text-cyan-100">
                    {type.types.map((t, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" />
                        {t}
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
      <section className="py-16 bg-gray-50" aria-labelledby="additional-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="additional-features" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              More Features You'll Love
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Insurance Business?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join 1000+ insurance agents who trust Policy Tracker.in to manage their policies efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-10">
                Start Free - No Credit Card Required
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                View Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={logo} alt="Policy Tracker" className="w-10 h-10" />
                <span className="text-xl font-bold text-white">Policy Tracker.in</span>
              </div>
              <p className="text-sm">India's #1 agent policy tracker for insurance professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/enquiry" className="hover:text-white transition-colors">Enquiry</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cancellation-refunds" className="hover:text-white transition-colors">Cancellation & Refunds</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Policy Tracker.in - Best Agent Policy Tracker Software. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <WhatsAppFloatingButton />
    </div>
  );
};

export default FeaturesPage;
