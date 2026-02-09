import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import logo from '@/assets/logo.png';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Calculator", href: "/calculator" },
    { name: "Request Demo", href: "/demo-request" }
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="PolicyTracker - Insurance Agent CRM" 
              className="h-10 w-10 sm:h-12 sm:w-12 group-hover:scale-105 transition-transform" 
            />
            <div className="hidden xs:block">
              <div className="font-bold text-gray-900 text-lg sm:text-xl">PolicyTracker.in</div>
              <div className="text-xs text-gray-500 hidden sm:block">Insurance Agent CRM</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.href} 
                className="text-gray-600 hover:text-teal-600 font-medium transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-gray-700 hover:text-teal-600 font-medium">
                Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-sm">
                Start Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 z-50">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="p-6 border-b flex items-center gap-3">
                  <img src={logo} alt="PolicyTracker" className="h-10 w-10" />
                  <div>
                    <div className="font-bold text-gray-900">PolicyTracker.in</div>
                    <div className="text-xs text-gray-500">Insurance Agent CRM</div>
                  </div>
                </div>

                {/* Mobile Links */}
                <div className="flex-1 p-4">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.name}
                        to={link.href} 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-700 font-medium transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Auth */}
                <div className="p-4 border-t space-y-3">
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
