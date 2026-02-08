import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { Search, MoreVertical, Eye, UserX, UserCheck, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  mobile_number: string | null;
  created_at: string;
  policyCount?: number;
  subscriptionTier?: string;
  isActive?: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pro" | "free">("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch subscriber info
      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('user_id, subscription_tier, is_active');

      // Fetch policy counts
      const { data: policyCounts } = await supabase
        .from('policies')
        .select('user_id');

      // Map policy counts
      const policyCountMap: Record<string, number> = {};
      policyCounts?.forEach((p) => {
        policyCountMap[p.user_id] = (policyCountMap[p.user_id] || 0) + 1;
      });

      // Map subscriber info
      const subscriberMap: Record<string, { tier: string; active: boolean }> = {};
      subscribers?.forEach((s) => {
        subscriberMap[s.user_id] = {
          tier: s.subscription_tier,
          active: s.is_active,
        };
      });

      // Combine data
      const enrichedUsers = profiles?.map((profile) => ({
        ...profile,
        policyCount: policyCountMap[profile.id] || 0,
        subscriptionTier: subscriberMap[profile.id]?.tier || 'free',
        isActive: subscriberMap[profile.id]?.active ?? true,
      })) || [];

      setUsers(enrichedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.mobile_number || '').includes(searchQuery);

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "pro" && user.subscriptionTier === "pro") ||
      (selectedFilter === "free" && user.subscriptionTier === "free");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-muted-foreground">View and manage platform users</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
              >
                All ({users.length})
              </Button>
              <Button
                variant={selectedFilter === "pro" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("pro")}
              >
                Pro ({users.filter(u => u.subscriptionTier === 'pro').length})
              </Button>
              <Button
                variant={selectedFilter === "free" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("free")}
              >
                Free ({users.filter(u => u.subscriptionTier === 'free').length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Policies</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.mobile_number && (
                              <div className="text-xs text-muted-foreground">{user.mobile_number}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                            {user.subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.policyCount}</TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Upgrade to Pro
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <UserX className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;