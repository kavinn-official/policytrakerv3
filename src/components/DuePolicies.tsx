import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageSquare, Phone, AlertTriangle, Calendar, Bell, Download, Send, Search, ChevronLeft, ChevronRight, RefreshCw, Edit, Trash2, Clock, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import * as XLSX from '@e965/xlsx';
import { formatDateDDMMYYYY } from "@/utils/policyUtils";

interface PolicyData {
  id: string;
  policy_number: string;
  client_name: string;
  vehicle_number: string;
  vehicle_make: string;
  vehicle_model: string;
  policy_expiry_date: string;
  contact_number: string | null;
  status: string;
  reference: string;
  company_name?: string;
  agent_code?: string;
  insurance_type?: string;
  whatsapp_reminder_count: number;
}

interface DuePolicy extends PolicyData {
  daysLeft: number;
  urgency: string;
}

const POLICIES_PER_PAGE = 10;

const DuePolicies = () => {
  const [duePolicies, setDuePolicies] = useState<DuePolicy[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRenewing, setIsRenewing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [weekFilter, setWeekFilter] = useState<number>(0); // 0 = all, 1-4 = weeks
  const [sortBy, setSortBy] = useState<string>("daysLeft");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<DuePolicy | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDuePolicies();
      const channel = supabase
        .channel('due-policy-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'policies', filter: `user_id=eq.${user.id}` }, () => fetchDuePolicies())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchDuePolicies = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('id, policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, policy_expiry_date, contact_number, status, reference, company_name, agent_code, insurance_type, whatsapp_reminder_count')
        .eq('user_id', user.id)
        .order('policy_expiry_date', { ascending: true });

      if (error) throw error;

      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const mapped = (data || [])
        .filter((p: PolicyData) => {
          const exp = new Date(p.policy_expiry_date);
          return exp >= today && exp <= thirtyDaysFromNow;
        })
        .map((p: PolicyData) => {
          const daysLeft = Math.ceil((new Date(p.policy_expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          let urgency = "low";
          if (daysLeft <= 3) urgency = "critical";
          else if (daysLeft <= 7) urgency = "high";
          else if (daysLeft <= 15) urgency = "medium";
          return { ...p, company_name: p.company_name || "", agent_code: p.agent_code || "", whatsapp_reminder_count: p.whatsapp_reminder_count || 0, daysLeft, urgency } as DuePolicy;
        });

      setDuePolicies(mapped);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Error", description: "Failed to load due policies.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPolicies = useMemo(() => {
    let result = duePolicies.filter((p) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = !s || p.policy_number.toLowerCase().includes(s) || p.client_name.toLowerCase().includes(s) || p.vehicle_number.toLowerCase().includes(s) || (p.company_name?.toLowerCase().includes(s));
      const matchesUrgency = urgencyFilter === "all" || p.urgency === urgencyFilter;
      const matchesWeek = weekFilter === 0 || p.daysLeft <= weekFilter * 7;
      return matchesSearch && matchesUrgency && matchesWeek;
    });

    result.sort((a, b) => {
      if (sortBy === "daysLeft") return a.daysLeft - b.daysLeft;
      if (sortBy === "name") return a.client_name.localeCompare(b.client_name);
      if (sortBy === "company") return (a.company_name || "").localeCompare(b.company_name || "");
      return 0;
    });

    return result;
  }, [duePolicies, searchTerm, urgencyFilter, weekFilter, sortBy]);

  const totalPages = Math.ceil(filteredPolicies.length / POLICIES_PER_PAGE);
  const startIndex = (currentPage - 1) * POLICIES_PER_PAGE;
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + POLICIES_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, urgencyFilter, weekFilter, sortBy]);

  const urgencyCounts = useMemo(() => ({
    all: duePolicies.length,
    critical: duePolicies.filter(p => p.urgency === "critical").length,
    high: duePolicies.filter(p => p.urgency === "high").length,
    medium: duePolicies.filter(p => p.urgency === "medium").length,
    low: duePolicies.filter(p => p.urgency === "low").length,
  }), [duePolicies]);

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "critical": return { card: "border-l-4 border-l-red-500 bg-red-50/80", badge: "bg-red-100 text-red-800", text: "text-red-700" };
      case "high": return { card: "border-l-4 border-l-orange-500 bg-orange-50/80", badge: "bg-orange-100 text-orange-800", text: "text-orange-700" };
      case "medium": return { card: "border-l-4 border-l-amber-500 bg-amber-50/80", badge: "bg-amber-100 text-amber-800", text: "text-amber-700" };
      default: return { card: "border-l-4 border-l-blue-500 bg-blue-50/80", badge: "bg-blue-100 text-blue-800", text: "text-blue-700" };
    }
  };

  const generateWhatsAppMessage = (policy: DuePolicy) => {
    const formattedExpiry = new Date(policy.policy_expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const vehicle = policy.vehicle_make && policy.vehicle_model ? `${policy.vehicle_make} - ${policy.vehicle_model}` : policy.vehicle_make || 'N/A';
    return `Hi ${policy.client_name},\nyour policy ${policy.policy_number} is expiring in ${policy.daysLeft} days.\nVehicle: ${vehicle}\nReg: ${policy.vehicle_number}\nExpires: ${formattedExpiry}\n\nPlease contact us for renewal.`;
  };

  const handleWhatsApp = async (policy: DuePolicy) => {
    const message = generateWhatsAppMessage(policy);
    const phone = policy.contact_number?.replace(/\D/g, '') || '';
    window.open(phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    try {
      await supabase.from('policies').update({ whatsapp_reminder_count: (policy.whatsapp_reminder_count || 0) + 1 }).eq('id', policy.id);
      setDuePolicies(prev => prev.map(p => p.id === policy.id ? { ...p, whatsapp_reminder_count: (p.whatsapp_reminder_count || 0) + 1 } : p));
    } catch {}
    toast({ title: "WhatsApp", description: `Opening WhatsApp for ${policy.client_name}` });
  };

  const handleCall = (policy: DuePolicy) => {
    if (policy.contact_number) { window.open(`tel:${policy.contact_number}`); }
    else { toast({ title: "No Contact", description: `No number for ${policy.client_name}`, variant: "destructive" }); }
  };

  const handleRenewPolicy = (policy: DuePolicy) => navigate(`/edit-policy/${policy.id}?renewal=true`);
  const handleEditPolicy = (policy: DuePolicy) => navigate(`/edit-policy/${policy.id}`);
  const handleDeleteClick = (policy: DuePolicy) => { setPolicyToDelete(policy); setDeleteDialogOpen(true); };

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return;
    try {
      const { error } = await supabase.from('policies').delete().eq('id', policyToDelete.id);
      if (error) throw error;
      setDuePolicies(prev => prev.filter(p => p.id !== policyToDelete.id));
      selectedPolicies.delete(policyToDelete.id);
      setSelectedPolicies(new Set(selectedPolicies));
      toast({ title: "Deleted", description: `Policy ${policyToDelete.policy_number} deleted.` });
    } catch {
      toast({ title: "Error", description: "Failed to delete policy.", variant: "destructive" });
    } finally { setDeleteDialogOpen(false); setPolicyToDelete(null); }
  };

  const togglePolicySelection = (id: string) => {
    const s = new Set(selectedPolicies);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedPolicies(s);
  };

  const toggleSelectAll = () => {
    setSelectedPolicies(selectedPolicies.size === filteredPolicies.length ? new Set() : new Set(filteredPolicies.map(p => p.id)));
  };

  const handleBulkRenewal = () => {
    const ids = Array.from(selectedPolicies);
    if (ids.length === 0) { toast({ title: "None Selected", variant: "destructive" }); return; }
    if (ids.length === 1) { navigate(`/edit-policy/${ids[0]}?renewal=true`); return; }
    sessionStorage.setItem('bulkRenewalQueue', JSON.stringify(ids.slice(1)));
    navigate(`/edit-policy/${ids[0]}?renewal=true&bulk=true`);
  };

  const handleBulkWhatsApp = () => {
    const selected = filteredPolicies.filter(p => selectedPolicies.has(p.id));
    if (selected.length === 0) return;
    selected.forEach((p, i) => setTimeout(() => {
      const phone = p.contact_number?.replace(/\D/g, '') || '';
      window.open(phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(generateWhatsAppMessage(p))}` : `https://wa.me/?text=${encodeURIComponent(generateWhatsAppMessage(p))}`, '_blank');
    }, i * 1000));
    toast({ title: "Bulk WhatsApp", description: `Opening for ${selected.length} policies` });
  };

  const downloadExpiringPolicies = () => {
    if (filteredPolicies.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(filteredPolicies.map(p => ({
      'Policy Number': p.policy_number, 'Client Name': p.client_name, 'Vehicle Number': p.vehicle_number,
      'Expiry Date': formatDateDDMMYYYY(p.policy_expiry_date), 'Days Left': p.daysLeft, 'Urgency': p.urgency,
      'Company': p.company_name, 'Agent': p.agent_code, 'Contact': p.contact_number || '',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Due Policies');
    XLSX.writeFile(wb, `due_policies_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={() => setUrgencyFilter("critical")} className={`p-3 rounded-xl border-2 text-left transition-all ${urgencyFilter === "critical" ? "border-red-500 bg-red-50 ring-2 ring-red-200" : "border-red-200 bg-red-50/50 hover:border-red-300"}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-xs font-semibold text-red-700">Critical</span>
          </div>
          <p className="text-2xl font-bold text-red-800">{urgencyCounts.critical}</p>
          <p className="text-xs text-red-600">≤ 3 days</p>
        </button>
        <button onClick={() => setUrgencyFilter("high")} className={`p-3 rounded-xl border-2 text-left transition-all ${urgencyFilter === "high" ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200" : "border-orange-200 bg-orange-50/50 hover:border-orange-300"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-semibold text-orange-700">High</span>
          </div>
          <p className="text-2xl font-bold text-orange-800">{urgencyCounts.high}</p>
          <p className="text-xs text-orange-600">4-7 days</p>
        </button>
        <button onClick={() => setUrgencyFilter("medium")} className={`p-3 rounded-xl border-2 text-left transition-all ${urgencyFilter === "medium" ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200" : "border-amber-200 bg-amber-50/50 hover:border-amber-300"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">Medium</span>
          </div>
          <p className="text-2xl font-bold text-amber-800">{urgencyCounts.medium}</p>
          <p className="text-xs text-amber-600">8-15 days</p>
        </button>
        <button onClick={() => setUrgencyFilter(urgencyFilter === "all" ? "low" : "all")} className={`p-3 rounded-xl border-2 text-left transition-all ${urgencyFilter === "all" || urgencyFilter === "low" ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" : "border-blue-200 bg-blue-50/50 hover:border-blue-300"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">{urgencyFilter === "low" ? "Low" : "All"}</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{urgencyFilter === "low" ? urgencyCounts.low : urgencyCounts.all}</p>
          <p className="text-xs text-blue-600">{urgencyFilter === "low" ? "16-30 days" : "Total due"}</p>
        </button>
      </div>

      {/* Week Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", value: 0 },
          { label: "1 Week", value: 1 },
          { label: "2 Weeks", value: 2 },
          { label: "3 Weeks", value: 3 },
          { label: "4 Weeks", value: 4 },
        ].map((wf) => (
          <button
            key={wf.value}
            onClick={() => setWeekFilter(wf.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              weekFilter === wf.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {wf.label}
          </button>
        ))}
      </div>

      {/* Sticky Search/Filter Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-3 pt-1 -mx-2 px-2 sm:-mx-0 sm:px-0">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search name, policy, vehicle..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11" />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-11"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daysLeft">Days Left</SelectItem>
                <SelectItem value="name">Client Name</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-11" onClick={() => navigate('/expired-policies')}>
              <Clock className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Expired</span>
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredPolicies.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Checkbox checked={selectedPolicies.size === filteredPolicies.length && filteredPolicies.length > 0} onCheckedChange={toggleSelectAll} />
            <span className="text-xs text-muted-foreground">{selectedPolicies.size}/{filteredPolicies.length}</span>
            {selectedPolicies.size > 0 && (
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="default" onClick={handleBulkRenewal} className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />Renew ({selectedPolicies.size})
                </Button>
                <Button size="sm" variant="default" onClick={handleBulkWhatsApp} className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs">
                  <Send className="h-3 w-3 mr-1" />WhatsApp
                </Button>
                <Button size="sm" variant="outline" onClick={downloadExpiringPolicies} className="h-8 text-xs">
                  <Download className="h-3 w-3 mr-1" />Export
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Policy Cards */}
      {filteredPolicies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{searchTerm || urgencyFilter !== "all" ? "No policies match your filters" : "No policies due in the next 30 days"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedPolicies.map((policy) => {
            const styles = getUrgencyStyles(policy.urgency);
            return (
              <Card key={policy.id} className={`${styles.card} shadow-sm hover:shadow-md transition-all overflow-hidden`}>
                <CardContent className="p-0">
                  {/* Header Row */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={selectedPolicies.has(policy.id)} onCheckedChange={() => togglePolicySelection(policy.id)} />
                      <Badge className={`${styles.badge} text-xs font-semibold`}>
                        {policy.urgency === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {policy.urgency.charAt(0).toUpperCase() + policy.urgency.slice(1)}
                      </Badge>
                      <span className={`text-sm font-bold ${styles.text}`}>{policy.daysLeft} days left</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditPolicy(policy)} className="h-8 w-8 hover:bg-blue-100">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(policy)} className="h-8 w-8 hover:bg-red-100">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 px-4 pb-3">
                    <div>
                      <h3 className="font-bold text-foreground text-base">{policy.client_name}</h3>
                      <p className="text-sm text-muted-foreground">{policy.contact_number || 'No contact'}</p>
                      <p className="text-sm text-muted-foreground">Policy: {policy.policy_number}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{policy.insurance_type || "Vehicle Insurance"}</p>
                      <p className="text-sm text-muted-foreground">
                        {policy.vehicle_make ? `${policy.vehicle_make}${policy.vehicle_model ? ` - ${policy.vehicle_model}` : ''}` : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">{policy.vehicle_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Company & Agent</p>
                      <p className="text-sm text-muted-foreground">{policy.company_name || 'Not specified'}</p>
                      <p className="text-sm text-muted-foreground">Agent: {policy.agent_code || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Ref: {policy.reference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expires: {format(new Date(policy.policy_expiry_date), "dd-MMM-yyyy")}</p>
                      <p className="text-sm text-muted-foreground">Status: {policy.status}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{policy.daysLeft} days remaining</span>
                      </div>
                      {policy.whatsapp_reminder_count > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <MessageSquare className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">{policy.whatsapp_reminder_count} reminder{policy.whatsapp_reminder_count !== 1 ? 's' : ''} sent</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 px-4 pb-4">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10" onClick={() => handleRenewPolicy(policy)} disabled={isRenewing === policy.id}>
                      <Edit className="h-4 w-4 mr-1.5" />
                      <span className="hidden xs:inline">{isRenewing === policy.id ? "Opening..." : "Renew"}</span>
                    </Button>
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10" onClick={() => handleWhatsApp(policy)}>
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="w-12 sm:flex-1 sm:w-auto h-10" onClick={() => handleCall(policy)}>
                      <Phone className="h-4 w-4" />
                      <span className="hidden sm:inline sm:ml-1.5">Call</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">{startIndex + 1}-{Math.min(startIndex + POLICIES_PER_PAGE, filteredPolicies.length)} of {filteredPolicies.length}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let n;
                  if (totalPages <= 5) n = i + 1;
                  else if (currentPage <= 3) n = i + 1;
                  else if (currentPage >= totalPages - 2) n = totalPages - 4 + i;
                  else n = currentPage - 2 + i;
                  return (
                    <Button key={n} variant={currentPage === n ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(n)} className="w-8 h-8 p-0">{n}</Button>
                  );
                })}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this policy?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{policyToDelete?.policy_number}</strong> for <strong>{policyToDelete?.client_name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DuePolicies;
