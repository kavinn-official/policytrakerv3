import BulkUpload from "@/components/BulkUpload";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useSubscription } from "@/hooks/useSubscription";

const BulkUploadPage = () => {
  const { user, loading } = useAuth();
  const { usage, limits } = useUsageTracking();
  const { subscribed } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading...</p>
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
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">Bulk Upload</h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Add multiple policies at once using Excel</p>
          </div>
        </div>
      </div>

      <BulkUpload 
        policyCount={usage.policyCount} 
        maxPolicies={limits.maxPolicies} 
        isPro={subscribed} 
      />
    </div>
  );
};

export default BulkUploadPage;
