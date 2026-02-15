import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialDatePicker } from "@/components/ui/material-date-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Upload, FileText, Loader2, Sparkles, X, AlertCircle, RefreshCw, Trash2, ChevronRight, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, addDays, parse } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { compressDocument } from "@/utils/documentCompression";
import { productNamesByInsuranceType } from "@/data/productNameData";

const INSURANCE_TYPES = [
  "Vehicle Insurance",
  "Health Insurance", 
  "Life Insurance",
  "Other"
] as const;

const EditPolicy = () => {
  const navigate = useNavigate();
  const { policyId } = useParams<{ policyId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [existingDocumentUrl, setExistingDocumentUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [isRemovingDocument, setIsRemovingDocument] = useState(false);
  
  // Bulk renewal flow state
  const isRenewal = searchParams.get('renewal') === 'true';
  const isBulkRenewal = searchParams.get('bulk') === 'true';
  const [bulkRenewalQueue, setBulkRenewalQueue] = useState<string[]>([]);
  const [showSuccessState, setShowSuccessState] = useState(false);

  // Load bulk renewal queue from session storage
  useEffect(() => {
    if (isBulkRenewal) {
      const queue = sessionStorage.getItem('bulkRenewalQueue');
      if (queue) {
        try {
          setBulkRenewalQueue(JSON.parse(queue));
        } catch (e) {
          console.error('Failed to parse bulk renewal queue:', e);
        }
      }
    }
  }, [isBulkRenewal]);

  const [formData, setFormData] = useState({
    policy_number: "",
    client_name: "",
    vehicle_number: "",
    vehicle_make: "",
    vehicle_model: "",
    company_name: "",
    contact_number: "",
    agent_code: "",
    reference: "",
    status: "Active",
    net_premium: "",
    insurance_type: "Vehicle Insurance",
    product_name: "",
  });

  const [policyActiveDate, setPolicyActiveDate] = useState<Date | undefined>(undefined);
  const [policyExpiryDate, setPolicyExpiryDate] = useState<Date | undefined>(undefined);

  // Load existing policy data
  useEffect(() => {
    const fetchPolicy = async () => {
      if (!policyId || !user) return;

      try {
        const { data, error } = await supabase
          .from('policies')
          .select('*')
          .eq('id', policyId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Policy Not Found",
            description: "The policy you're trying to edit doesn't exist.",
            variant: "destructive",
          });
          navigate('/policies');
          return;
        }

        setFormData({
          policy_number: data.policy_number || "",
          client_name: data.client_name || "",
          vehicle_number: data.vehicle_number || "",
          vehicle_make: data.vehicle_make || "",
          vehicle_model: data.vehicle_model || "",
          company_name: data.company_name || "",
          contact_number: data.contact_number || "",
          agent_code: data.agent_code || "",
          reference: data.reference || "",
          status: data.status || "Active",
          net_premium: data.net_premium ? String(data.net_premium) : "",
          insurance_type: data.insurance_type || "Vehicle Insurance",
          product_name: data.product_name || "",
        });

        if (data.policy_active_date) {
          setPolicyActiveDate(new Date(data.policy_active_date));
        }
        if (data.policy_expiry_date) {
          setPolicyExpiryDate(new Date(data.policy_expiry_date));
        }
        if (data.document_url) {
          setExistingDocumentUrl(data.document_url);
        }
      } catch (error) {
        console.error('Error fetching policy:', error);
        toast({
          title: "Error",
          description: "Failed to load policy data.",
          variant: "destructive",
        });
        navigate('/policies');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPolicy();
  }, [policyId, user, navigate, toast]);

  const toCamelCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const parseFile = async (file: File) => {
    setParsing(true);
    setParseError(null);
    setParseProgress(10);
    
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File too large. Maximum size is 10MB.");
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error("Unsupported file format. Please upload a PDF or image file.");
      }

      console.log("Parsing file:", file.name, "Type:", file.type, "Size:", file.size);
      setParseProgress(20);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          if (!base64Data || base64Data.length === 0) {
            reject(new Error("Failed to read file. The file may be corrupted."));
            return;
          }
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error("Failed to read file. Please try again."));
        reader.readAsDataURL(file);
      });

      console.log("Base64 generated, length:", base64.length);
      setParseProgress(40);

      const progressInterval = setInterval(() => {
        setParseProgress(prev => Math.min(prev + 5, 85));
      }, 500);

      const { data, error } = await supabase.functions.invoke('parse-policy-pdf', {
        body: { pdfBase64: base64 }
      });

      clearInterval(progressInterval);
      setParseProgress(90);

      if (error) {
        console.error("Supabase function error:", error);
        if (error.message?.includes('Failed to send') || error.message?.includes('Failed to fetch')) {
          throw new Error("Network error. Please check your connection and try again.");
        }
        throw new Error(error.message || "Failed to process document");
      }

      if (data?.error) {
        console.error("API returned error:", data.error);
        throw new Error(data.error);
      }

      if (data?.success && data?.data) {
        const extracted = data.data;
        
        // Update form with extracted data, preserving manually edited values
        setFormData(prev => ({
          ...prev,
          policy_number: extracted.policy_number || prev.policy_number,
          client_name: extracted.client_name ? toCamelCase(extracted.client_name) : prev.client_name,
          vehicle_number: extracted.vehicle_number?.toUpperCase().replace(/[^A-Z0-9]/g, '') || prev.vehicle_number,
          vehicle_make: extracted.vehicle_make || prev.vehicle_make,
          vehicle_model: extracted.vehicle_model || prev.vehicle_model,
          company_name: extracted.company_name || prev.company_name,
          contact_number: extracted.contact_number?.replace(/\D/g, '').substring(0, 10) || prev.contact_number,
          net_premium: extracted.net_premium ? String(extracted.net_premium) : prev.net_premium,
          insurance_type: INSURANCE_TYPES.includes(extracted.insurance_type) 
            ? extracted.insurance_type 
            : prev.insurance_type,
          product_name: extracted.product_name || prev.product_name,
        }));

        if (extracted.policy_active_date) {
          try {
            const activeDate = parse(extracted.policy_active_date, 'yyyy-MM-dd', new Date());
            if (!isNaN(activeDate.getTime())) {
              setPolicyActiveDate(activeDate);
              setPolicyExpiryDate(addDays(activeDate, 364));
            }
          } catch (e) {
            console.log("Could not parse active date");
          }
        }

        setParseProgress(100);
        toast({
          title: "Document Parsed Successfully",
          description: "Policy details have been updated. Please review and save.",
        });
      } else {
        throw new Error("Could not extract data from the document.");
      }
    } catch (error: any) {
      console.error("PDF parsing error:", error);
      
      let errorMessage = "Could not extract data from the document.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      setParseError(errorMessage);
      toast({
        title: "Parsing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setParsing(false);
      setParseProgress(0);
    }
  };

  const retryParsing = async () => {
    if (uploadedFile) {
      setParseError(null);
      await parseFile(uploadedFile);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or image file (JPEG, PNG, WebP)",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;
    setUploadedFile(file);
    await parseFile(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFile(file);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const { clientX, clientY } = e;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        setIsDragging(false);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (files.length > 1) {
      toast({
        title: "Multiple Files",
        description: "Only one file can be uploaded at a time. Using the first file.",
      });
    }

    const file = files[0];
    await handleFile(file);
  }, [toast]);

  const handleRemoveExistingDocument = async () => {
    if (!existingDocumentUrl || !policyId) return;

    setIsRemovingDocument(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('policy-documents')
        .remove([existingDocumentUrl]);

      if (storageError) {
        console.error('Error deleting document from storage:', storageError);
      }

      // Update policy to remove document reference
      const { error: updateError } = await supabase
        .from('policies')
        .update({ document_url: null })
        .eq('id', policyId);

      if (updateError) throw updateError;

      setExistingDocumentUrl(null);
      toast({
        title: "Document Removed",
        description: "The policy document has been removed.",
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: "Error",
        description: "Failed to remove document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemovingDocument(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (isSubmitting || loading) return;
    
    setSubmitError(null);

    if (!policyActiveDate || !policyExpiryDate) {
      toast({
        title: "Error",
        description: "Please select policy active date",
        variant: "destructive",
      });
      return;
    }

    if (!formData.policy_number || formData.policy_number.trim() === "") {
      toast({
        title: "Error",
        description: "Policy number is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.vehicle_number || formData.vehicle_number.trim() === "") {
      toast({
        title: "Error",
        description: "Vehicle number is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.contact_number && formData.contact_number.replace(/\D/g, '').length !== 10) {
      toast({
        title: "Error",
        description: "Contact number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Upload new PDF if provided
      let documentUrl: string | null = existingDocumentUrl;
      
      if (uploadedFile && uploadedFile.type === 'application/pdf') {
        const compressedFile = await compressDocument(uploadedFile);
        // Delete old document if exists
        if (existingDocumentUrl) {
          await supabase.storage
            .from('policy-documents')
            .remove([existingDocumentUrl]);
        }

        const fileExt = 'pdf';
        const fileName = `${user?.id}/${Date.now()}_${formData.policy_number.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('policy-documents')
          .upload(fileName, compressedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Document upload error:', uploadError);
          toast({
            title: "Warning",
            description: "Policy document could not be uploaded. Policy will be saved without new document.",
            variant: "destructive",
          });
        } else {
          documentUrl = fileName;
        }
      }

      // Use edge function for server-side validation
      const { data: result, error: validationError } = await supabase.functions.invoke('validate-policy', {
        body: {
          action: 'update',
          policyId: policyId,
          data: {
            ...formData,
            net_premium: formData.net_premium ? parseFloat(formData.net_premium) : 0,
            policy_active_date: format(policyActiveDate, "yyyy-MM-dd"),
            policy_expiry_date: format(policyExpiryDate, "yyyy-MM-dd"),
            document_url: documentUrl,
            product_name: formData.product_name || null,
          }
        }
      });

      if (validationError || !result?.success) {
        const errorDetails = result?.details;
        if (errorDetails && Array.isArray(errorDetails)) {
          throw new Error(errorDetails.map((e: any) => e.message).join(', '));
        }
        throw new Error(result?.error || validationError?.message || "Failed to update policy");
      }

      toast({
        title: "Success",
        description: isRenewal ? "Policy renewed successfully!" : "Policy updated successfully!",
      });

      // Handle bulk renewal flow
      if (isBulkRenewal && bulkRenewalQueue.length > 0) {
        setShowSuccessState(true);
      } else {
        // Clear any remaining queue
        sessionStorage.removeItem('bulkRenewalQueue');
        navigate(isRenewal ? "/due-policies" : "/policies");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update policy";
      setSubmitError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const retrySubmit = async () => {
    setSubmitError(null);
    await handleSubmit();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "policy_number") {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else if (name === "client_name") {
      const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: toCamelCase(cleanedValue) });
    } else if (name === "vehicle_number") {
      setFormData({ ...formData, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') });
    } else if (name === "contact_number") {
      const digits = value.replace(/\D/g, '').substring(0, 10);
      setFormData({ ...formData, [name]: digits });
    } else if (name === "agent_code") {
      const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: toCamelCase(cleanedValue) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleActiveDateChange = (date: Date | undefined) => {
    if (date) {
      setPolicyActiveDate(date);
      setPolicyExpiryDate(addDays(date, 364));
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle next policy in bulk renewal
  const handleNextPolicy = () => {
    if (bulkRenewalQueue.length > 0) {
      const nextPolicyId = bulkRenewalQueue[0];
      const remainingQueue = bulkRenewalQueue.slice(1);
      
      // Update session storage with remaining queue
      if (remainingQueue.length > 0) {
        sessionStorage.setItem('bulkRenewalQueue', JSON.stringify(remainingQueue));
      } else {
        sessionStorage.removeItem('bulkRenewalQueue');
      }
      
      // Navigate to next policy
      navigate(`/edit-policy/${nextPolicyId}?renewal=true${remainingQueue.length > 0 ? '&bulk=true' : ''}`);
    } else {
      sessionStorage.removeItem('bulkRenewalQueue');
      navigate('/due-policies');
    }
  };

  // Handle finish bulk renewal
  const handleFinishBulkRenewal = () => {
    sessionStorage.removeItem('bulkRenewalQueue');
    navigate('/due-policies');
  };

  if (initialLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 sm:p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600">Loading policy data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Edit Policy</h1>
            <p className="text-gray-600 text-sm sm:text-base">Update policy details</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* PDF Upload Card with Drag & Drop */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Upload New Document</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Upload a new policy PDF to update the details automatically.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf,image/*,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                  capture={undefined}
                />

                {/* Existing Document */}
                {existingDocumentUrl && !uploadedFile && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border mb-3">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700 flex-1 truncate">Current document attached</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleRemoveExistingDocument}
                      disabled={isRemovingDocument}
                      className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      {isRemovingDocument ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
                
                {uploadedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-700 flex-1 truncate">{uploadedFile.name}</span>
                      {parsing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      ) : parseError ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={retryParsing}
                          className="h-7 px-2 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      ) : (
                        <button onClick={clearUploadedFile} className="p-1 hover:bg-gray-100 rounded">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    
                    {parsing && parseProgress > 0 && (
                      <div className="space-y-1">
                        <Progress value={parseProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          {parseProgress < 40 ? "Reading document..." : 
                           parseProgress < 85 ? "Extracting policy details with AI..." : 
                           "Finalizing..."}
                        </p>
                      </div>
                    )}
                    
                    {parseError && !parsing && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <span className="text-xs">{parseError}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={retryParsing}
                            className="h-6 px-2 text-xs ml-2"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all
                      ${isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700 text-center">
                      {parsing ? "Processing..." : isDragging ? "Drop file here" : "Click or drag file to upload"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF or images (max 10MB)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Policy Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policy_number" className="text-sm font-medium">
                    Policy Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="policy_number"
                    name="policy_number"
                    value={formData.policy_number}
                    onChange={handleInputChange}
                    required
                    className="h-10 text-sm uppercase"
                    placeholder="ABC-123-XYZ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance_type" className="text-sm font-medium">
                    Type of Insurance <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.insurance_type}
                    onValueChange={(value) => setFormData({ ...formData, insurance_type: value, product_name: "" })}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select insurance type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {INSURANCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_name" className="text-sm font-medium">
                    Product Name
                  </Label>
                  <Select
                    value={formData.product_name}
                    onValueChange={(value) => setFormData({ ...formData, product_name: value })}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select product name" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      {(productNamesByInsuranceType[formData.insurance_type] || []).map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_name" className="text-sm font-medium">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    required
                    className="h-10 text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="vehicle_number" className="text-sm font-medium">
                    Vehicle Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vehicle_number"
                    name="vehicle_number"
                    value={formData.vehicle_number}
                    onChange={handleInputChange}
                    required
                    className="h-10 text-sm uppercase"
                    placeholder="TN01AB1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_make" className="text-sm font-medium">
                    Vehicle Make
                  </Label>
                  <Input
                    id="vehicle_make"
                    name="vehicle_make"
                    value={formData.vehicle_make}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="e.g., Maruti, Honda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_model" className="text-sm font-medium">
                    Vehicle Model
                  </Label>
                  <Input
                    id="vehicle_model"
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="e.g., Swift, City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-sm font-medium">
                    Insurance Company
                  </Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="e.g., ICICI Lombard"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_number" className="text-sm font-medium">
                    Contact Number
                  </Label>
                  <Input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    inputMode="numeric"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent_code" className="text-sm font-medium">
                    Agent Name
                  </Label>
                  <Input
                    id="agent_code"
                    name="agent_code"
                    value={formData.agent_code}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="Agent Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-sm font-medium">Reference</Label>
                  <Input
                    id="reference"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="Enter reference"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="net_premium" className="text-sm font-medium">
                    Net Premium (₹)
                  </Label>
                  <Input
                    id="net_premium"
                    name="net_premium"
                    type="number"
                    inputMode="decimal"
                    value={formData.net_premium}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Risk Start Date (RSD) <span className="text-red-500">*</span>
                  </Label>
                  <MaterialDatePicker
                    date={policyActiveDate}
                    onDateChange={handleActiveDateChange}
                    placeholder="Select date"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Risk End Date (RED)</Label>
                  <Input
                    value={policyExpiryDate ? format(policyExpiryDate, "PPP") : "Auto-calculated (1 year)"}
                    disabled
                    className="h-10 text-sm bg-gray-50"
                  />
                </div>
              </div>

              {submitError && !loading && !isSubmitting && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span className="text-sm">{submitError}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={retrySubmit}
                      className="h-7 px-3 text-xs ml-2"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 space-y-3">
                {/* Success state for bulk renewal */}
                {showSuccessState && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <span className="text-green-800 font-medium">
                        Policy renewed successfully! {bulkRenewalQueue.length} more {bulkRenewalQueue.length === 1 ? 'policy' : 'policies'} remaining.
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          size="sm" 
                          variant="outline"
                          onClick={handleFinishBulkRenewal}
                          className="h-8"
                        >
                          Finish
                        </Button>
                        <Button 
                          type="button"
                          size="sm"
                          onClick={handleNextPolicy}
                          className="h-8 bg-green-600 hover:bg-green-700"
                        >
                          Next Policy
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {!showSuccessState && (
                  <Button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full h-10 text-sm"
                  >
                    {loading || isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isRenewal ? "Renewing Policy..." : "Updating Policy..."}
                      </>
                    ) : (
                      <>
                        {isRenewal ? "Renew Policy" : "Update Policy"}
                        {isBulkRenewal && bulkRenewalQueue.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            +{bulkRenewalQueue.length} more
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditPolicy;
