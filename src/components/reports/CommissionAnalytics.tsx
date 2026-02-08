import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Percent, Briefcase } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { normalizeCompanyName } from "@/utils/companyNormalization";

interface CommissionData {
  totalCommission: number;
  firstYearCommission: number;
  renewalCommission: number;
  avgCommissionRate: number;
  policyCount: number;
  topCompanies: { name: string; commission: number; count: number }[];
}

interface CommissionAnalyticsProps {
  policies: any[];
  formatCurrency: (amount: number) => string;
  periodLabel: string;
}

const CommissionAnalytics = ({ policies, formatCurrency, periodLabel }: CommissionAnalyticsProps) => {
  // Calculate commission data from policies
  const commissionData: CommissionData = {
    totalCommission: 0,
    firstYearCommission: 0,
    renewalCommission: 0,
    avgCommissionRate: 0,
    policyCount: 0,
    topCompanies: [],
  };

  // Use normalized company names for grouping
  const companyCommissions: Record<string, { commission: number; count: number }> = {};
  let totalCommissionRate = 0;
  let policiesWithCommission = 0;

  policies.forEach(policy => {
    const premium = Number(policy.net_premium) || 0;
    const commissionRate = Number(policy.commission_percentage) || 0;
    const firstYearComm = Number(policy.first_year_commission) || ((premium * commissionRate) / 100);
    
    if (commissionRate > 0) {
      policiesWithCommission++;
      totalCommissionRate += commissionRate;
    }

    commissionData.totalCommission += firstYearComm;
    
    // Classify as first year or renewal based on status
    if (policy.status === 'Fresh') {
      commissionData.firstYearCommission += firstYearComm;
    } else {
      commissionData.renewalCommission += firstYearComm;
    }

    // Track by normalized company name
    const company = normalizeCompanyName(policy.company_name);
    if (!companyCommissions[company]) {
      companyCommissions[company] = { commission: 0, count: 0 };
    }
    companyCommissions[company].commission += firstYearComm;
    companyCommissions[company].count++;
  });

  commissionData.policyCount = policies.length;
  commissionData.avgCommissionRate = policiesWithCommission > 0 
    ? totalCommissionRate / policiesWithCommission 
    : 0;
  
  commissionData.topCompanies = Object.entries(companyCommissions)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.commission - a.commission)
    .slice(0, 5);

  const maxCommission = Math.max(...commissionData.topCompanies.map(c => c.commission), 1);

  if (policies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Commission Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="shadow-md border-0 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-amber-700">Total Commission</p>
                <p className="text-lg sm:text-2xl font-bold text-amber-900 mt-1">
                  {formatCurrency(commissionData.totalCommission)}
                </p>
                <p className="text-xs text-amber-600 mt-1">{periodLabel}</p>
              </div>
              <div className="p-2 bg-amber-500 rounded-lg flex-shrink-0">
                <IndianRupee className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-green-700">First Year</p>
                <p className="text-lg sm:text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(commissionData.firstYearCommission)}
                </p>
                <p className="text-xs text-green-600 mt-1">Fresh policies</p>
              </div>
              <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-blue-700">Renewal</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900 mt-1">
                  {formatCurrency(commissionData.renewalCommission)}
                </p>
                <p className="text-xs text-blue-600 mt-1">Renewed policies</p>
              </div>
              <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-purple-700">Avg. Rate</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-900 mt-1">
                  {commissionData.avgCommissionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-purple-600 mt-1">{policiesWithCommission} policies</p>
              </div>
              <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                <Percent className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission by Company */}
      {commissionData.topCompanies.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              Commission by Company
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Top performing companies by commission earned
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {commissionData.topCompanies.map((company, index) => (
              <div key={company.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-medium truncate">{company.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({company.count} {company.count === 1 ? 'policy' : 'policies'})
                    </span>
                  </div>
                  <span className="font-semibold text-amber-700 flex-shrink-0 ml-2">
                    {formatCurrency(company.commission)}
                  </span>
                </div>
                <Progress 
                  value={(company.commission / maxCommission) * 100} 
                  className="h-2 bg-amber-100"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommissionAnalytics;
