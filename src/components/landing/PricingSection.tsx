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
          <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            Simple, Transparent Pricing
          </span>
          <h2 id="pricing-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Plans That Grow With Your Business
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-2 border-teal-500 shadow-lg scale-105' 
                  : 'border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-sm font-medium px-4 py-1 rounded-bl-lg flex items-center gap-1">
                    <Star className="h-4 w-4 fill-white" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-4">
                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  {plan.yearlyPrice && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">or {plan.yearlyPrice}</span>
                      <span className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        {plan.yearlySaving}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to="/auth" className="block">
                  <Button 
                    className={`w-full text-lg py-6 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700' 
                        : ''
                    }`}
                    variant={plan.ctaVariant}
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-6 py-3 rounded-full">
            <Zap className="h-5 w-5" />
            <span className="font-medium">7-Day Money Back Guarantee on Pro Plan</span>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Need Custom Features?</h3>
          <p className="text-gray-600 mb-4">
            Running a large agency or team? We offer custom solutions with dedicated support.
          </p>
          <Link to="/enquiry">
            <Button variant="outline" size="lg">
              Contact for Enterprise Pricing
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
