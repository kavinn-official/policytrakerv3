import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Clock, PlusCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export const RecentActivity = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchRecent = async () => {
            try {
                const { data, error } = await supabase
                    .from('policies')
                    .select('id, client_name, policy_number, insurance_type, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;
                setActivities(data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchRecent();

        const channel = supabase
            .channel('activity-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'policies', filter: `user_id=eq.${user.id}` }, () => {
                fetchRecent();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    if (loading) {
        return (
            <Card className="shadow-lg border-0">
                <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded"></div>)}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-0 h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/policies')} className="text-xs h-7">View All</Button>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
                {activities.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">No recent activity</div>
                ) : (
                    activities.map(act => (
                        <div key={act.id} className="flex gap-3 text-sm">
                            <div className="mt-0.5 flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                                    <PlusCircle className="h-4 w-4 text-purple-600" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 pb-3 border-b border-gray-100">
                                <p className="text-gray-900 font-medium truncate">
                                    <span className="text-gray-600 font-normal">Added </span>
                                    {act.client_name}
                                </p>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="text-xs text-gray-500 truncate">{act.policy_number} • {act.insurance_type}</p>
                                    <p className="text-[10px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default RecentActivity;
