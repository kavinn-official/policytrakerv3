import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Mail, Lock, Upload, FileSpreadsheet, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import PolicyCard from "./policy/PolicyCard";
import PolicyTableRow from "./policy/PolicyTableRow";
import PolicySearch from "./policy/PolicySearch";
import PolicyDateFilter from "./policy/PolicyDateFilter";
import PolicyViewDialogRevamped from "./policy/PolicyViewDialogRevamped";
import PolicyCalendar from "./policy/PolicyCalendar";
import PolicyEditDialog from "./policy/PolicyEditDialog";
import PolicyDocumentPreviewDialog from "./policy/PolicyDocumentPreviewDialog";
import { Policy, getStatusColor, getDaysToExpiry, filterPolicies, downloadPoliciesAsExcel, getComputedPolicyStatus } from "@/utils/policyUtils";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const POLICIES_PER_PAGE = 10;
const INSURANCE_TYPES = ['All', 'Vehicle Insurance', 'Health Insurance', 'Life Insurance', 'Other'] as const;

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
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentPreviewPolicy, setDocumentPreviewPolicy] = useState<Policy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rsdFromDate, setRsdFromDate] = useState<Date | undefined>(undefined);
  const [rsdToDate, setRsdToDate] = useState<Date | undefined>(undefined);
  const [redFromDate, setRedFromDate] = useState<Date | undefined>(undefined);
  const [redToDate, setRedToDate] = useState<Date | undefined>(undefined);
  const [createdFromDate, setCreatedFromDate] = useState<Date | undefined>(undefined);
  const [createdToDate, setCreatedToDate] = useState<Date | undefined>(undefined);
  const [insuranceTypeFilter, setInsuranceTypeFilter] = useState<string>('All');
  const [fyFilter, setFyFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();

  useEffect(() => {
    fetchPolicies();

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
        .order('policy_active_date', { ascending: true });

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

  // Generate FY options from available policies
  const fyOptions = (() => {
    const years = new Set<number>();
    policies.forEach(p => {
      const d = new Date(p.policy_active_date);
      const y = d.getFullYear();
      const m = d.getMonth(); // 0-indexed
      // FY starts April: if month >= 3 (April), FY = y, else FY = y-1
      years.add(m >= 3 ? y : y - 1);
    });
    return Array.from(years).sort((a, b) => b - a).map(y => ({
      value: `${y}`,
      label: `FY ${y} - FY ${y + 1}`,
    }));
  })();

  // Filter policies based on search term, date range (by policy start date), insurance type, and FY
  const filteredPolicies = filterPolicies(policies, searchTerm).filter((policy) => {
    const policyStartDate = new Date(policy.policy_active_date);

    // Risk Start Date
    if (rsdFromDate && policyStartDate < rsdFromDate) return false;
    if (rsdToDate) {
      const endOfDay = new Date(rsdToDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (policyStartDate > endOfDay) return false;
    }

    // Risk End Date
    const red = new Date(policy.policy_expiry_date);
    if (redFromDate && red < redFromDate) return false;
    if (redToDate) {
      const endOfDay = new Date(redToDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (red > endOfDay) return false;
    }

    // Created Date
    const cd = new Date(policy.created_at);
    if (createdFromDate && cd < createdFromDate) return false;
    if (createdToDate) {
      const endOfDay = new Date(createdToDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (cd > endOfDay) return false;
    }

    // Insurance type filter
    if (insuranceTypeFilter !== 'All') {
      const policyType = (policy as any).insurance_type || 'Vehicle Insurance';
      if (policyType !== insuranceTypeFilter) return false;
    }
    // Financial Year filter
    if (fyFilter !== 'All') {
      const fyStart = new Date(parseInt(fyFilter), 3, 1); // April 1
      const fyEnd = new Date(parseInt(fyFilter) + 1, 2, 31, 23, 59, 59, 999); // March 31
      if (policyStartDate < fyStart || policyStartDate > fyEnd) return false;
    }
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPolicies.length / POLICIES_PER_PAGE);
  const startIndex = (currentPage - 1) * POLICIES_PER_PAGE;
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + POLICIES_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedPolicies(new Set()); // Clear selections on filter change
  }, [searchTerm, rsdFromDate, rsdToDate, redFromDate, redToDate, createdFromDate, createdToDate, insuranceTypeFilter, fyFilter]);

  const handleClearDateFilter = () => {
    setRsdFromDate(undefined);
    setRsdToDate(undefined);
    setRedFromDate(undefined);
    setRedToDate(undefined);
    setCreatedFromDate(undefined);
    setCreatedToDate(undefined);
  };

  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setViewDialogOpen(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    navigate(`/edit-policy/${policy.id}`);
  };

  const handleDeletePolicy = (policy: Policy) => {
    setPolicyToDelete(policy);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleSelect = (policy: Policy, checked: boolean) => {
    const newSelected = new Set(selectedPolicies);
    if (checked) {
      newSelected.add(policy.id);
    } else {
      newSelected.delete(policy.id);
    }
    setSelectedPolicies(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredPolicies.map(p => p.id));
      setSelectedPolicies(allIds);
    } else {
      setSelectedPolicies(new Set());
    }
  };

  const handlePreviewDocument = (policy: Policy) => {
    setDocumentPreviewPolicy(policy);
    setDocumentPreviewOpen(true);
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

  const handleBulkDelete = async () => {
    if (selectedPolicies.size === 0) return;
    setIsBulkDeleting(true);

    try {
      const idsToDelete = Array.from(selectedPolicies);
      const { error } = await supabase
        .from("policies")
        .delete()
        .in("id", idsToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${idsToDelete.length} policies deleted successfully.`,
      });

      setIsBulkDeleteDialogOpen(false);
      setSelectedPolicies(new Set());
      fetchPolicies();
    } catch (error: any) {
      console.error("Error bulk deleting policies:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete selected policies.",
        variant: "destructive",
      });
    } finally {
      setIsBulkDeleting(false);
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

  const MAX_EXCEL_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation
    if (file.size > MAX_EXCEL_SIZE) {
      toast({
        title: "File Too Large",
        description: "Excel file must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

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

      // Free user bulk upload limit: 200 total policies
      const FREE_USER_TOTAL_LIMIT = 200;
      const currentPolicyCount = policies.length;

      if (!subscribed) {
        const remainingSlots = FREE_USER_TOTAL_LIMIT - currentPolicyCount;
        if (remainingSlots <= 0) {
          toast({
            title: "Upload Limit Reached",
            description: `Free plan allows up to ${FREE_USER_TOTAL_LIMIT} policies total. You have ${currentPolicyCount} policies. Please upgrade to Premium for unlimited uploads.`,
            variant: "destructive",
            duration: 5000,
          });
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
        if (data.length > remainingSlots) {
          toast({
            title: "Upload Limit Exceeded",
            description: `You can only upload ${remainingSlots} more policies (${currentPolicyCount}/${FREE_USER_TOTAL_LIMIT} used). Please reduce the number of rows or upgrade to Premium.`,
            variant: "destructive",
            duration: 5000,
          });
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }
      }

      for (let i = 0; i < data.length; i++) {
        const validation = validatePolicyData(data[i], i);
        if (validation.valid) {
          validPolicies.push(convertExcelRowToPolicy(data[i], user?.id || ''));
        } else {
          errors.push(...validation.errors);
        }
      }

      if (validPolicies.length > 0) {

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
        <Card className="shadow-lg border-0 relative">
          {/* Bulk Action Toolbar */}
          {selectedPolicies.size > 0 && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-blue-50 border-b border-blue-200 p-3 sm:p-4 rounded-t-lg flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {selectedPolicies.size}
                </span>
                <span className="text-sm font-medium text-blue-900 hidden sm:inline">
                  policies selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPolicies(new Set())}
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-100 h-8 text-xs font-medium"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  className="h-8 shadow-sm flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete Selected</span>
                </Button>
              </div>
            </div>
          )}

          <CardHeader className={`px-4 sm:px-6 ${selectedPolicies.size > 0 ? "pt-20 sm:pt-20" : ""}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Policy Management</CardTitle>
              <div className="flex flex-col space-y-2">
                <Button
                  className={`min-h-[44px] w-full sm:w-auto ${isAddPolicyDisabled
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
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex-1">
                  <PolicySearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                </div>

                <div className="flex bg-gray-100 p-1 rounded-md mb-2 sm:mb-0">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${viewMode === 'calendar'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    Calendar
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-48">
                  <Select value={insuranceTypeFilter} onValueChange={setInsuranceTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Insurance Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSURANCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === 'All' ? 'All Types' : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {fyOptions.length > 0 && (
                  <div className="w-full sm:w-56">
                    <Select value={fyFilter} onValueChange={setFyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Financial Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Years</SelectItem>
                        {fyOptions.map((fy) => (
                          <SelectItem key={fy.value} value={fy.value}>
                            {fy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <PolicyDateFilter
                  rsdFromDate={rsdFromDate}
                  rsdToDate={rsdToDate}
                  onRsdFromChange={setRsdFromDate}
                  onRsdToChange={setRsdToDate}

                  redFromDate={redFromDate}
                  redToDate={redToDate}
                  onRedFromChange={setRedFromDate}
                  onRedToChange={setRedToDate}

                  createdFromDate={createdFromDate}
                  createdToDate={createdToDate}
                  onCreatedFromChange={setCreatedFromDate}
                  onCreatedToChange={setCreatedToDate}

                  onClear={handleClearDateFilter}
                />
              </div>
            </div>
            {filteredPolicies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No policies found.</p>
                <Button
                  className={`min-h-[44px] ${isAddPolicyDisabled
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
            ) : viewMode === 'calendar' ? (
              <PolicyCalendar policies={filteredPolicies} onViewPolicy={handleViewPolicy} />
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left p-4 font-semibold text-gray-900 w-12">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              checked={filteredPolicies.length > 0 && selectedPolicies.size === filteredPolicies.length}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              title="Select All"
                            />
                          </div>
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-900">Policy Number</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Client Name</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Agent / Reference</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Vehicle</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Risk Start Date</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Risk End Date</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPolicies.map((policy) => {
                        const daysToExpiry = getDaysToExpiry(policy.policy_expiry_date);
                        const statusColor = getStatusColor(getComputedPolicyStatus(policy));
                        return (
                          <PolicyTableRow
                            key={policy.id}
                            policy={policy}
                            daysToExpiry={daysToExpiry}
                            statusColor={statusColor}
                            onViewPolicy={handleViewPolicy}
                            onEditPolicy={handleEditPolicy}
                            onDeletePolicy={handleDeletePolicy}
                            onPreviewDocument={handlePreviewDocument}
                            isSelected={selectedPolicies.has(policy.id)}
                            onToggleSelect={handleToggleSelect}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {/* Select All Checkbox for Mobile */}
                  {filteredPolicies.length > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 mb-2">
                      <input
                        type="checkbox"
                        id="mobile-select-all"
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedPolicies.size === filteredPolicies.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                      <label htmlFor="mobile-select-all" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Select All Policies
                      </label>
                    </div>
                  )}
                  {paginatedPolicies.map((policy) => {
                    const daysToExpiry = getDaysToExpiry(policy.policy_expiry_date);
                    const statusColor = getStatusColor(getComputedPolicyStatus(policy));
                    return (
                      <PolicyCard
                        key={policy.id}
                        policy={policy}
                        daysToExpiry={daysToExpiry}
                        statusColor={statusColor}
                        onViewPolicy={handleViewPolicy}
                        onEditPolicy={handleEditPolicy}
                        onDeletePolicy={handleDeletePolicy}
                        onPreviewDocument={handlePreviewDocument}
                        isSelected={selectedPolicies.has(policy.id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    );
                  })}
                </div>

                {/* Pagination Controls */}
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
                        Previous
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
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Download and Email Buttons at Bottom */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 px-4 sm:px-0">
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

      {/* View Policy Dialog */}
      <PolicyViewDialogRevamped
        policy={selectedPolicy}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Edit Policy Dialog */}
      <PolicyEditDialog
        policy={selectedPolicy}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onPolicyUpdated={fetchPolicies}
      />

      {/* Document Preview Dialog */}
      <PolicyDocumentPreviewDialog
        documentUrl={documentPreviewPolicy?.document_url || null}
        policyNumber={documentPreviewPolicy?.policy_number || ''}
        open={documentPreviewOpen}
        onOpenChange={setDocumentPreviewOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the policy for {policyToDelete?.client_name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePolicy}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedPolicies.size} Policies?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {selectedPolicies.size} selected policies.
              This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PolicyList;
