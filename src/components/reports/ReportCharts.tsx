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
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

// Enhanced color palette with semantic colors
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

interface ReportChartsProps {
  monthlyTrends: MonthlyTrend[];
  pieChartData: ChartData[];
  barChartData: BarChartData[];
  formatCurrency: (amount: number) => string;
}

const CustomTooltip = ({ active, payload, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.name || data.month || payload[0].name}</p>
        {(data.value !== undefined || data.count !== undefined || data.policies !== undefined) && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || '#3B82F6' }}></span>
            Policies: {data.value || data.count || data.policies || payload[0].value}
          </p>
        )}
        {data.premium !== undefined && data.premium > 0 && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <IndianRupee className="h-3 w-3" />
            Premium: {formatCurrency(data.premium)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PremiumTooltip = ({ active, payload, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.month}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <IndianRupee className="h-3 w-3" />
          Premium: {formatCurrency(data.premium)}
        </p>
        <p className="text-sm text-muted-foreground">
          Policies: {data.policies}
        </p>
      </div>
    );
  }
  return null;
};

export const TrendCharts = ({ monthlyTrends, formatCurrency }: { monthlyTrends: MonthlyTrend[]; formatCurrency: (amount: number) => string }) => {
  // Check if there's any actual data to display
  const hasData = monthlyTrends.some(t => t.policies > 0 || t.premium > 0);
  const maxPolicies = Math.max(...monthlyTrends.map(t => t.policies), 1);
  const maxPremium = Math.max(...monthlyTrends.map(t => t.premium), 1);
  
  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Policy Count Trend
            </CardTitle>
            <CardDescription>
              Policy count over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[280px]">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No data available for the selected period</p>
              <p className="text-xs text-muted-foreground mt-1">Add policies to see trends</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="h-5 w-5 text-primary" />
              Premium Trend
            </CardTitle>
            <CardDescription>
              Premium collection over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[280px]">
            <div className="text-center">
              <IndianRupee className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No premium data available</p>
              <p className="text-xs text-muted-foreground mt-1">Add policies with premium to see trends</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Policy Count Trend - Line Chart with Area */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Policy Count Trend
          </CardTitle>
          <CardDescription>
            Policy count comparison over time
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="policyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  domain={[0, maxPolicies + Math.ceil(maxPolicies * 0.1)]}
                />
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                <Area 
                  type="monotone" 
                  dataKey="policies" 
                  stroke="#3B82F6" 
                  strokeWidth={2.5}
                  fill="url(#policyGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="policies" 
                  stroke="#3B82F6" 
                  strokeWidth={2.5}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Premium Trend - Bar Chart with improved styling */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-green-50/30 dark:to-green-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IndianRupee className="h-5 w-5 text-green-500" />
            Premium Trend
          </CardTitle>
          <CardDescription>
            Premium collection comparison over time
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value > 0 ? `₹${(value / 1000).toFixed(0)}k` : '₹0'}
                  domain={[0, maxPremium + Math.ceil(maxPremium * 0.1)]}
                />
                <Tooltip content={<PremiumTooltip formatCurrency={formatCurrency} />} />
                <Bar 
                  dataKey="premium" 
                  fill="url(#premiumGradient)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const DistributionCharts = ({ pieChartData, barChartData, formatCurrency }: { 
  pieChartData: ChartData[]; 
  barChartData: BarChartData[];
  formatCurrency: (amount: number) => string;
}) => {
  if (pieChartData.length === 0 && barChartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Policy Distribution
            </CardTitle>
            <CardDescription>
              Policy count by insurance type
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[350px]">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No policies to display distribution</p>
              <p className="text-xs text-muted-foreground mt-1">Add policies to see breakdown</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Policy Count by Type
            </CardTitle>
            <CardDescription>
              Number of policies by insurance type
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[350px]">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No policies to display count</p>
              <p className="text-xs text-muted-foreground mt-1">Add policies to see breakdown</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate total for percentage labels
  const total = pieChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie Chart - Enhanced Donut with center label */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChartIcon className="h-5 w-5 text-purple-500" />
            Policy Distribution
          </CardTitle>
          <CardDescription>
            Policy count by insurance type
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[350px] sm:h-[380px] w-full relative">
            {pieChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={55}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                      label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          strokeWidth={2}
                          stroke="#fff"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }}
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      formatter={(value: string) => <span className="text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-2xl font-bold text-foreground">{total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Enhanced with better styling */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-amber-50/30 dark:to-amber-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-amber-500" />
            Policy Count by Type
          </CardTitle>
          <CardDescription>
            Number of policies by insurance type
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[350px] sm:h-[380px] w-full">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={barChartData} 
                  margin={{ top: 20, right: 20, left: 0, bottom: 30 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    width={70}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Bar 
                    dataKey="count" 
                    name="count" 
                    radius={[0, 6, 6, 0]}
                    maxBarSize={35}
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};