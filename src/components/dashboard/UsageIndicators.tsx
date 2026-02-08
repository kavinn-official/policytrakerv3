import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useSubscription } from "@/hooks/useSubscription";
import { FileText, Scan, HardDrive, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UsageIndicators = () => {
  const { usage, limits, loading, formatStorageSize, getUsagePercentage } = useUsageTracking();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const policyPercentage = getUsagePercentage(usage.policyCount, limits.maxPolicies);
  const ocrPercentage = getUsagePercentage(usage.ocrScansUsed, limits.maxOcrScans);
  const storagePercentage = getUsagePercentage(usage.storageUsedBytes, limits.maxStorageBytes);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-blue-500";
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {subscribed ? (
            <>
              <Crown className="h-4 w-4 text-yellow-500" />
              Pro Plan Usage
            </>
          ) : (
            "Free Plan Usage"
          )}
        </CardTitle>
        {!subscribed && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/subscription')}
            className="text-xs h-7"
          >
            Upgrade
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Policies */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <FileText className="h-3 w-3" />
              Policies
            </span>
            <span className="font-medium">
              {usage.policyCount} / {limits.maxPolicies === Infinity ? '∞' : limits.maxPolicies}
            </span>
          </div>
          {limits.maxPolicies !== Infinity && (
            <Progress 
              value={policyPercentage} 
              className="h-1.5"
              indicatorClassName={getProgressColor(policyPercentage)}
            />
          )}
        </div>

        {/* OCR Scans */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Scan className="h-3 w-3" />
              OCR Scans (Monthly)
            </span>
            <span className="font-medium">
              {usage.ocrScansUsed} / {limits.maxOcrScans === Infinity ? '∞' : limits.maxOcrScans}
            </span>
          </div>
          {limits.maxOcrScans !== Infinity && (
            <Progress 
              value={ocrPercentage} 
              className="h-1.5"
              indicatorClassName={getProgressColor(ocrPercentage)}
            />
          )}
        </div>

        {/* Storage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-gray-600">
              <HardDrive className="h-3 w-3" />
              Storage
            </span>
            <span className="font-medium">
              {formatStorageSize(usage.storageUsedBytes)} / {formatStorageSize(limits.maxStorageBytes)}
            </span>
          </div>
          <Progress 
            value={storagePercentage} 
            className="h-1.5"
            indicatorClassName={getProgressColor(storagePercentage)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageIndicators;
