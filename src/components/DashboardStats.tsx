
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, AlertTriangle, CheckCircle, Clock, PlusCircle, IndianRupee, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
}

interface PolicyData {
  policy_expiry_date: string;
  created_at: string;
  net_premium: number | null;
}

const DashboardStats = () => {
  const { user } = useAuth();
  const { subscribed, loading: subscriptionLoading } = useSubscription();

  const [stats, setStats] = useState({
    totalPolicies: 0,
    duePolicies: 0,
    activePolicies: 0,
    expiredPolicies: 0,
    newPoliciesToday: 0,
    todayNetPremium: 0,
    monthlyNetPremium: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    fetchStats();

    // Set up real-time subscription to policy changes
    const channel = supabase
      .channel('policy-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'policies',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Fetch user's policies only - select only the columns we need
      const { data: policies, error } = await supabase
        .from('policies')
        .select('policy_expiry_date, created_at, net_premium')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching policies:', error);
        throw error;
      }

      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const totalPolicies = policies?.length || 0;
      const duePolicies = policies?.filter((policy: PolicyData) => {
        const expiryDate = new Date(policy.policy_expiry_date);
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
      }).length || 0;

      const activePolicies = policies?.filter((policy: PolicyData) => {
        const expiryDate = new Date(policy.policy_expiry_date);
        return expiryDate > today;
      }).length || 0;

      const expiredPolicies = policies?.filter((policy: PolicyData) => {
        const expiryDate = new Date(policy.policy_expiry_date);
        return expiryDate < today;
      }).length || 0;

      const newPoliciesToday = policies?.filter((policy: PolicyData) => {
        const createdAt = new Date(policy.created_at);
        return createdAt >= todayStart;
      }).length || 0;

      // Calculate today's net premium
      const todayNetPremium = policies?.reduce((sum: number, policy: PolicyData) => {
        const createdAt = new Date(policy.created_at);
        if (createdAt >= todayStart) {
          return sum + (policy.net_premium || 0);
        }
        return sum;
      }, 0) || 0;

      // Calculate monthly net premium
      const monthlyNetPremium = policies?.reduce((sum: number, policy: PolicyData) => {
        const createdAt = new Date(policy.created_at);
        if (createdAt >= monthStart) {
          return sum + (policy.net_premium || 0);
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalPolicies,
        duePolicies,
        activePolicies,
        expiredPolicies,
        newPoliciesToday,
        todayNetPremium,
        monthlyNetPremium,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  const statsData: StatItem[] = [
    {
      title: "Total Policies",
      value: isLoading ? "..." : stats.totalPolicies.toString(),
      subtitle: subscribed ? "Unlimited" : `Used: ${stats.totalPolicies} / 50`,
      icon: FileText,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "New Policies Today",
      value: isLoading ? "..." : stats.newPoliciesToday.toString(),
      subtitle: "Added today",
      icon: PlusCircle,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
    {
      title: "Today's Premium",
      value: isLoading ? "..." : formatCurrency(stats.todayNetPremium),
      subtitle: "Net premium today",
      icon: IndianRupee,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      title: "Monthly Premium",
      value: isLoading ? "..." : formatCurrency(stats.monthlyNetPremium),
      subtitle: "This month's total",
      icon: TrendingUp,
      color: "bg-cyan-500",
      textColor: "text-cyan-600",
    },
    {
      title: "Due for Renewal",
      value: isLoading ? "..." : stats.duePolicies.toString(),
      subtitle: "Next 30 days",
      icon: AlertTriangle,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      title: "Active Policies",
      value: isLoading ? "..." : stats.activePolicies.toString(),
      subtitle: "Currently active",
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Expired Policies",
      value: isLoading ? "..." : stats.expiredPolicies.toString(),
      subtitle: "Need attention",
      icon: Clock,
      color: "bg-red-500",
      textColor: "text-red-600",
    },
  ];

  if (!user) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-lg border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <p className="text-gray-500">Sign in to view stats</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-4">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-xs font-medium text-gray-900 truncate">{stat.title}</p>
                <p className={`text-xs ${stat.textColor} truncate`}>{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;
