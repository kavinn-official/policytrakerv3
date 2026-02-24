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
import { ArrowLeft, Upload, FileText, Loader2, Sparkles, X, Share2, AlertCircle, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format, addDays, parse } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { compressDocument } from "@/utils/documentCompression";
import { productNamesByInsuranceType } from "@/data/productNameData";

const INSURANCE_TYPES = [
  "Vehicle Insurance",
  "Health Insurance",
  "Life Insurance",
  "Other"
] as const;

// Use sessionStorage instead of localStorage for sensitive form data
// This ensures data is cleared when browser is closed (more secure for shared devices)
const STORAGE_KEY = 'addPolicy_formData';
const FILE_STORAGE_KEY = 'addPolicy_uploadedFile';

const AddPolicy = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { incrementOcrUsage, addStorageUsage, canUseOcr, refreshUsage } = useUsageTracking();
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
  const [parseError, setParseError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [parseProgress, setParseProgress] = useState(0);
  const [lastSubmitData, setLastSubmitData] = useState<any>(null);

  const [formData, setFormData] = useState(() => {
    // Try to restore from sessionStorage (more secure - cleared on browser close)
    const saved = sessionStorage.getItem(STORAGE_KEY);
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
      commission_percentage: "",
      insurance_type: "Vehicle Insurance",
      product_name: "",
      premium_frequency: "yearly",
      // Motor specific
      idv: "",
      basic_od_premium: "",
      basic_tp_premium: "",
      // Health specific
      sum_insured: "",
      members_covered: "",
      plan_type: "",
      // Life specific
      sum_assured: "",
      policy_term: "",
      premium_payment_term: "",
      // Commission split
      od_commission_percentage: "",
      tp_commission_percentage: "",
      // Commission amounts
      od_commission_amount: "",
      tp_commission_amount: "",
      net_commission_amount: "",
      commission_amount: "",
    };
  });

  const [policyActiveDate, setPolicyActiveDate] = useState<Date | undefined>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
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
    const saved = sessionStorage.getItem(STORAGE_KEY);
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

  // Persist form data to sessionStorage (cleared on browser close for security)
  useEffect(() => {
    const dataToSave = {
      ...formData,
      _policyActiveDate: policyActiveDate?.toISOString(),
      _policyExpiryDate: policyExpiryDate?.toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, policyActiveDate, policyExpiryDate]);

  // Clear form data after successful submission
  const clearSavedFormData = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(FILE_STORAGE_KEY);
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

  // Auto-calculate Total Commission = OD + TP + Net
  useEffect(() => {
    const od = parseFloat(formData.od_commission_amount) || 0;
    const tp = parseFloat(formData.tp_commission_amount) || 0;
    const net = parseFloat(formData.net_commission_amount) || 0;

    // Auto-calculate if any of the components are present
    if (formData.od_commission_amount || formData.tp_commission_amount || formData.net_commission_amount) {
      const total = od + tp + net;
      // Format to avoid floating point precision issues and infinite loops
      const formattedTotal = total.toFixed(2).replace(/\.00$/, '');
      if (total >= 0 && formData.commission_amount !== formattedTotal) {
        setFormData(prev => ({ ...prev, commission_amount: formattedTotal }));
      }
    }
  }, [formData.od_commission_amount, formData.tp_commission_amount, formData.net_commission_amount]);

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
    setParseError(null);
    setParseProgress(10);

    try {
      // Validate file before parsing
      if (!file) {
        throw new Error("No file provided");
      }

      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File too large. Maximum size is 10MB.");
      }

      // Check file type
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

      // Simulate progress during AI processing
      const progressInterval = setInterval(() => {
        setParseProgress(prev => Math.min(prev + 5, 85));
      }, 500);

      const { data, error } = await supabase.functions.invoke('parse-policy-pdf', {
        body: { pdfBase64: base64 }
      });

      clearInterval(progressInterval);
      setParseProgress(90);

      if (error) {
        console.error("Supabase function error (raw):", error);

        let realErrorMsg = error.message;

        if (error.context && typeof error.context.text === 'function') {
          try {
            const errorText = await error.context.text();
            console.error("Real error from Edge Function:", errorText);
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error) {
                realErrorMsg = errorJson.error;
              } else {
                realErrorMsg = errorText;
              }
            } catch (e) {
              realErrorMsg = errorText;
            }
          } catch (e) {
            console.error("Could not read error context:", e);
          }
        } else if (error && error.message) {
          realErrorMsg = error.message;
        }

        // Parse specific error messages based on realErrorMsg
        if (realErrorMsg?.includes('Failed to send') || realErrorMsg?.includes('Failed to fetch')) {
          throw new Error("Network error. Please check your connection and try again.");
        }
        if (realErrorMsg?.includes('Rate limit')) {
          throw new Error("Too many requests. Please wait a moment and try again.");
        }
        if (realErrorMsg?.includes('credits')) {
          throw new Error("AI service temporarily unavailable. Please try again later.");
        }
        if (realErrorMsg?.includes('Invalid JWT') || realErrorMsg?.includes('Authentication failed')) {
          throw new Error("Your session has expired or is invalid. Please log out and log back in.");
        }

        throw new Error(realErrorMsg || "Failed to process document");
      }

      if (data?.error) {
        console.error("API returned error:", data.error);
        throw new Error(data.error);
      }

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
          insurance_type: INSURANCE_TYPES.includes(extracted.insurance_type)
            ? extracted.insurance_type
            : formData.insurance_type,
          product_name: extracted.product_name || formData.product_name,
          // Motor specific
          idv: extracted.idv ? String(extracted.idv) : formData.idv,
          basic_od_premium: extracted.basic_od_premium ? String(extracted.basic_od_premium) : formData.basic_od_premium,
          basic_tp_premium: extracted.basic_tp_premium ? String(extracted.basic_tp_premium) : formData.basic_tp_premium,
          // Health specific
          sum_insured: extracted.sum_insured ? String(extracted.sum_insured) : formData.sum_insured,
          members_covered: extracted.members_covered ? String(extracted.members_covered) : formData.members_covered,
          plan_type: extracted.plan_type || formData.plan_type,
          // Life specific
          sum_assured: extracted.sum_assured ? String(extracted.sum_assured) : formData.sum_assured,
          policy_term: extracted.policy_term ? String(extracted.policy_term) : formData.policy_term,
          premium_payment_term: extracted.premium_payment_term ? String(extracted.premium_payment_term) : formData.premium_payment_term,
          // Commission extracts
          od_commission_amount: extracted.od_commission_amount ? String(extracted.od_commission_amount) : formData.od_commission_amount,
          tp_commission_amount: extracted.tp_commission_amount ? String(extracted.tp_commission_amount) : formData.tp_commission_amount,
          net_commission_amount: extracted.net_commission_amount ? String(extracted.net_commission_amount) : formData.net_commission_amount,
          commission_amount: extracted.total_commission_amount ? String(extracted.total_commission_amount) : (extracted.commission_amount ? String(extracted.commission_amount) : formData.commission_amount),
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

        // Track OCR usage after successful parse
        await incrementOcrUsage();
        await refreshUsage();

        setParseProgress(100);
        toast({
          title: "Document Parsed Successfully",
          description: "Policy details have been extracted. Please review and edit if needed.",
        });
      } else {
        throw new Error("Could not extract data from the document. The PDF may not contain readable policy information.");
      }
    } catch (error: any) {
      console.error("PDF parsing error:", error);

      // Provide user-friendly error messages
      let errorMessage = "Could not extract data from the document.";
      let errorTitle = "Parsing Failed";

      if (error.message) {
        if (error.message.includes("Network error") || error.message.includes("Failed to fetch")) {
          errorTitle = "Connection Error";
          errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (error.message.includes("too large")) {
          errorTitle = "File Too Large";
          errorMessage = "The file exceeds the 10MB limit. Please upload a smaller file.";
        } else if (error.message.includes("Unsupported")) {
          errorTitle = "Unsupported Format";
          errorMessage = error.message;
        } else if (error.message.includes("corrupted")) {
          errorTitle = "Corrupted File";
          errorMessage = "The file appears to be corrupted. Please try a different file.";
        } else if (error.message.includes("Rate limit") || error.message.includes("Too many")) {
          errorTitle = "Please Wait";
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      // Store error for retry functionality
      setParseError(errorMessage);

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setParsing(false);
      setParseProgress(0);
    }
  };

  // Retry PDF parsing
  const retryParsing = async () => {
    if (uploadedFile) {
      setParseError(null);
      await parseFile(uploadedFile);
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
                `⚠️ Duplicate Found: A policy for vehicle "${vehicleNum}" from the same company already exists (Policy: ${existing.policy_number}, Period: ${format(existingActive, 'dd-MMM-yyyy')} - ${format(existingExpiry, 'dd-MMM-yyyy')}). This policy cannot be submitted.`
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
                `A policy for vehicle "${vehicleNumber}" from the same company already exists (Policy: ${existing.policy_number}, Period: ${format(existingActive, 'dd-MMM-yyyy')} - ${format(existingExpiry, 'dd-MMM-yyyy')}).`
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Prevent double submission
    if (isSubmitting || loading) return;

    setDuplicateError(null);
    setSubmitError(null);

    // Validate required fields
    const validationErrors: string[] = [];

    if (!policyActiveDate || !policyExpiryDate) {
      validationErrors.push("Policy active date is required");
    }

    if (!formData.policy_number || formData.policy_number.trim() === "") {
      validationErrors.push("Policy number is required");
    } else if (formData.policy_number.trim().length < 3) {
      validationErrors.push("Policy number must be at least 3 characters");
    }

    if (!formData.client_name || formData.client_name.trim() === "") {
      validationErrors.push("Client name is required");
    } else if (formData.client_name.trim().length < 2) {
      validationErrors.push("Client name must be at least 2 characters");
    }

    // Vehicle number is only required for Vehicle Insurance
    if (formData.insurance_type === 'Vehicle Insurance' && (!formData.vehicle_number || formData.vehicle_number.trim() === "")) {
      validationErrors.push("Vehicle number is required for Vehicle Insurance");
    }

    if (formData.contact_number && formData.contact_number.replace(/\D/g, '').length !== 10) {
      validationErrors.push("Contact number must be exactly 10 digits");
    }

    if (formData.net_premium && isNaN(parseFloat(formData.net_premium))) {
      validationErrors.push("Net premium must be a valid number");
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors[0],
        variant: "destructive",
      });
      return;
    }

    // Store submit data for retry
    setLastSubmitData({
      formData: { ...formData },
      policyActiveDate,
      policyExpiryDate,
      uploadedFile,
    });

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

      // Upload PDF to storage if file is available (with compression)
      let documentUrl: string | null = null;
      if (uploadedFile && uploadedFile.type === 'application/pdf') {
        const compressedFile = await compressDocument(uploadedFile);
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
            description: "Policy document could not be uploaded. Policy will be saved without document.",
            variant: "destructive",
          });
        } else {
          documentUrl = fileName;
          // Track storage usage after successful upload (use compressed size)
          await addStorageUsage(compressedFile.size);
          await refreshUsage();
        }
      }

      // Use edge function for server-side validation
      const { data: result, error: validationError } = await supabase.functions.invoke('validate-policy', {
        body: {
          action: 'create',
          data: {
            ...formData,
            net_premium: formData.net_premium ? parseFloat(formData.net_premium) : 0,
            commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : 0,
            idv: formData.idv ? parseFloat(formData.idv) : 0,
            basic_od_premium: formData.basic_od_premium ? parseFloat(formData.basic_od_premium) : 0,
            basic_tp_premium: formData.basic_tp_premium ? parseFloat(formData.basic_tp_premium) : 0,
            od_commission_percentage: formData.od_commission_percentage ? parseFloat(formData.od_commission_percentage) : 0,
            tp_commission_percentage: formData.tp_commission_percentage ? parseFloat(formData.tp_commission_percentage) : 0,
            sum_insured: formData.sum_insured ? parseFloat(formData.sum_insured) : 0,
            sum_assured: formData.sum_assured ? parseFloat(formData.sum_assured) : 0,
            members_covered: formData.members_covered ? parseInt(formData.members_covered) : 0,
            policy_term: formData.policy_term ? parseInt(formData.policy_term) : null,
            premium_payment_term: formData.premium_payment_term ? parseInt(formData.premium_payment_term) : null,
            od_commission_amount: formData.od_commission_amount ? parseFloat(formData.od_commission_amount) : null,
            tp_commission_amount: formData.tp_commission_amount ? parseFloat(formData.tp_commission_amount) : null,
            net_commission_amount: formData.net_commission_amount ? parseFloat(formData.net_commission_amount) : null,
            commission_amount: formData.commission_amount ? parseFloat(formData.commission_amount) : null,
            policy_active_date: format(policyActiveDate, "yyyy-MM-dd"),
            policy_expiry_date: format(policyExpiryDate, "yyyy-MM-dd"),
            document_url: documentUrl,
            product_name: formData.product_name || null,
          }
        }
      });

      if (validationError || !result?.success) {
        let errorMessage = result?.error || "Failed to add policy";

        if (validationError) {
          if (validationError.context && typeof validationError.context.text === 'function') {
            try {
              const errorText = await validationError.context.text();
              try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) {
                  errorMessage = errorJson.error;
                }
              } catch (e) {
                errorMessage = errorText || errorMessage;
              }
            } catch (e) {
              // ignore
            }
          } else if (validationError.message) {
            errorMessage = validationError.message;
          }
        }

        const errorDetails = result?.details;
        if (errorDetails && Array.isArray(errorDetails)) {
          throw new Error(errorDetails.map((e: any) => e.message).join(', '));
        }
        throw new Error(errorMessage);
      }

      // Clear saved form data on success
      clearSavedFormData();

      toast({
        title: "Success",
        description: documentUrl ? "Policy and document added successfully!" : "Policy added successfully!",
      });

      navigate("/policies");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to add policy";
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

  // Retry submission
  const retrySubmit = async () => {
    setSubmitError(null);
    await handleSubmit();
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
    } else if (name === "reference") {
      setFormData({ ...formData, [name]: toCamelCase(value) });
    } else if (name === "vehicle_make" || name === "vehicle_model" || name === "company_name") {
      setFormData({ ...formData, [name]: toCamelCase(value) });
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
      commission_percentage: "",
      insurance_type: "Vehicle Insurance",
      product_name: "",
      premium_frequency: "yearly",
      idv: "",
      basic_od_premium: "",
      basic_tp_premium: "",
      sum_insured: "",
      members_covered: "",
      plan_type: "",
      sum_assured: "",
      policy_term: "",
      premium_payment_term: "",
      od_commission_percentage: "",
      tp_commission_percentage: "",
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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 rounded-t-3xl sm:-mx-6 -mx-4 lg:-mx-8">
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white/50">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="self-start rounded-full shadow-sm hover:bg-slate-50 transition-all border-slate-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-slate-600" />
            <span className="text-slate-700 font-medium">Back</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">Add New Policy</h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base mt-1">Create a new insurance policy</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearForm}
          className="self-start sm:self-auto text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          <X className="h-4 w-4 mr-1" />
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
        <Card className="shadow-lg shadow-blue-900/5 border border-white/60 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 w-full min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Smart Auto-Fill</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Upload a policy PDF or image and we'll auto extract details.
                  <span className="block mt-1 text-xs text-blue-600">
                    <Share2 className="w-3 h-3 inline mr-1" />
                    Tip: Share PDFs from other apps!
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-white rounded-lg border min-w-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 flex-1 truncate min-w-0">{uploadedFile.name}</span>
                      {parsing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />
                      ) : parseError ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={retryParsing}
                          className="h-7 px-2 text-xs flex-shrink-0"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      ) : (
                        <button onClick={clearUploadedFile} className="p-1 hover:bg-gray-100 rounded flex-shrink-0">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>

                    {/* Progress indicator */}
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

                    {/* Parse error with retry */}
                    {parseError && !parsing && (
                      <Alert variant="destructive" className="py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:justify-between">
                          <span className="text-xs">{parseError}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={retryParsing}
                            className="h-6 px-2 text-xs"
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
                      relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-out
                      ${isDragging
                        ? 'border-blue-500 bg-blue-50/80 scale-[1.01] shadow-inner'
                        : 'border-indigo-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-sm'
                      }
                    `}
                  >
                    <Upload className={`w-6 h-6 sm:w-8 sm:h-8 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                      {parsing ? "Processing..." : isDragging ? "Drop file here" : "Click or drag to upload"}
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

        {/* Replace the monolithic Form Card with distinct sectional cards */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Section 1: Basic Details */}
          <Card className="shadow-md shadow-blue-900/5 border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4 px-5 sm:px-8 bg-gradient-to-r from-blue-50/80 to-slate-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg shadow-sm">
                  <FileText className="h-5 w-5 text-blue-700" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-slate-800">Basic Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pt-6">
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
                  <Label htmlFor="insurance_type" className="text-sm font-medium">
                    Type of Insurance <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.insurance_type}
                    onValueChange={(value) => setFormData({ ...formData, insurance_type: value })}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select insurance type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INSURANCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Auto-detected from document (editable)</p>
                </div>

                {/* Product Name - Dynamic based on insurance type */}
                {productNamesByInsuranceType[formData.insurance_type] && (
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
                      <SelectContent>
                        {productNamesByInsuranceType[formData.insurance_type].map((product) => (
                          <SelectItem key={product} value={product}>
                            {product}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">Auto-detected from document (optional)</p>
                  </div>
                )}

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
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Vehicle Details (Dynamic) */}
          {formData.insurance_type === 'Vehicle Insurance' && (
            <Card className="shadow-md shadow-indigo-900/5 border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-4 px-5 sm:px-8 bg-gradient-to-r from-indigo-50/80 to-slate-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-700"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H8.3a2 2 0 0 0-1.6.8L4 11l-5.16.86a1 1 0 0 0-.84.99V16h3" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-slate-800">Vehicle Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 px-5 sm:px-8 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Label htmlFor="idv" className="text-sm font-medium">
                      IDV (₹)
                    </Label>
                    <Input
                      id="idv"
                      name="idv"
                      type="number"
                      inputMode="numeric"
                      value={formData.idv}
                      onChange={handleInputChange}
                      className="h-10 text-sm"
                      placeholder="e.g., 500000"
                      min="0"
                    />
                    <p className="text-xs text-gray-500">Insured Declared Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 3: Coverage Details (Dynamic) */}
          {(formData.insurance_type === 'Health Insurance' || formData.insurance_type === 'Life Insurance') && (
            <Card className="shadow-md shadow-pink-900/5 border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-4 px-5 sm:px-8 bg-gradient-to-r from-pink-50/80 to-slate-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-700"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-slate-800">Coverage Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 px-5 sm:px-8 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.insurance_type === 'Health Insurance' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sum_insured" className="text-sm font-medium">
                          Sum Insured (₹)
                        </Label>
                        <Input
                          id="sum_insured"
                          name="sum_insured"
                          type="number"
                          inputMode="numeric"
                          value={formData.sum_insured}
                          onChange={handleInputChange}
                          className="h-10 text-sm"
                          placeholder="e.g., 500000"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="members_covered" className="text-sm font-medium">
                          Members Covered
                        </Label>
                        <Input
                          id="members_covered"
                          name="members_covered"
                          type="number"
                          inputMode="numeric"
                          value={formData.members_covered}
                          onChange={handleInputChange}
                          className="h-10 text-sm"
                          placeholder="e.g., 4"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="plan_type" className="text-sm font-medium">
                          Plan Type
                        </Label>
                        <Input
                          id="plan_type"
                          name="plan_type"
                          value={formData.plan_type}
                          onChange={handleInputChange}
                          className="h-10 text-sm"
                          placeholder="e.g., Individual, Family Floater"
                        />
                      </div>
                    </>
                  )}

                  {formData.insurance_type === 'Life Insurance' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sum_assured" className="text-sm font-medium">
                          Sum Assured (₹)
                        </Label>
                        <Input
                          id="sum_assured"
                          name="sum_assured"
                          type="number"
                          inputMode="numeric"
                          value={formData.sum_assured}
                          onChange={handleInputChange}
                          className="h-10 text-sm"
                          placeholder="e.g., 5000000"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="policy_term" className="text-sm font-medium">
                          Policy Term (Years)
                        </Label>
                        <Input
                          id="policy_term"
                          name="policy_term"
                          type="number"
                          inputMode="numeric"
                          value={formData.policy_term}
                          onChange={handleInputChange}
                          className="h-10 text-sm"
                          placeholder="e.g., 20"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="premium_payment_term" className="text-sm font-medium">
                          Premium Payment Term (Years)
                        </Label>
                        <Input
                          id="premium_payment_term"
                          name="premium_payment_term"
                          type="number"
                          inputMode="numeric"
                          value={formData.premium_payment_term}
                          onChange={handleInputChange}
                          className="h-10 text-sm"
                          placeholder="e.g., 15"
                          min="1"
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 4: Premium & Dates */}
          <Card className="shadow-md shadow-emerald-900/5 border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4 px-5 sm:px-8 bg-gradient-to-r from-emerald-50/80 to-slate-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-700"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-slate-800">Premium & Validity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 px-5 sm:px-8 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label className="text-sm font-medium">
                    Risk End Date (RED) <span className="text-red-500">*</span>
                  </Label>
                  <MaterialDatePicker
                    date={policyExpiryDate}
                    onDateChange={(date) => {
                      setDuplicateError(null);
                      setPolicyExpiryDate(date);
                    }}
                    placeholder="Select date"
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
                  <p className="text-xs text-muted-foreground">Auto-extracted from PDF (optional)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="premium_frequency" className="text-sm font-medium">
                    Premium Frequency
                  </Label>
                  <Select
                    value={formData.premium_frequency}
                    onValueChange={(value) => setFormData({ ...formData, premium_frequency: value })}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="single">Single Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.insurance_type === 'Vehicle Insurance' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="basic_od_premium" className="text-sm font-medium">
                        Basic OD Premium (&#x20B9;)
                      </Label>
                      <Input
                        id="basic_od_premium"
                        name="basic_od_premium"
                        type="number"
                        inputMode="decimal"
                        value={formData.basic_od_premium}
                        onChange={handleInputChange}
                        className="h-10 text-sm"
                        placeholder="e.g., 5000"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="basic_tp_premium" className="text-sm font-medium">
                        Basic TP Premium (&#x20B9;)
                      </Label>
                      <Input
                        id="basic_tp_premium"
                        name="basic_tp_premium"
                        type="number"
                        inputMode="decimal"
                        value={formData.basic_tp_premium}
                        onChange={handleInputChange}
                        className="h-10 text-sm"
                        placeholder="e.g., 3000"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Agent & Commission Info */}
          <Card className="shadow-md shadow-amber-900/5 border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4 px-5 sm:px-8 bg-gradient-to-r from-amber-50/80 to-slate-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-700"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-slate-800">Agent & Commission</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 px-5 sm:px-8 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {formData.insurance_type === 'Vehicle Insurance' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="od_commission_amount" className="text-sm font-medium">
                        OD Commission (&#x20B9;)
                      </Label>
                      <Input
                        id="od_commission_amount"
                        name="od_commission_amount"
                        type="number"
                        inputMode="decimal"
                        value={formData.od_commission_amount}
                        onChange={handleInputChange}
                        className="h-10 text-sm"
                        placeholder="e.g., 1500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tp_commission_amount" className="text-sm font-medium">
                        TP Commission (&#x20B9;)
                      </Label>
                      <Input
                        id="tp_commission_amount"
                        name="tp_commission_amount"
                        type="number"
                        inputMode="decimal"
                        value={formData.tp_commission_amount}
                        onChange={handleInputChange}
                        className="h-10 text-sm"
                        placeholder="e.g., 500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="net_commission_amount" className="text-sm font-medium">
                    Net Commission (&#x20B9;)
                  </Label>
                  <Input
                    id="net_commission_amount"
                    name="net_commission_amount"
                    type="number"
                    inputMode="decimal"
                    value={formData.net_commission_amount}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="e.g., 200"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_amount" className="text-sm font-medium">
                    Total Commission (&#x20B9;)
                  </Label>
                  <Input
                    id="commission_amount"
                    name="commission_amount"
                    type="number"
                    inputMode="decimal"
                    value={formData.commission_amount}
                    onChange={handleInputChange}
                    className="h-10 text-sm"
                    placeholder="e.g., 2200"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500">Auto-calculated as OD + TP + Net if missing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>{submitError}</span>
                <Button size="sm" variant="outline" onClick={retrySubmit}>Retry</Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 pb-12 sm:pb-4 flex justify-end">
            <Button
              type="submit"
              className="w-full sm:w-auto min-w-[200px] h-14 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
              disabled={loading || isSubmitting}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Policy...
                </>
              ) : (
                "Save Policy"
              )}
            </Button>
          </div>
          <p className="text-center sm:text-right text-xs text-gray-400 -mt-2">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
        </form>
      </div>
    </div>
  );
};

export default AddPolicy;
