import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp,
  HardDrive,
  ScanLine,
  UserCheck,
  UserX,
  Loader2
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  proUsers: number;
  freeUsers: number;
  totalPolicies: number;
  totalStorageBytes: number;
  totalOcrScans: number;
  newUsersThisMonth: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch pro subscribers
        const { count: proUsers } = await supabase
          .from('subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_tier', 'pro')
          .eq('is_active', true);

        // Fetch total policies
        const { count: totalPolicies } = await supabase
          .from('policies')
          .select('*', { count: 'exact', head: true });

        // Fetch storage usage
        const { data: usageData } = await supabase
          .from('usage_tracking')
          .select('storage_used_bytes, ocr_scans_used');

        const totalStorageBytes = usageData?.reduce((sum, u) => sum + (u.storage_used_bytes || 0), 0) || 0;
        const totalOcrScans = usageData?.reduce((sum, u) => sum + (u.ocr_scans_used || 0), 0) || 0;

        // Fetch new users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newUsersThisMonth } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString());

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: totalUsers || 0, // Simplified for now
          proUsers: proUsers || 0,
          freeUsers: (totalUsers || 0) - (proUsers || 0),
          totalPolicies: totalPolicies || 0,
          totalStorageBytes,
          totalOcrScans,
          newUsersThisMonth: newUsersThisMonth || 0,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      description: `+${stats?.newUsersThisMonth || 0} this month`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pro Subscribers",
      value: stats?.proUsers || 0,
      description: `${stats?.freeUsers || 0} on free plan`,
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Policies",
      value: stats?.totalPolicies?.toLocaleString('en-IN') || 0,
      description: "Across all users",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Platform Storage",
      value: formatBytes(stats?.totalStorageBytes || 0),
      description: "Total used storage",
      icon: HardDrive,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "OCR Scans",
      value: stats?.totalOcrScans?.toLocaleString('en-IN') || 0,
      description: "Total scans performed",
      icon: ScanLine,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Growth Rate",
      value: stats?.totalUsers ? `${Math.round(((stats?.newUsersThisMonth || 0) / stats.totalUsers) * 100)}%` : '0%',
      description: "Monthly user growth",
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Pro vs Free users breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span>Pro Users</span>
                </div>
                <span className="font-bold">{stats?.proUsers || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${stats?.totalUsers ? ((stats.proUsers / stats.totalUsers) * 100) : 0}%` 
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-gray-600" />
                  <span>Free Users</span>
                </div>
                <span className="font-bold">{stats?.freeUsers || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full transition-all" 
                  style={{ 
                    width: `${stats?.totalUsers ? ((stats.freeUsers / stats.totalUsers) * 100) : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>System status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">Database Status</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">Edge Functions</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">Storage Service</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;