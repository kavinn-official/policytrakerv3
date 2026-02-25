import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import logo from '@/assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Demo", href: "/demo" },
      { name: "Blog", href: "/blog" },
      { name: "Calculator", href: "/calculator" }
    ],
    resources: [
      { name: "Motor Insurance Guide", href: "/blog/motor-insurance-renewal-tips" },
      { name: "Health Insurance Tips", href: "/blog/health-insurance-claim-tips" },
      { name: "Life Insurance Strategies", href: "/blog/life-insurance-selling-strategies" },
      { name: "Agent Success Stories", href: "/blog" }
    ],
    company: [
      { name: "About Us", href: "/contact" },
      { name: "Contact", href: "/contact" },
      { name: "Enquiry", href: "/enquiry" },
      { name: "Request Demo", href: "/demo-request" }
    ],
    legal: [
      { name: "Terms & Conditions", href: "/terms-conditions" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Cancellation & Refunds", href: "/cancellation-refunds" }
    ]
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900" role="contentinfo">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <img src={logo} alt="PolicyTracker" className="h-10 w-10 group-hover:scale-105 transition-transform" />
              <div>
                <div className="font-bold text-white text-lg tracking-tight">PolicyTracker.in</div>
                <div className="text-xs text-slate-500 font-medium">Insurance Agent CRM</div>
              </div>
            </Link>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              India's #1 policy tracking software for insurance agents.
              Manage motor, health & life policies, track renewals, and grow your business.
            </p>

            {/* Contact Info */}
            <div className="space-y-4 text-sm font-medium">
              <a href="mailto:policytracker.in@gmail.com" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                policytracker.in@gmail.com
              </a>
              <a href="tel:+916381615829" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                +91 6381615829
              </a>
              <div className="flex items-start gap-3 text-slate-400">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="pt-1.5">Chennai, Tamil Nadu, India</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-6">Product</h3>
            <ul className="space-y-4 text-sm font-medium">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-indigo-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-white mb-6">Resources</h3>
            <ul className="space-y-4 text-sm font-medium">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-indigo-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-6">Company</h3>
            <ul className="space-y-4 text-sm font-medium">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-indigo-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-6">Legal</h3>
            <ul className="space-y-4 text-sm font-medium">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-slate-400 hover:text-indigo-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Essential Links & Trust Badges */}
        <div className="mt-16 pt-8 border-t border-slate-800/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-400">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              <a href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</a>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-4 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><span className="text-indigo-400">🔒</span> SSL Secured</span>
              <span className="flex items-center gap-1.5"><span className="text-indigo-400">🇮🇳</span> Made in India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#0b0f19] py-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© {currentYear} PolicyTracker.in. All rights reserved.</p>
            <p>
              Best <strong className="font-semibold text-slate-400">Agent Policy Tracker</strong> & <strong className="font-semibold text-slate-400">Insurance CRM</strong> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
