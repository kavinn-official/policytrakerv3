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
  ShieldCheck
} from "lucide-react";
import logo from '@/assets/logo.png';
import howItWorksImg from '@/assets/screenshots/how-it-works.png';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

// Declare global trackSignupClick function
declare global {
  interface Window {
    trackSignupClick?: (location: string) => void;
  }
}

const LandingPage = () => {
  // SEO-optimized features with high-intent keywords
  const features = [
    {
      icon: FileText,
      title: "Insurance Policy Management",
      description: "Best-in-class policy tracking app for agents. Store and manage all motor, health, and life insurance policies in one centralized dashboard."
    },
    {
      icon: Bell,
      title: "Policy Renewal Reminder App",
      description: "Never miss a policy renewal. Get automated renewal alerts and notifications for expiring policies - the smartest policy reminder system."
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Reminders Integration",
      description: "Send automated WhatsApp reminders to clients for policy renewals with one click. Keep clients engaged and boost retention."
    },
    {
      icon: Users,
      title: "Insurance Agent CRM",
      description: "Complete client management system for insurance agents. Maintain detailed records with contact information and policy history."
    },
    {
      icon: BarChart3,
      title: "Dashboard & Reports Analytics",
      description: "Visual dashboard showing total policies, renewals due, premium reports, and business insights. Export to Excel anytime."
    },
    {
      icon: Smartphone,
      title: "Mobile Policy Tracking App",
      description: "Access your agent policy tracker anywhere - desktop, tablet, or mobile phone. Install as PWA for native app experience."
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Dashboard Overview",
      description: "Get an overview of all your insurance policies with a quick glance at active, due, expired, and new policies."
    },
    {
      step: 2,
      title: "Add New Policy",
      description: "Easily input new policy details with our smart auto-fill feature that extracts data from PDFs and images."
    },
    {
      step: 3,
      title: "Manage Policies",
      description: "View, edit, and organize all your policies in one convenient list."
    },
    {
      step: 4,
      title: "Track and Renew Due Policies",
      description: "Get alerts for policies up for renewal and easily send reminders or renew them with a few clicks."
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

  // SEO-optimized FAQs with high-intent keywords for AEO
  const faqs = [
    {
      question: "What is the best agent policy tracker for insurance agents in India?",
      answer: "Policy Tracker.in is the best agent policy tracker for insurance agents in India. It's a comprehensive insurance policy management software that helps you track motor, health, and life insurance policies, manage client relationships, send automated WhatsApp reminders for renewals, and generate Excel reports. Trusted by 1000+ insurance agents with a 4.8-star rating."
    },
    {
      question: "What is Policy Tracker.in and how does it work?",
      answer: "Policy Tracker.in is India's #1 policy tracking app for insurance agents. It works as an all-in-one insurance agent CRM where you can add policies (manually or via PDF upload), track renewal dates, send WhatsApp reminders to clients, manage client information, and generate premium reports. The platform is designed specifically for Indian insurance agents."
    },
    {
      question: "Is this insurance policy management software free to use?",
      answer: "Yes! Policy Tracker.in offers a free forever plan that includes up to 50 policies, basic renewal alerts, and client management. For agents managing more policies, we have affordable premium plans starting at just ₹199/month with unlimited policies and advanced features like WhatsApp automation and priority support."
    },
    {
      question: "How does the policy renewal reminder app feature work?",
      answer: "The policy renewal reminder feature automatically tracks all policy expiry dates. You get alerts on your dashboard for upcoming renewals. With one click, you can send personalized WhatsApp reminders to clients including policy details, expiry date, and your contact information. Premium plans include fully automated reminders sent before policy expiry."
    },
    {
      question: "Can I use Policy Tracker as an insurance agent CRM?",
      answer: "Absolutely! Policy Tracker.in works as a complete insurance agent CRM. You can manage client contact information, view policy history for each client, track all communications, and maintain relationships with your insurance clients in one organized platform."
    },
    {
      question: "What makes this the best policy tracking app for agents?",
      answer: "Policy Tracker.in is built specifically for Indian insurance agents with features like WhatsApp integration, Hindi language support, INR pricing, and support for all Indian insurance types. It's the most affordable agent policy tracker with a generous free tier, premium plans from ₹199/month, and features like PDF auto-fill that no other policy tracker offers."
    },
    {
      question: "What types of insurance policies can I track?",
      answer: "You can track all types of insurance policies including Motor Insurance (car, bike, two-wheeler, commercial vehicles), Health Insurance, Life Insurance, Term Plans, and general insurance policies. For motor insurance, the policy tracker supports vehicle details like make, model, and registration number."
    },
    {
      question: "Is this policy tracker app available on mobile?",
      answer: "Yes! Policy Tracker.in is a fully responsive policy tracking app that works perfectly on mobile phones, tablets, and desktops. You can also install it as a PWA (Progressive Web App) on your phone for quick access just like a native mobile app - no app store download needed."
    },
    {
      question: "How do I import my existing policy data into the tracker?",
      answer: "You can import policies from Excel files, CSV files, or any digital format. We also offer free data migration assistance where our team will personally help you digitize your existing records from diaries, notepads, or any other format into the policy tracker."
    },
    {
      question: "Is my client and policy data secure?",
      answer: "Yes, your data is completely secure. Policy Tracker.in uses industry-standard 256-bit SSL encryption, secure cloud storage, and regular backups. Your policy and client data is private and never shared with third parties. Only you can access your account data."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Agent Policy Tracker - Best Insurance Policy Management Software India" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Policy Tracker.in</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Agent Policy Tracker</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth" aria-label="Login to your agent policy tracker account">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/auth" aria-label="Start free trial of policy tracking app">
                <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section - Optimized for SEO, AEO & AI Search */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" aria-hidden="true" />
              <span>#1 Agent Policy Tracker - Trusted by 1000+ Insurance Agents in India</span>
            </div>
            <h2 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Best Insurance Policy
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
                Tracker for Agents
              </span>
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              India's #1 <strong>agent policy tracker</strong> and <strong>insurance policy management software</strong>. 
              Track motor policies, send WhatsApp renewal reminders, manage clients with our 
              <strong> policy tracking app for agents</strong>. <span className="text-teal-600 font-semibold">Free to start. No credit card required.</span>
            </p>
            
            {/* Primary CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" onClick={() => window.trackSignupClick?.('hero_primary')}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-8 py-6 shadow-lg shadow-teal-200">
                  Start Free Trial - No Credit Card
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2">
                  Try Policy Tracker Demo
                </Button>
              </Link>
            </div>

            {/* Trust Badges - Keyword Rich */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10 text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <span className="font-medium">Free Policy Tracker</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <span className="font-medium">WhatsApp Renewal Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <span className="font-medium">Insurance Agent CRM</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <span className="font-medium">Mobile Policy Tracking</span>
              </div>
            </div>
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

      {/* Step-by-Step Section with Single Image */}
      <section className="py-16 sm:py-24 bg-white" id="how-it-works" aria-labelledby="steps-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="steps-heading" className="text-3xl sm:text-4xl font-bold text-gray-900">
              See Exactly How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From chaos to clarity in 4 simple steps. Here's how insurance agents like you manage policies effortlessly.
            </p>
          </div>
          
          {/* Single Combined Screenshot */}
          <div className="relative mb-12">
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
                src={howItWorksImg} 
                alt="Agent Policy Tracker Dashboard - How to track insurance policies, manage renewals, send WhatsApp reminders"
                title="Best Agent Policy Tracker - Insurance Policy Management Software"
                className="w-full h-auto"
                loading="lazy"
                width="1200"
                height="675"
              />
            </div>
          </div>

          {/* Steps Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-full font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/auth" onClick={() => window.trackSignupClick?.('after_screenshots')}>
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
                  <Button size="lg" className="w-full sm:w-auto bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/40 text-lg px-8">
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
              Complete Insurance Policy Management Software
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need in an <strong>agent policy tracker</strong>. Built specifically for insurance agents in India. Simple, powerful, and designed to save you time.
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
            <Link to="/auth" onClick={() => window.trackSignupClick?.('after_features')}>
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

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 bg-white" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-bold text-gray-900">
              What Insurance Agents Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Trusted by thousands of insurance professionals across India
            </p>
          </div>

          {/* Written Testimonials */}
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
            <Link to="/auth" onClick={() => window.trackSignupClick?.('final_cta')}>
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-lg px-10 py-6">
                Start Free Trial Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/enquiry">
              <Button size="lg" className="w-full sm:w-auto bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 text-lg px-10 py-6">
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
                <img src={logo} alt="Policy Tracker.in - Best Agent Policy Tracker Software India" className="w-10 h-10" />
                <span className="text-xl font-bold text-white">Policy Tracker.in</span>
              </div>
              <p className="text-sm mb-4">
                India's #1 <strong>agent policy tracker</strong> and insurance policy management software. 
                Track renewals, send WhatsApp reminders, manage clients with our policy tracking app for agents.
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
            <p>© 2025 PolicyTracker.in - Best Agent Policy Tracker | Insurance Policy Management Software for Indian Agents | Policy Tracking App</p>
          </div>
        </div>
      </footer>

      <WhatsAppFloatingButton />
    </div>
  );
};

export default LandingPage;
