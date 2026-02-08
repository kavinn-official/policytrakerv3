import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useSubscription } from "@/hooks/useSubscription";
import { FileText, Scan, HardDrive, Crown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const UsageStatistics = () => {
  const { usage, limits, loading, formatStorageSize, getUsagePercentage } = useUsageTracking();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
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

  const stats = [
    {
      label: "Policies Created",
      used: usage.policyCount,
      max: limits.maxPolicies,
      percentage: policyPercentage,
      icon: FileText,
    },
    {
      label: "AI OCR Scans",
      used: usage.ocrScansUsed,
      max: limits.maxOcrScans,
      percentage: ocrPercentage,
      icon: Scan,
      suffix: "(Monthly)",
    },
    {
      label: "Storage Used",
      used: formatStorageSize(usage.storageUsedBytes),
      max: formatStorageSize(limits.maxStorageBytes),
      percentage: storagePercentage,
      icon: HardDrive,
      isStorage: true,
    },
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Usage Statistics
        </CardTitle>
        <p className="text-sm text-muted-foreground">Track your platform usage</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600">
                <stat.icon className="h-4 w-4" />
                {stat.label} {stat.suffix && <span className="text-xs text-muted-foreground">{stat.suffix}</span>}
              </span>
              <span className="font-medium text-gray-900">
                {stat.isStorage 
                  ? `${stat.used} / ${stat.max}`
                  : `${stat.used} / ${stat.max === Infinity ? '∞' : stat.max}`
                }
              </span>
            </div>
            {(stat.max !== Infinity || stat.isStorage) && (
              <Progress 
                value={stat.percentage} 
                className="h-2"
                indicatorClassName={getProgressColor(stat.percentage)}
              />
            )}
          </div>
        ))}
        
        {!subscribed && (
          <div className="pt-3 border-t">
            <Button 
              onClick={() => navigate('/subscription')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro for Unlimited
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageStatistics;
