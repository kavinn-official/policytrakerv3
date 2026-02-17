import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Shield, Zap, MessageCircle } from "lucide-react";

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 5 && !sessionStorage.getItem("exit_popup_shown")) {
      setShow(true);
      sessionStorage.setItem("exit_popup_shown", "true");
    }
  }, []);

  useEffect(() => {
    // Only on desktop
    if (window.innerWidth < 768) return;
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000); // Wait 5s before enabling
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShow(false)}>
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Wait! Get Free Policy Setup
          </h3>
          <p className="text-gray-600 mb-6">
            Let our team help you set up your policies for free. No commitment, no credit card required.
          </p>

          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Zap className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>Free policy migration from Excel/diary</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Shield className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>256-bit encrypted, your data stays private</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MessageCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span>WhatsApp support from our team</span>
            </div>
          </div>

          <Link to="/enquiry" onClick={() => setShow(false)}>
            <Button className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white py-6 text-lg">
              Get Free Setup Help
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <button
            onClick={() => setShow(false)}
            className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            No thanks, I'll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
