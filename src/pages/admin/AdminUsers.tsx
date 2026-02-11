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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: subscribers } = await supabase
        .from('subscribers')
        .select('user_id, subscription_tier, is_active');

      const { data: policyCounts } = await supabase
        .from('policies')
        .select('user_id');

      const policyCountMap: Record<string, number> = {};
      policyCounts?.forEach((p) => {
        policyCountMap[p.user_id] = (policyCountMap[p.user_id] || 0) + 1;
      });

      const subscriberMap: Record<string, { tier: string; active: boolean }> = {};
      subscribers?.forEach((s) => {
        subscriberMap[s.user_id] = { tier: s.subscription_tier, active: s.is_active };
      });

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

  useEffect(() => { fetchUsers(); }, []);

  const handleUpgradeToPro = async (user: UserData) => {
    setActionLoading(true);
    try {
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('subscribers')
          .update({ subscription_tier: 'pro', is_active: true, subscription_end_date: new Date(Date.now() + 365 * 86400000).toISOString() })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscribers')
          .insert({ user_id: user.id, subscription_tier: 'pro', is_active: true, subscription_end_date: new Date(Date.now() + 365 * 86400000).toISOString() });
        if (error) throw error;
      }

      toast.success(`${user.full_name || user.email} upgraded to Pro`);
      setShowUpgradeConfirm(false);
      fetchUsers();
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to upgrade user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (user: UserData) => {
    setActionLoading(true);
    try {
      const newActive = !user.isActive;
      const { data: existing } = await supabase
        .from('subscribers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('subscribers')
          .update({ is_active: newActive })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subscribers')
          .insert({ user_id: user.id, subscription_tier: 'free', is_active: newActive });
        if (error) throw error;
      }

      toast.success(`${user.full_name || user.email} ${newActive ? 'reactivated' : 'suspended'}`);
      setShowSuspendConfirm(false);
      fetchUsers();
    } catch (error) {
      console.error("Suspend error:", error);
      toast.error("Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
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
              <Input placeholder="Search by name, email, or phone..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant={selectedFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter("all")}>All ({users.length})</Button>
              <Button variant={selectedFilter === "pro" ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter("pro")}>Pro ({users.filter(u => u.subscriptionTier === 'pro').length})</Button>
              <Button variant={selectedFilter === "free" ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter("free")}>Free ({users.filter(u => u.subscriptionTier === 'free').length})</Button>
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
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.mobile_number && <div className="text-xs text-muted-foreground">{user.mobile_number}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                            {user.subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.policyCount}</TableCell>
                        <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowDetails(true); }}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setShowUpgradeConfirm(true); }}>
                                <UserCheck className="h-4 w-4 mr-2" /> Upgrade to Pro
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedUser(user); setShowSuspendConfirm(true); }}>
                                <UserX className="h-4 w-4 mr-2" /> {user.isActive ? 'Suspend User' : 'Reactivate User'}
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

      {/* View Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Full information for this user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedUser.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-medium">{selectedUser.mobile_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{format(new Date(selectedUser.created_at), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <Badge variant={selectedUser.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                    {selectedUser.subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Policies</p>
                  <p className="font-medium">{selectedUser.policyCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedUser.isActive ? 'outline' : 'destructive'}>
                    {selectedUser.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs break-all">{selectedUser.id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Confirmation */}
      <AlertDialog open={showUpgradeConfirm} onOpenChange={setShowUpgradeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
            <AlertDialogDescription>
              Upgrade <strong>{selectedUser?.full_name || selectedUser?.email}</strong> to Pro plan for 1 year? This will give them access to all premium features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && handleUpgradeToPro(selectedUser)} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Upgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={showSuspendConfirm} onOpenChange={setShowSuspendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedUser?.isActive ? 'Suspend User' : 'Reactivate User'}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.isActive
                ? `Suspend ${selectedUser?.full_name || selectedUser?.email}? They will lose access to premium features.`
                : `Reactivate ${selectedUser?.full_name || selectedUser?.email}? They will regain access.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedUser && handleSuspendUser(selectedUser)} disabled={actionLoading} className={selectedUser?.isActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {selectedUser?.isActive ? 'Suspend' : 'Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
