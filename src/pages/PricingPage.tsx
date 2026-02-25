import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowRight,
  Star,
  Clock,
  CreditCard
} from "lucide-react";
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

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
      <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900">
        {/* Background Mesh/Noise */}
        <div className="absolute inset-x-0 top-0 h-[800px] z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#e2e8f0,transparent_50%)] opacity-60"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/3 -translate-x-1/3"></div>
        </div>

        {/* Structured Data for Pricing */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "PolicyTracker.in - Agent Policy Tracker",
            "description": "Best agent policy tracker and insurance policy management software for Indian insurance agents",
            "image": "https://policytracker.in/logo.png",
            "brand": {
              "@type": "Brand",
              "name": "PolicyTracker.in"
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

        <Navigation />

        {/* Hero Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative z-10" aria-labelledby="pricing-hero">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100/50 px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <Star className="h-4 w-4 fill-indigo-600 text-indigo-600" />
              <span>Affordable Pricing for Every Agent</span>
            </div>
            <h1 id="pricing-hero" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Simple, Transparent
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-indigo-600 mt-2 pb-2">
                Pricing Plans
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
              Start free, upgrade when you need more. No hidden fees, no surprises.
              Choose the plan that fits your insurance business.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8 relative z-10" aria-labelledby="pricing-plans">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative overflow-hidden transition-all duration-300 border-0 ${plan.popular
                      ? 'shadow-2xl shadow-indigo-900/10 md:scale-105 z-10'
                      : 'shadow-xl shadow-slate-200/50 hover:shadow-2xl border border-slate-200/60'
                    }`}
                >
                  {/* Background styling for popular card */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-slate-900 z-0">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                    </div>
                  )}

                  {plan.popular && (
                    <div className="absolute top-0 right-0 z-20">
                      <div className="bg-indigo-600 text-white text-[11px] uppercase tracking-wider font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  <div className={`relative z-10 h-full flex flex-col ${plan.popular ? 'text-white' : 'text-slate-900 bg-white'}`}>
                    <CardHeader className="pb-8 pt-10">
                      <div className="flex items-center gap-3 mb-4">
                        {plan.popular && <Crown className="w-6 h-6 text-yellow-400" />}
                        <CardTitle className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</CardTitle>
                      </div>
                      <p className={`${plan.popular ? 'text-slate-300' : 'text-slate-500'} text-base font-medium min-h-[48px]`}>{plan.description}</p>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-6xl font-extrabold tracking-tight ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                          <span className={`text-lg font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
                        </div>
                        {plan.popular && (
                          <p className="text-sm text-indigo-300 mt-2 font-medium">Best value for professional agents</p>
                        )}
                      </div>

                      <div className="space-y-4 mb-10 flex-grow pt-8 border-t border-slate-200/20">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-4">
                            {feature.included ? (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular
                                  ? feature.highlight ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-800 text-indigo-400'
                                  : feature.highlight ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-slate-800/50' : 'bg-slate-100'
                                }`}>
                                <X className={`w-3.5 h-3.5 ${plan.popular ? 'text-slate-600' : 'text-slate-400'}`} />
                              </div>
                            )}
                            <span className={`text-[15px] ${feature.included
                                ? feature.highlight
                                  ? plan.popular ? 'font-semibold text-white' : 'font-semibold text-slate-900'
                                  : plan.popular ? 'text-slate-200' : 'text-slate-700'
                                : plan.popular ? 'text-slate-600' : 'text-slate-400'
                              }`}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Link to={plan.ctaLink} className="mt-auto block w-full">
                        <Button
                          className={`w-full h-14 text-base font-semibold ${plan.popular
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 border-0'
                              : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-slate-300 shadow-sm'
                            }`}
                          variant={plan.popular ? "default" : "outline"}
                        >
                          {plan.popular && <CreditCard className="h-5 w-5 mr-2" />}
                          {plan.cta}
                          {plan.popular && <ArrowRight className="h-5 w-5 ml-2" />}
                        </Button>
                      </Link>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="mt-16 text-center">
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  <span>Instant Activation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <span>Cancel Anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  <span>7-Day Money Back</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-24 bg-white border-t border-slate-100 relative" aria-labelledby="comparison-table">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 id="comparison-table" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                Compare Plans Side by Side
              </h2>
              <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                See exactly what's included before making your decision. Get the best tools for your business.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/20 bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                    <th className="text-left py-6 px-6 font-bold text-slate-900 text-lg w-1/3">Core Feature</th>
                    <th className="text-center py-6 px-4 font-bold text-slate-900 text-lg w-1/3">
                      Free
                      <span className="block text-sm font-medium text-slate-500 mt-1">₹0 forever</span>
                    </th>
                    <th className="text-center py-6 px-4 font-bold text-indigo-600 text-lg w-1/3 bg-indigo-50/50 relative">
                      <span className="inline-flex items-center gap-2">
                        <Crown className="w-5 h-5 text-indigo-600" />
                        Premium
                      </span>
                      <span className="block text-sm font-medium text-indigo-400 mt-1">₹199 / month</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className={`hover:bg-slate-50/50 transition-colors`}>
                      <td className="py-5 px-6 font-medium text-slate-700">{row.feature}</td>
                      <td className="text-center py-5 px-4 font-medium">
                        {row.free === "✓" ? (
                          <Check className="w-5 h-5 text-slate-400 mx-auto" />
                        ) : row.free === "✗" ? (
                          <X className="w-5 h-5 text-slate-200 mx-auto" />
                        ) : (
                          <span className="text-slate-500">{row.free}</span>
                        )}
                      </td>
                      <td className="text-center py-5 px-4 font-medium bg-indigo-50/30">
                        {row.premium === "✓" ? (
                          <Check className="w-5 h-5 text-indigo-600 mx-auto drop-shadow-sm" />
                        ) : row.premium === "✗" ? (
                          <X className="w-5 h-5 text-slate-300 mx-auto" />
                        ) : (
                          <span className="text-indigo-900 font-bold">{row.premium}</span>
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
        <section className="py-24 bg-slate-50" aria-labelledby="pricing-faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="pricing-faq" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600 font-medium">
                Everything you need to know about pricing, billing, and subscriptions
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-white rounded-2xl border border-slate-200/60 px-6 sm:px-8 shadow-sm data-[state=open]:shadow-md transition-all duration-300"
                >
                  <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-indigo-600 hover:no-underline py-6 text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-6 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] opacity-70"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-300 mb-10 font-medium">
              Join thousands of insurance agents who trust PolicyTracker.in. Start free today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white text-lg h-14 px-12 shadow-xl shadow-indigo-900/50 border-0 transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo-request" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-10 border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 hover:border-slate-600">
                  Contact Sales
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

export default PricingPage;
