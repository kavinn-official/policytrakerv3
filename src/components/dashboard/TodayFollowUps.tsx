import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Phone, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { format, isToday, addDays, isBefore } from "date-fns";
import { useNavigate } from "react-router-dom";

interface FollowUpPolicy {
  id: string;
  client_name: string;
  contact_number: string | null;
  policy_expiry_date: string;
  policy_number: string;
  insurance_type: string;
}

const TodayFollowUps = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<FollowUpPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchFollowUps = async () => {
      try {
        const today = new Date();
        const sevenDaysFromNow = addDays(today, 7);

        // Fetch policies expiring in next 7 days that need follow-up
        const { data, error } = await supabase
          .from('policies')
          .select('id, client_name, contact_number, policy_expiry_date, policy_number, insurance_type')
          .eq('user_id', user.id)
          .gte('policy_expiry_date', format(today, 'yyyy-MM-dd'))
          .lte('policy_expiry_date', format(sevenDaysFromNow, 'yyyy-MM-dd'))
          .order('policy_expiry_date', { ascending: true })
          .limit(5);

        if (error) {
          console.error('Error fetching follow-ups:', error);
          return;
        }

        setPolicies(data || []);
      } catch (error) {
        console.error('Error in fetchFollowUps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [user?.id]);

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleWhatsAppCall = (phone: string | null, clientName: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(`Hi ${clientName}, this is a reminder about your insurance policy renewal.`);
    window.open(`https://wa.me/${fullPhone}?text=${message}`, '_blank');
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
          <Phone className="h-4 w-4 text-blue-600" />
          Today's Follow-Ups
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
      <CardContent className="pt-0 space-y-2">
        {policies.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No follow-ups needed today
          </div>
        ) : (
          policies.map(policy => {
            const daysRemaining = getDaysRemaining(policy.policy_expiry_date);
            const isUrgent = daysRemaining <= 3;

            return (
              <div
                key={policy.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer group hover:shadow-sm ${isUrgent ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'
                  }`}
                onClick={() => navigate('/due-policies')}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {policy.client_name}
                    </p>
                    {isUrgent && (
                      <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                    {policy.insurance_type} • Call in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                  </p>
                </div>
                {policy.contact_number && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWhatsAppCall(policy.contact_number, policy.client_name);
                    }}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Phone className="h-4 w-4 text-green-600" />
                  </Button>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default TodayFollowUps;
