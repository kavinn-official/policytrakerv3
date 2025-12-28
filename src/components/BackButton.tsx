import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

const BackButton = ({ fallbackPath = "/dashboard", className = "" }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle browser/device back button by ensuring proper history state
  useEffect(() => {
    const handlePopState = () => {
      // Browser back button was pressed - React Router will handle it
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleBack = () => {
    // Check if we have history to go back to
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
};

export default BackButton;
