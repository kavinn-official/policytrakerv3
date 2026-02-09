import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ScanLine, Loader2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserOcr {
  user_id: string;
  email: string;
  ocr_scans_used: number;
  month_year: string;
}

const AdminOcrUsage = () => {
  const [totalScans, setTotalScans] = useState(0);
  const [userOcr, setUserOcr] = useState<UserOcr[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOcr = async () => {
      try {
        const { data: usageData } = await supabase
          .from("usage_tracking")
          .select("user_id, ocr_scans_used, month_year")
          .order("ocr_scans_used", { ascending: false });

        const { data: profiles } = await supabase.from("profiles").select("id, email");
        const profileMap = new Map((profiles || []).map((p) => [p.id, p.email]));

        let total = 0;
        const items = (usageData || []).map((u) => {
          total += u.ocr_scans_used || 0;
          return {
            user_id: u.user_id,
            email: profileMap.get(u.user_id) || u.user_id.substring(0, 8) + "...",
            ocr_scans_used: u.ocr_scans_used || 0,
            month_year: u.month_year,
          };
        });

        setTotalScans(total);
        setUserOcr(items);
      } catch (error) {
        console.error("Error fetching OCR usage:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOcr();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">OCR Usage Tracking</h1>
        <p className="text-muted-foreground">Monitor OCR scan usage across the platform</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total OCR Scans</CardTitle>
            <ScanLine className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(userOcr.map((u) => u.user_id)).size}</div>
            <p className="text-xs text-muted-foreground">Users who've used OCR</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg per User</CardTitle>
            <ScanLine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(userOcr.map((u) => u.user_id)).size > 0
                ? Math.round(totalScans / new Set(userOcr.map((u) => u.user_id)).size)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Scans per user</p>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>Per-User OCR Usage</CardTitle>
          <CardDescription>Monthly breakdown of OCR usage</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Month</th>
                  <th className="text-left p-3 font-medium">Scans Used</th>
                  <th className="text-left p-3 font-medium">Usage Level</th>
                </tr>
              </thead>
              <tbody>
                {userOcr.length === 0 ? (
                  <tr><td colSpan={4} className="text-center p-8 text-muted-foreground">No OCR usage data</td></tr>
                ) : (
                  userOcr.slice(0, 100).map((u, idx) => (
                    <tr key={`${u.user_id}-${u.month_year}-${idx}`} className="border-b hover:bg-muted/30">
                      <td className="p-3 truncate max-w-[250px]">{u.email}</td>
                      <td className="p-3">{u.month_year}</td>
                      <td className="p-3 font-medium">{u.ocr_scans_used}</td>
                      <td className="p-3">
                        {u.ocr_scans_used > 50 ? (
                          <Badge variant="destructive">High</Badge>
                        ) : u.ocr_scans_used > 20 ? (
                          <Badge className="bg-amber-100 text-amber-700">Medium</Badge>
                        ) : (
                          <Badge variant="secondary">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOcrUsage;
