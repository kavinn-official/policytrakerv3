import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Bell, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Star,
  BarChart3,
  Smartphone,
  MessageCircle
} from "lucide-react";
import logo from '@/assets/logo.png';
import dashboardImg from '@/assets/screenshots/dashboard.png';
import addPolicyImg from '@/assets/screenshots/add-policy.png';
import duePoliciesImg from '@/assets/screenshots/due-policies.png';
import whatsappImg from '@/assets/screenshots/whatsapp-reminders.png';
import reportsImg from '@/assets/screenshots/reports.png';

const LandingPage = () => {
  const features = [
    {
      icon: FileText,
      title: "Policy Management",
      description: "Store and manage all your motor, health, and life insurance policies in one centralized dashboard. Track policy numbers, client details, and vehicle information."
    },
    {
      icon: Bell,
      title: "Renewal Alerts",
      description: "Never miss a policy renewal. Get automated email reports and notifications for expiring policies to stay ahead of due dates."
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Reminders",
      description: "Send automated WhatsApp reminders to your clients for policy renewals. Configure reminder days and time preferences."
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Maintain detailed client records with contact information, policy history, and quick access to all associated policies."
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      description: "Get instant insights with visual dashboard showing total policies, expiring soon, and expired policies at a glance."
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your policy tracker from anywhere - desktop, tablet, or mobile. Your data is always just a click away."
    }
  ];

  const screenshots = [
    {
      image: dashboardImg,
      title: "Dashboard Overview",
      description: "Get a complete view of all your policies, clients, and upcoming renewals at a glance."
    },
    {
      image: addPolicyImg,
      title: "Add New Policies",
      description: "Easily add motor, health, or life insurance policies with all client and vehicle details."
    },
    {
      image: duePoliciesImg,
      title: "Track Due Policies",
      description: "Filter and view policies due in 1st, 2nd, 3rd, or 4th week with quick action buttons."
    },
    {
      image: whatsappImg,
      title: "WhatsApp Reminders",
      description: "Configure automated WhatsApp reminders with custom days and preferred time slots."
    },
    {
      image: reportsImg,
      title: "Export Reports",
      description: "Generate and download Excel reports of expiring policies for easy client follow-up."
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Insurance Agent, Delhi",
      content: "Policy Tracker.in has transformed how I manage my client policies. The WhatsApp reminders have helped me retain more clients.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Insurance Advisor, Mumbai",
      content: "Simple, effective, and exactly what I needed. The Excel report feature saves me hours of manual work every week.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Agency Owner, Gujarat",
      content: "My team relies on Policy Tracker daily. It's become an essential tool for our motor insurance business operations.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Policy Tracker - Insurance Policy Management Software India" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Policy Tracker.in</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Insurance Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Best Insurance Policy
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
              Management Software for Agents
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            India's #1 policy tracker for insurance agents. Track motor & vehicle policy renewals, 
            send WhatsApp reminders, manage clients, and grow your agency efficiently.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                Learn More
              </Button>
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              <span>Free to Start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              <span>WhatsApp Reminders</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teal-600" />
              <span>Excel Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="py-16 sm:py-24 bg-white" id="screenshots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              See How Policy Tracker.in Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Simple, intuitive interface designed for Indian insurance agents
            </p>
          </div>
          <div className="space-y-16">
            {screenshots.map((screenshot, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-12`}
              >
                <div className="flex-1 w-full">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200">
                    <img 
                      src={screenshot.image} 
                      alt={`${screenshot.title} - Policy Tracker Insurance Software Screenshot`}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {screenshot.title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {screenshot.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Manage Insurance Policies
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for insurance agents in India. Simple, powerful, and designed to save you time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How Policy Tracker.in Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in minutes and transform your policy management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-teal-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up Free</h3>
              <p className="text-gray-600">Create your account in seconds. No credit card required to get started.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-teal-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Your Policies</h3>
              <p className="text-gray-600">Enter policy details including client info, vehicle details, and expiry dates.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-teal-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track & Get Alerts</h3>
              <p className="text-gray-600">Monitor renewals, receive WhatsApp reminders, and never miss an expiry again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Trusted by Insurance Agents Across India
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our users have to say about Policy Tracker.in
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-cyan-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Streamline Your Insurance Policy Management?
          </h2>
          <p className="text-lg text-cyan-100 mb-8">
            Join thousands of insurance agents who trust Policy Tracker.in to manage their policies efficiently.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-teal-600 hover:bg-gray-100">
              Get Started Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src={logo} alt="Policy Tracker.in - Insurance Software" className="w-10 h-10" />
                <span className="text-xl font-bold text-white">Policy Tracker.in</span>
              </div>
              <p className="text-sm">
                India's leading insurance policy management software for agents. 
                Track renewals, send WhatsApp reminders, manage clients, and grow your business.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/cancellation-refunds" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 policytracker.in. All rights reserved. | Best Insurance Policy Tracker for Indian Agents</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;