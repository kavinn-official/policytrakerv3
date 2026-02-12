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

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Use PolicyTracker.in to Manage Insurance Policies",
  "description": "Step-by-step guide for insurance agents to start managing policies, sending reminders, and tracking commissions with PolicyTracker.in",
  "totalTime": "PT5M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Sign Up for Free",
      "text": "Create your free PolicyTracker.in account in under 30 seconds. No credit card required. Access the dashboard immediately.",
      "url": "https://policytracker.in/auth"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Add Your Policies",
      "text": "Add policies manually or bulk upload via Excel. Supports Motor, Health, Life, and General Insurance. OCR auto-fill from PDF documents.",
      "url": "https://policytracker.in/add-policy"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Track Renewals & Earn More",
      "text": "Get automated WhatsApp renewal reminders, track commissions, generate reports, and never miss a policy renewal again.",
      "url": "https://policytracker.in/dashboard"
    }
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "PolicyTracker.in Insurance Agent CRM",
  "serviceType": "Insurance Policy Management Software",
  "provider": {
    "@type": "Organization",
    "name": "PolicyTracker.in",
    "url": "https://policytracker.in"
  },
  "description": "Complete insurance agent CRM with policy tracking, WhatsApp renewal reminders, OCR PDF auto-fill, commission analytics, and bulk upload. Supports motor, health, life and general insurance.",
  "areaServed": {
    "@type": "Country",
    "name": "India"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "PolicyTracker Plans",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Free Plan"
        },
        "price": "0",
        "priceCurrency": "INR",
        "description": "200 policies, 50 OCR scans, 2GB storage"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Pro Plan"
        },
        "price": "199",
        "priceCurrency": "INR",
        "description": "Unlimited policies, automated WhatsApp reminders, 10GB storage"
      }
    ]
  }
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "PolicyTracker.in",
  "url": "https://policytracker.in",
  "applicationCategory": "BusinessApplication",
  "browserRequirements": "Requires JavaScript. Works on Chrome, Firefox, Safari, Edge.",
  "softwareVersion": "2.0",
  "operatingSystem": "Web, Android, iOS (PWA)",
  "availableOnDevice": "Desktop, Mobile, Tablet",
  "countriesSupported": "IN",
  "inLanguage": "en-IN"
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
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
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
