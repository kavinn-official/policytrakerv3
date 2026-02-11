import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, FileText, CreditCard, TrendingUp, HardDrive, ScanLine,
  UserCheck, UserX, Loader2, RefreshCw
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalPolicies: number;
  totalStorageBytes: number;
  totalOcrScans: number;
  newUsersThisMonth: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      
      const [
        { count: totalUsers },
        { count: proUsers },
        { count: totalPolicies },
        { data: usageData },
        { count: newUsersThisMonth },
        { data: revenueData },
        { count: totalSupportTickets },
        { count: openTickets },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'pro').eq('is_active', true),
        supabase.from('policies').select('*', { count: 'exact', head: true }),
        supabase.from('usage_tracking').select('storage_used_bytes, ocr_scans_used'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('subscriptions').select('amount').eq('status', 'active'),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      ]);

      const totalStorageBytes = usageData?.reduce((sum, u) => sum + (u.storage_used_bytes || 0), 0) || 0;
      const totalOcrScans = usageData?.reduce((sum, u) => sum + (u.ocr_scans_used || 0), 0) || 0;
      const totalRevenue = revenueData?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
        freeUsers: (totalUsers || 0) - (proUsers || 0),
        totalPolicies: totalPolicies || 0,
        totalStorageBytes,
        totalOcrScans,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchStats(), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, description: `+${stats?.newUsersThisMonth || 0} this month`, icon: Users, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Pro Subscribers", value: stats?.proUsers || 0, description: `${stats?.freeUsers || 0} on free plan`, icon: CreditCard, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Total Policies", value: stats?.totalPolicies?.toLocaleString('en-IN') || 0, description: "Across all users", icon: FileText, color: "text-purple-600", bgColor: "bg-purple-100" },
    { title: "Platform Storage", value: formatBytes(stats?.totalStorageBytes || 0), description: "Total used", icon: HardDrive, color: "text-orange-600", bgColor: "bg-orange-100" },
    { title: "OCR Scans", value: stats?.totalOcrScans?.toLocaleString('en-IN') || 0, description: "Total scans", icon: ScanLine, color: "text-cyan-600", bgColor: "bg-cyan-100" },
    { title: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, description: "Active subscriptions", icon: TrendingUp, color: "text-teal-600", bgColor: "bg-teal-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and key metrics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchStats(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>User Distribution</CardTitle><CardDescription>Pro vs Free breakdown</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-green-600" /><span>Pro Users</span></div>
                <span className="font-bold">{stats?.proUsers || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${stats?.totalUsers ? ((stats.proUsers / stats.totalUsers) * 100) : 0}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><UserX className="h-5 w-5 text-muted-foreground" /><span>Free Users</span></div>
                <span className="font-bold">{stats?.freeUsers || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-muted-foreground/50 h-2 rounded-full transition-all" style={{ width: `${stats?.totalUsers ? ((stats.freeUsers / stats.totalUsers) * 100) : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Growth Rate</CardTitle><CardDescription>Monthly user growth</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">New Users This Month</span>
                <span className="text-green-600 font-bold text-lg">{stats?.newUsersThisMonth || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800">Growth Rate</span>
                <span className="text-blue-600 font-bold text-lg">
                  {stats?.totalUsers ? `${Math.round(((stats?.newUsersThisMonth || 0) / stats.totalUsers) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-800">Conversion Rate</span>
                <span className="text-purple-600 font-bold text-lg">
                  {stats?.totalUsers ? `${Math.round(((stats?.proUsers || 0) / stats.totalUsers) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
