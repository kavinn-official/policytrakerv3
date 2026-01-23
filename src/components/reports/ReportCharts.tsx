import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, IndianRupee, BarChart3 } from "lucide-react";
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
} from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#A855F7'];

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
        <p className="font-medium">{data.name || payload[0].name}</p>
        <p className="text-sm text-muted-foreground">
          Policies: {data.value || data.count || data.policies || payload[0].value}
        </p>
        {data.premium !== undefined && (
          <p className="text-sm text-muted-foreground">
            Premium: {formatCurrency(data.premium)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const TrendCharts = ({ monthlyTrends, formatCurrency }: { monthlyTrends: MonthlyTrend[]; formatCurrency: (amount: number) => string }) => {
  // Check if there's any actual data to display
  const hasData = monthlyTrends.some(t => t.policies > 0 || t.premium > 0);
  
  if (!hasData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Policy Count Trend
            </CardTitle>
            <CardDescription>
              Last 6 months policy count comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground text-center">
              No data available for the selected period
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="h-5 w-5 text-primary" />
              Premium Trend
            </CardTitle>
            <CardDescription>
              Last 6 months premium collection comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground text-center">
              No data available for the selected period
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Policy Count Trend
          </CardTitle>
          <CardDescription>
            Last 6 months policy count comparison
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [value, 'Policies']}
                />
                <Line 
                  type="monotone" 
                  dataKey="policies" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IndianRupee className="h-5 w-5 text-primary" />
            Premium Trend
          </CardTitle>
          <CardDescription>
            Last 6 months premium collection comparison
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => value > 0 ? `₹${(value / 1000).toFixed(0)}k` : '₹0'}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Premium']}
                />
                <Bar dataKey="premium" fill="#22C55E" radius={[4, 4, 0, 0]} />
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
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Policy Distribution
            </CardTitle>
            <CardDescription>
              Policy count by insurance type
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[320px]">
            <p className="text-muted-foreground text-center">
              No policies to display distribution
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Policy Count by Type
            </CardTitle>
            <CardDescription>
              Number of policies by insurance type
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[320px]">
            <p className="text-muted-foreground text-center">
              No policies to display count
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie Chart */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Policy Distribution
          </CardTitle>
          <CardDescription>
            Policy count by insurance type
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[320px] sm:h-[350px] w-full">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="40%"
                    labelLine={true}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    paddingAngle={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Policy Count by Type
          </CardTitle>
          <CardDescription>
            Number of policies by insurance type
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="h-[320px] sm:h-[350px] w-full">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={barChartData} 
                  margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    interval={0}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                    width={45}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                  <Bar 
                    dataKey="count" 
                    name="count" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
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
