import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Bell,
  BarChart3,
  Upload,
  FolderOpen,
  FileSpreadsheet,
  Shield,
  MessageCircle,
  Smartphone,
  Scan,
  Calculator,
  TrendingUp,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Insurance Policy Management System",
    description: "Add, view, edit, and organize all your insurance policies in one centralized dashboard. Seamlessly track motor, health, and life insurance portfolios.",
    keywords: "policy management software, insurance policy tracker"
  },
  {
    icon: Bell,
    title: "Automated Renewal Tracking & Alerts",
    description: "Never miss a renewal opportunity. Get automated alerts 30, 15, and 7 days before policy expiry to boost your renewal rates by 25%.",
    keywords: "policy renewal reminder, insurance expiry alerts"
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Policy Renewal Reminders",
    description: "Send personalized renewal reminders to clients via WhatsApp with exactly one click, improving client engagement and retention.",
    keywords: "WhatsApp reminder for insurance, client communication"
  },
  {
    icon: Calculator,
    title: "Commission Analytics",
    description: "Track first-year and renewal commissions. Calculate earnings by policy type, company, or time period.",
    keywords: "insurance commission tracker, agent commission calculator"
  },
  {
    icon: Upload,
    title: "Bulk Policy Upload",
    description: "Import hundreds of policies from Excel or CSV files. Migrate your existing data in minutes, not hours.",
    keywords: "bulk policy import, Excel policy upload"
  },
  {
    icon: Scan,
    title: "AI-Powered OCR PDF Auto-Fill",
    description: "Upload policy PDFs and let our AI extract extracted details automatically. Save 80% of manual data entry time per policy imported.",
    keywords: "OCR policy scanning, PDF auto-fill insurance"
  },
  {
    icon: FolderOpen,
    title: "Document Storage",
    description: "Store policy documents securely in the cloud. Access PDFs, images, and files from anywhere, anytime.",
    keywords: "policy document management, insurance file storage"
  },
  {
    icon: FileSpreadsheet,
    title: "Reports & Export",
    description: "Generate detailed reports on premiums, renewals, and commissions. Export to Excel, PDF, or print-ready formats.",
    keywords: "insurance reports, policy analytics export"
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description: "Visual dashboard showing portfolio growth, company-wise distribution, and business insights.",
    keywords: "insurance business analytics, agent dashboard"
  },
  {
    icon: Smartphone,
    title: "Mobile Access",
    description: "Access your policy tracker on any device. Install as a mobile app (PWA) for native-like experience.",
    keywords: "mobile policy tracker, insurance app for agents"
  },
  {
    icon: Shield,
    title: "Data Security & Backup",
    description: "256-bit SSL encryption. Automatic daily backups. Your client data is safe and always recoverable.",
    keywords: "secure policy storage, insurance data backup"
  },
  {
    icon: TrendingUp,
    title: "Growth Insights",
    description: "Track month-over-month growth, identify top-performing products, and find renewal opportunities.",
    keywords: "insurance business growth, agent performance tracking"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 to-white" id="features" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium mb-4">
            Powerful Features
          </span>
          <h2 id="features-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Insurance Business
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A complete <strong>insurance agent CRM</strong> with policy tracking, renewal management, commission analytics,
            and client communication — all in one powerful platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <article
              key={index}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>

        {/* Feature Highlight CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link to="/features">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Explore All Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-lg px-8">
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

export default FeaturesSection;
