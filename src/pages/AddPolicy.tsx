import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialDatePicker } from "@/components/ui/material-date-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Upload, FileText, Loader2, Sparkles, X, Share2, AlertCircle } from "lucide-react";
import { format, addDays, parse } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STORAGE_KEY = 'addPolicy_formData';
const FILE_STORAGE_KEY = 'addPolicy_uploadedFile';

const AddPolicy = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sharedFileLoaded, setSharedFileLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(() => {
    // Try to restore from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    return {
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
    };
  });

  const [policyActiveDate, setPolicyActiveDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed._policyActiveDate) {
          return new Date(parsed._policyActiveDate);
        }
      } catch {
        // ignore
      }
    }
    return undefined;
  });

  const [policyExpiryDate, setPolicyExpiryDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed._policyExpiryDate) {
          return new Date(parsed._policyExpiryDate);
        }
      } catch {
        // ignore
      }
    }
    return undefined;
  });

  // Persist form data to localStorage
  useEffect(() => {
    const dataToSave = {
      ...formData,
      _policyActiveDate: policyActiveDate?.toISOString(),
      _policyExpiryDate: policyExpiryDate?.toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, policyActiveDate, policyExpiryDate]);

  // Clear form data after successful submission
  const clearSavedFormData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FILE_STORAGE_KEY);
  };

  // Handle shared files from external apps
  useEffect(() => {
    const checkForSharedFile = async () => {
      const sharedParam = searchParams.get('shared');
      const errorParam = searchParams.get('error');

      // Handle errors from share target
      if (errorParam) {
        let errorMessage = "An error occurred while receiving the file.";
        switch (errorParam) {
          case 'no_file':
            errorMessage = "No file was received. Please try again.";
            break;
          case 'invalid_type':
            errorMessage = "Only PDF files are supported. Please share a PDF document.";
            break;
          case 'file_too_large':
            errorMessage = "File is too large. Maximum size is 10MB.";
            break;
          case 'processing_failed':
            errorMessage = "Failed to process the shared file. Please try again.";
            break;
        }
        toast({
          title: "Share Error",
          description: errorMessage,
          variant: "destructive",
        });
        navigate('/add-policy', { replace: true });
        return;
      }

      // Check for pending shared file
      if (sharedParam === 'pending' && !sharedFileLoaded) {
        try {
          const cache = await caches.open('shared-files');
          const response = await cache.match('/shared-pdf');
          
          if (response) {
            const blob = await response.blob();
            const fileName = decodeURIComponent(response.headers.get('X-File-Name') || 'shared-policy.pdf');
            const file = new File([blob], fileName, { type: 'application/pdf' });
            
            await cache.delete('/shared-pdf');
            
            setUploadedFile(file);
            setSharedFileLoaded(true);
            
            toast({
              title: "PDF Received",
              description: `"${fileName}" has been loaded. Processing document...`,
            });
            
            await parseFile(file);
            navigate('/add-policy', { replace: true });
          }
        } catch (error) {
          console.error('Error loading shared file:', error);
        }
      }
    };

    checkForSharedFile();
  }, [searchParams, sharedFileLoaded]);

  const toCamelCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const parseFile = async (file: File) => {
    setParsing(true);
    setDuplicateError(null);
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('parse-policy-pdf', {
        body: { pdfBase64: base64 }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const extracted = data.data;
        
        const newFormData = {
          ...formData,
          policy_number: extracted.policy_number || formData.policy_number,
          client_name: extracted.client_name ? toCamelCase(extracted.client_name) : formData.client_name,
          vehicle_number: extracted.vehicle_number?.toUpperCase().replace(/[^A-Z0-9]/g, '') || formData.vehicle_number,
          vehicle_make: extracted.vehicle_make || formData.vehicle_make,
          vehicle_model: extracted.vehicle_model || formData.vehicle_model,
          company_name: extracted.company_name || formData.company_name,
          contact_number: extracted.contact_number?.replace(/\D/g, '').substring(0, 10) || formData.contact_number,
          net_premium: extracted.net_premium ? String(extracted.net_premium) : formData.net_premium,
        };
        
        setFormData(newFormData);

        let newActiveDate: Date | undefined;
        let newExpiryDate: Date | undefined;
        
        if (extracted.policy_active_date) {
          try {
            const activeDate = parse(extracted.policy_active_date, 'yyyy-MM-dd', new Date());
            if (!isNaN(activeDate.getTime())) {
              newActiveDate = activeDate;
              newExpiryDate = addDays(activeDate, 364);
              setPolicyActiveDate(activeDate);
              setPolicyExpiryDate(addDays(activeDate, 364));
            }
          } catch (e) {
            console.log("Could not parse active date");
          }
        }

        // Check for duplicates immediately after parsing
        await checkDuplicatePolicyAfterParse(
          extracted.policy_number,
          extracted.vehicle_number?.toUpperCase().replace(/[^A-Z0-9]/g, ''),
          extracted.company_name,
          newActiveDate,
          newExpiryDate
        );

        toast({
          title: "Document Parsed Successfully",
          description: "Policy details have been extracted. Please review and edit if needed.",
        });
      } else {
        throw new Error(data?.error || "Failed to extract data");
      }
    } catch (error: any) {
      console.error("PDF parsing error:", error);
      toast({
        title: "Parsing Failed",
        description: error.message || "Could not extract data from the document. Please fill in manually.",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  // Check for duplicate immediately after PDF parsing
  const checkDuplicatePolicyAfterParse = async (
    policyNumber?: string,
    vehicleNumber?: string,
    companyName?: string,
    activeDate?: Date,
    expiryDate?: Date
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const policyNum = policyNumber?.trim().toUpperCase();
      const vehicleNum = vehicleNumber?.trim().toUpperCase();
      
      // Check by policy number (exact match, case-insensitive)
      if (policyNum) {
        const { data: existingByPolicyNumber } = await supabase
          .from('policies')
          .select('id, policy_number, vehicle_number, client_name')
          .eq('user_id', user.id)
          .ilike('policy_number', policyNum)
          .limit(1);

        if (existingByPolicyNumber && existingByPolicyNumber.length > 0) {
          setDuplicateError(
            `⚠️ Duplicate Found: A policy with number "${policyNum}" already exists for ${existingByPolicyNumber[0].client_name || 'this client'}. This policy cannot be submitted.`
          );
          return true;
        }
      }

      // Check by vehicle number + active date + company (same vehicle, same period, same company)
      if (vehicleNum && activeDate && companyName) {
        const { data: existingByVehicle } = await supabase
          .from('policies')
          .select('id, policy_number, vehicle_number, client_name, policy_active_date, policy_expiry_date')
          .eq('user_id', user.id)
          .ilike('vehicle_number', vehicleNum)
          .ilike('company_name', companyName.trim());

        if (existingByVehicle && existingByVehicle.length > 0) {
          const newActiveDate = activeDate;
          const newExpiryDate = expiryDate || addDays(activeDate, 364);
          
          for (const existing of existingByVehicle) {
            const existingActive = new Date(existing.policy_active_date);
            const existingExpiry = new Date(existing.policy_expiry_date);
            
            // Check if dates overlap
            if (newActiveDate <= existingExpiry && newExpiryDate >= existingActive) {
              setDuplicateError(
                `⚠️ Duplicate Found: A policy for vehicle "${vehicleNum}" from the same company already exists (Policy: ${existing.policy_number}, Period: ${format(existingActive, 'dd/MM/yyyy')} - ${format(existingExpiry, 'dd/MM/yyyy')}). This policy cannot be submitted.`
              );
              return true;
            }
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking duplicate after parse:', error);
      return false;
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type - accept PDF and common image types
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or image file (JPEG, PNG, WebP)",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (10MB max)
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

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the drop zone entirely
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

    // Take only the first file
    if (files.length > 1) {
      toast({
        title: "Multiple Files",
        description: "Only one file can be uploaded at a time. Using the first file.",
      });
    }

    const file = files[0];
    await handleFile(file);
  }, [toast]);

  // Check for duplicate policy
  const checkDuplicatePolicy = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    setCheckingDuplicate(true);
    setDuplicateError(null);

    try {
      const policyNumber = formData.policy_number.trim().toUpperCase();
      const vehicleNumber = formData.vehicle_number.trim().toUpperCase();
      
      // Check by policy number (exact match, case-insensitive)
      if (policyNumber) {
        const { data: existingByPolicyNumber } = await supabase
          .from('policies')
          .select('id, policy_number, vehicle_number, client_name')
          .eq('user_id', user.id)
          .ilike('policy_number', policyNumber)
          .limit(1);

        if (existingByPolicyNumber && existingByPolicyNumber.length > 0) {
          setDuplicateError(
            `A policy with number "${policyNumber}" already exists for ${existingByPolicyNumber[0].client_name || 'this client'}.`
          );
          return true;
        }
      }

      // Check by vehicle number + active date + company (same vehicle, same period, same company)
      if (vehicleNumber && policyActiveDate && formData.company_name) {
        const { data: existingByVehicle } = await supabase
          .from('policies')
          .select('id, policy_number, vehicle_number, client_name, policy_active_date, policy_expiry_date')
          .eq('user_id', user.id)
          .ilike('vehicle_number', vehicleNumber)
          .ilike('company_name', formData.company_name.trim());

        if (existingByVehicle && existingByVehicle.length > 0) {
          // Check for date overlap
          const newActiveDate = policyActiveDate;
          const newExpiryDate = policyExpiryDate || addDays(policyActiveDate, 364);
          
          for (const existing of existingByVehicle) {
            const existingActive = new Date(existing.policy_active_date);
            const existingExpiry = new Date(existing.policy_expiry_date);
            
            // Check if dates overlap
            if (newActiveDate <= existingExpiry && newExpiryDate >= existingActive) {
              setDuplicateError(
                `A policy for vehicle "${vehicleNumber}" from the same company already exists (Policy: ${existing.policy_number}, Period: ${format(existingActive, 'dd/MM/yyyy')} - ${format(existingExpiry, 'dd/MM/yyyy')}).`
              );
              return true;
            }
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || loading) return;
    
    setDuplicateError(null);

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

    // Check for duplicate policy
    const isDuplicate = await checkDuplicatePolicy();
    if (isDuplicate) {
      setIsSubmitting(false);
      toast({
        title: "Duplicate Policy",
        description: "This policy already exists in your account.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      const isSubscribed = subscription && 
                          subscription.status === 'active' && 
                          subscription.end_date && 
                          new Date(subscription.end_date) > new Date();

      if (!isSubscribed) {
        const { count, error: countError } = await supabase
          .from('policies')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id);

        if (countError) throw countError;

        if (count !== null && count >= 50) {
          toast({
            title: "Policy Limit Reached",
            description: "Free users can add up to 50 policies. Please upgrade to add more policies.",
            variant: "destructive",
          });
          setLoading(false);
          setIsSubmitting(false);
          return;
        }
      }

      // Upload PDF to storage if file is available
      let documentUrl: string | null = null;
      if (uploadedFile && uploadedFile.type === 'application/pdf') {
        const fileExt = 'pdf';
        const fileName = `${user?.id}/${Date.now()}_${formData.policy_number.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('policy-documents')
          .upload(fileName, uploadedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Document upload error:', uploadError);
          toast({
            title: "Warning",
            description: "Policy document could not be uploaded. Policy will be saved without document.",
            variant: "destructive",
          });
        } else {
          documentUrl = fileName;
        }
      }

      // Use edge function for server-side validation
      const { data: result, error: validationError } = await supabase.functions.invoke('validate-policy', {
        body: {
          action: 'create',
          data: {
            ...formData,
            net_premium: formData.net_premium ? parseFloat(formData.net_premium) : 0,
            policy_active_date: format(policyActiveDate, "yyyy-MM-dd"),
            policy_expiry_date: format(policyExpiryDate, "yyyy-MM-dd"),
            document_url: documentUrl,
          }
        }
      });

      if (validationError || !result?.success) {
        const errorDetails = result?.details;
        if (errorDetails && Array.isArray(errorDetails)) {
          throw new Error(errorDetails.map((e: any) => e.message).join(', '));
        }
        throw new Error(result?.error || validationError?.message || "Failed to add policy");
      }

      // Clear saved form data on success
      clearSavedFormData();

      toast({
        title: "Success",
        description: documentUrl ? "Policy and document added successfully!" : "Policy added successfully!",
      });

      navigate("/policies");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add policy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear duplicate error when user modifies key fields
    if (['policy_number', 'vehicle_number', 'company_name'].includes(name)) {
      setDuplicateError(null);
    }
    
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
    setDuplicateError(null);
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

  const clearForm = () => {
    setFormData({
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
    });
    setPolicyActiveDate(undefined);
    setPolicyExpiryDate(undefined);
    setUploadedFile(null);
    setDuplicateError(null);
    clearSavedFormData();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Add New Policy</h1>
            <p className="text-gray-600 text-sm sm:text-base">Create a new insurance policy</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearForm}
          className="self-start sm:self-auto text-muted-foreground"
        >
          Clear Form
        </Button>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Duplicate Error Alert */}
        {duplicateError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{duplicateError}</AlertDescription>
          </Alert>
        )}

        {/* PDF Upload Card with Drag & Drop */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Smart Auto-Fill</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Upload a policy PDF or image and we'll automatically extract the details for you.
                  <span className="block mt-1 text-xs text-blue-600">
                    <Share2 className="w-3 h-3 inline mr-1" />
                    Tip: You can also share PDFs directly from other apps or drag & drop files!
                  </span>
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
                
                {uploadedFile ? (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{uploadedFile.name}</span>
                    {parsing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    ) : (
                      <button onClick={clearUploadedFile} className="p-1 hover:bg-gray-100 rounded">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
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
                    className={`h-10 text-sm uppercase ${duplicateError?.includes('policy') ? 'border-destructive' : ''}`}
                    placeholder="ABC-123-XYZ"
                  />
                  <p className="text-xs text-gray-500">Letters, numbers, and special characters (auto CAPS)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_name" className="text-sm font-medium">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    inputMode="text"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    required
                    className="h-10 text-sm"
                    placeholder="John Doe"
                  />
                  <p className="text-xs text-gray-500">Letters only (auto Camel Case)</p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="vehicle_number" className="text-sm font-medium">
                    Vehicle Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vehicle_number"
                    name="vehicle_number"
                    type="text"
                    value={formData.vehicle_number}
                    onChange={handleInputChange}
                    required
                    className={`h-10 text-sm uppercase ${duplicateError?.includes('vehicle') ? 'border-destructive' : ''}`}
                    placeholder="TN01AB1234"
                  />
                  <p className="text-xs text-gray-500">Uppercase letters and numbers only</p>
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
                    placeholder="e.g., Maruti, Honda, Toyota"
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
                    placeholder="e.g., Swift, City, Fortuner"
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
                    placeholder="e.g., ICICI Lombard, New India"
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
                  <p className="text-xs text-gray-500">10 digits only (optional)</p>
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
                  <p className="text-xs text-gray-500">Letters only (auto Camel Case, optional)</p>
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
                  <p className="text-xs text-gray-500">Auto-extracted from PDF (optional)</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Policy Active Date <span className="text-red-500">*</span>
                  </Label>
                  <MaterialDatePicker
                    date={policyActiveDate}
                    onDateChange={handleActiveDateChange}
                    placeholder="Select date"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Policy Expiry Date</Label>
                  <Input
                    value={policyExpiryDate ? format(policyExpiryDate, "PPP") : "Auto-calculated (1 year)"}
                    disabled
                    className="h-10 text-sm bg-gray-50"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || checkingDuplicate || isSubmitting}
                  className="w-full h-10 text-sm"
                >
                  {checkingDuplicate ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking for duplicates...
                    </>
                  ) : loading ? (
                    "Adding Policy..."
                  ) : (
                    "Add Policy"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddPolicy;
