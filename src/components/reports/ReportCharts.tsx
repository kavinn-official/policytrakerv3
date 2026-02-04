import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, IndianRupee, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

// Modern color palette
const COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#A855F7', '#F59E0B', '#06B6D4'];

interface MonthlyTrend {
  month: string;
  policies: number;
  premium: number;
}

interface ChartData {
  name: string;
  value: number;
  premium: number;
  color: string;
}

interface BarChartData {
  name: string;
  count: number;
  premium: number;
  fill: string;
}

// Simple stat card for displaying numbers
const StatCard = ({ title, value, icon: Icon, color, subtitle }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string;
  subtitle?: string;
}) => (
  <div className={`rounded-xl p-4 ${color}`}>
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white/20">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-white/80 text-sm">{title}</p>
        <p className="text-white text-xl font-bold">{value}</p>
        {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground text-sm">{data.name || data.month || payload[0].name}</p>
        {(data.value !== undefined || data.count !== undefined || data.policies !== undefined) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || data.fill || '#3B82F6' }}></span>
            Policies: {data.value || data.count || data.policies || payload[0].value}
          </p>
        )}
        {data.premium !== undefined && data.premium > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <IndianRupee className="h-3 w-3" />
            Premium: {formatCurrency(data.premium)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const TrendCharts = ({ monthlyTrends, formatCurrency }: { monthlyTrends: MonthlyTrend[]; formatCurrency: (amount: number) => string }) => {
  const isMobile = useIsMobile();
  const hasData = monthlyTrends.some(t => t.policies > 0 || t.premium > 0);
  
  const totalPolicies = monthlyTrends.reduce((sum, t) => sum + t.policies, 0);
  const totalPremium = monthlyTrends.reduce((sum, t) => sum + t.premium, 0);
  
  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Policy Count Trend
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Policy count over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] sm:h-[280px]">
            <div className="text-center">
              <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No data available</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <IndianRupee className="h-5 w-5 text-green-500" />
              Premium Trend
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Premium collection over time
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] sm:h-[280px]">
            <div className="text-center">
              <IndianRupee className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No premium data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatCard 
          title="Total Policies" 
          value={totalPolicies} 
          icon={BarChart3} 
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="This period"
        />
        <StatCard 
          title="Total Premium" 
          value={formatCurrency(totalPremium)} 
          icon={IndianRupee} 
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle="This period"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Policy Count Trend */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Policy Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="h-[180px] sm:h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="policyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: isMobile ? 10 : 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Area 
                    type="monotone" 
                    dataKey="policies" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fill="url(#policyGradient)"
                    dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Premium Trend */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <IndianRupee className="h-5 w-5 text-green-500" />
              Premium Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="h-[180px] sm:h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: isMobile ? 10 : 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Bar 
                    dataKey="premium" 
                    fill="#22C55E" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const DistributionCharts = ({ pieChartData, barChartData, formatCurrency }: { 
  pieChartData: ChartData[]; 
  barChartData: BarChartData[];
  formatCurrency: (amount: number) => string;
}) => {
  const isMobile = useIsMobile();
  
  if (pieChartData.length === 0 && barChartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="h-5 w-5 text-purple-500" />
              Policy Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] sm:h-[280px]">
            <div className="text-center">
              <PieChartIcon className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No data to display</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              Policy Count by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] sm:h-[280px]">
            <div className="text-center">
              <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No data to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = pieChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Donut Chart - Policy Distribution */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChartIcon className="h-5 w-5 text-purple-500" />
            Policy Distribution
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">By insurance type</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[220px] sm:h-[280px] w-full relative">
            {pieChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      outerRadius={isMobile ? 70 : 90}
                      innerRadius={isMobile ? 35 : 45}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={2}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                    <Legend 
                      wrapperStyle={{ fontSize: isMobile ? '10px' : '12px', paddingTop: '10px' }}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute top-[40%] sm:top-[42%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">No data</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Horizontal Bar Chart - Policy Count by Type */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-5 w-5 text-amber-500" />
            Policy Count by Type
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Number of policies</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="h-[220px] sm:h-[280px] w-full">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={barChartData} 
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: isMobile ? 50 : 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={isMobile ? 50 : 60}
                  />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={30}
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">No data</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
