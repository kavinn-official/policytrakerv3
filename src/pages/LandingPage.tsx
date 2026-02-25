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
import StickyMobileCTA from "@/components/landing/StickyMobileCTA";
import ExitIntentPopup from "@/components/landing/ExitIntentPopup";

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

// Single FAQ schema - only place where FAQPage JSON-LD is defined
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is PolicyTracker.in?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PolicyTracker.in is India's leading insurance agent CRM and policy management software. It helps insurance agents track motor, health, life, and general insurance policies, send WhatsApp renewal reminders to clients, manage commissions, store policy documents, and grow their insurance business. Trusted by 1,500+ agents across India."
      }
    },
    {
      "@type": "Question",
      "name": "How does PolicyTracker help insurance agents manage renewals?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PolicyTracker automatically tracks all policy expiry dates and sends you alerts 30, 15, and 7 days before renewal. You can send personalized WhatsApp reminders to clients with one click, including policy details and expiry date. This automated system helps agents achieve 98% renewal rates."
      }
    },
    {
      "@type": "Question",
      "name": "Is PolicyTracker free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! PolicyTracker offers a Free Forever plan that includes up to 200 policies, basic renewal alerts, 50 OCR scans per month, and 2GB document storage. For agents managing larger portfolios, the Pro plan at ₹199/month offers unlimited policies, automated WhatsApp reminders, and advanced commission analytics."
      }
    },
    {
      "@type": "Question",
      "name": "Which types of insurance policies can I track?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PolicyTracker supports all insurance types: Motor Insurance (car, two-wheeler, commercial vehicles), Health Insurance (individual, family floater, group health), Life Insurance (term, ULIP, endowment, whole life), and General Insurance (fire, marine, liability, property)."
      }
    },
    {
      "@type": "Question",
      "name": "How do I import my existing policy data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can import policies in multiple ways: Upload policy PDFs and let our OCR technology auto-fill details, import from Excel or CSV files using our bulk upload feature, or manually add policies."
      }
    },
    {
      "@type": "Question",
      "name": "How does the OCR PDF auto-fill feature work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simply upload a policy PDF document, and our AI-powered OCR technology automatically extracts policy details like policy number, client name, premium, dates, vehicle information, and more. This saves 80% of manual data entry time."
      }
    },
    {
      "@type": "Question",
      "name": "Can I track my insurance commission income?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! PolicyTracker includes comprehensive commission tracking. You can set commission percentages for each policy, track first-year vs renewal commissions, view commission reports by company or time period, and export earnings data."
      }
    },
    {
      "@type": "Question",
      "name": "Is my client data secure on PolicyTracker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. PolicyTracker uses industry-standard 256-bit SSL encryption for all data transmission. Your policy and client data is stored securely in the cloud with automatic daily backups. Only you can access your account data."
      }
    },
    {
      "@type": "Question",
      "name": "How do WhatsApp reminders work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "With one click, you can send personalized renewal reminders to clients via WhatsApp. The message includes the client's name, policy details, expiry date, and your contact information. On the Pro plan, you can set up automated reminders."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use PolicyTracker on my mobile phone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! PolicyTracker is fully responsive and works on any device. You can also install it as a PWA (Progressive Web App) on your phone for quick access like a native mobile app, without needing to download from app stores."
      }
    }
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section - H1, Main Value Proposition */}
        <HeroSection />

        {/* Features Section - Product Features Grid (Bento) */}
        <FeaturesSection />

        {/* Insurance Types Section - Motor, Health, Life, General */}
        <InsuranceTypesSection />

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

        {/* WhatsApp Floating Button - hidden on mobile where sticky CTA shows */}
        <div className="hidden sm:block">
          <WhatsAppFloatingButton />
        </div>

        {/* Sticky Mobile CTA Bar */}
        <StickyMobileCTA />

        {/* Exit Intent Popup */}
        <ExitIntentPopup />
      </div>
    </>
  );
};

export default LandingPage;
