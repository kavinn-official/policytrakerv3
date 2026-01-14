import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Mail, Loader2, FileSpreadsheet, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import * as XLSX from "@e965/xlsx";

interface PolicyWithPremium {
  id: string;
  policy_number: string;
  client_name: string;
  vehicle_number: string;
  company_name: string | null;
  net_premium: number | null;
  policy_active_date: string;
  policy_expiry_date: string;
  created_at: string;
  agent_code: string | null;
}

const MonthlyPremiumReport = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>("current");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getMonthRange = (monthOption: string) => {
    const now = new Date();
    let targetMonth: Date;

    switch (monthOption) {
      case "previous":
        targetMonth = subMonths(now, 1);
        break;
      case "2months":
        targetMonth = subMonths(now, 2);
        break;
      case "3months":
        targetMonth = subMonths(now, 3);
        break;
      default:
        targetMonth = now;
    }

    return {
      start: startOfMonth(targetMonth),
      end: endOfMonth(targetMonth),
      label: format(targetMonth, "MMMM yyyy"),
    };
  };

  const fetchMonthlyPolicies = async (): Promise<PolicyWithPremium[]> => {
    const { start, end } = getMonthRange(selectedMonth);
    
    const { data, error } = await supabase
      .from("policies")
      .select("id, policy_number, client_name, vehicle_number, company_name, net_premium, policy_active_date, policy_expiry_date, created_at, agent_code")
      .eq("user_id", user?.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const generateExcelReport = (policies: PolicyWithPremium[], monthLabel: string) => {
    const totalPremium = policies.reduce((sum, p) => sum + (p.net_premium || 0), 0);
    
    // Create summary sheet
    const summaryData = [
      { Metric: "Report Period", Value: monthLabel },
      { Metric: "Total Policies", Value: policies.length },
      { Metric: "Total Net Premium", Value: `₹${totalPremium.toLocaleString("en-IN")}` },
      { Metric: "Average Premium", Value: policies.length > 0 ? `₹${(totalPremium / policies.length).toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "₹0" },
      { Metric: "Generated On", Value: format(new Date(), "dd MMM yyyy, hh:mm a") },
    ];

    // Create policies sheet
    const policiesData = policies.map((policy, index) => ({
      "S.No": index + 1,
      "Policy Number": policy.policy_number,
      "Client Name": policy.client_name,
      "Vehicle Number": policy.vehicle_number,
      "Company": policy.company_name || "-",
      "Agent": policy.agent_code || "-",
      "Net Premium (₹)": policy.net_premium || 0,
      "Active Date": format(new Date(policy.policy_active_date), "dd/MM/yyyy"),
      "Expiry Date": format(new Date(policy.policy_expiry_date), "dd/MM/yyyy"),
      "Added On": format(new Date(policy.created_at), "dd/MM/yyyy"),
    }));

    // Add total row
    policiesData.push({
      "S.No": "" as any,
      "Policy Number": "",
      "Client Name": "",
      "Vehicle Number": "",
      "Company": "",
      "Agent": "TOTAL",
      "Net Premium (₹)": totalPremium,
      "Active Date": "",
      "Expiry Date": "",
      "Added On": "",
    });

    const workbook = XLSX.utils.book_new();
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    
    const policiesSheet = XLSX.utils.json_to_sheet(policiesData);
    // Set column widths
    policiesSheet["!cols"] = [
      { wch: 6 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, policiesSheet, "Policies");

    return workbook;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const policies = await fetchMonthlyPolicies();
      const { label } = getMonthRange(selectedMonth);
      
      if (policies.length === 0) {
        toast({
          title: "No Policies Found",
          description: `No policies were added in ${label}.`,
          variant: "destructive",
        });
        return;
      }

      const workbook = generateExcelReport(policies, label);
      const fileName = `Premium_Report_${label.replace(" ", "_")}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Report Downloaded",
        description: `${policies.length} policies exported for ${label}.`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Download Failed",
        description: "Could not generate the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = async () => {
    setIsEmailing(true);
    try {
      const { label } = getMonthRange(selectedMonth);
      
      const { data, error } = await supabase.functions.invoke("send-policy-report", {
        body: {
          manual_trigger: true,
          user_id: user?.id,
          report_type: "monthly_premium",
          month: selectedMonth,
        },
      });

      if (error) throw error;

      toast({
        title: "Report Sent",
        description: `Monthly premium report for ${label} has been sent to your email.`,
      });
    } catch (error) {
      console.error("Error sending report:", error);
      toast({
        title: "Email Failed",
        description: "Could not send the report. Please try downloading instead.",
        variant: "destructive",
      });
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-green-600" />
          Monthly Premium Report
        </CardTitle>
        <CardDescription>
          Download or email a detailed report of all policies with net premiums
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  {format(new Date(), "MMMM yyyy")}
                </span>
              </SelectItem>
              <SelectItem value="previous">
                {format(subMonths(new Date(), 1), "MMMM yyyy")}
              </SelectItem>
              <SelectItem value="2months">
                {format(subMonths(new Date(), 2), "MMMM yyyy")}
              </SelectItem>
              <SelectItem value="3months">
                {format(subMonths(new Date(), 3), "MMMM yyyy")}
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 flex-1">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
            <Button
              onClick={handleEmail}
              disabled={isEmailing}
              variant="outline"
              className="flex-1"
            >
              {isEmailing ? (
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
  );
};

export default MonthlyPremiumReport;
