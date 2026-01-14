import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeft, Search, FileQuestion, MessageCircle } from "lucide-react";
import logo from '@/assets/logo.png';
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Log 404 for analytics tracking
  useEffect(() => {
    console.log(`404 - Page not found: ${location.pathname}`);
    // Track 404 in Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_not_found', {
        'event_category': 'error',
        'event_label': location.pathname,
        'value': 404
      });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 py-12">
      {/* SEO Meta for 404 */}
      <title>Page Not Found - Policy Tracker.in</title>
      
      <div className="text-center max-w-lg w-full">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={logo} 
            alt="Policy Tracker - Insurance Agent Software" 
            className="h-16 w-16 mx-auto mb-6" 
          />
        </div>

        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <FileQuestion className="w-16 h-16 text-blue-500" />
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
            <Search className="w-8 h-8 text-gray-400 animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-7xl sm:text-8xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Don't worry, let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button 
            onClick={() => navigate("/")} 
            className="w-full sm:w-auto h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg shadow-blue-500/25"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto h-11 px-8 border-gray-300 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular Pages</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button 
              onClick={() => navigate("/demo")}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Try Demo
            </button>
            <span className="text-gray-300">•</span>
            <button 
              onClick={() => navigate("/auth")}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign Up Free
            </button>
            <span className="text-gray-300">•</span>
            <button 
              onClick={() => navigate("/enquiry")}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* WhatsApp Support */}
        <div className="mt-8">
          <a 
            href="https://wa.me/916381615829" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Need help? Chat on WhatsApp</span>
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-8">© 2025 policytracker.in</p>
      </div>
    </div>
  );
};

export default NotFound;
