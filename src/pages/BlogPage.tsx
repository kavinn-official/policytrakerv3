import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User, Clock, BookOpen, Car, Shield, Heart, FileText, Briefcase, FolderOpen } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import Navigation from "@/components/landing/Navigation";
import Footer from "@/components/landing/Footer";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  icon: React.ReactNode;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "motor-insurance-renewal-tips",
    title: "10 Essential Tips for Motor Insurance Renewal in 2025",
    excerpt: "Learn the best practices for renewing motor insurance policies. From comparing quotes to understanding no-claim bonuses, this guide covers everything agents need to know.",
    category: "Motor Insurance",
    readTime: "5 min read",
    date: "2025-02-01",
    author: "Policy Tracker Team",
    icon: <Car className="h-5 w-5" />
  },
  {
    id: "2",
    slug: "whatsapp-reminder-strategies",
    title: "How to Use WhatsApp Reminders to Increase Policy Renewals",
    excerpt: "Discover effective WhatsApp messaging strategies that help insurance agents achieve higher renewal rates and maintain strong client relationships.",
    category: "Sales Tips",
    readTime: "4 min read",
    date: "2025-01-28",
    author: "Policy Tracker Team",
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: "3",
    slug: "vehicle-insurance-claim-process",
    title: "Complete Guide to Vehicle Insurance Claim Process in India",
    excerpt: "Step-by-step guide to filing vehicle insurance claims. Help your clients navigate the claim process smoothly with this comprehensive resource.",
    category: "Motor Insurance",
    readTime: "7 min read",
    date: "2025-01-25",
    author: "Policy Tracker Team",
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: "4",
    slug: "health-insurance-selling-tips",
    title: "Top Health Insurance Selling Strategies for Agents",
    excerpt: "Master the art of selling health insurance with proven techniques. Learn how to explain policy benefits and handle common objections from clients.",
    category: "Health Insurance",
    readTime: "6 min read",
    date: "2025-01-20",
    author: "Policy Tracker Team",
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: "5",
    slug: "insurance-agent-productivity",
    title: "5 Productivity Hacks Every Insurance Agent Should Know",
    excerpt: "Boost your efficiency with these time-saving tips. From policy management tools to client communication strategies, learn how top agents stay productive.",
    category: "Productivity",
    readTime: "4 min read",
    date: "2025-01-15",
    author: "Policy Tracker Team",
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    id: "6",
    slug: "third-party-vs-comprehensive-insurance",
    title: "Third Party vs Comprehensive Insurance: A Complete Comparison",
    excerpt: "Help your clients understand the difference between third-party and comprehensive motor insurance. Learn the pros, cons, and when to recommend each type.",
    category: "Motor Insurance",
    readTime: "6 min read",
    date: "2025-01-10",
    author: "Policy Tracker Team",
    icon: <Car className="h-5 w-5" />
  },
  {
    id: "7",
    slug: "health-insurance-claim-tips",
    title: "Health Insurance Claim Process: Complete Guide for Agents",
    excerpt: "Help your clients file health insurance claims efficiently. Learn about cashless hospitalization, reimbursement claims, and common rejection reasons.",
    category: "Health Insurance",
    readTime: "8 min read",
    date: "2025-02-03",
    author: "Policy Tracker Team",
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: "8",
    slug: "life-insurance-selling-strategies",
    title: "Life Insurance Selling Strategies: Convert More Leads",
    excerpt: "Proven techniques for selling term and whole life insurance. Learn how to identify client needs, overcome objections, and close more deals.",
    category: "Life Insurance",
    readTime: "7 min read",
    date: "2025-02-02",
    author: "Policy Tracker Team",
    icon: <Briefcase className="h-5 w-5" />
  },
  {
    id: "9",
    slug: "policy-document-management",
    title: "Policy Document Management Best Practices for Agents",
    excerpt: "Organize and manage insurance policy documents efficiently. Learn digital storage tips, naming conventions, and quick retrieval techniques.",
    category: "Productivity",
    readTime: "5 min read",
    date: "2025-01-30",
    author: "Policy Tracker Team",
    icon: <FolderOpen className="h-5 w-5" />
  },
  {
    id: "10",
    slug: "family-floater-health-insurance",
    title: "Family Floater vs Individual Health Insurance: Which to Recommend?",
    excerpt: "Understand the pros and cons of family floater policies. Guide your clients to choose the right health insurance plan for their family.",
    category: "Health Insurance",
    readTime: "6 min read",
    date: "2025-01-22",
    author: "Policy Tracker Team",
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: "11",
    slug: "term-vs-whole-life-insurance",
    title: "Term vs Whole Life Insurance: Complete Comparison Guide",
    excerpt: "Help clients choose between term and whole life insurance. Understand coverage, premiums, benefits, and which suits different life stages.",
    category: "Life Insurance",
    readTime: "7 min read",
    date: "2025-01-18",
    author: "Policy Tracker Team",
    icon: <Briefcase className="h-5 w-5" />
  },
  {
    id: "12",
    slug: "critical-illness-insurance-guide",
    title: "Critical Illness Insurance: What Every Agent Should Know",
    excerpt: "Comprehensive guide to selling critical illness riders. Learn covered diseases, claim process, and how to explain benefits to clients.",
    category: "Health Insurance",
    readTime: "6 min read",
    date: "2025-01-12",
    author: "Policy Tracker Team",
    icon: <Shield className="h-5 w-5" />
  }
];

const categories = ["All", "Motor Insurance", "Health Insurance", "Life Insurance", "Sales Tips", "Productivity"];

const BlogPage = () => {
  return (
    <>
      <SEOHead
        title="Insurance Agent Blog | Motor Insurance Tips & Resources | Policy Tracker"
        description="Expert tips for insurance agents. Learn motor insurance renewal strategies, WhatsApp reminder techniques, claim processes, and productivity hacks. Free resources for Indian insurance agents."
        canonicalPath="/blog"
      />

      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
        <Navigation />

        {/* Hero Section */}
        <section className="py-16 md:py-24 relative overflow-hidden bg-white border-b border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge className="mb-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-sm px-4 py-1.5 rounded-full text-sm font-medium">
              <BookOpen className="h-4 w-4 mr-2" />
              Insurance Agent Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              Blog for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Insurance Agents</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Expert tips, industry insights, and practical guides to help you grow your insurance business and serve your clients better.
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-white/50 backdrop-blur-sm sticky top-[64px] z-40 border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  size="sm"
                  className={`rounded-full px-6 transition-all ${category === "All"
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-2xl transition-all duration-300 border-slate-200 shadow-sm overflow-hidden bg-white hover:-translate-y-1">
                  <CardHeader className="pb-4 border-b border-slate-50 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 font-medium">
                        {React.cloneElement(post.icon as React.ReactElement<{ className?: string }>, { className: "h-3.5 w-3.5" })}
                        {post.category}
                      </Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-slate-600 text-base mb-6 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500 font-medium border-t border-slate-100 pt-4 mb-6">
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-slate-400" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(post.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="block">
                      <Button variant="outline" className="w-full group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors h-12 text-base font-semibold border-slate-200">
                        Read Article
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] opacity-70"></div>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Ready to Streamline Your Policy Management?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              Join thousands of insurance agents using PolicyTracker.in to manage policies, automate WhatsApp reminders, and grow their business efficiently.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold h-14 px-8 text-lg border-0 shadow-lg shadow-indigo-900/50">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;
