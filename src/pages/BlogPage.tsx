import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, User, Clock, BookOpen, Car, Shield, Heart, FileText, Briefcase, FolderOpen } from "lucide-react";
import SEOHead from "@/components/SEOHead";

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
      
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Policy Tracker" className="h-8 w-8" loading="lazy" />
              <span className="text-xl font-bold text-primary">Policy Tracker</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/features" className="hidden md:block text-gray-600 hover:text-primary">
                Features
              </Link>
              <Link to="/pricing" className="hidden md:block text-gray-600 hover:text-primary">
                Pricing
              </Link>
              <Link to="/auth">
                <Button>Get Started Free</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-primary/5 to-cyan-50">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <BookOpen className="h-3 w-3 mr-1" />
              Insurance Agent Resources
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Blog for <span className="text-primary">Insurance Agents</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Expert tips, industry insights, and practical guides to help you grow your insurance business and serve your clients better.
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-6 border-b bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {post.icon}
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <Link to={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm" className="w-full mt-4 group-hover:bg-primary/5">
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
        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Streamline Your Policy Management?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Join 1000+ insurance agents using Policy Tracker to manage policies, send WhatsApp reminders, and grow their business.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="font-semibold">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gray-900 text-gray-400">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Policy Tracker.in. All rights reserved.</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <Link to="/terms-conditions" className="hover:text-white">Terms</Link>
              <Link to="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogPage;
