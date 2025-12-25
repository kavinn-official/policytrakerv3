
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import logo from '@/assets/logo.png';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="text-center max-w-sm sm:max-w-md">
        <div className="mb-6 sm:mb-8">
          <img src={logo} alt="Policy Tracker.in" className="h-20 w-20 mx-auto mb-6" />
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold text-gray-200">404</h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-2 sm:mt-4">Page Not Found</h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2 sm:mt-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Button 
            onClick={() => navigate("/")} 
            className="w-full sm:w-auto h-10 text-sm px-6"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <div>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto h-10 text-sm px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-8">© 2025 policytracker.in</p>
      </div>
    </div>
  );
};

export default NotFound;