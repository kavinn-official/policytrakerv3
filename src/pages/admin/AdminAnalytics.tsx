import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, TrendingUp, Users, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  userGrowth: { date: string; users: number }[];
  policyDistribution: { type: string; count: number }[];
  subscriptionTrend: { month: string; pro: number; free: number }[];
  revenueData: { month: string; revenue: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = subDays(new Date(), daysAgo);

      // Fetch user signups over time
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // Group by date
      const userGrowthMap: Record<string, number> = {};
      profiles?.forEach(p => {
        const date = format(new Date(p.created_at), 'MMM dd');
        userGrowthMap[date] = (userGrowthMap[date] || 0) + 1;
      });
      const userGrowth = Object.entries(userGrowthMap).map(([date, users]) => ({ date, users }));

      // Fetch policy distribution by type
      const { data: policies } = await supabase
        .from('policies')
        .select('insurance_type');

      const policyTypeMap: Record<string, number> = {};
      policies?.forEach(p => {
        policyTypeMap[p.insurance_type] = (policyTypeMap[p.insurance_type] || 0) + 1;
      });
      const policyDistribution = Object.entries(policyTypeMap).map(([type, count]) => ({ type, count }));

      // Fetch subscription data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('amount, status, created_at');

      const revenueByMonth: Record<string, number> = {};
      subscriptions?.forEach(s => {
        if (s.status === 'active') {
          const month = format(new Date(s.created_at), 'MMM yyyy');
          revenueByMonth[month] = (revenueByMonth[month] || 0) + s.amount;
        }
      });
      const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

      // Subscription trend (mock data for now)
      const subscriptionTrend = [
        { month: 'Jan', pro: 12, free: 45 },
        { month: 'Feb', pro: 18, free: 52 },
        { month: 'Mar', pro: 25, free: 60 },
        { month: 'Apr', pro: 32, free: 75 },
      ];

      setData({
        userGrowth,
        policyDistribution,
        subscriptionTrend,
        revenueData,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-muted-foreground">Insights into platform performance and growth</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data?.userGrowth && data.userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#0891b2" 
                      strokeWidth={2}
                      dot={{ fill: '#0891b2' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available for the selected period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Policy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Distribution
            </CardTitle>
            <CardDescription>Breakdown by insurance type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data?.policyDistribution && data.policyDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.policyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type.replace(' Insurance', '')}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.policyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No policy data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Subscription Trend
            </CardTitle>
            <CardDescription>Pro vs Free user trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.subscriptionTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="pro" fill="#0891b2" name="Pro" />
                  <Bar dataKey="free" fill="#94a3b8" name="Free" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly subscription revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {data?.revenueData && data.revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;