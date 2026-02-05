import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Clock, Share2, BookOpen, Car, Shield, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface ArticleContent {
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  metaDescription: string;
  content: React.ReactNode;
}

const articles: Record<string, ArticleContent> = {
  "motor-insurance-renewal-tips": {
    title: "10 Essential Tips for Motor Insurance Renewal in 2025",
    category: "Motor Insurance",
    readTime: "5 min read",
    date: "2025-02-01",
    author: "Policy Tracker Team",
    metaDescription: "Learn 10 essential tips for motor insurance renewal in 2025. Expert advice for insurance agents on comparing quotes, NCB benefits, and renewal strategies.",
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-gray-600 mb-6">
          Motor insurance renewal is a critical opportunity for insurance agents to strengthen client relationships and ensure continuous coverage. Here are 10 essential tips to help you and your clients navigate the renewal process effectively.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Start the Renewal Process Early</h2>
        <p>Begin discussing renewal at least 30 days before the policy expires. This gives clients time to compare options and make informed decisions. Using a policy tracker tool like Policy Tracker.in helps you stay on top of expiry dates automatically.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Understand No-Claim Bonus (NCB) Benefits</h2>
        <p>Explain the NCB benefits to your clients. A good claims history can result in discounts of up to 50% on the own damage premium. This is a significant selling point for timely renewals.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Compare Multiple Quotes</h2>
        <p>Always provide clients with 3-4 competitive quotes from different insurers. This builds trust and ensures they get the best value. Document all comparisons for transparency.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Review Coverage Requirements</h2>
        <p>Assess if the current coverage still meets the client's needs. Vehicle value depreciates over time, and coverage requirements may change. Suggest appropriate add-ons like zero depreciation or engine protection if needed.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Send Timely WhatsApp Reminders</h2>
        <p>Use WhatsApp reminders to notify clients about upcoming renewals. Personalized messages with policy details, expiry dates, and your contact information increase engagement and renewal rates.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Explain the Consequences of Lapsed Policies</h2>
        <p>Help clients understand that driving without insurance is illegal and can result in fines. A lapsed policy also means losing NCB benefits, which takes years to accumulate.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Offer Online Payment Options</h2>
        <p>Make the renewal process convenient by offering multiple payment methods including UPI, cards, and net banking. Quick and easy payment options increase conversion rates.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Keep Documentation Ready</h2>
        <p>Have all necessary documents ready: previous policy copy, RC book, and identification documents. Digital copies stored in a policy management system speed up the process.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Address Common Objections</h2>
        <p>Be prepared to handle objections about pricing. Explain the value of comprehensive coverage vs. third-party only, and highlight the benefits of add-ons in case of accidents.</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Follow Up After Renewal</h2>
        <p>Send a thank-you message after successful renewal. Share the new policy document promptly and remind clients about claim procedures. This builds long-term relationships.</p>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Tip: Use Policy Tracker.in</h3>
          <p className="text-gray-700 mb-0">
            Automate your renewal reminders and never miss an expiry date. Policy Tracker.in helps you manage all your client policies, send WhatsApp reminders, and track renewals in one place. Start your free trial today!
          </p>
        </div>
      </div>
    )
  },
  "whatsapp-reminder-strategies": {
    title: "How to Use WhatsApp Reminders to Increase Policy Renewals",
    category: "Sales Tips",
    readTime: "4 min read",
    date: "2025-01-28",
    author: "Policy Tracker Team",
    metaDescription: "Discover effective WhatsApp messaging strategies that help insurance agents achieve higher renewal rates and maintain strong client relationships.",
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-gray-600 mb-6">
          WhatsApp has become the preferred communication channel for most Indians. As an insurance agent, leveraging WhatsApp for policy reminders can significantly boost your renewal rates.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why WhatsApp Works for Insurance Reminders</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> 98% message open rate compared to 20% for emails</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Instant delivery and read receipts</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Personal and conversational tone</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Easy to share documents and images</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Best Practices for WhatsApp Reminders</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">1. Personalize Every Message</h3>
        <p>Always include the client's name, policy number, and specific vehicle details. Generic messages get ignored.</p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">2. Time Your Messages Right</h3>
        <p>Send the first reminder 30 days before expiry, followed by reminders at 15 days, 7 days, and 3 days. The urgency increases conversion rates.</p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3. Include a Clear Call-to-Action</h3>
        <p>Always end your message with a clear next step: "Reply YES to renew" or "Call me at [number] to discuss options."</p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4. Use Policy Tracker's One-Click Feature</h3>
        <p>With Policy Tracker.in, you can send pre-formatted WhatsApp reminders with a single click. The message automatically includes all policy details.</p>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Automate Your WhatsApp Reminders</h3>
          <p className="text-gray-700 mb-0">
            Policy Tracker.in lets you send personalized WhatsApp reminders to all your clients with one click. Track which clients have been contacted and follow up efficiently.
          </p>
        </div>
      </div>
    )
  },
  "vehicle-insurance-claim-process": {
    title: "Complete Guide to Vehicle Insurance Claim Process in India",
    category: "Motor Insurance",
    readTime: "7 min read",
    date: "2025-01-25",
    author: "Policy Tracker Team",
    metaDescription: "Step-by-step guide to filing vehicle insurance claims in India. Help your clients navigate the claim process smoothly with this comprehensive resource.",
    content: (
      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-gray-600 mb-6">
          Understanding the vehicle insurance claim process is essential for every insurance agent. This guide will help you assist your clients through every step of filing a claim.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Types of Claims</h2>
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Cashless Claims</h3>
            <p className="text-blue-800 text-sm">Repairs done at network garages without upfront payment by the policyholder.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Reimbursement Claims</h3>
            <p className="text-green-800 text-sm">Policyholder pays first, then claims reimbursement from the insurer.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Step-by-Step Claim Process</h2>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Step 1: Immediate Actions After Accident</h3>
        <ul className="space-y-1">
          <li>Ensure safety of all passengers</li>
          <li>Call police if required (mandatory for theft/injury)</li>
          <li>Take photos of the damage and accident scene</li>
          <li>Collect details of other parties involved</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Step 2: Notify the Insurance Company</h3>
        <p>Report the incident within 24-48 hours. Provide policy number, date/time of incident, location, and brief description of what happened.</p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Step 3: File FIR (If Required)</h3>
        <p>File an FIR for theft, total loss, or third-party injury. This is mandatory documentation for certain claims.</p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Step 4: Submit Documents</h3>
        <ul className="space-y-1">
          <li>Claim form</li>
          <li>Copy of driving license</li>
          <li>RC book copy</li>
          <li>FIR copy (if applicable)</li>
          <li>Repair estimates</li>
          <li>Photos of damage</li>
        </ul>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Step 5: Vehicle Inspection</h3>
        <p>The insurance surveyor will inspect the vehicle and assess the damage. Be present during inspection if possible.</p>

        <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Step 6: Claim Settlement</h3>
        <p>After approval, cashless claims are settled directly with the garage. Reimbursement claims are processed within 7-15 working days.</p>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep Client Documents Organized</h3>
          <p className="text-gray-700 mb-0">
            Use Policy Tracker.in to store policy documents digitally. Quick access to policy details helps expedite the claims process.
          </p>
        </div>
      </div>
    )
  }
};

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h1>
            <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${article.title} | Policy Tracker Blog`}
        description={article.metaDescription}
        canonicalPath={`/blog/${slug}`}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Policy Tracker" className="h-8 w-8" loading="lazy" />
              <span className="text-xl font-bold text-primary">Policy Tracker</span>
            </Link>
            <Link to="/auth">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </header>

        {/* Article */}
        <article className="py-8 md:py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link to="/blog" className="inline-flex items-center text-primary hover:underline mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            <Badge variant="secondary" className="mb-4">
              {article.category}
            </Badge>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(article.date).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </span>
              <Button variant="ghost" size="sm" className="ml-auto">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {article.content}

            {/* CTA */}
            <Card className="mt-12 bg-primary text-white border-0">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-3">Start Managing Your Policies Today</h2>
                <p className="text-primary-foreground/80 mb-6">
                  Join 1000+ insurance agents using Policy Tracker.in to grow their business.
                </p>
                <Link to="/auth">
                  <Button size="lg" variant="secondary">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </article>

        {/* Footer */}
        <footer className="py-8 bg-gray-900 text-gray-400">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Policy Tracker.in. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogArticlePage;
