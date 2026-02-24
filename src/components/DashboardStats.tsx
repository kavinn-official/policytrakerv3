
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
  commission_amount: number | null;
  net_premium: number | null;
  commission_percentage: number | null;
  first_year_commission: number | null;
}

const DashboardStats = () => {
  const { user } = useAuth();
  const { subscribed, loading: subscriptionLoading } = useSubscription();

  const [stats, setStats] = useState({
    totalPolicies: 0,
    duePolicies: 0,
    activePolicies: 0,
    expiredPolicies: 0,
    totalCommission: 0,
    newPoliciesThisMonth: 0,
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
        .select('policy_expiry_date, created_at, commission_amount, net_premium, commission_percentage, first_year_commission')
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

      const newPoliciesThisMonth = policies?.filter((policy: PolicyData) => {
        const createdAt = new Date(policy.created_at);
        return createdAt >= monthStart;
      }).length || 0;

      // Calculate total commission earned using exact formula from other areas
      const totalCommission = policies?.reduce((sum: number, policy: PolicyData) => {
        const commissionAmount = Number(policy.commission_amount) || 0;
        const premium = Number(policy.net_premium) || 0;
        const commissionRate = Number(policy.commission_percentage) || 0;
        const comm = commissionAmount > 0
          ? commissionAmount
          : (Number(policy.first_year_commission) || ((premium * commissionRate) / 100));
        return sum + comm;
      }, 0) || 0;

      setStats({
        totalPolicies,
        duePolicies,
        activePolicies,
        expiredPolicies,
        totalCommission,
        newPoliciesThisMonth,
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

  const statsData = [
    {
      title: "Total Policies",
      value: isLoading ? "..." : stats.totalPolicies.toString(),
      trend: stats.newPoliciesThisMonth > 0 ? `+${stats.newPoliciesThisMonth} this month` : 'All time',
      trendUp: true,
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      link: "/policies",
    },
    {
      title: "Active Policies",
      value: isLoading ? "..." : stats.activePolicies.toString(),
      trend: "Currently active",
      trendUp: true,
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      link: "/policies",
    },
    {
      title: "Expiring Soon",
      value: isLoading ? "..." : stats.duePolicies.toString(),
      trend: "Next 30 days",
      trendUp: false,
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      link: "/due-policies",
    },
    {
      title: "Expired Policies",
      value: isLoading ? "..." : stats.expiredPolicies.toString(),
      trend: "Need renewals",
      trendUp: false,
      icon: Clock,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      link: "/expired-policies",
    },
    {
      title: "Total Commission",
      value: isLoading ? "..." : formatCurrency(stats.totalCommission),
      trend: "Total earned",
      trendUp: true,
      icon: IndianRupee,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      link: "/reports",
    },
    {
      title: "Pending Renewals",
      value: isLoading ? "..." : stats.duePolicies.toString(),
      trend: "Requires action",
      trendUp: false,
      icon: TrendingUp,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      link: "/due-policies",
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
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
      {statsData.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <a
            key={index}
            href={stat.link}
            className="block"
          >
            <Card className="shadow-sm border-gray-100 hover:shadow-md hover:border-gray-300 transition-all duration-200 h-full cursor-pointer bg-white group">
              <CardContent className="p-3 sm:p-5 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className={`p-2 sm:p-2.5 rounded-lg ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">{stat.value}</h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">{stat.title}</p>

                  <div className="mt-3 flex items-center">
                    <span className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        );
      })}
    </div>
  );
};

export default DashboardStats;
