import SEOHead from "@/components/SEOHead";
import Navigation from "@/components/landing/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import InsuranceTypesSection from "@/components/landing/InsuranceTypesSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

// JSON-LD Structured Data for SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PolicyTracker.in",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "description": "India's #1 insurance agent CRM and policy management software. Track motor, health, and life insurance policies, send WhatsApp renewal reminders, manage commissions, and grow your insurance business.",
  "url": "https://policytracker.in",
  "author": {
    "@type": "Organization",
    "name": "PolicyTracker.in",
    "url": "https://policytracker.in"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "description": "Free Forever Plan with up to 200 policies"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "1500",
    "bestRating": "5"
  },
  "featureList": [
    "Policy Management for Motor, Health, Life Insurance",
    "Automated WhatsApp Renewal Reminders",
    "Commission Tracking and Analytics",
    "OCR PDF Auto-Fill",
    "Bulk Policy Upload from Excel",
    "Secure Document Storage",
    "Mobile Access PWA",
    "Business Reports and Analytics"
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://policytracker.in"
    }
  ]
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "PolicyTracker.in",
  "description": "Insurance Agent CRM and Policy Management Software",
  "url": "https://policytracker.in",
  "telephone": "+91-6381615829",
  "email": "support@policytracker.in",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Chennai",
    "addressRegion": "Tamil Nadu",
    "addressCountry": "IN"
  },
  "priceRange": "₹0 - ₹1999"
};

const LandingPage = () => {
  return (
    <>
      <SEOHead
        title="PolicyTracker.in | #1 Insurance Agent CRM & Policy Management Software India"
        description="India's best insurance agent CRM for motor, health & life insurance. Track policies, send WhatsApp renewal reminders, manage commissions, OCR PDF auto-fill. Free forever plan. Trusted by 1500+ agents."
        canonicalPath="/"
        keywords="insurance agent CRM, policy tracker India, insurance renewal reminder software, commission tracking software, motor insurance software, health insurance agent software, life insurance CRM, policy management software, WhatsApp policy reminder, insurance agent app India"
        ogTitle="PolicyTracker.in - All-in-One CRM for Insurance Agents"
        ogDescription="Track policies, send WhatsApp reminders, manage commissions. Free forever plan for insurance agents. Join 1500+ agents growing their business."
      />

      {/* JSON-LD Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section - H1, Main Value Proposition */}
        <HeroSection />

        {/* Benefits Section - Key Agent Benefits */}
        <BenefitsSection />

        {/* Insurance Types Section - Motor, Health, Life, General */}
        <InsuranceTypesSection />

        {/* Features Section - Product Features Grid */}
        <FeaturesSection />

        {/* How It Works - 3-Step Process */}
        <HowItWorksSection />

        {/* Testimonials & Social Proof */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section - SEO & AEO Optimized */}
        <FAQSection />

        {/* Final CTA */}
        <CTASection />

        {/* Footer */}
        <Footer />

        {/* WhatsApp Floating Button */}
        <WhatsAppFloatingButton />
      </div>
    </>
  );
};

export default LandingPage;
