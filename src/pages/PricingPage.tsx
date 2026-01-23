import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  X,
  Crown,
  Zap,
  Shield,
  Users,
  BarChart3,
  Bell,
  MessageCircle,
  FileSpreadsheet,
  Sparkles,
  Headphones,
  ArrowRight,
  Star,
  Clock,
  CreditCard
} from "lucide-react";
import logo from '@/assets/logo.png';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

const PricingPage = () => {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for getting started with policy tracking",
      popular: false,
      features: [
        { name: "Up to 50 Policies", included: true },
        { name: "Basic Dashboard", included: true },
        { name: "Policy Renewal Alerts", included: true },
        { name: "Client Management", included: true },
        { name: "Secure Data Storage", included: true },
        { name: "Mobile Responsive", included: true },
        { name: "Unlimited Policies", included: false },
        { name: "WhatsApp Reminders", included: false },
        { name: "PDF Auto-Fill", included: false },
        { name: "Advanced Reports", included: false },
        { name: "Priority Support", included: false },
        { name: "Email Notifications", included: false },
      ],
      cta: "Start Free",
      ctaLink: "/auth"
    },
    {
      name: "Premium",
      price: "₹199",
      period: "/month",
      description: "For professional insurance agents managing more policies",
      popular: true,
      features: [
        { name: "Unlimited Policies", included: true, highlight: true },
        { name: "Advanced Dashboard & Analytics", included: true },
        { name: "Policy Renewal Alerts", included: true },
        { name: "Client Management CRM", included: true },
        { name: "Secure Data Storage", included: true },
        { name: "Mobile Responsive", included: true },
        { name: "WhatsApp Reminders", included: true, highlight: true },
        { name: "PDF Auto-Fill Technology", included: true, highlight: true },
        { name: "Advanced Excel Reports", included: true },
        { name: "Priority Customer Support", included: true },
        { name: "Email Notifications", included: true },
        { name: "Bulk Policy Import", included: true },
      ],
      cta: "Upgrade to Premium",
      ctaLink: "/auth"
    }
  ];

  const comparisonFeatures = [
    { feature: "Number of Policies", free: "Up to 50", premium: "Unlimited" },
    { feature: "Dashboard Analytics", free: "Basic", premium: "Advanced" },
    { feature: "Policy Tracking", free: "✓", premium: "✓" },
    { feature: "Renewal Alerts", free: "✓", premium: "✓" },
    { feature: "Client Management", free: "✓", premium: "✓" },
    { feature: "WhatsApp Reminders", free: "✗", premium: "✓" },
    { feature: "PDF Auto-Fill", free: "✗", premium: "✓" },
    { feature: "Excel Export", free: "Basic", premium: "Advanced" },
    { feature: "Email Notifications", free: "✗", premium: "✓" },
    { feature: "Bulk Import", free: "✗", premium: "✓" },
    { feature: "Customer Support", free: "Email", premium: "Priority" },
    { feature: "Data Backup", free: "✓", premium: "✓" },
  ];

  const faqs = [
    {
      question: "Is the Free plan really free forever?",
      answer: "Yes! Our Free plan is completely free with no hidden charges. You can use it forever with up to 50 policies. We believe in providing value first, and the Free plan includes essential features like policy tracking, renewal alerts, and client management."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods through Razorpay including Credit Cards, Debit Cards, UPI, Net Banking, and mobile wallets like Paytm, PhonePe, and Google Pay. All payments are secure and encrypted."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can upgrade to Premium anytime from your dashboard. When you upgrade, you get instant access to all premium features. If you decide to cancel, your premium features will continue until the end of your billing period."
    },
    {
      question: "What happens when I exceed 50 policies on Free plan?",
      answer: "When you reach 50 policies, you'll need to upgrade to Premium to add more policies. All your existing data remains safe, and you can continue viewing and managing your current policies."
    },
    {
      question: "Is there a yearly subscription discount?",
      answer: "Currently, we offer monthly subscriptions at ₹199/month. We're working on annual plans with discounts. Contact us for special requirements or team pricing."
    },
    {
      question: "How do I cancel my Premium subscription?",
      answer: "You can cancel your subscription anytime from your account settings. There are no cancellation fees. Your premium features will remain active until the end of your current billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a full refund within 7 days of purchase if you're not satisfied with Premium. After 7 days, you can cancel anytime but refunds are not provided for partial months. Please see our Cancellation & Refunds policy for details."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard 256-bit SSL encryption for all data transmission. Your data is stored securely in the cloud with regular backups. We never share your data with third parties."
    },
    {
      question: "Can I get a custom plan for my team?",
      answer: "Yes! For teams and agencies with special requirements, please contact us through the enquiry form or WhatsApp. We offer custom plans with volume discounts and additional features."
    },
    {
      question: "What if I need help with the software?",
      answer: "Free users get email support. Premium users get priority support via WhatsApp and email with faster response times. We also provide free data migration assistance for Premium users."
    }
  ];

  return (
    <>
      <SEOHead
        title="Pricing - Agent Policy Tracker | Affordable Plans for Insurance Agents"
        description="Simple, transparent pricing for Policy Tracker.in. Free plan with 50 policies, Premium at ₹199/month with unlimited policies, WhatsApp reminders & PDF auto-fill. Best value for insurance agents."
        canonicalPath="/pricing"
        keywords="agent policy tracker pricing, insurance software pricing, policy tracker cost, affordable insurance agent software, premium plan India"
      />
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      {/* Structured Data for Pricing */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Policy Tracker.in - Agent Policy Tracker",
          "description": "Best agent policy tracker and insurance policy management software for Indian insurance agents",
          "image": "https://policytracker.in/logo.png",
          "brand": {
            "@type": "Brand",
            "name": "Policy Tracker.in"
          },
          "offers": [
            {
              "@type": "Offer",
              "name": "Free Plan",
              "price": "0",
              "priceCurrency": "INR",
              "description": "Free forever plan with up to 50 policies",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2025-12-31"
            },
            {
              "@type": "Offer",
              "name": "Premium Plan",
              "price": "199",
              "priceCurrency": "INR",
              "description": "Premium plan with unlimited policies and WhatsApp reminders",
              "availability": "https://schema.org/InStock",
              "priceValidUntil": "2025-12-31",
              "billingIncrement": "P1M"
            }
          ]
        })
      }} />

      {/* Navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Policy Tracker - Best Agent Policy Tracker Software" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Policy Tracker.in</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Agent Policy Tracker</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/features" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
                Features
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
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="pricing-hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4 fill-current" />
            <span>Affordable Pricing for Every Agent</span>
          </div>
          <h1 id="pricing-hero" className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Simple, Transparent
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
              Pricing Plans
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises. 
            Choose the plan that fits your insurance business.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8" aria-labelledby="pricing-plans">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'ring-2 ring-cyan-600 shadow-xl shadow-cyan-500/10' 
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-semibold px-4 py-1.5 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    {plan.popular && <Crown className="w-5 h-5 text-yellow-500" />}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500 text-lg">{plan.period}</span>
                    </div>
                    {plan.popular && (
                      <p className="text-xs text-green-600 mt-1">Best value for professional agents</p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            feature.highlight 
                              ? 'bg-gradient-to-r from-cyan-500 to-teal-500' 
                              : 'bg-green-100'
                          }`}>
                            <Check className={`w-3 h-3 ${feature.highlight ? 'text-white' : 'text-green-600'}`} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <X className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <span className={`text-sm ${
                          feature.included 
                            ? feature.highlight ? 'font-medium text-gray-900' : 'text-gray-700'
                            : 'text-gray-400'
                        }`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link to={plan.ctaLink}>
                    <Button 
                      className={`w-full h-12 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-lg shadow-cyan-500/25' 
                          : ''
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.popular && <CreditCard className="h-4 w-4 mr-2" />}
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-10 text-center">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Instant Activation</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                <span>7-Day Money Back</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-white" aria-labelledby="comparison-table">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="comparison-table" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Compare Plans Side by Side
            </h2>
            <p className="text-lg text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">
                    <span className="inline-flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      Premium
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <td className="py-4 px-4 text-gray-700">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.free === "✓" ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : row.free === "✗" ? (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-gray-600">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.premium === "✓" ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : row.premium === "✗" ? (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      ) : (
                        <span className="text-gray-900 font-medium">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50" aria-labelledby="pricing-faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="pricing-faq" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about pricing, billing, and subscriptions
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`faq-${index}`} 
                className="bg-white rounded-xl border border-gray-200 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-cyan-100 mb-8">
            Join 1000+ insurance agents who trust Policy Tracker.in. Start free today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto bg-white text-teal-700 hover:bg-gray-100 text-lg px-10">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-white text-white hover:bg-white/10">
                Try Live Demo
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
    </>
  );
};

export default PricingPage;
