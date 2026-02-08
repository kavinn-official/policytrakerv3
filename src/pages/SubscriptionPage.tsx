import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import SubscriptionPageRevamped from "@/components/subscription/SubscriptionPageRevamped";
import BackButton from "@/components/BackButton";
import { Loader2 } from "lucide-react";

const SubscriptionPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-primary mx-auto" />
          <p className="mt-2 sm:mt-4 text-muted-foreground text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground">Subscription</h1>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Manage your subscription plan</p>
          </div>
        </div>
      </div>

      <SubscriptionPageRevamped />
    </div>
  );
};

export default SubscriptionPage;
