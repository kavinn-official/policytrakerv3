import PolicyList from "@/components/PolicyList";
import BackButton from "@/components/BackButton";
import BulkUpload from "@/components/BulkUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useSubscription } from "@/hooks/useSubscription";

const Policies = () => {
  const { usage, limits } = useUsageTracking();
  const { subscribed } = useSubscription();

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Policies</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage and track all your insurance policies</p>
          </div>
        </div>
      </div>

      <PolicyList />
      
      {/* Bulk Upload Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" />
            Bulk Policy Upload
          </CardTitle>
          <CardDescription>Upload multiple policies at once using Excel template</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <BulkUpload 
            policyCount={usage.policyCount} 
            maxPolicies={limits.maxPolicies} 
            isPro={subscribed} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Policies;
