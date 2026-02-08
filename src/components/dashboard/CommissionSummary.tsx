import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { IndianRupee, TrendingUp, Calendar, Wallet } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface CommissionData {
  monthlyCommission: number;
  yearlyCommission: number;
  expectedFutureCommission: number;
  totalLifetimeCommission: number;
}

const CommissionSummary = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CommissionData>({
    monthlyCommission: 0,
    yearlyCommission: 0,
    expectedFutureCommission: 0,
    totalLifetimeCommission: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchCommissionData = async () => {
      try {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const yearStart = startOfYear(now);
        const yearEnd = endOfYear(now);

        // Fetch all policies with commission data
        const { data: policies, error } = await supabase
          .from('policies')
          .select('net_premium, commission_percentage, policy_active_date, policy_expiry_date, created_at')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching commission data:', error);
          return;
        }

        let monthlyCommission = 0;
        let yearlyCommission = 0;
        let expectedFutureCommission = 0;
        let totalLifetimeCommission = 0;

        policies?.forEach(policy => {
          const premium = policy.net_premium || 0;
          const commissionPercent = policy.commission_percentage || 0;
          const commission = (premium * commissionPercent) / 100;
          const createdAt = new Date(policy.created_at);
          const expiryDate = new Date(policy.policy_expiry_date);

          // Total lifetime commission
          totalLifetimeCommission += commission;

          // Monthly commission (policies created this month)
          if (createdAt >= monthStart && createdAt <= monthEnd) {
            monthlyCommission += commission;
          }

          // Yearly commission (policies created this year)
          if (createdAt >= yearStart && createdAt <= yearEnd) {
            yearlyCommission += commission;
          }

          // Expected future commission (active policies that will renew)
          if (expiryDate > now) {
            expectedFutureCommission += commission;
          }
        });

        setData({
          monthlyCommission,
          yearlyCommission,
          expectedFutureCommission,
          totalLifetimeCommission,
        });
      } catch (error) {
        console.error('Error in fetchCommissionData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionData();
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: "This Month",
      value: formatCurrency(data.monthlyCommission),
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "This Year",
      value: formatCurrency(data.yearlyCommission),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Expected Future",
      value: formatCurrency(data.expectedFutureCommission),
      icon: Wallet,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Lifetime",
      value: formatCurrency(data.totalLifetimeCommission),
      icon: IndianRupee,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-green-600" />
          Commission Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`${stat.bg} rounded-lg p-2.5 flex flex-col`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
                <span className="text-xs text-gray-600">{stat.label}</span>
              </div>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommissionSummary;
