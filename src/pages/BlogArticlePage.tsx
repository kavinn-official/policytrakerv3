import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar, User, Clock, Share2, BookOpen, CheckCircle } from "lucide-react";
import React from "react";
import SEOHead from "@/components/SEOHead";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

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
      <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
        <p className="lead text-xl text-slate-500 mb-8 font-medium leading-relaxed">
          Motor insurance renewal is a critical opportunity for insurance agents to strengthen client relationships and ensure continuous coverage. Here are 10 essential tips to help you and your clients navigate the renewal process effectively.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">1. Start the Renewal Process Early</h2>
        <p className="text-slate-600 leading-relaxed">Begin discussing renewal at least 30 days before the policy expires. This gives clients time to compare options and make informed decisions. Using a policy tracker tool like PolicyTracker.in helps you stay on top of expiry dates automatically.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">2. Understand No-Claim Bonus (NCB) Benefits</h2>
        <p className="text-slate-600 leading-relaxed">Explain the NCB benefits to your clients. A good claims history can result in discounts of up to 50% on the own damage premium. This is a significant selling point for timely renewals.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">3. Compare Multiple Quotes</h2>
        <p className="text-slate-600 leading-relaxed">Always provide clients with 3-4 competitive quotes from different insurers. This builds trust and ensures they get the best value. Document all comparisons for transparency.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">4. Review Coverage Requirements</h2>
        <p className="text-slate-600 leading-relaxed">Assess if the current coverage still meets the client's needs. Vehicle value depreciates over time, and coverage requirements may change. Suggest appropriate add-ons like zero depreciation or engine protection if needed.</p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">5. Send Timely WhatsApp Reminders</h2>
        <p className="text-slate-600 leading-relaxed">Use WhatsApp reminders to notify clients about upcoming renewals. Personalized messages with policy details, expiry dates, and your contact information increase engagement and renewal rates.</p>

        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-100 p-8 my-10 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-xl font-bold text-indigo-900 mb-3 relative z-10 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Pro Tip: Use PolicyTracker.in
          </h3>
          <p className="text-slate-700 mb-0 relative z-10 leading-relaxed">
            Automate your renewal reminders and never miss an expiry date. PolicyTracker.in helps you manage all your client policies, send WhatsApp reminders, and track renewals in one place. Start your free trial today!
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
      <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
        <p className="lead text-xl text-slate-500 mb-8 font-medium leading-relaxed">
          WhatsApp has become the preferred communication channel for most Indians. As an insurance agent, leveraging WhatsApp for policy reminders can significantly boost your renewal rates.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">Why WhatsApp Works for Insurance Reminders</h2>
        <ul className="space-y-3 list-none pl-0">
          <li className="flex items-start gap-3 text-slate-600"><CheckCircle className="h-6 w-6 text-indigo-500 flex-shrink-0" /> <span><strong>98% message open rate</strong> compared to 20% for emails</span></li>
          <li className="flex items-start gap-3 text-slate-600"><CheckCircle className="h-6 w-6 text-indigo-500 flex-shrink-0" /> <span><strong>Instant delivery</strong> and read receipts</span></li>
          <li className="flex items-start gap-3 text-slate-600"><CheckCircle className="h-6 w-6 text-indigo-500 flex-shrink-0" /> <span>Personal and <strong>conversational tone</strong></span></li>
          <li className="flex items-start gap-3 text-slate-600"><CheckCircle className="h-6 w-6 text-indigo-500 flex-shrink-0" /> <span>Easy to share <strong>documents and images</strong></span></li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">Best Practices for WhatsApp Reminders</h2>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Personalize Every Message</h3>
        <p className="text-slate-600 leading-relaxed">Always include the client's name, policy number, and specific vehicle details. Generic messages get ignored.</p>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Time Your Messages Right</h3>
        <p className="text-slate-600 leading-relaxed">Send the first reminder 30 days before expiry, followed by reminders at 15 days, 7 days, and 3 days. The urgency increases conversion rates.</p>

        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-100 p-8 my-10 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-xl font-bold text-indigo-900 mb-3 relative z-10">Automate Your WhatsApp Reminders</h3>
          <p className="text-slate-700 mb-0 relative z-10 leading-relaxed">
            PolicyTracker.in lets you send personalized WhatsApp reminders to all your clients with one click. Track which clients have been contacted and follow up efficiently.
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
      <div className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
        <p className="lead text-xl text-slate-500 mb-8 font-medium leading-relaxed">
          Understanding the vehicle insurance claim process is essential for every insurance agent. This guide will help you assist your clients through every step of filing a claim.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">Types of Claims</h2>
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-xl hover:shadow-md transition-shadow">
            <h3 className="font-bold text-indigo-900 mt-0">Cashless Claims</h3>
            <p className="text-slate-600 text-base mb-0">Repairs done at network garages without upfront payment by the policyholder.</p>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-xl hover:shadow-md transition-shadow">
            <h3 className="font-bold text-blue-900 mt-0">Reimbursement Claims</h3>
            <p className="text-slate-600 text-base mb-0">Policyholder pays first, then claims reimbursement from the insurer.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-5">Step-by-Step Claim Process</h2>

        <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Step 1: Immediate Actions After Accident</h3>
        <ul className="space-y-2 text-slate-600 list-disc pl-5">
          <li>Ensure safety of all passengers</li>
          <li>Call police if required (mandatory for theft/injury)</li>
          <li>Take photos of the damage and accident scene</li>
          <li>Collect details of other parties involved</li>
        </ul>

        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-indigo-100 p-8 my-10 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="text-xl font-bold text-indigo-900 mb-3 relative z-10 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Keep Client Documents Organized
          </h3>
          <p className="text-slate-700 mb-0 relative z-10 leading-relaxed">
            Use PolicyTracker.in to store policy documents digitally. Quick access to policy details helps expedite the claims process.
          </p>
        </div>
      </div>
    )
  },
  "health-insurance-claim-tips": {
    title: "Health Insurance Claim Process: Complete Guide for Agents",
    category: "Health Insurance",
    readTime: "8 min read",
    date: "2025-02-03",
    author: "Policy Tracker Team",
    metaDescription: "Help your clients file health insurance claims efficiently. Learn about cashless hospitalization, reimbursement claims, and common rejection reasons.",
    content: (
      <div className="prose prose-lg max-w-none text-slate-600">
        <p className="lead text-xl text-slate-500 mb-6 font-medium">
          Health insurance claims can be complex. As an agent, understanding the claim process thoroughly helps you guide clients and ensure smooth settlements.
        </p>
        <p>This is a placeholder for the full article content. In a real application, this would contain the complete guide.</p>
      </div>
    )
  },
  "life-insurance-selling-strategies": {
    title: "Life Insurance Selling Strategies: Convert More Leads",
    category: "Life Insurance",
    readTime: "7 min read",
    date: "2025-02-02",
    author: "Policy Tracker Team",
    metaDescription: "Proven techniques for selling term and whole life insurance. Learn how to identify client needs, overcome objections, and close more deals.",
    content: (
      <div className="prose prose-lg max-w-none text-slate-600">
        <p className="lead text-xl text-slate-500 mb-6 font-medium">
          Life insurance selling requires a different approach than motor or health insurance. It's about protecting families and securing futures. Here are proven strategies to increase your conversion rates.
        </p>
        <p>This is a placeholder for the full article content.</p>
      </div>
    )
  },
  "policy-document-management": {
    title: "Policy Document Management Best Practices for Agents",
    category: "Productivity",
    readTime: "5 min read",
    date: "2025-01-30",
    author: "Policy Tracker Team",
    metaDescription: "Organize and manage insurance policy documents efficiently. Learn digital storage tips, naming conventions, and quick retrieval techniques.",
    content: (
      <div className="prose prose-lg max-w-none text-slate-600">
        <p className="lead text-xl text-slate-500 mb-6 font-medium">
          Efficient document management is crucial for insurance agents. Disorganized files lead to missed renewals, frustrated clients, and lost business. Here's how to stay organized.
        </p>
        <p>This is a placeholder for the full article content.</p>
      </div>
    )
  },
  "family-floater-health-insurance": {
    title: "Family Floater vs Individual Health Insurance: Which to Recommend?",
    category: "Health Insurance",
    readTime: "6 min read",
    date: "2025-01-22",
    author: "Policy Tracker Team",
    metaDescription: "Understand the pros and cons of family floater policies. Guide your clients to choose the right health insurance plan for their family.",
    content: (
      <div className="prose prose-lg max-w-none text-slate-600">
        <p className="lead text-xl text-slate-500 mb-6 font-medium">
          Choosing between family floater and individual health insurance plans is one of the most common questions clients ask. Here's how to guide them to the right decision.
        </p>
        <p>This is a placeholder for the full article content.</p>
      </div>
    )
  },
  "term-vs-whole-life-insurance": {
    title: "Term vs Whole Life Insurance: Complete Comparison Guide",
    category: "Life Insurance",
    readTime: "7 min read",
    date: "2025-01-18",
    author: "Policy Tracker Team",
    metaDescription: "Help clients choose between term and whole life insurance. Understand coverage, premiums, benefits, and which suits different life stages.",
    content: (
      <div className="prose prose-lg max-w-none text-slate-600">
        <p className="lead text-xl text-slate-500 mb-6 font-medium">
          Term vs whole life insurance is a fundamental decision for clients. Understanding the differences helps you recommend the right product.
        </p>
        <p>This is a placeholder for the full article content.</p>
      </div>
    )
  },
  "critical-illness-insurance-guide": {
    title: "Critical Illness Insurance: What Every Agent Should Know",
    category: "Health Insurance",
    readTime: "6 min read",
    date: "2025-01-12",
    author: "Policy Tracker Team",
    metaDescription: "Comprehensive guide to selling critical illness riders. Learn covered diseases, claim process, and how to explain benefits to clients.",
    content: (
      <div className="prose prose-lg max-w-none text-slate-600">
        <p className="lead text-xl text-slate-500 mb-6 font-medium">
          Critical Illness Insurance is an essential part of financial planning that covers life-threatening diseases. Learn how to explain these benefits effectively.
        </p>
        <p>This is a placeholder for the full article content.</p>
      </div>
    )
  }
};

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? articles[slug] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center selection:bg-indigo-100 selection:text-indigo-900">
        <Navigation />
        <Card className="max-w-md shadow-xl border-slate-200 mt-20">
          <CardContent className="p-10 text-center">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Article Not Found</h1>
            <p className="text-slate-500 mb-8 font-medium">The article you're looking for doesn't exist or has been moved.</p>
            <Link to="/blog">
              <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-md">Back to Blog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${article.title} | PolicyTracker Blog`}
        description={article.metaDescription}
        canonicalPath={`/blog/${slug}`}
      />

      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
        <Navigation />

        {/* Article Header */}
        <section className="pt-24 pb-12 bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <Link to="/blog" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-8 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            <Badge variant="secondary" className="mb-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 font-medium px-4 py-1.5 text-sm rounded-full shadow-sm">
              {article.category}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                {article.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                {new Date(article.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                {article.readTime}
              </span>
              <Button variant="outline" size="sm" className="ml-auto border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors hidden sm:flex">
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 max-w-3xl">
            {article.content}

            {/* CTA */}
            <Card className="mt-20 bg-slate-900 text-white border-0 overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[80px] opacity-70"></div>

              <CardContent className="p-10 md:p-12 text-center relative z-10">
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Start Managing Your Policies Today</h2>
                <p className="text-slate-300 mb-8 text-lg">
                  Join 1000+ insurance agents using PolicyTracker.in to grow their business efficiently.
                </p>
                <Link to="/auth">
                  <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold h-14 px-8 text-lg border-0 shadow-lg shadow-indigo-900/50 w-full sm:w-auto">
                    Start Your Free Trial
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </article>

        <Footer />
      </div>
    </>
  );
};

export default BlogArticlePage;
