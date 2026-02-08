import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, ChevronRight, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";

interface RenewalPolicy {
  id: string;
  client_name: string;
  policy_number: string;
  policy_expiry_date: string;
  insurance_type: string;
  net_premium: number | null;
}

const UpcomingRenewals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<RenewalPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ count: 0, totalPremium: 0 });

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchRenewals = async () => {
      try {
        const today = new Date();
        const thirtyDaysFromNow = addDays(today, 30);

        const { data, error, count } = await supabase
          .from('policies')
          .select('id, client_name, policy_number, policy_expiry_date, insurance_type, net_premium', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('policy_expiry_date', format(today, 'yyyy-MM-dd'))
          .lte('policy_expiry_date', format(thirtyDaysFromNow, 'yyyy-MM-dd'))
          .order('policy_expiry_date', { ascending: true })
          .limit(5);

        if (error) {
          console.error('Error fetching renewals:', error);
          return;
        }

        setPolicies(data || []);
        
        // Calculate summary
        const totalPremium = data?.reduce((sum, p) => sum + (p.net_premium || 0), 0) || 0;
        setSummary({ count: count || 0, totalPremium });
      } catch (error) {
        console.error('Error in fetchRenewals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRenewals();
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
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-orange-600" />
          Upcoming Renewals (30 Days)
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/due-policies')}
          className="text-xs h-7 gap-1"
        >
          View All <ChevronRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Summary */}
        <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2.5 mb-3">
          <div>
            <p className="text-xs text-gray-600">Total Renewals</p>
            <p className="text-lg font-bold text-orange-600">{summary.count}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Premium Value</p>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(summary.totalPremium)}</p>
          </div>
        </div>

        {/* Policy List */}
        <div className="space-y-2">
          {policies.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              No renewals in the next 30 days
            </div>
          ) : (
            policies.map(policy => (
              <div 
                key={policy.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {policy.client_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {policy.insurance_type}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(policy.policy_expiry_date), 'dd MMM')}
                  </p>
                  {policy.net_premium && (
                    <p className="text-xs font-medium text-green-600">
                      {formatCurrency(policy.net_premium)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingRenewals;
