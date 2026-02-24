import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format, subMonths, startOfMonth, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

export const DashboardCharts = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [commissionData, setCommissionData] = useState<any[]>([]);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        fetchMetrics();

        const channel = supabase
            .channel('chart-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'policies', filter: `user_id=eq.${user.id}` }, () => {
                fetchMetrics();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user]);

    const fetchMetrics = async () => {
        try {
            const { data: policies, error } = await supabase
                .from('policies')
                .select('policy_active_date, policy_expiry_date, created_at, commission_amount, net_premium, commission_percentage, first_year_commission')
                .eq('user_id', user.id);

            if (error) throw error;
            if (!policies) return;

            const today = new Date();
            let active = 0;
            let expired = 0;
            let due = 0;

            const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

            // Arrays for last 6 months
            const months = Array.from({ length: 6 }).map((_, i) => format(startOfMonth(subMonths(today, 5 - i)), "MMM yy"));
            const monthMap = months.reduce((acc, max) => ({ ...acc, [max]: 0 }), {} as Record<string, number>);
            const commMap = months.reduce((acc, max) => ({ ...acc, [max]: 0 }), {} as Record<string, number>);

            policies.forEach(policy => {
                // Status metrics
                const expiryDate = new Date(policy.policy_expiry_date);
                if (expiryDate < today) {
                    expired++;
                } else if (expiryDate >= today && expiryDate <= thirtyDays) {
                    due++;
                    active++; // Due is also active
                } else {
                    active++;
                }

                // Monthly generation metrics
                const creationDate = new Date(policy.created_at);
                const mKey = format(startOfMonth(creationDate), "MMM yy");
                if (monthMap[mKey] !== undefined) {
                    monthMap[mKey]++;
                }

                // Commission metrics
                const commissionAmount = Number(policy.commission_amount) || 0;
                const premium = Number(policy.net_premium) || 0;
                const commissionRate = Number(policy.commission_percentage) || 0;
                const comm = commissionAmount > 0
                    ? commissionAmount
                    : (Number(policy.first_year_commission) || ((premium * commissionRate) / 100));

                // Let's proxy commission earned visually based on start date or created date mapping
                const cKey = policy.policy_active_date ? format(startOfMonth(new Date(policy.policy_active_date)), "MMM yy") : mKey;
                if (commMap[cKey] !== undefined) {
                    commMap[cKey] += comm;
                }
            });

            const rawStatus = [
                { name: 'Active', value: active, color: '#10b981' },
                { name: 'Due (< 30d)', value: due, color: '#f59e0b' },
                { name: 'Expired', value: expired, color: '#ef4444' }
            ];
            const filteredStatus = rawStatus.filter(s => s.value > 0);

            setStatusData(filteredStatus.length > 0 ? filteredStatus : [{ name: 'No Data', value: 1, color: '#e5e7eb' }]);

            setMonthlyData(months.map(m => ({ name: m, Policies: monthMap[m] })));
            setCommissionData(months.map(m => ({ name: m, Earned: commMap[m] })));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !user) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-xl bg-gray-50 h-64 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                    </div>
                ))}
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border rounded-lg shadow-lg p-3">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
                    {payload.map((p: any, idx: number) => (
                        <p key={idx} className="text-sm" style={{ color: p.color || p.fill }}>
                            {p.name}: <span className="font-bold">{p.name === 'Earned' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. Policy Status Distribution */}
            <Card className="shadow-sm border-gray-100 col-span-1 h-auto md:h-[22rem]">
                <CardContent className="p-4 flex flex-col h-full">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Policy Status</h3>
                    <div className="flex-1 w-full mt-2 flex justify-center">
                        <PieChart width={350} height={250}>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Monthly Trend */}
            <Card className="shadow-sm border-gray-100 col-span-1 lg:col-span-2 h-auto md:h-[22rem]">
                <CardContent className="p-4 flex flex-col h-full">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Overview Matrix (6 Months)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 h-full min-h-0">

                        {/* Policies Added */}
                        <div className="min-w-0">
                            <p className="text-xs text-center text-gray-500 mb-2 mt-2 md:mt-0">Policies Generated</p>
                            <div className="w-full h-[220px] flex justify-center overflow-x-auto">
                                <BarChart width={350} height={220} data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="Policies" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </div>
                        </div>

                        {/* Commission Trend */}
                        <div className="min-w-0">
                            <p className="text-xs text-center text-gray-500 mb-2 mt-4 md:mt-0">Estimated Commission Earnings</p>
                            <div className="w-full h-[220px] flex justify-center overflow-x-auto">
                                <AreaChart width={350} height={220} data={commissionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 11, fill: '#6B7280' }} width={45} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Earned" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEarned)" />
                                </AreaChart>
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardCharts;
