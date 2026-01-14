import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  MessageCircle,
  Upload,
  FileSpreadsheet,
  BookOpen,
  Database,
  Zap,
  TrendingUp,
  Lock,
  Award,
  Headphones,
  Play,
  ShieldCheck
} from "lucide-react";
import logo from '@/assets/logo.png';
import dashboardImg from '@/assets/screenshots/dashboard.png';
import addPolicyImg from '@/assets/screenshots/add-policy.png';
import duePoliciesImg from '@/assets/screenshots/due-policies.png';
import reportsImg from '@/assets/screenshots/reports.png';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

const LandingPage = () => {
  const features = [
    {
      icon: FileText,
      title: "Policy Management",
      description: "Store and manage all your motor, health, and life insurance policies in one centralized dashboard."
    },
    {
      icon: Bell,
      title: "Smart Renewal Alerts",
      description: "Never miss a policy renewal. Get automated notifications for expiring policies."
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Reminders",
      description: "Send automated WhatsApp reminders to clients for policy renewals with one click."
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Maintain detailed client records with contact information and policy history."
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      description: "Visual dashboard showing total policies, renewals due, and business insights."
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your policy tracker anywhere - desktop, tablet, or mobile phone."
    }
  ];

  const steps = [
    {
      step: 1,
      image: dashboardImg,
      title: "Your Command Center",
      subtitle: "Dashboard Overview",
      description: "See everything at a glance — total policies, today's premium, upcoming renewals, and quick actions. Know your business health instantly.",
      features: ["227+ Policies Managed", "₹5.15L Monthly Premium", "41 Due for Renewal"]
    },
    {
      step: 2,
      image: addPolicyImg,
      title: "Add Policies in Seconds",
      subtitle: "Smart Auto-Fill",
      description: "Upload a policy PDF and let our AI extract all details automatically. Or enter manually with smart suggestions for vehicle make, model, and insurance companies.",
      features: ["PDF Auto-Extract", "Smart Suggestions", "Vehicle Database"]
    },
    {
      step: 3,
      image: reportsImg,
      title: "Manage All Policies",
      subtitle: "Policy List View",
      description: "Search, filter, and manage all your policies in one place. View by status, date, or insurance type. Edit, delete, or download policy documents instantly.",
      features: ["Quick Search", "Smart Filters", "One-Click Actions"]
    },
    {
      step: 4,
      image: duePoliciesImg,
      title: "Never Miss a Renewal",
      subtitle: "Due Policies Management",
      description: "Track policies expiring this week, next week, or next month. Send WhatsApp reminders, call clients, or renew policies — all from one screen.",
      features: ["Week-wise Filtering", "WhatsApp Reminders", "Renewal Tracking"]
    }
  ];

  const bulkImportSources = [
    { icon: FileSpreadsheet, title: "Excel Sheets", description: "Import from .xlsx or .csv files" },
    { icon: FileText, title: "Notepad Files", description: "Convert text records to digital" },
    { icon: BookOpen, title: "Diary Records", description: "Digitize handwritten entries" },
    { icon: Database, title: "Other Systems", description: "Migrate from any format" }
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

  const trustBadges = [
    { icon: Lock, title: "SSL Secured", description: "256-bit encryption" },
    { icon: ShieldCheck, title: "Data Protected", description: "Your data is safe" },
    { icon: Award, title: "1000+ Users", description: "Trusted platform" },
    { icon: Headphones, title: "24/7 Support", description: "Always here to help" }
  ];

  const faqs = [
    {
      question: "What is Policy Tracker.in?",
      answer: "Policy Tracker.in is a comprehensive insurance policy management software designed specifically for Indian insurance agents. It helps you track motor, health, and life insurance policies, manage client relationships, send automated WhatsApp reminders for renewals, and generate Excel reports — all in one easy-to-use platform."
    },
    {
      question: "Is Policy Tracker.in free to use?",
      answer: "Yes! We offer a free forever plan that includes up to 50 policies, basic renewal alerts, and client management. For agents managing more policies, we have affordable premium plans starting at just ₹199/month with unlimited policies and advanced features like WhatsApp automation."
    },
    {
      question: "Can I import my existing policy data?",
      answer: "Absolutely! You can import policies from Excel files, CSV files, or any digital format. We also offer free data migration assistance where our team will personally help you digitize your existing records from diaries, notepads, or any other format."
    },
    {
      question: "How do WhatsApp reminders work?",
      answer: "With one click, you can send personalized renewal reminder messages to your clients via WhatsApp. The message includes policy details, expiry date, and your contact information. Premium plans include automated reminders that are sent automatically before policy expiry."
    },
    {
      question: "Is my data secure on Policy Tracker?",
      answer: "Yes, your data is completely secure. We use industry-standard 256-bit SSL encryption, secure cloud storage, and regular backups. Your policy and client data is private and never shared with third parties. Only you can access your account data."
    },
    {
      question: "Can I access Policy Tracker on mobile?",
      answer: "Yes! Policy Tracker.in is fully responsive and works perfectly on mobile phones, tablets, and desktops. You can also install it as a PWA (Progressive Web App) on your phone for quick access just like a native app."
    },
    {
      question: "What types of insurance policies can I manage?",
      answer: "You can manage all types of insurance policies including Motor Insurance (car, bike, commercial vehicles), Health Insurance, Life Insurance, Term Plans, and any other general insurance policies. The platform is flexible to handle all your policy types."
    },
    {
      question: "How can I get support if I face any issues?",
      answer: "We offer multiple support channels: WhatsApp support, email support at policytracker.in@gmail.com, and our enquiry form. Premium users get priority support with faster response times. We're committed to helping you succeed."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Policy Tracker - Insurance Policy Management Software India" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Policy Tracker.in</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Insurance Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth" aria-label="Login to your account">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth" aria-label="Start free trial">
                <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section - Optimized for instant value proposition */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Trusted by 1000+ Insurance Agents Across India
            </div>
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Stop Losing Renewals.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
                Start Tracking Policies.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              The simplest way for insurance agents to track motor policies, send WhatsApp reminders, 
              and never miss a renewal again. <strong>Free to start. No credit card required.</strong>
            </p>
            
            {/* Primary CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-8 py-6 shadow-lg shadow-teal-200">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2">
                  Try Dashboard Demo
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10 text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" />
                <span className="font-medium">100% Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" />
                <span className="font-medium">WhatsApp Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" />
                <span className="font-medium">Excel Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" />
                <span className="font-medium">Mobile Friendly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-12 sm:py-16 bg-white" aria-labelledby="video-demo-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="video-demo-heading" className="text-2xl sm:text-3xl font-bold text-gray-900">
              Watch How It Works in 60 Seconds
            </h2>
            <p className="mt-3 text-gray-600">
              See how easy it is to manage your insurance policies with Policy Tracker
            </p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-cyan-600 to-teal-600 aspect-video">
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors group">
                  <Play className="h-10 w-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-lg font-medium">Interactive Demo Coming Soon</p>
                <p className="text-sm text-white/80 mt-2">Meanwhile, explore the screenshots below</p>
              </div>
            </div>
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                Try It Yourself — Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-8 bg-gray-50 border-y border-gray-200" aria-label="Trust indicators">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center justify-center gap-3 py-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <badge.icon className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{badge.title}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-Step Screenshots Section */}
      <section className="py-16 sm:py-24 bg-white" id="how-it-works" aria-labelledby="steps-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="steps-heading" className="text-3xl sm:text-4xl font-bold text-gray-900">
              See Exactly How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From chaos to clarity in 4 simple steps. Here's how insurance agents like you manage policies effortlessly.
            </p>
          </div>
          
          <div className="space-y-20 sm:space-y-32">
            {steps.map((item, index) => (
              <article 
                key={index} 
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-16`}
              >
                {/* Screenshot */}
                <div className="flex-1 w-full">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-200/40 to-teal-200/40 rounded-2xl blur-xl"></div>
                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
                      <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">policytracker.in</span>
                      </div>
                      <img 
                        src={item.image} 
                        alt={`Step ${item.step}: ${item.title} - Policy Tracker Screenshot`}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {item.step}
                    </span>
                    {item.subtitle}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {item.features.map((feature, i) => (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4 text-teal-600" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA after screenshots */}
          <div className="mt-16 text-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-10 py-6 shadow-lg shadow-teal-200">
                Start Managing Policies Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bulk Import Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-cyan-600 to-teal-600" aria-labelledby="bulk-import-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Upload className="h-4 w-4" />
              Data Migration Made Easy
            </div>
            <h2 id="bulk-import-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Got Existing Data? We'll Help You Import It!
            </h2>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto">
              Don't start from scratch. Bring your existing policy records from any format — we'll help you go digital in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {bulkImportSources.map((source, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <source.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{source.title}</h3>
                  <p className="text-cyan-100 text-sm">{source.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Need Help Importing Your Data?
              </h3>
              <p className="text-cyan-100 mb-6">
                Our team will personally help you migrate your existing policy records into Policy Tracker. 
                <strong className="text-white"> Free data import assistance</strong> for all new users.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/enquiry">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-teal-600 hover:bg-gray-100 text-lg px-8">
                    Request Free Data Import
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-lg px-8">
                    Start Fresh Instead
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-16 sm:py-24 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Grow Your Insurance Business
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for insurance agents in India. Simple, powerful, and designed to save you time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA after features */}
          <div className="mt-12 text-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-10">
                Get All Features Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-teal-50" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-teal-600">1000+</div>
              <p className="text-gray-600 mt-2">Active Agents</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-teal-600">50K+</div>
              <p className="text-gray-600 mt-2">Policies Tracked</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-teal-600">₹10Cr+</div>
              <p className="text-gray-600 mt-2">Premiums Managed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-teal-600">4.8★</div>
              <p className="text-gray-600 mt-2">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-white" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold text-gray-900">
              Loved by Insurance Agents Across India
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our users have to say about Policy Tracker.in
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
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

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-gray-50" id="faq" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about Policy Tracker.in
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`}
                className="bg-white rounded-xl border border-gray-200 px-6 shadow-sm"
              >
                <AccordionTrigger className="text-left text-gray-900 font-semibold hover:text-teal-600 py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link to="/enquiry">
              <Button variant="outline" size="lg" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                <Headphones className="mr-2 h-5 w-5" />
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 bg-gray-900" aria-labelledby="final-cta-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="h-12 w-12 text-teal-400 mx-auto mb-6" />
          <h2 id="final-cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Stop Missing Renewals?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join 1000+ insurance agents who are growing their business with Policy Tracker. 
            Start free today — no credit card, no commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-lg px-10 py-6">
                Start Free Trial Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/enquiry">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-gray-600 text-white hover:bg-gray-800 text-lg px-10 py-6">
                Contact Us
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-gray-500 text-sm">
            ✓ Free forever plan available &nbsp;•&nbsp; ✓ No credit card required &nbsp;•&nbsp; ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src={logo} alt="Policy Tracker.in - Insurance Software" className="w-10 h-10" />
                <span className="text-xl font-bold text-white">Policy Tracker.in</span>
              </div>
              <p className="text-sm mb-4">
                India's leading insurance policy management software for agents. 
                Track renewals, send WhatsApp reminders, manage clients, and grow your business.
              </p>
              <p className="text-sm">
                <strong className="text-white">Contact:</strong> policytracker.in@gmail.com
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Sign Up Free</Link></li>
                <li><Link to="/enquiry" className="hover:text-white transition-colors">Enquiry</Link></li>
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

      <WhatsAppFloatingButton />
    </div>
  );
};

export default LandingPage;
