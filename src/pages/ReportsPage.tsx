import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, getYear, getMonth, setMonth, setYear, subMonths } from "date-fns";
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
  TrendingDown,
  Calendar,
  IndianRupee,
  BarChart3,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import * as XLSX from '@e965/xlsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { aggregateByNormalizedCompany } from "@/utils/companyNormalization";
import { formatDateDDMMYYYY } from "@/utils/policyUtils";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PolicyStats {
  totalPolicies: number;
  totalNetPremium: number;
  vehicleInsurance: { count: number; premium: number };
  healthInsurance: { count: number; premium: number };
  lifeInsurance: { count: number; premium: number };
  otherInsurance: { count: number; premium: number };
  byCompany: { [key: string]: { count: number; premium: number } };
  policies: any[];
}

interface MonthlyTrend {
  month: string;
  policies: number;
  premium: number;
}

const COLORS = ['#3B82F6', '#EF4444', '#22C55E', '#A855F7'];

const MONTHS = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

// Generate years from 2020 to current year + 1
const currentYear = getYear(new Date());
const YEARS = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
}));

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(String(getMonth(now)));
  const [selectedYear, setSelectedYear] = useState<string>(String(getYear(now)));
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [stats, setStats] = useState<PolicyStats | null>(null);
  const [previousStats, setPreviousStats] = useState<PolicyStats | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);

  // Compute start and end dates based on selected month/year
  const getDateRange = (month: number, year: number) => {
    const baseDate = setYear(setMonth(new Date(), month), year);
    return {
      startDate: startOfMonth(baseDate),
      endDate: endOfMonth(baseDate),
    };
  };

  const fetchStatsForPeriod = async (startDate: Date, endDate: Date): Promise<PolicyStats | null> => {
    if (!user?.id) return null;
    
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
        byCompany: {},
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

      stats.byCompany = aggregateByNormalizedCompany(policies || []);
      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const { startDate, endDate } = getDateRange(month, year);
      
      // Fetch current month stats
      const currentStats = await fetchStatsForPeriod(startDate, endDate);
      setStats(currentStats);

      // Fetch previous month stats for comparison
      const prevMonth = subMonths(startDate, 1);
      const prevRange = getDateRange(getMonth(prevMonth), getYear(prevMonth));
      const prevStats = await fetchStatsForPeriod(prevRange.startDate, prevRange.endDate);
      setPreviousStats(prevStats);

      // Fetch last 6 months trend data
      const trends: MonthlyTrend[] = [];
      for (let i = 5; i >= 0; i--) {
        const trendMonth = subMonths(startDate, i);
        const trendRange = getDateRange(getMonth(trendMonth), getYear(trendMonth));
        const trendStats = await fetchStatsForPeriod(trendRange.startDate, trendRange.endDate);
        trends.push({
          month: format(trendMonth, 'MMM yy'),
          policies: trendStats?.totalPolicies || 0,
          premium: trendStats?.totalNetPremium || 0,
        });
      }
      setMonthlyTrends(trends);

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
    fetchStats();
  }, [selectedMonth, selectedYear, user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const { startDate } = getDateRange(parseInt(selectedMonth), parseInt(selectedYear));
  const monthYearLabel = format(startDate, 'MMMM yyyy');

  // Calculate comparison percentages
  const getComparison = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const downloadExcel = () => {
    if (!stats || stats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found for the selected month",
        variant: "destructive",
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryData = [
      ['Monthly Policy Report'],
      ['Month', monthYearLabel],
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
      [],
      ['By Insurance Company'],
      ['Company', 'Policy Count', 'Net Premium'],
      ...Object.entries(stats.byCompany)
        .sort((a, b) => b[1].premium - a[1].premium)
        .map(([company, data]) => [company, data.count, data.premium]),
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Policies sheet
    const policyData = stats.policies.map((p, index) => ({
      'S.No': index + 1,
      'Policy Number': p.policy_number,
      'Client Name': p.client_name,
      'Insurance Type': p.insurance_type || 'Vehicle Insurance',
      'Company': p.company_name || '',
      'Vehicle Number': p.vehicle_number || '',
      'Active Date': formatDateDDMMYYYY(p.policy_active_date),
      'Expiry Date': formatDateDDMMYYYY(p.policy_expiry_date),
      'Net Premium': p.net_premium || 0,
      'Status': p.status,
      'Contact': p.contact_number || '',
    }));
    const policiesSheet = XLSX.utils.json_to_sheet(policyData);
    XLSX.utils.book_append_sheet(workbook, policiesSheet, 'Policies');

    const fileName = `Policy_Report_${monthYearLabel.replace(' ', '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Excel Downloaded",
      description: `${fileName} has been downloaded`,
    });
  };

  const downloadCSV = () => {
    if (!stats || stats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found for the selected month",
        variant: "destructive",
      });
      return;
    }

    const headers = ['S.No', 'Policy Number', 'Client Name', 'Insurance Type', 'Company', 'Vehicle Number', 'Active Date', 'Expiry Date', 'Net Premium', 'Status', 'Contact'];
    const rows = stats.policies.map((p, index) => [
      index + 1,
      p.policy_number,
      p.client_name,
      p.insurance_type || 'Vehicle Insurance',
      p.company_name || '',
      p.vehicle_number || '',
      formatDateDDMMYYYY(p.policy_active_date),
      formatDateDDMMYYYY(p.policy_expiry_date),
      p.net_premium || 0,
      p.status,
      p.contact_number || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Policy_Report_${monthYearLabel.replace(' ', '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Downloaded",
      description: "CSV file has been downloaded",
    });
  };

  const downloadPDF = () => {
    if (!stats || stats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found for the selected month",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header with branding
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Tracker.in', 14, 18);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Monthly Policy Report - ${monthYearLabel}`, 14, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 14, 28, { align: 'right' });

    // Summary section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 50);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Policies: ${stats.totalPolicies}`, 14, 60);
    doc.text(`Total Net Premium: ${formatCurrency(stats.totalNetPremium)}`, 14, 68);

    // Insurance type breakdown
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('By Insurance Type', 14, 85);

    autoTable(doc, {
      startY: 92,
      head: [['Type', 'Count', 'Premium']],
      body: [
        ['Vehicle Insurance', String(stats.vehicleInsurance.count), formatCurrency(stats.vehicleInsurance.premium)],
        ['Health Insurance', String(stats.healthInsurance.count), formatCurrency(stats.healthInsurance.premium)],
        ['Life Insurance', String(stats.lifeInsurance.count), formatCurrency(stats.lifeInsurance.premium)],
        ['Other Insurance', String(stats.otherInsurance.count), formatCurrency(stats.otherInsurance.premium)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });

    // Company breakdown
    const yAfterTypeTable = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('By Insurance Company', 14, yAfterTypeTable);

    const companyData = Object.entries(stats.byCompany)
      .sort((a, b) => b[1].premium - a[1].premium)
      .map(([company, data]) => [company, String(data.count), formatCurrency(data.premium)]);

    autoTable(doc, {
      startY: yAfterTypeTable + 7,
      head: [['Company', 'Count', 'Premium']],
      body: companyData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });

    // Policy details on new page
    doc.addPage();
    
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Policy Details', 14, 16);

    const policyTableData = stats.policies.map((p, index) => [
      String(index + 1),
      p.policy_number,
      p.client_name,
      p.insurance_type || 'Vehicle',
      formatCurrency(Number(p.net_premium) || 0),
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['#', 'Policy Number', 'Client Name', 'Type', 'Premium']],
      body: policyTableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      doc.text('Generated by Policy Tracker.in', 14, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`Policy_Report_${monthYearLabel.replace(' ', '_')}.pdf`);

    toast({
      title: "PDF Downloaded",
      description: "PDF report has been downloaded",
    });
  };

  const emailReport = async () => {
    if (!stats || stats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found for the selected month",
        variant: "destructive",
      });
      return;
    }

    setEmailing(true);
    try {
      const { error } = await supabase.functions.invoke('send-policy-report', {
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

  // Prepare chart data - use count as fallback if premium is 0
  const getPieChartData = () => {
    if (!stats) return [];
    const data = [
      { name: 'Vehicle', value: stats.vehicleInsurance.count, premium: stats.vehicleInsurance.premium, color: COLORS[0] },
      { name: 'Health', value: stats.healthInsurance.count, premium: stats.healthInsurance.premium, color: COLORS[1] },
      { name: 'Life', value: stats.lifeInsurance.count, premium: stats.lifeInsurance.premium, color: COLORS[2] },
      { name: 'Other', value: stats.otherInsurance.count, premium: stats.otherInsurance.premium, color: COLORS[3] },
    ].filter(item => item.value > 0);
    return data;
  };

  const getBarChartData = () => {
    if (!stats) return [];
    return [
      { name: 'Vehicle', count: stats.vehicleInsurance.count, premium: stats.vehicleInsurance.premium, fill: COLORS[0] },
      { name: 'Health', count: stats.healthInsurance.count, premium: stats.healthInsurance.premium, fill: COLORS[1] },
      { name: 'Life', count: stats.lifeInsurance.count, premium: stats.lifeInsurance.premium, fill: COLORS[2] },
      { name: 'Other', count: stats.otherInsurance.count, premium: stats.otherInsurance.premium, fill: COLORS[3] },
    ].filter(item => item.count > 0);
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
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name || payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Policies: {data.value || data.count || payload[0].value}
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

  const policyComparison = previousStats ? getComparison(stats?.totalPolicies || 0, previousStats.totalPolicies) : null;
  const premiumComparison = previousStats ? getComparison(stats?.totalNetPremium || 0, previousStats.totalNetPremium) : null;

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Generate and analyze policy reports</p>
          </div>
        </div>
      </div>

      {/* Month & Year Selection */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Select Month & Year
          </CardTitle>
          <CardDescription>
            Choose a month and year to view policies added during that period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end flex-wrap">
            <div className="w-full sm:w-48 space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32 space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={loading || !stats || stats.policies.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={downloadExcel}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadCSV}>
                    <FileText className="h-4 w-4 mr-2" />
                    CSV (.csv)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadPDF}>
                    <Printer className="h-4 w-4 mr-2" />
                    PDF Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={emailReport}
                disabled={emailing || loading || !stats || stats.policies.length === 0}
                variant="outline"
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
          {/* Overall Summary with Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Policies</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalPolicies}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-blue-100 text-sm">{monthYearLabel}</p>
                      {policyComparison && (
                        <span className={`flex items-center text-xs px-2 py-0.5 rounded-full ${policyComparison.isPositive ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                          {policyComparison.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {policyComparison.value.toFixed(1)}%
                        </span>
                      )}
                    </div>
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
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-green-100 text-sm">Collected in {monthYearLabel}</p>
                      {premiumComparison && stats.totalNetPremium > 0 && (
                        <span className={`flex items-center text-xs px-2 py-0.5 rounded-full ${premiumComparison.isPositive ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                          {premiumComparison.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {premiumComparison.value.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-white/20 rounded-xl">
                    <IndianRupee className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Month-over-Month Trend Charts */}
          {monthlyTrends.length > 0 && (
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
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
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
          )}

          {/* Charts Section - Policy Distribution */}
          {stats.totalPolicies > 0 && getPieChartData().length > 0 && (
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
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieChartData()}
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
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                        />
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
                <CardContent className="px-2 sm:px-6">
                  <div className="h-[320px] sm:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={getBarChartData()} 
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
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          name="count" 
                          radius={[6, 6, 0, 0]}
                          maxBarSize={60}
                        >
                          {getBarChartData().map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* No Data Message */}
          {stats.totalPolicies === 0 && (
            <Card className="shadow-lg border-0">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Policies Found</h3>
                <p className="text-muted-foreground mt-1">
                  No policies were added in {monthYearLabel}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Insurance Type Breakdown */}
          {stats.totalPolicies > 0 && (
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
          )}

          {/* By Company Breakdown */}
          {Object.keys(stats.byCompany).length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  By Insurance Company
                </CardTitle>
                <CardDescription>
                  Policy count and premium breakdown by company name (similar names merged)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-3 px-4 font-semibold">Company Name</th>
                        <th className="text-center py-3 px-4 font-semibold">Policy Count</th>
                        <th className="text-right py-3 px-4 font-semibold">Net Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byCompany)
                        .sort((a, b) => b[1].premium - a[1].premium)
                        .map(([company, data], index) => (
                          <tr key={company} className={`border-b hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                            <td className="py-3 px-4 font-medium">{company}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {data.count}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-green-600">
                              {formatCurrency(data.premium)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 font-bold">
                        <td className="py-3 px-4">Total</td>
                        <td className="py-3 px-4 text-center">{stats.totalPolicies}</td>
                        <td className="py-3 px-4 text-right text-green-600">{formatCurrency(stats.totalNetPremium)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

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
        </>
      ) : null}
    </div>
  );
};

export default ReportsPage;
