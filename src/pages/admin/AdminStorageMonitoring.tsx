import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { HardDrive, Loader2, AlertTriangle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserStorage {
  user_id: string;
  email: string;
  storage_used_bytes: number;
}

const TOTAL_PLATFORM_STORAGE_GB = 50; // Platform limit

const AdminStorageMonitoring = () => {
  const [totalUsed, setTotalUsed] = useState(0);
  const [userStorages, setUserStorages] = useState<UserStorage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const { data: usageData } = await supabase
          .from("usage_tracking")
          .select("user_id, storage_used_bytes");

        const { data: profiles } = await supabase.from("profiles").select("id, email");
        const profileMap = new Map((profiles || []).map((p) => [p.id, p.email]));

        const userMap = new Map<string, number>();
        let total = 0;
        (usageData || []).forEach((u) => {
          const prev = userMap.get(u.user_id) || 0;
          userMap.set(u.user_id, prev + (u.storage_used_bytes || 0));
          total += u.storage_used_bytes || 0;
        });

        setTotalUsed(total);
        setUserStorages(
          Array.from(userMap.entries())
            .map(([user_id, storage_used_bytes]) => ({
              user_id,
              email: profileMap.get(user_id) || user_id.substring(0, 8) + "...",
              storage_used_bytes,
            }))
            .sort((a, b) => b.storage_used_bytes - a.storage_used_bytes)
        );
      } catch (error) {
        console.error("Error fetching storage:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStorage();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalGB = TOTAL_PLATFORM_STORAGE_GB;
  const usedGB = totalUsed / (1024 * 1024 * 1024);
  const usagePercent = (usedGB / totalGB) * 100;
  const isWarning = usagePercent > 70;
  const isCritical = usagePercent > 90;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Storage Monitoring</h1>
        <p className="text-muted-foreground">Platform-wide storage usage overview</p>
      </div>

      {/* Overview Card */}
      <Card className={isCritical ? "border-red-300" : isWarning ? "border-amber-300" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" /> Platform Storage
            </CardTitle>
            {isCritical && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>}
            {isWarning && !isCritical && <Badge className="bg-amber-100 text-amber-700"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{formatBytes(totalUsed)} used</span>
              <span>{totalGB} GB total</span>
            </div>
            <Progress value={Math.min(usagePercent, 100)} className="h-3" />
            <p className="text-xs text-muted-foreground">{usagePercent.toFixed(1)}% of total capacity used</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>User Storage Breakdown</CardTitle>
          <CardDescription>Top storage consumers ({userStorages.length} users)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Storage Used</th>
                  <th className="text-left p-3 font-medium">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {userStorages.length === 0 ? (
                  <tr><td colSpan={3} className="text-center p-8 text-muted-foreground">No storage data</td></tr>
                ) : (
                  userStorages.slice(0, 50).map((u) => (
                    <tr key={u.user_id} className="border-b hover:bg-muted/30">
                      <td className="p-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[250px]">{u.email}</span>
                      </td>
                      <td className="p-3 font-medium">{formatBytes(u.storage_used_bytes)}</td>
                      <td className="p-3 text-muted-foreground">{totalUsed > 0 ? ((u.storage_used_bytes / totalUsed) * 100).toFixed(1) : 0}%</td>
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

export default AdminStorageMonitoring;
