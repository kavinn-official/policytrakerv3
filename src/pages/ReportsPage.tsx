import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, getYear, getMonth, setMonth, setYear, subMonths, startOfYear, endOfYear } from "date-fns";
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
  FileSpreadsheet,
  Printer,
  CalendarRange
} from "lucide-react";
import * as XLSX from '@e965/xlsx';
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
import { aggregateByNormalizedCompany, normalizeCompanyName } from "@/utils/companyNormalization";
import { formatDateDDMMYYYY } from "@/utils/policyUtils";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TrendCharts, DistributionCharts } from "@/components/reports/ReportCharts";
import { ReportFilters } from "@/components/reports/ReportFilters";

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

const currentYear = getYear(new Date());
const YEARS = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
}));

const INSURANCE_TYPES = ['Vehicle Insurance', 'Health Insurance', 'Life Insurance', 'Other Insurance'];

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const now = new Date();
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(String(getMonth(now)));
  const [selectedYear, setSelectedYear] = useState<string>(String(getYear(now)));
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [stats, setStats] = useState<PolicyStats | null>(null);
  const [previousStats, setPreviousStats] = useState<PolicyStats | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [allPolicies, setAllPolicies] = useState<any[]>([]);
  
  // Filter states
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  // Get unique companies from policies
  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>();
    allPolicies.forEach(p => {
      if (p.company_name) {
        companies.add(normalizeCompanyName(p.company_name));
      }
    });
    return Array.from(companies).sort();
  }, [allPolicies]);

  // Filter policies based on selected filters
  const filteredPolicies = useMemo(() => {
    let filtered = allPolicies;
    
    if (selectedInsuranceType !== 'all') {
      filtered = filtered.filter(p => p.insurance_type === selectedInsuranceType);
    }
    
    if (selectedCompany !== 'all') {
      filtered = filtered.filter(p => normalizeCompanyName(p.company_name || '') === selectedCompany);
    }
    
    return filtered;
  }, [allPolicies, selectedInsuranceType, selectedCompany]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    if (!filteredPolicies.length) return null;
    
    const stats: PolicyStats = {
      totalPolicies: filteredPolicies.length,
      totalNetPremium: 0,
      vehicleInsurance: { count: 0, premium: 0 },
      healthInsurance: { count: 0, premium: 0 },
      lifeInsurance: { count: 0, premium: 0 },
      otherInsurance: { count: 0, premium: 0 },
      byCompany: {},
      policies: filteredPolicies,
    };

    filteredPolicies.forEach(policy => {
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

    stats.byCompany = aggregateByNormalizedCompany(filteredPolicies);
    return stats;
  }, [filteredPolicies]);

  // Use filtered stats or original stats
  const displayStats = (selectedInsuranceType !== 'all' || selectedCompany !== 'all') ? filteredStats : stats;

  const getDateRange = (month: number, year: number) => {
    const baseDate = setYear(setMonth(new Date(), month), year);
    return {
      startDate: startOfMonth(baseDate),
      endDate: endOfMonth(baseDate),
    };
  };

  const getYearRange = (year: number) => {
    const baseDate = new Date(year, 0, 1);
    return {
      startDate: startOfYear(baseDate),
      endDate: endOfYear(baseDate),
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
      
      let startDate: Date, endDate: Date;
      
      if (reportType === 'yearly') {
        const range = getYearRange(year);
        startDate = range.startDate;
        endDate = range.endDate;
      } else {
        const range = getDateRange(month, year);
        startDate = range.startDate;
        endDate = range.endDate;
      }
      
      // Fetch current period stats
      const currentStats = await fetchStatsForPeriod(startDate, endDate);
      setStats(currentStats);
      setAllPolicies(currentStats?.policies || []);

      // Fetch previous period stats for comparison
      if (reportType === 'yearly') {
        const prevYear = getYearRange(year - 1);
        const prevStats = await fetchStatsForPeriod(prevYear.startDate, prevYear.endDate);
        setPreviousStats(prevStats);
      } else {
        const prevMonth = subMonths(startDate, 1);
        const prevRange = getDateRange(getMonth(prevMonth), getYear(prevMonth));
        const prevStats = await fetchStatsForPeriod(prevRange.startDate, prevRange.endDate);
        setPreviousStats(prevStats);
      }

      // Fetch trend data (last 6 months for monthly, last 12 months for yearly)
      const trends: MonthlyTrend[] = [];
      const trendCount = reportType === 'yearly' ? 12 : 6;
      
      for (let i = trendCount - 1; i >= 0; i--) {
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
  }, [selectedMonth, selectedYear, reportType, user?.id]);

  // Reset filters when period changes
  useEffect(() => {
    setSelectedInsuranceType('all');
    setSelectedCompany('all');
  }, [selectedMonth, selectedYear, reportType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    if (reportType === 'yearly') {
      return selectedYear;
    }
    const { startDate } = getDateRange(parseInt(selectedMonth), parseInt(selectedYear));
    return format(startDate, 'MMMM yyyy');
  };

  const periodLabel = getPeriodLabel();

  const getComparison = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  // Chart data functions
  const getPieChartData = () => {
    if (!displayStats) return [];
    const data = [
      { name: 'Vehicle', value: displayStats.vehicleInsurance.count, premium: displayStats.vehicleInsurance.premium, color: COLORS[0] },
      { name: 'Health', value: displayStats.healthInsurance.count, premium: displayStats.healthInsurance.premium, color: COLORS[1] },
      { name: 'Life', value: displayStats.lifeInsurance.count, premium: displayStats.lifeInsurance.premium, color: COLORS[2] },
      { name: 'Other', value: displayStats.otherInsurance.count, premium: displayStats.otherInsurance.premium, color: COLORS[3] },
    ].filter(item => item.value > 0);
    return data;
  };

  const getBarChartData = () => {
    if (!displayStats) return [];
    return [
      { name: 'Vehicle', count: displayStats.vehicleInsurance.count, premium: displayStats.vehicleInsurance.premium, fill: COLORS[0] },
      { name: 'Health', count: displayStats.healthInsurance.count, premium: displayStats.healthInsurance.premium, fill: COLORS[1] },
      { name: 'Life', count: displayStats.lifeInsurance.count, premium: displayStats.lifeInsurance.premium, fill: COLORS[2] },
      { name: 'Other', count: displayStats.otherInsurance.count, premium: displayStats.otherInsurance.premium, fill: COLORS[3] },
    ].filter(item => item.count > 0);
  };

  const downloadExcel = () => {
    if (!displayStats || displayStats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found for the selected period",
        variant: "destructive",
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    
    const summaryData = [
      [reportType === 'yearly' ? 'Yearly Policy Report' : 'Monthly Policy Report'],
      ['Period', periodLabel],
      ['Generated On', format(new Date(), 'dd/MM/yyyy HH:mm')],
      ...(selectedInsuranceType !== 'all' ? [['Filtered by Type', selectedInsuranceType]] : []),
      ...(selectedCompany !== 'all' ? [['Filtered by Company', selectedCompany]] : []),
      [],
      ['Summary'],
      ['Total Policies', displayStats.totalPolicies],
      ['Total Net Premium', displayStats.totalNetPremium],
      [],
      ['By Insurance Type'],
      ['Type', 'Policy Count', 'Net Premium'],
      ['Vehicle Insurance', displayStats.vehicleInsurance.count, displayStats.vehicleInsurance.premium],
      ['Health Insurance', displayStats.healthInsurance.count, displayStats.healthInsurance.premium],
      ['Life Insurance', displayStats.lifeInsurance.count, displayStats.lifeInsurance.premium],
      ['Other Insurance', displayStats.otherInsurance.count, displayStats.otherInsurance.premium],
      [],
      ['By Insurance Company'],
      ['Company', 'Policy Count', 'Net Premium'],
      ...Object.entries(displayStats.byCompany)
        .sort((a, b) => b[1].premium - a[1].premium)
        .map(([company, data]) => [company, data.count, data.premium]),
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const policyData = displayStats.policies.map((p, index) => ({
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

    const fileName = `Policy_Report_${periodLabel.replace(' ', '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Excel Downloaded",
      description: `${fileName} has been downloaded`,
    });
  };

  const downloadCSV = () => {
    if (!displayStats || displayStats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found for the selected period",
        variant: "destructive",
      });
      return;
    }

    const headers = ['S.No', 'Policy Number', 'Client Name', 'Insurance Type', 'Company', 'Vehicle Number', 'Active Date', 'Expiry Date', 'Net Premium', 'Status', 'Contact'];
    const rows = displayStats.policies.map((p, index) => [
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
    link.download = `Policy_Report_${periodLabel.replace(' ', '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Downloaded",
      description: "CSV file has been downloaded",
    });
  };

  const downloadPDF = () => {
    if (!displayStats || displayStats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found for the selected period",
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
    doc.text(`${reportType === 'yearly' ? 'Yearly' : 'Monthly'} Policy Report - ${periodLabel}`, 14, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - 14, 28, { align: 'right' });

    // Filters info
    let yPos = 50;
    if (selectedInsuranceType !== 'all' || selectedCompany !== 'all') {
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      if (selectedInsuranceType !== 'all') {
        doc.text(`Filtered by Type: ${selectedInsuranceType}`, 14, yPos);
        yPos += 8;
      }
      if (selectedCompany !== 'all') {
        doc.text(`Filtered by Company: ${selectedCompany}`, 14, yPos);
        yPos += 8;
      }
    }

    // Summary section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPos);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Policies: ${displayStats.totalPolicies}`, 14, yPos + 10);
    doc.text(`Total Net Premium: ${formatCurrency(displayStats.totalNetPremium)}`, 14, yPos + 18);

    // Insurance type breakdown
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('By Insurance Type', 14, yPos + 35);

    autoTable(doc, {
      startY: yPos + 42,
      head: [['Type', 'Count', 'Premium']],
      body: [
        ['Vehicle Insurance', String(displayStats.vehicleInsurance.count), formatCurrency(displayStats.vehicleInsurance.premium)],
        ['Health Insurance', String(displayStats.healthInsurance.count), formatCurrency(displayStats.healthInsurance.premium)],
        ['Life Insurance', String(displayStats.lifeInsurance.count), formatCurrency(displayStats.lifeInsurance.premium)],
        ['Other Insurance', String(displayStats.otherInsurance.count), formatCurrency(displayStats.otherInsurance.premium)],
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

    const companyData = Object.entries(displayStats.byCompany)
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

    const policyTableData = displayStats.policies.map((p, index) => [
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

    doc.save(`Policy_Report_${periodLabel.replace(' ', '_')}.pdf`);

    toast({
      title: "PDF Downloaded",
      description: "PDF report has been downloaded",
    });
  };

  const emailReport = async () => {
    if (!displayStats || displayStats.policies.length === 0) {
      toast({
        title: "No Data",
        description: "No policies found for the selected period",
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

  const policyComparison = previousStats ? getComparison(displayStats?.totalPolicies || 0, previousStats.totalPolicies) : null;
  const premiumComparison = previousStats ? getComparison(displayStats?.totalNetPremium || 0, previousStats.totalNetPremium) : null;

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

      {/* Report Type & Period Selection */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Report Settings
          </CardTitle>
          <CardDescription>
            Choose report type, period, and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end flex-wrap">
            <div className="w-full sm:w-40 space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(v: 'monthly' | 'yearly') => setReportType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Monthly
                    </span>
                  </SelectItem>
                  <SelectItem value="yearly">
                    <span className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4" />
                      Yearly
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {reportType === 'monthly' && (
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
            )}
            
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
                  <Button disabled={loading || !displayStats || displayStats.policies.length === 0}>
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
                disabled={emailing || loading || !displayStats || displayStats.policies.length === 0}
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

          {/* Filters */}
          <ReportFilters
            insuranceTypes={INSURANCE_TYPES}
            companies={uniqueCompanies}
            selectedType={selectedInsuranceType}
            selectedCompany={selectedCompany}
            onTypeChange={setSelectedInsuranceType}
            onCompanyChange={setSelectedCompany}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayStats ? (
        <>
          {/* Overall Summary with Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Policies</p>
                    <p className="text-4xl font-bold mt-2">{displayStats.totalPolicies}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-blue-100 text-sm">{periodLabel}</p>
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
                    <p className="text-4xl font-bold mt-2">{formatCurrency(displayStats.totalNetPremium)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-green-100 text-sm">Collected in {periodLabel}</p>
                      {premiumComparison && displayStats.totalNetPremium > 0 && (
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
          <TrendCharts monthlyTrends={monthlyTrends} formatCurrency={formatCurrency} />

          {/* Charts Section - Policy Distribution */}
          <DistributionCharts 
            pieChartData={getPieChartData()} 
            barChartData={getBarChartData()} 
            formatCurrency={formatCurrency}
          />

          {/* No Data Message */}
          {displayStats.totalPolicies === 0 && (
            <Card className="shadow-lg border-0">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Policies Found</h3>
                <p className="text-muted-foreground mt-1">
                  No policies were added in {periodLabel}
                  {(selectedInsuranceType !== 'all' || selectedCompany !== 'all') && ' with the selected filters'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Insurance Type Breakdown */}
          {displayStats.totalPolicies > 0 && (
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
                    count={displayStats.vehicleInsurance.count}
                    premium={displayStats.vehicleInsurance.premium}
                    icon={Car}
                    colorClass="bg-blue-500"
                  />
                  <StatCard
                    title="Health Insurance"
                    count={displayStats.healthInsurance.count}
                    premium={displayStats.healthInsurance.premium}
                    icon={Heart}
                    colorClass="bg-red-500"
                  />
                  <StatCard
                    title="Life Insurance"
                    count={displayStats.lifeInsurance.count}
                    premium={displayStats.lifeInsurance.premium}
                    icon={Shield}
                    colorClass="bg-green-500"
                  />
                  <StatCard
                    title="Other Insurance"
                    count={displayStats.otherInsurance.count}
                    premium={displayStats.otherInsurance.premium}
                    icon={FileText}
                    colorClass="bg-purple-500"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* By Company Breakdown */}
          {Object.keys(displayStats.byCompany).length > 0 && (
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
                      {Object.entries(displayStats.byCompany)
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
                        <td className="py-3 px-4 text-center">{displayStats.totalPolicies}</td>
                        <td className="py-3 px-4 text-right text-green-600">{formatCurrency(displayStats.totalNetPremium)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Policy List Preview */}
          {displayStats.policies.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Policy Details ({displayStats.policies.length})
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
                      {displayStats.policies.slice(0, 10).map((policy) => (
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
                  {displayStats.policies.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      Showing 10 of {displayStats.policies.length} policies. Download the report for complete data.
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
