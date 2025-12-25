
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Mail, Lock, Upload, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import PolicyCard from "./policy/PolicyCard";
import PolicyTableRow from "./policy/PolicyTableRow";
import PolicySearch from "./policy/PolicySearch";
import PolicyViewDialog from "./policy/PolicyViewDialog";
import PolicyEditDialog from "./policy/PolicyEditDialog";
import { Policy, getStatusColor, getDaysToExpiry, filterPolicies, downloadPoliciesAsExcel } from "@/utils/policyUtils";
import { triggerManualPolicyReport } from "@/utils/emailReportUtils";
import { generateSampleExcelTemplate, parseExcelFile, validatePolicyData, convertExcelRowToPolicy } from "@/utils/excelUtils";
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

const PolicyList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();

  useEffect(() => {
    fetchPolicies();

    // Set up real-time subscription to policy changes
    const channel = supabase
      .channel('policy-list-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'policies'
        },
        () => {
          fetchPolicies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch policies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPolicies = filterPolicies(policies, searchTerm);

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setViewDialogOpen(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setEditDialogOpen(true);
  };

  const handleDeletePolicy = (policy: Policy) => {
    setPolicyToDelete(policy);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePolicy = async () => {
    if (!policyToDelete) return;

    try {
      const { error } = await supabase
        .from("policies")
        .delete()
        .eq("id", policyToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
      setPolicyToDelete(null);
      fetchPolicies();
    } catch (error: any) {
      console.error("Error deleting policy:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete policy. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadAllPolicies = () => {
    const result = downloadPoliciesAsExcel(policies, 'all_policies');
    
    if (!result) {
      toast({
        title: "No Policies",
        description: "There are no policies to download.",
      });
      return;
    }
    
    toast({
      title: "Download Complete",
      description: `Downloaded ${result.count} policies to ${result.fileName}`,
    });
  };

  const sendPolicyReportEmail = async () => {
    if (policies.length === 0) {
      toast({
        title: "No Policies",
        description: "You need to have at least one policy to send a report.",
        variant: "destructive",
      });
      return;
    }

    setIsEmailSending(true);
    try {
      const result = await triggerManualPolicyReport();
      console.log('Policy report sent successfully:', result);
      toast({
        title: "Policy Report Sent",
        description: "Policy report has been sent to your registered email.",
      });
    } catch (error) {
      console.error('Error sending policy report email:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send policy report. Please try again.";
      toast({
        title: "Failed to Send Report",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleAddPolicy = () => {
    if (!subscribed && policies.length >= 50) {
      toast({
        title: "Policy Limit Reached",
        description: "Free plan is limited to 50 policies. Please upgrade to Premium to add more policies.",
        variant: "destructive",
        duration: 3000,
      });
      navigate("/subscription");
      return;
    }
    navigate("/add-policy");
  };

  const isAddPolicyDisabled = !subscriptionLoading && !subscribed && policies.length >= 50;

  const handleDownloadTemplate = () => {
    const fileName = generateSampleExcelTemplate();
    toast({
      title: "Template Downloaded",
      description: `Downloaded ${fileName}`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const data = await parseExcelFile(file);
      const validPolicies: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < data.length; i++) {
        const validation = validatePolicyData(data[i]);
        if (validation.valid) {
          validPolicies.push(convertExcelRowToPolicy(data[i], user?.id || ''));
        } else {
          errors.push(`Row ${i + 2}: ${validation.errors.join(', ')}`);
        }
      }

      if (validPolicies.length > 0) {
        // Check policy limit for free users
        const currentPolicyCount = policies.length;
        const newTotalCount = currentPolicyCount + validPolicies.length;
        
        if (!subscribed && newTotalCount > 50) {
          toast({
            title: "Policy Limit Reached",
            description: "Free plan allows up to 50 policies only. Please upgrade to Premium for unlimited uploads.",
            variant: "destructive",
            duration: 5000,
          });
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        const { error } = await supabase
          .from('policies')
          .insert(validPolicies);

        if (error) throw error;

        toast({
          title: "Upload Successful",
          description: `${validPolicies.length} policies added successfully${errors.length > 0 ? `, ${errors.length} rows skipped due to errors` : ''}`,
        });

        fetchPolicies();
      }

      if (errors.length > 0 && validPolicies.length === 0) {
        toast({
          title: "Upload Failed",
          description: errors[0],
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload Excel file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-gray-600">Loading policies...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Policy Management</CardTitle>
              <div className="flex flex-col space-y-2">
                <Button 
                  className={`min-h-[44px] w-full sm:w-auto ${
                    isAddPolicyDisabled 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
                  onClick={handleAddPolicy}
                  disabled={isAddPolicyDisabled}
                >
                  {isAddPolicyDisabled ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Limit Reached ({policies.length}/50)
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Policy
                    </>
                  )}
                </Button>
                {isAddPolicyDisabled && (
                  <p className="text-xs text-gray-500 text-center">
                    <span className="text-orange-600 font-medium">Free Plan: {policies.length}/50 policies used</span>
                    <br />
                    <button 
                      onClick={() => navigate("/subscription")}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Upgrade to Premium for unlimited policies
                    </button>
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <PolicySearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            {filteredPolicies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No policies found.</p>
                <Button 
                  className={`min-h-[44px] ${
                    isAddPolicyDisabled 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
                  onClick={handleAddPolicy}
                  disabled={isAddPolicyDisabled}
                >
                  {isAddPolicyDisabled ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Upgrade to Add Policies
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Policy
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-900">Policy Number</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Client Name</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Vehicle</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Active Date</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Expiry Date</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPolicies.map((policy) => {
                        const daysToExpiry = getDaysToExpiry(policy.policy_expiry_date);
                        const statusColor = getStatusColor(policy.status);
                        return (
                          <PolicyTableRow
                            key={policy.id}
                            policy={policy}
                            daysToExpiry={daysToExpiry}
                            statusColor={statusColor}
                            onViewPolicy={handleViewPolicy}
                            onEditPolicy={handleEditPolicy}
                            onDeletePolicy={handleDeletePolicy}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {filteredPolicies.map((policy) => {
                    const daysToExpiry = getDaysToExpiry(policy.policy_expiry_date);
                    const statusColor = getStatusColor(policy.status);
                    return (
                      <PolicyCard
                        key={policy.id}
                        policy={policy}
                        daysToExpiry={daysToExpiry}
                        statusColor={statusColor}
                        onViewPolicy={handleViewPolicy}
                        onEditPolicy={handleEditPolicy}
                        onDeletePolicy={handleDeletePolicy}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Download, Upload and Email Buttons at Bottom */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 px-4 sm:px-0">
          <Button 
            variant="outline"
            onClick={handleDownloadTemplate}
            className="hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800 min-h-[44px] w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="hover:bg-orange-50 border-orange-200 text-orange-700 hover:text-orange-800 min-h-[44px] w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Excel'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={downloadAllPolicies}
            className="hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 min-h-[44px] w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All Policies
          </Button>
          
          <Button 
            variant="outline"
            onClick={sendPolicyReportEmail}
            disabled={isEmailSending}
            className="hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 min-h-[44px] w-full sm:w-auto"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isEmailSending ? 'Sending...' : 'Email Policy Report'}
          </Button>
        </div>
      </div>

      <PolicyViewDialog 
        policy={selectedPolicy}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <PolicyEditDialog 
        policy={selectedPolicy}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onPolicyUpdated={fetchPolicies}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this policy? This action cannot be undone.
              {policyToDelete && (
                <div className="mt-2 text-sm font-medium">
                  Policy: {policyToDelete.policy_number}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePolicy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PolicyList;
