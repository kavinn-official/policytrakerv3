import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, HelpCircle } from "lucide-react";

// SEO & AEO optimized FAQs with question-answer format for AI search engines
const faqs = [
  {
    question: "What is PolicyTracker.in?",
    answer: "PolicyTracker.in is India's leading insurance agent CRM and policy management software. It helps insurance agents track motor, health, life, and general insurance policies, send WhatsApp renewal reminders to clients, manage commissions, store policy documents, and grow their insurance business. Trusted by 1,500+ agents across India."
  },
  {
    question: "How does PolicyTracker help insurance agents manage renewals?",
    answer: "PolicyTracker automatically tracks all policy expiry dates and sends you alerts 30, 15, and 7 days before renewal. You can send personalized WhatsApp reminders to clients with one click, including policy details and expiry date. This automated system helps agents achieve 98% renewal rates and never miss a policy renewal."
  },
  {
    question: "Is PolicyTracker free to use?",
    answer: "Yes! PolicyTracker offers a Free Forever plan that includes up to 200 policies, basic renewal alerts, 50 OCR scans per month, and 2GB document storage. For agents managing larger portfolios, the Pro plan at ₹199/month (or ₹1,999/year) offers unlimited policies, automated WhatsApp reminders, and advanced commission analytics."
  },
  {
    question: "Which types of insurance policies can I track?",
    answer: "PolicyTracker supports all insurance types: Motor Insurance (car, two-wheeler, commercial vehicles), Health Insurance (individual, family floater, group health), Life Insurance (term, ULIP, endowment, whole life), and General Insurance (fire, marine, liability, property). One platform for your entire insurance portfolio."
  },
  {
    question: "How do I import my existing policy data?",
    answer: "You can import policies in multiple ways: Upload policy PDFs and let our OCR technology auto-fill details, import from Excel or CSV files using our bulk upload feature, or manually add policies. We also offer free data migration assistance to help you digitize records from diaries or notepads."
  },
  {
    question: "How does the OCR PDF auto-fill feature work?",
    answer: "Simply upload a policy PDF document, and our AI-powered OCR technology automatically extracts policy details like policy number, client name, premium, dates, vehicle information, and more. This saves 80% of manual data entry time and reduces errors significantly."
  },
  {
    question: "Can I track my insurance commission income?",
    answer: "Yes! PolicyTracker includes comprehensive commission tracking. You can set commission percentages for each policy, track first-year vs renewal commissions, view commission reports by company or time period, and export earnings data. Know exactly how much you're earning from your insurance business."
  },
  {
    question: "Is my client data secure on PolicyTracker?",
    answer: "Absolutely. PolicyTracker uses industry-standard 256-bit SSL encryption for all data transmission. Your policy and client data is stored securely in the cloud with automatic daily backups. Only you can access your account data - we never share your information with third parties."
  },
  {
    question: "Can I use PolicyTracker on my mobile phone?",
    answer: "Yes! PolicyTracker is fully responsive and works on any device - desktop, tablet, or mobile phone. You can also install it as a PWA (Progressive Web App) on your phone for quick access like a native mobile app, without needing to download from app stores."
  },
  {
    question: "How do WhatsApp reminders work?",
    answer: "With one click, you can send personalized renewal reminders to clients via WhatsApp. The message includes the client's name, policy details, expiry date, and your contact information. On the Pro plan, you can set up automated reminders that send WhatsApp messages automatically before policy expiry."
  },
  {
    question: "What reports can I generate with PolicyTracker?",
    answer: "PolicyTracker offers comprehensive reporting: Premium collection reports, renewal due reports, commission analytics, company-wise policy distribution, month-over-month growth tracking, and more. All reports can be exported to Excel, PDF, or printed directly."
  },
  {
    question: "Is PolicyTracker suitable for a team or agency?",
    answer: "Yes! Whether you're an individual agent or running an agency, PolicyTracker scales with your needs. The Pro plan supports unlimited policies and team usage. For larger agencies needing custom features, contact us for enterprise solutions with dedicated support."
  }
];

const FAQSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50" id="faq" aria-labelledby="faq-heading">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </span>
          <h2 id="faq-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Know
          </h2>
          <p className="text-lg text-gray-600">
            Got questions about PolicyTracker? Find answers to common questions below.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-white rounded-xl border border-gray-200 px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-lg font-medium text-gray-900 pr-4">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-gray-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still Have Questions?</h3>
          <p className="text-gray-600 mb-4">
            Our team is here to help you get started with PolicyTracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Contact Support
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                Try Free Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
