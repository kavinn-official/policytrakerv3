import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Clock, Share2, BookOpen, Car, Shield, CheckCircle, Heart, Briefcase, FolderOpen } from "lucide-react";
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
        <p className="lead text-xl text-muted-foreground mb-6">
          Motor insurance renewal is a critical opportunity for insurance agents to strengthen client relationships and ensure continuous coverage. Here are 10 essential tips to help you and your clients navigate the renewal process effectively.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Start the Renewal Process Early</h2>
        <p>Begin discussing renewal at least 30 days before the policy expires. This gives clients time to compare options and make informed decisions. Using a policy tracker tool like Policy Tracker.in helps you stay on top of expiry dates automatically.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. Understand No-Claim Bonus (NCB) Benefits</h2>
        <p>Explain the NCB benefits to your clients. A good claims history can result in discounts of up to 50% on the own damage premium. This is a significant selling point for timely renewals.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. Compare Multiple Quotes</h2>
        <p>Always provide clients with 3-4 competitive quotes from different insurers. This builds trust and ensures they get the best value. Document all comparisons for transparency.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Review Coverage Requirements</h2>
        <p>Assess if the current coverage still meets the client's needs. Vehicle value depreciates over time, and coverage requirements may change. Suggest appropriate add-ons like zero depreciation or engine protection if needed.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">5. Send Timely WhatsApp Reminders</h2>
        <p>Use WhatsApp reminders to notify clients about upcoming renewals. Personalized messages with policy details, expiry dates, and your contact information increase engagement and renewal rates.</p>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Pro Tip: Use Policy Tracker.in</h3>
          <p className="text-muted-foreground mb-0">
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
        <p className="lead text-xl text-muted-foreground mb-6">
          WhatsApp has become the preferred communication channel for most Indians. As an insurance agent, leveraging WhatsApp for policy reminders can significantly boost your renewal rates.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why WhatsApp Works for Insurance Reminders</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> 98% message open rate compared to 20% for emails</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Instant delivery and read receipts</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Personal and conversational tone</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Easy to share documents and images</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Best Practices for WhatsApp Reminders</h2>
        
        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Personalize Every Message</h3>
        <p>Always include the client's name, policy number, and specific vehicle details. Generic messages get ignored.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Time Your Messages Right</h3>
        <p>Send the first reminder 30 days before expiry, followed by reminders at 15 days, 7 days, and 3 days. The urgency increases conversion rates.</p>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Automate Your WhatsApp Reminders</h3>
          <p className="text-muted-foreground mb-0">
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
        <p className="lead text-xl text-muted-foreground mb-6">
          Understanding the vehicle insurance claim process is essential for every insurance agent. This guide will help you assist your clients through every step of filing a claim.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Types of Claims</h2>
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

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Step-by-Step Claim Process</h2>
        
        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Step 1: Immediate Actions After Accident</h3>
        <ul className="space-y-1">
          <li>Ensure safety of all passengers</li>
          <li>Call police if required (mandatory for theft/injury)</li>
          <li>Take photos of the damage and accident scene</li>
          <li>Collect details of other parties involved</li>
        </ul>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Keep Client Documents Organized</h3>
          <p className="text-muted-foreground mb-0">
            Use Policy Tracker.in to store policy documents digitally. Quick access to policy details helps expedite the claims process.
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
      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-muted-foreground mb-6">
          Health insurance claims can be complex. As an agent, understanding the claim process thoroughly helps you guide clients and ensure smooth settlements.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Types of Health Insurance Claims</h2>
        
        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">1. Cashless Hospitalization</h3>
        <p>The insurer directly settles bills with the network hospital. The policyholder only pays non-covered expenses.</p>
        <ul className="space-y-1">
          <li>Only available at network hospitals</li>
          <li>Pre-authorization required before admission</li>
          <li>E-card or policy details needed</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">2. Reimbursement Claims</h3>
        <p>The policyholder pays first, then submits bills for reimbursement within 15-30 days of discharge.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Claim Rejection Reasons</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2"><span className="text-red-500">✗</span> Pre-existing diseases not disclosed</li>
          <li className="flex items-start gap-2"><span className="text-red-500">✗</span> Waiting period not completed</li>
          <li className="flex items-start gap-2"><span className="text-red-500">✗</span> Documents missing or incomplete</li>
          <li className="flex items-start gap-2"><span className="text-red-500">✗</span> Treatment not covered under policy</li>
          <li className="flex items-start gap-2"><span className="text-red-500">✗</span> Policy lapsed or inactive</li>
        </ul>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Pro Tip for Agents</h3>
          <p className="text-muted-foreground mb-0">
            Always ensure clients understand their waiting periods and exclusions at the time of policy purchase. This prevents claim rejections and maintains trust.
          </p>
        </div>
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
      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-muted-foreground mb-6">
          Life insurance selling requires a different approach than motor or health insurance. It's about protecting families and securing futures. Here are proven strategies to increase your conversion rates.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Understanding Client Psychology</h2>
        <p>People don't like thinking about death. Your job is to shift the conversation from "dying" to "protecting." Focus on:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Children's education and future</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Spouse's financial independence</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Debt repayment (home loan, car loan)</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Maintaining current lifestyle for family</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Calculating the Right Coverage</h2>
        <p>Use the Human Life Value (HLV) method:</p>
        <ul className="space-y-1">
          <li><strong>Step 1:</strong> Calculate annual income</li>
          <li><strong>Step 2:</strong> Subtract personal expenses (typically 30%)</li>
          <li><strong>Step 3:</strong> Multiply by years until retirement</li>
          <li><strong>Step 4:</strong> Add outstanding debts</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Handling Common Objections</h2>
        
        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">"I'm too young for life insurance"</h3>
        <p>Response: "That's exactly why premiums are so affordable for you now. A 25-year-old pays 60% less than a 40-year-old for the same coverage."</p>

        <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">"I already have coverage from employer"</h3>
        <p>Response: "Employer coverage typically ends when you leave the job. Personal coverage stays with you regardless of career changes."</p>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Track All Your Life Insurance Policies</h3>
          <p className="text-muted-foreground mb-0">
            Policy Tracker.in helps you manage life, health, and motor insurance policies in one dashboard. Never miss a renewal or follow-up again.
          </p>
        </div>
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
      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-muted-foreground mb-6">
          Efficient document management is crucial for insurance agents. Disorganized files lead to missed renewals, frustrated clients, and lost business. Here's how to stay organized.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Go Digital First</h2>
        <p>Physical files are outdated. Digital document management offers:</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Instant search and retrieval</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Access from anywhere (mobile, laptop)</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Automatic backup and security</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Easy sharing with clients</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Naming Convention</h2>
        <p>Use a consistent naming format:</p>
        <code className="block bg-muted p-4 rounded-lg my-4">
          [ClientName]_[PolicyType]_[PolicyNumber]_[ExpiryDate].pdf
        </code>
        <p>Example: <code>RajeshKumar_Motor_POL123456_2025-03-15.pdf</code></p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Folder Structure</h2>
        <ul className="space-y-1">
          <li>📁 Clients</li>
          <li>&nbsp;&nbsp;📁 Client Name</li>
          <li>&nbsp;&nbsp;&nbsp;&nbsp;📁 Motor Insurance</li>
          <li>&nbsp;&nbsp;&nbsp;&nbsp;📁 Health Insurance</li>
          <li>&nbsp;&nbsp;&nbsp;&nbsp;📁 Life Insurance</li>
        </ul>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Use Policy Tracker for Document Management</h3>
          <p className="text-muted-foreground mb-0">
            Policy Tracker.in lets you upload and store policy documents securely. Access any document in seconds with smart search. Never lose a policy document again!
          </p>
        </div>
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
      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-muted-foreground mb-6">
          Choosing between family floater and individual health insurance plans is one of the most common questions clients ask. Here's how to guide them to the right decision.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is a Family Floater?</h2>
        <p>A family floater policy covers the entire family under a single sum insured. Any family member can claim up to the full sum insured amount.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Pros of Family Floater</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Lower premium compared to individual policies for each member</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Easier to manage (one policy, one renewal)</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Flexible coverage allocation within family</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">When to Recommend Individual Plans</h2>
        <ul className="space-y-2">
          <li>• Senior parents (above 60) - Higher claim probability affects family premium</li>
          <li>• Family members with chronic conditions</li>
          <li>• Large families where sum insured may be exhausted</li>
        </ul>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Track Family Policies Easily</h3>
          <p className="text-muted-foreground mb-0">
            Policy Tracker.in helps you manage multiple policies per family. Track renewals and send WhatsApp reminders for all family members' policies.
          </p>
        </div>
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
      <div className="prose prose-lg max-w-none">
        <p className="lead text-xl text-muted-foreground mb-6">
          Term vs whole life insurance is a fundamental decision for clients. Understanding the differences helps you recommend the right product.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Quick Comparison</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-muted">
                <th className="border p-3 text-left">Feature</th>
                <th className="border p-3 text-left">Term Insurance</th>
                <th className="border p-3 text-left">Whole Life Insurance</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-3">Coverage Period</td><td className="border p-3">Fixed term (10-40 years)</td><td className="border p-3">Lifetime (up to 99 years)</td></tr>
              <tr><td className="border p-3">Premium</td><td className="border p-3">Low</td><td className="border p-3">High (5-10x term)</td></tr>
              <tr><td className="border p-3">Maturity Benefit</td><td className="border p-3">None (pure protection)</td><td className="border p-3">Yes (if survived)</td></tr>
              <tr><td className="border p-3">Best For</td><td className="border p-3">Income protection</td><td className="border p-3">Wealth transfer, legacy</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">When to Recommend Term Insurance</h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Young families with financial dependents</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Clients with home loans or major debts</li>
          <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> Budget-conscious clients wanting maximum coverage</li>
        </ul>

        <div className="bg-primary/5 border-l-4 border-primary p-6 my-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Manage All Policy Types</h3>
          <p className="text-muted-foreground mb-0">
            Policy Tracker.in supports term, whole life, endowment, and ULIP policies. Track all your clients' life insurance in one dashboard.
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
