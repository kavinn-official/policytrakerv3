import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialDatePicker } from "@/components/ui/material-date-picker";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Loader2, 
  Car, 
  Heart, 
  Shield, 
  FileText,
  TrendingUp,
  Calendar,
  IndianRupee
} from "lucide-react";
import * as XLSX from 'xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface PolicyStats {
  totalPolicies: number;
  totalNetPremium: number;
  vehicleInsurance: { count: number; premium: number };
  healthInsurance: { count: number; premium: number };
  lifeInsurance: { count: number; premium: number };
  otherInsurance: { count: number; premium: number };
  policies: any[];
}

const COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#A855F7'];

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [stats, setStats] = useState<PolicyStats | null>(null);

  const fetchStats = async () => {
    if (!user?.id || !startDate || !endDate) return;
    
    setLoading(true);
    try {
      const { data: policies, error } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user.id)
        .gte('policy_active_date', format(startDate, 'yyyy-MM-dd'))
        .lte('policy_active_date', format(endDate, 'yyyy-MM-dd'))
        .order('policy_active_date', { ascending: false });

      if (error) throw error;

      const stats: PolicyStats = {
        totalPolicies: policies?.length || 0,
        totalNetPremium: 0,
        vehicleInsurance: { count: 0, premium: 0 },
        healthInsurance: { count: 0, premium: 0 },
        lifeInsurance: { count: 0, premium: 0 },
        otherInsurance: { count: 0, premium: 0 },
        policies: policies || [],
      };

      policies?.forEach(policy => {
        const premium = Number(policy.net_premium) || 0;
        stats.totalNetPremium += premium;

        const insuranceType = policy.insurance_type || 'Vehicle Insurance';
        switch (insuranceType) {
          case 'Vehicle Insurance':
            stats.vehicleInsurance.count++;
            stats.vehicleInsurance.premium += premium;
            break;
          case 'Health Insurance':
            stats.healthInsurance.count++;
            stats.healthInsurance.premium += premium;
            break;
          case 'Life Insurance':
            stats.lifeInsurance.count++;
            stats.lifeInsurance.premium += premium;
            break;
          default:
            stats.otherInsurance.count++;
            stats.otherInsurance.premium += premium;
        }
      });

      setStats(stats);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchStats();
    }
  }, [startDate, endDate, user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const downloadReport = () => {
    if (!stats || stats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found in the selected date range",
        variant: "destructive",
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Policy Report'],
      ['Date Range', `${format(startDate!, 'dd/MM/yyyy')} - ${format(endDate!, 'dd/MM/yyyy')}`],
      ['Generated On', format(new Date(), 'dd/MM/yyyy HH:mm')],
      [],
      ['Summary'],
      ['Total Policies', stats.totalPolicies],
      ['Total Net Premium', stats.totalNetPremium],
      [],
      ['By Insurance Type'],
      ['Type', 'Policy Count', 'Net Premium'],
      ['Vehicle Insurance', stats.vehicleInsurance.count, stats.vehicleInsurance.premium],
      ['Health Insurance', stats.healthInsurance.count, stats.healthInsurance.premium],
      ['Life Insurance', stats.lifeInsurance.count, stats.lifeInsurance.premium],
      ['Other Insurance', stats.otherInsurance.count, stats.otherInsurance.premium],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Policies sheet with all details
    const policyData = stats.policies.map((p, index) => ({
      'S.No': index + 1,
      'Policy Number': p.policy_number,
      'Client Name': p.client_name,
      'Insurance Type': p.insurance_type || 'Vehicle Insurance',
      'Company': p.company_name || '',
      'Vehicle Number': p.vehicle_number || '',
      'Vehicle Make': p.vehicle_make || '',
      'Vehicle Model': p.vehicle_model || '',
      'Active Date': p.policy_active_date,
      'Expiry Date': p.policy_expiry_date,
      'Net Premium': p.net_premium || 0,
      'Status': p.status,
      'Contact': p.contact_number || '',
      'Agent Code': p.agent_code || '',
      'Reference': p.reference || '',
    }));
    const policiesSheet = XLSX.utils.json_to_sheet(policyData);
    
    // Set column widths
    policiesSheet['!cols'] = [
      { wch: 6 }, { wch: 22 }, { wch: 20 }, { wch: 18 }, { wch: 25 },
      { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, policiesSheet, 'Policies');

    const fileName = `Policy_Report_${format(startDate!, 'yyyyMMdd')}_${format(endDate!, 'yyyyMMdd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Downloaded",
      description: `${fileName} has been downloaded with ${stats.policies.length} policies`,
    });
  };

  const emailReport = async () => {
    if (!stats || stats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found in the selected date range",
        variant: "destructive",
      });
      return;
    }

    setEmailing(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-policy-report', {
        body: {
          manual_trigger: true,
          user_id: user?.id,
        }
      });

      if (error) throw error;

      toast({
        title: "Report Sent",
        description: "The report has been emailed to your registered email address",
      });
    } catch (error: any) {
      console.error('Email error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setEmailing(false);
    }
  };

  // Prepare chart data
  const getPieChartData = () => {
    if (!stats) return [];
    return [
      { name: 'Vehicle', value: stats.vehicleInsurance.premium, count: stats.vehicleInsurance.count },
      { name: 'Health', value: stats.healthInsurance.premium, count: stats.healthInsurance.count },
      { name: 'Life', value: stats.lifeInsurance.premium, count: stats.lifeInsurance.count },
      { name: 'Other', value: stats.otherInsurance.premium, count: stats.otherInsurance.count },
    ].filter(item => item.count > 0);
  };

  const getBarChartData = () => {
    if (!stats) return [];
    return [
      { name: 'Vehicle', premium: stats.vehicleInsurance.premium, count: stats.vehicleInsurance.count },
      { name: 'Health', premium: stats.healthInsurance.premium, count: stats.healthInsurance.count },
      { name: 'Life', premium: stats.lifeInsurance.premium, count: stats.lifeInsurance.count },
      { name: 'Other', premium: stats.otherInsurance.premium, count: stats.otherInsurance.count },
    ];
  };

  const StatCard = ({ 
    title, 
    count, 
    premium, 
    icon: Icon, 
    colorClass 
  }: { 
    title: string; 
    count: number; 
    premium: number; 
    icon: any; 
    colorClass: string;
  }) => (
    <Card className="shadow-md border-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{count}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(premium)}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Premium: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Policies: {payload[0].payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 text-sm sm:text-base">Generate and analyze policy reports</p>
          </div>
        </div>
      </div>

      {/* Date Range Selection */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Select Date Range
          </CardTitle>
          <CardDescription>
            Choose the period for your report based on policy active dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-auto space-y-2">
              <Label>Start Date</Label>
              <MaterialDatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="w-full sm:w-auto space-y-2">
              <Label>End Date</Label>
              <MaterialDatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="Select end date"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={downloadReport}
                disabled={loading || !stats || stats.policies.length === 0}
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                onClick={emailReport}
                disabled={emailing || loading || !stats || stats.policies.length === 0}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                {emailing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stats ? (
        <>
          {/* Overall Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Policies</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalPolicies}</p>
                    <p className="text-blue-100 text-sm mt-1">
                      {format(startDate!, 'dd MMM')} - {format(endDate!, 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-xl">
                    <FileText className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Net Premium</p>
                    <p className="text-4xl font-bold mt-2">{formatCurrency(stats.totalNetPremium)}</p>
                    <p className="text-green-100 text-sm mt-1">
                      Collected in this period
                    </p>
                  </div>
                  <div className="p-4 bg-white/20 rounded-xl">
                    <IndianRupee className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          {stats.totalPolicies > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pie Chart */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Premium Distribution
                  </CardTitle>
                  <CardDescription>
                    Premium breakdown by insurance type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
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
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getBarChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            if (name === 'count') return [value, 'Policies'];
                            return [formatCurrency(value), 'Premium'];
                          }}
                        />
                        <Bar dataKey="count" fill="#3B82F6" name="count" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Insurance Type Breakdown */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                By Insurance Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Vehicle Insurance"
                  count={stats.vehicleInsurance.count}
                  premium={stats.vehicleInsurance.premium}
                  icon={Car}
                  colorClass="bg-blue-500"
                />
                <StatCard
                  title="Health Insurance"
                  count={stats.healthInsurance.count}
                  premium={stats.healthInsurance.premium}
                  icon={Heart}
                  colorClass="bg-red-500"
                />
                <StatCard
                  title="Life Insurance"
                  count={stats.lifeInsurance.count}
                  premium={stats.lifeInsurance.premium}
                  icon={Shield}
                  colorClass="bg-green-500"
                />
                <StatCard
                  title="Other Insurance"
                  count={stats.otherInsurance.count}
                  premium={stats.otherInsurance.premium}
                  icon={FileText}
                  colorClass="bg-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Policy List Preview */}
          {stats.policies.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Policy Details ({stats.policies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Policy #</th>
                        <th className="text-left py-3 px-2 font-medium">Client</th>
                        <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Type</th>
                        <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Company</th>
                        <th className="text-right py-3 px-2 font-medium">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.policies.slice(0, 10).map((policy) => (
                        <tr key={policy.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 font-mono text-xs">{policy.policy_number}</td>
                          <td className="py-3 px-2">{policy.client_name}</td>
                          <td className="py-3 px-2 hidden sm:table-cell">
                            <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                              {policy.insurance_type || 'Vehicle'}
                            </span>
                          </td>
                          <td className="py-3 px-2 hidden md:table-cell">{policy.company_name}</td>
                          <td className="py-3 px-2 text-right font-medium">
                            {formatCurrency(Number(policy.net_premium) || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {stats.policies.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Showing 10 of {stats.policies.length} policies. Download the report for complete data.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {stats.policies.length === 0 && (
            <Card className="shadow-lg border-0">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Policies Found</h3>
                <p className="text-muted-foreground mt-1">
                  No policies were added in the selected date range
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
};

export default ReportsPage;
