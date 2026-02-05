import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { 
  MessageSquare, 
  Phone, 
  Calendar, 
  Download, 
  Send, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Edit, 
  Trash2,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from '@e965/xlsx';
import { formatDateDDMMYYYY } from "@/utils/policyUtils";
// BackButton removed - using inline navigation to Due Policies

interface ExpiredPolicy {
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
  whatsapp_reminder_count: number;
  daysExpired: number;
}

const POLICIES_PER_PAGE = 10;

const ExpiredPoliciesPage = () => {
  const [expiredPolicies, setExpiredPolicies] = useState<ExpiredPolicy[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<ExpiredPolicy | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchExpiredPolicies();

      const channel = supabase
        .channel('expired-policy-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'policies',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchExpiredPolicies();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchExpiredPolicies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('policies')
        .select('id, policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, policy_expiry_date, contact_number, status, reference, company_name, agent_code, whatsapp_reminder_count')
        .eq('user_id', user.id)
        .order('policy_expiry_date', { ascending: false });

      if (error) {
        console.error('Error fetching policies:', error);
        throw error;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expiredData = (data || [])
        .filter((policy) => {
          const expiryDate = new Date(policy.policy_expiry_date);
          return expiryDate < today;
        })
        .map((policy) => {
          const expiryDate = new Date(policy.policy_expiry_date);
          const daysExpired = Math.ceil((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));

          return {
            ...policy,
            company_name: policy.company_name || "Not specified",
            agent_code: policy.agent_code || "",
            whatsapp_reminder_count: policy.whatsapp_reminder_count || 0,
            daysExpired
          } as ExpiredPolicy;
        });

      setExpiredPolicies(expiredData);
    } catch (error) {
      console.error('Error fetching expired policies:', error);
      toast({
        title: "Error",
        description: "Failed to load expired policies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPolicies = expiredPolicies.filter((policy) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      policy.policy_number.toLowerCase().includes(searchLower) ||
      policy.client_name.toLowerCase().includes(searchLower) ||
      policy.vehicle_number.toLowerCase().includes(searchLower) ||
      (policy.company_name?.toLowerCase().includes(searchLower) || false) ||
      (policy.agent_code?.toLowerCase().includes(searchLower) || false)
    );
  });

  const totalPages = Math.ceil(filteredPolicies.length / POLICIES_PER_PAGE);
  const startIndex = (currentPage - 1) * POLICIES_PER_PAGE;
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + POLICIES_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const generateWhatsAppMessage = (policy: ExpiredPolicy) => {
    const expiryDate = new Date(policy.policy_expiry_date);
    const formattedExpiry = expiryDate.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    
    const vehicleDetails = policy.vehicle_make && policy.vehicle_model 
      ? `${policy.vehicle_make} - ${policy.vehicle_model}`
      : policy.vehicle_make || 'N/A';
    
    return `Hi ${policy.client_name},
Your policy ${policy.policy_number} has expired ${policy.daysExpired} days ago.
Vehicle Details: ${vehicleDetails}
Registration Number: ${policy.vehicle_number}
Expired on: ${formattedExpiry}

Please contact us immediately for renewal.`;
  };

  const handleWhatsApp = async (policy: ExpiredPolicy) => {
    const message = generateWhatsAppMessage(policy);
    const phoneNumber = policy.contact_number?.replace(/\D/g, '') || '';
    
    const whatsappUrl = phoneNumber 
      ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');

    try {
      const { error } = await supabase
        .from('policies')
        .update({ whatsapp_reminder_count: (policy.whatsapp_reminder_count || 0) + 1 })
        .eq('id', policy.id);

      if (!error) {
        setExpiredPolicies(prev => prev.map(p => 
          p.id === policy.id 
            ? { ...p, whatsapp_reminder_count: (p.whatsapp_reminder_count || 0) + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Error incrementing WhatsApp count:', error);
    }
    
    toast({
      title: "WhatsApp Message",
      description: phoneNumber 
        ? `Opening WhatsApp for ${policy.client_name}`
        : `Opening WhatsApp - please select a contact`,
    });
  };

  const handleCall = (policy: ExpiredPolicy) => {
    if (policy.contact_number) {
      window.open(`tel:${policy.contact_number}`);
      toast({
        title: "Calling",
        description: `Calling ${policy.client_name} at ${policy.contact_number}`,
      });
    } else {
      toast({
        title: "No Contact Number",
        description: `No contact number available for ${policy.client_name}`,
        variant: "destructive",
      });
    }
  };

  const handleRenewPolicy = (policy: ExpiredPolicy) => {
    navigate(`/edit-policy/${policy.id}?renewal=true`);
  };

  const handleEditPolicy = (policy: ExpiredPolicy) => {
    navigate(`/edit-policy/${policy.id}`);
  };

  const handleDeleteClick = (policy: ExpiredPolicy) => {
    setPolicyToDelete(policy);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return;

    try {
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', policyToDelete.id);

      if (error) throw error;

      setExpiredPolicies(prev => prev.filter(p => p.id !== policyToDelete.id));
      setSelectedPolicies(prev => {
        const newSet = new Set(prev);
        newSet.delete(policyToDelete.id);
        return newSet;
      });

      toast({
        title: "Policy Deleted",
        description: `Policy ${policyToDelete.policy_number} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        title: "Error",
        description: "Failed to delete policy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPolicyToDelete(null);
    }
  };

  const togglePolicySelection = (policyId: string) => {
    setSelectedPolicies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(policyId)) {
        newSet.delete(policyId);
      } else {
        newSet.add(policyId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPolicies.size === filteredPolicies.length) {
      setSelectedPolicies(new Set());
    } else {
      setSelectedPolicies(new Set(filteredPolicies.map(p => p.id)));
    }
  };

  const handleBulkWhatsApp = () => {
    const selected = filteredPolicies.filter(p => selectedPolicies.has(p.id));
    
    if (selected.length === 0) {
      toast({
        title: "No Policies Selected",
        description: "Please select at least one policy to send WhatsApp messages.",
        variant: "destructive",
      });
      return;
    }

    selected.forEach((policy, index) => {
      setTimeout(() => {
        const message = generateWhatsAppMessage(policy);
        const phoneNumber = policy.contact_number?.replace(/\D/g, '') || '';
        const whatsappUrl = phoneNumber 
          ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`
          : `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }, index * 1000);
    });

    toast({
      title: "Bulk WhatsApp",
      description: `Opening WhatsApp for ${selected.length} policies`,
    });
  };

  const downloadExpiredPolicies = () => {
    if (filteredPolicies.length === 0) {
      toast({
        title: "No Expired Policies",
        description: "There are no expired policies to download.",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredPolicies.map(policy => ({
      'Policy Number': policy.policy_number,
      'Client Name': policy.client_name,
      'Vehicle Number': policy.vehicle_number,
      'Vehicle Make': policy.vehicle_make,
      'Vehicle Model': policy.vehicle_model,
      'Expiry Date': formatDateDDMMYYYY(policy.policy_expiry_date),
      'Days Expired': policy.daysExpired,
      'Company Name': policy.company_name,
      'Agent Code': policy.agent_code,
      'Status': policy.status,
      'Contact Number': policy.contact_number || '',
      'Reference': policy.reference
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expired Policies');
    
    const fileName = `expired_policies_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Download Complete",
      description: `Downloaded ${filteredPolicies.length} expired policies to ${fileName}`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/due-policies')}
            className="flex items-center gap-2 h-9 px-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Due Policies</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Expired Policies</h1>
            <p className="text-gray-600 text-sm sm:text-base">Policies that have passed their expiry date</p>
          </div>
        </div>
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading expired policies...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/due-policies')}
            className="flex items-center gap-2 h-9 px-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">Due Policies</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Expired Policies</h1>
            <p className="text-gray-600 text-sm sm:text-base">Policies that have passed their expiry date</p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Expired Policies ({expiredPolicies.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by policy number, customer name, vehicle, company, or agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 min-h-[44px]"
              />
            </div>
          </div>

          {filteredPolicies.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <Checkbox
                checked={selectedPolicies.size === filteredPolicies.length && filteredPolicies.length > 0}
                onCheckedChange={toggleSelectAll}
                id="selectAllExpired"
              />
              <label htmlFor="selectAllExpired" className="text-sm text-muted-foreground cursor-pointer">
                Select All ({selectedPolicies.size}/{filteredPolicies.length} selected)
              </label>
            </div>
          )}
          
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No Expired Policies Found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? "No policies match your search criteria." : "All your policies are currently active."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedPolicies.map((policy) => (
                <Card key={policy.id} className="border border-red-200 bg-red-50 rounded-lg hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedPolicies.has(policy.id)}
                            onCheckedChange={() => togglePolicySelection(policy.id)}
                          />
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                          <span className="text-sm font-medium text-red-700">
                            {policy.daysExpired} days ago
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPolicy(policy)}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                            title="Edit Policy"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(policy)}
                            className="h-8 w-8 p-0 hover:bg-red-100"
                            title="Delete Policy"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{policy.client_name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 break-all">{policy.contact_number || 'No contact number'}</p>
                          <p className="text-xs sm:text-sm text-gray-600 break-all">Policy: {policy.policy_number}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900">Vehicle Details</p>
                          <p className="text-xs sm:text-sm text-gray-600">{policy.vehicle_make} {policy.vehicle_model}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{policy.vehicle_number}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900">Company & Agent</p>
                          <p className="text-xs sm:text-sm text-gray-600">{policy.company_name || 'Not specified'}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Agent: {policy.agent_code || 'N/A'}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Ref: {policy.reference || 'N/A'}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-red-600 font-medium">Expired: {formatDateDDMMYYYY(policy.policy_expiry_date)}</p>
                          <p className="text-xs sm:text-sm text-red-600 font-semibold">Status: Expired</p>
                          {policy.whatsapp_reminder_count > 0 && (
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-xs text-green-600 font-medium">
                                {policy.whatsapp_reminder_count} reminder{policy.whatsapp_reminder_count !== 1 ? 's' : ''} sent
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 text-white min-h-[40px] flex-1 sm:flex-none"
                          onClick={() => handleRenewPolicy(policy)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Renew
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white min-h-[40px] flex-1 sm:flex-none"
                          onClick={() => handleWhatsApp(policy)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Follow Up
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-blue-50 hover:border-blue-200 min-h-[40px] flex-1 sm:flex-none"
                          onClick={() => handleCall(policy)}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Showing {startIndex + 1}-{Math.min(startIndex + POLICIES_PER_PAGE, filteredPolicies.length)} of {filteredPolicies.length} policies
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {filteredPolicies.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
          <Button 
            variant="default"
            onClick={handleBulkWhatsApp}
            disabled={selectedPolicies.size === 0}
            className="bg-green-600 hover:bg-green-700 text-white min-h-[44px] w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            Follow Up Selected ({selectedPolicies.size})
          </Button>
          <Button 
            variant="outline"
            onClick={downloadExpiredPolicies}
            className="hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 min-h-[44px] w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this policy?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the policy
              <strong> {policyToDelete?.policy_number}</strong> for <strong>{policyToDelete?.client_name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpiredPoliciesPage;
