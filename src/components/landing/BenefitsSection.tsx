import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bell, 
  BarChart3, 
  FolderOpen, 
  MessageCircle, 
  Upload, 
  FileSpreadsheet,
  Shield,
  Scan,
  ArrowRight,
  RefreshCw,
  TrendingUp
} from "lucide-react";

const benefits = [
  {
    icon: RefreshCw,
    title: "Automated Renewal Tracking",
    description: "Never miss a policy renewal again. Get alerts 30, 15, and 7 days before expiry. Achieve 98% renewal rate.",
    stat: "98%",
    statLabel: "Renewal Rate"
  },
  {
    icon: BarChart3,
    title: "Commission Analytics",
    description: "Track first-year and renewal commissions. Know exactly how much you're earning from each policy and company.",
    stat: "₹2L+",
    statLabel: "Avg. Commission Tracked"
  },
  {
    icon: FolderOpen,
    title: "Secure Document Storage",
    description: "Store all policy documents in the cloud. Access PDFs, images, and files from anywhere, anytime.",
    stat: "10GB",
    statLabel: "Storage Space"
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Reminders",
    description: "Send personalized renewal reminders to clients via WhatsApp with one click. Keep clients engaged.",
    stat: "1-Click",
    statLabel: "Client Communication"
  },
  {
    icon: Upload,
    title: "Bulk Policy Upload",
    description: "Import hundreds of policies from Excel or CSV files. Migrate your existing data in minutes.",
    stat: "80%",
    statLabel: "Time Saved"
  },
  {
    icon: Scan,
    title: "OCR PDF Auto-Fill",
    description: "Upload policy PDFs and let AI extract details automatically. Reduce manual data entry by 80%.",
    stat: "AI",
    statLabel: "Powered"
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-50" id="benefits" aria-labelledby="benefits-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-4">
            Why Choose PolicyTracker?
          </span>
          <h2 id="benefits-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Grow Your Insurance Business Faster
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stop wasting time on spreadsheets and manual tracking. 
            PolicyTracker automates your workflow so you can focus on what matters — selling and servicing policies.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <benefit.icon className="h-7 w-7 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{benefit.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-teal-600">{benefit.stat}</span>
                      <span className="text-sm text-gray-500">{benefit.statLabel}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ROI Calculator Teaser */}
        <div className="mt-16 bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-gray-100">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Calculate Your Time Savings
              </h3>
              <p className="text-gray-600 mb-6">
                Insurance agents save an average of <strong>5 hours per week</strong> using PolicyTracker. 
                That's 20+ hours a month you can spend on selling new policies instead of managing spreadsheets.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Save 30 minutes per policy with OCR auto-fill</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Reduce renewal follow-ups by 80%</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Generate reports in seconds, not hours</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  Start Saving Time Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 text-center">
              <div className="text-6xl font-bold text-teal-600 mb-2">5+</div>
              <div className="text-xl text-gray-700 font-medium mb-4">Hours Saved Weekly</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">20+</div>
                  <div className="text-gray-500">Hours/Month</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">240+</div>
                  <div className="text-gray-500">Hours/Year</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
