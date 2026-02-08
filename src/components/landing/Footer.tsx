import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube, 
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
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src={logo} alt="PolicyTracker" className="h-10 w-10" />
              <div>
                <div className="font-bold text-white text-lg">PolicyTracker.in</div>
                <div className="text-xs text-gray-400">Insurance Agent CRM</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              India's #1 policy tracking software for insurance agents. 
              Manage motor, health & life policies, track renewals, and grow your business.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <a href="mailto:support@policytracker.in" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                support@policytracker.in
              </a>
              <a href="tel:+916381615829" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4" />
                +91 6381615829
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Chennai, Tamil Nadu, India</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            
            {/* Trust Badges */}
            <div className="flex gap-4 text-sm text-gray-400">
              <span>🔒 SSL Secured</span>
              <span>🇮🇳 Made in India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <p>© {currentYear} PolicyTracker.in. All rights reserved.</p>
            <p>
              Best <strong>Agent Policy Tracker</strong> & <strong>Insurance CRM</strong> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
