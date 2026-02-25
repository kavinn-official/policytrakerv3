import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, X, ArrowRight, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "Free Forever",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    popular: false,
    features: [
      { included: true, text: "Up to 200 policies" },
      { included: true, text: "Basic renewal alerts" },
      { included: true, text: "Client management" },
      { included: true, text: "50 OCR scans/month" },
      { included: true, text: "2GB document storage" },
      { included: true, text: "Mobile access" },
      { included: false, text: "Automated WhatsApp reminders" },
      { included: false, text: "Commission analytics" },
      { included: false, text: "Priority support" }
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const
  },
  {
    name: "Pro Plan",
    price: "₹199",
    period: "/month",
    yearlyPrice: "₹1,999/year",
    yearlySaving: "Save ₹389",
    description: "For serious insurance professionals",
    popular: true,
    features: [
      { included: true, text: "Unlimited policies" },
      { included: true, text: "Automated WhatsApp reminders" },
      { included: true, text: "Advanced commission tracking" },
      { included: true, text: "Unlimited OCR scans" },
      { included: true, text: "10GB document storage" },
      { included: true, text: "Premium analytics dashboard" },
      { included: true, text: "Bulk upload & export" },
      { included: true, text: "7-day data backup" },
      { included: true, text: "Priority WhatsApp support" }
    ],
    cta: "Start Pro Trial",
    ctaVariant: "default" as const
  }
];

const PricingSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-white" id="pricing" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-full text-sm mb-4 border border-indigo-100/50">
            Simple, Transparent Pricing
          </span>
          <h2 id="pricing-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Plans That Grow With Your Business
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all duration-300 rounded-[2rem] p-4 ${plan.popular
                  ? 'bg-slate-900 text-white shadow-2xl scale-105 border-slate-800'
                  : 'bg-white border-slate-200/60 shadow-sm hover:shadow-xl'
                }`}
            >
              {/* Subtle background glow for Pro plan */}
              {plan.popular && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              )}

              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-6 right-6">
                  <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Star className="h-3 w-3 fill-indigo-400 text-indigo-400" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-left pb-4 pt-6 px-6">
                <CardTitle className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</CardTitle>
                <p className={`${plan.popular ? 'text-slate-400' : 'text-slate-500'} text-sm`}>{plan.description}</p>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                {/* Price */}
                <div className="mb-8 relative z-10">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-extrabold tracking-tight font-mono ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    <span className={`text-sm font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>
                  </div>
                  {plan.yearlyPrice && (
                    <div className="mt-3 flex items-center gap-3">
                      <span className={`text-sm ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>or {plan.yearlyPrice}</span>
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${plan.popular ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                        {plan.yearlySaving}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-10 relative z-10">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-4">
                      {feature.included ? (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.popular ? 'bg-indigo-500/20' : 'bg-slate-100'}`}>
                          <CheckCircle className={`h-3 w-3 ${plan.popular ? 'text-indigo-400' : 'text-slate-700'}`} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-slate-50 border border-slate-100">
                          <X className="h-3 w-3 text-slate-300" />
                        </div>
                      )}
                      <span className={`text-sm leading-tight pt-1 ${plan.popular
                          ? (feature.included ? 'text-slate-200' : 'text-slate-600')
                          : (feature.included ? 'text-slate-700' : 'text-slate-400')
                        }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to="/auth" className="block relative z-10">
                  <Button
                    className={`w-full text-base h-12 shadow-sm ${plan.popular
                        ? 'bg-white text-slate-900 hover:bg-slate-100'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    variant={plan.popular ? 'secondary' : 'default'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-50 text-slate-700 border border-slate-200/60 px-6 py-3 rounded-full shadow-sm text-sm">
            <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
              <Zap className="h-3 w-3 text-slate-700" />
            </div>
            <span className="font-medium">7-Day Money-Back Guarantee on Pro Plan</span>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-20 text-center bg-slate-50/50 border border-slate-200/50 rounded-3xl p-10 max-w-4xl mx-auto backdrop-blur-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Need Custom Features?</h3>
          <p className="text-slate-600 mb-6 text-sm">
            Running a large agency or team? We offer custom solutions with dedicated support and data migration.
          </p>
          <Link to="/enquiry">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white h-12 px-8 shadow-sm">
              Contact for Enterprise Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
