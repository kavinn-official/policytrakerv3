import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  IndianRupee, 
  BarChart3, 
  PieChart as PieChartIcon,
  Car,
  Heart,
  Shield,
  FileText,
  Building2
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Modern color palette
const TYPE_COLORS: Record<string, { bg: string; text: string; icon: typeof Car }> = {
  'Vehicle': { bg: 'bg-blue-500', text: 'text-blue-600', icon: Car },
  'Health': { bg: 'bg-red-500', text: 'text-red-600', icon: Heart },
  'Life': { bg: 'bg-green-500', text: 'text-green-600', icon: Shield },
  'Other': { bg: 'bg-purple-500', text: 'text-purple-600', icon: FileText },
};

// Format currency for display (using Rs. for PDF compatibility)
const formatRupee = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-IN')}`;
};

// Progress bar component
const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Insurance type stat card
const TypeStatCard = ({ 
  type, 
  count, 
  premium, 
  maxCount,
  formatCurrency 
}: { 
  type: string; 
  count: number; 
  premium: number; 
  maxCount: number;
  formatCurrency: (amount: number) => string;
}) => {
  const config = TYPE_COLORS[type] || TYPE_COLORS['Other'];
  const Icon = config.icon;
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className={`p-2 rounded-lg ${config.bg}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium truncate">{type}</span>
          <span className="text-sm font-bold">{count}</span>
        </div>
        <ProgressBar value={count} max={maxCount} color={config.bg} />
        <p className="text-xs text-muted-foreground mt-1">{formatCurrency(premium)}</p>
      </div>
    </div>
  );
};

// Company stat row
const CompanyStatRow = ({ 
  company, 
  count, 
  premium, 
  maxPremium,
  formatCurrency,
  rank 
}: { 
  company: string; 
  count: number; 
  premium: number; 
  maxPremium: number;
  formatCurrency: (amount: number) => string;
  rank: number;
}) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
  const color = colors[rank % colors.length];
  
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-xs font-bold">{rank + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium truncate">{company}</span>
          <span className="text-sm text-muted-foreground">{count} policies</span>
        </div>
        <ProgressBar value={premium} max={maxPremium} color={color} />
        <p className="text-xs font-medium mt-1">{formatCurrency(premium)}</p>
      </div>
    </div>
  );
};

export const TrendCharts = ({ 
  monthlyTrends, 
  formatCurrency 
}: { 
  monthlyTrends: MonthlyTrend[]; 
  formatCurrency: (amount: number) => string;
}) => {
  const isMobile = useIsMobile();
  const hasData = monthlyTrends.some(t => t.policies > 0 || t.premium > 0);
  
  if (!hasData) {
    return (
      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Trend Analysis
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Month-over-month performance
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No trend data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxPolicies = Math.max(...monthlyTrends.map(t => t.policies), 1);
  const maxPremium = Math.max(...monthlyTrends.map(t => t.premium), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Policy Trend */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Policy Trend
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Policies over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {monthlyTrends.map((trend, index) => (
            <div key={trend.month} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{trend.month}</span>
                <span className="font-medium">{trend.policies}</span>
              </div>
              <ProgressBar value={trend.policies} max={maxPolicies} color="bg-blue-500" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Premium Trend */}
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
        <CardContent className="space-y-3">
          {monthlyTrends.map((trend, index) => (
            <div key={trend.month} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{trend.month}</span>
                <span className="font-medium">{formatCurrency(trend.premium)}</span>
              </div>
              <ProgressBar value={trend.premium} max={maxPremium} color="bg-green-500" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export const DistributionCharts = ({ 
  pieChartData, 
  barChartData, 
  formatCurrency,
  companyData 
}: { 
  pieChartData: ChartData[]; 
  barChartData: BarChartData[];
  formatCurrency: (amount: number) => string;
  companyData?: Record<string, { count: number; premium: number }>;
}) => {
  const isMobile = useIsMobile();
  
  // Calculate max values for progress bars
  const maxCount = Math.max(...barChartData.map(d => d.count), 1);
  const totalPolicies = barChartData.reduce((sum, d) => sum + d.count, 0);
  const totalPremium = barChartData.reduce((sum, d) => sum + d.premium, 0);
  
  // Sort companies by premium
  const sortedCompanies = companyData 
    ? Object.entries(companyData)
        .sort((a, b) => b[1].premium - a[1].premium)
        .slice(0, 5) // Top 5 companies
    : [];
  const maxCompanyPremium = sortedCompanies.length > 0 
    ? Math.max(...sortedCompanies.map(([_, data]) => data.premium), 1) 
    : 1;

  if (barChartData.length === 0 && (!companyData || Object.keys(companyData).length === 0)) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChartIcon className="h-5 w-5 text-purple-500" />
              Policy Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <PieChartIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No data to display</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="h-5 w-5 text-amber-500" />
              Top Companies
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No data to display</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Policy Distribution by Type */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <PieChartIcon className="h-5 w-5 text-purple-500" />
            Policy Distribution
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            By insurance type ({totalPolicies} total)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {barChartData.map((data) => (
            <TypeStatCard
              key={data.name}
              type={data.name}
              count={data.count}
              premium={data.premium}
              maxCount={maxCount}
              formatCurrency={formatCurrency}
            />
          ))}
          {barChartData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Companies */}
      <Card className="shadow-sm border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Building2 className="h-5 w-5 text-amber-500" />
            Top Companies
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            By premium collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCompanies.length > 0 ? (
            <div className="space-y-1">
              {sortedCompanies.map(([company, data], index) => (
                <CompanyStatRow
                  key={company}
                  company={company}
                  count={data.count}
                  premium={data.premium}
                  maxPremium={maxCompanyPremium}
                  formatCurrency={formatCurrency}
                  rank={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No company data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
