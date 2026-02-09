import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Users } from "lucide-react";
import { format } from "date-fns";

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_type: string | null;
  status: string;
  created_at: string;
}

const AdminDemoRequests = () => {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("demo_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests((data as any[]) || []);
    } catch (error) {
      console.error("Error fetching demo requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("demo_requests" as any)
      .update({ status } as any)
      .eq("id", id);
    if (!error) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge className="bg-blue-100 text-blue-700">New</Badge>;
      case "contacted": return <Badge className="bg-amber-100 text-amber-700">Contacted</Badge>;
      case "converted": return <Badge className="bg-green-100 text-green-700">Converted</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demo Requests</h1>
          <p className="text-muted-foreground">Manage incoming demo requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">Company/Type</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">No demo requests yet</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3">{r.email}</td>
                      <td className="p-3">{r.phone}</td>
                      <td className="p-3">{r.company_type || "—"}</td>
                      <td className="p-3">{statusBadge(r.status)}</td>
                      <td className="p-3 text-xs whitespace-nowrap">{format(new Date(r.created_at), "dd MMM yyyy")}</td>
                      <td className="p-3">
                        <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                          <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                          </SelectContent>
                        </Select>
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

export default AdminDemoRequests;
