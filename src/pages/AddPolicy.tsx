import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialDatePicker } from "@/components/ui/material-date-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Upload, FileText, Loader2, Sparkles, X } from "lucide-react";
import { format, addDays, parse } from "date-fns";

const AddPolicy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
  });
  const [policyActiveDate, setPolicyActiveDate] = useState<Date>();
  const [policyExpiryDate, setPolicyExpiryDate] = useState<Date>();

  const toCamelCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF or image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setParsing(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
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
        
        // Update form with extracted data
        setFormData(prev => ({
          ...prev,
          policy_number: extracted.policy_number || prev.policy_number,
          client_name: extracted.client_name ? toCamelCase(extracted.client_name) : prev.client_name,
          vehicle_number: extracted.vehicle_number?.toUpperCase().replace(/[^A-Z0-9]/g, '') || prev.vehicle_number,
          vehicle_make: extracted.vehicle_make || prev.vehicle_make,
          vehicle_model: extracted.vehicle_model || prev.vehicle_model,
          company_name: extracted.company_name || prev.company_name,
          contact_number: extracted.contact_number?.replace(/\D/g, '').substring(0, 10) || prev.contact_number,
        }));

        // Parse dates if available
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!policyActiveDate || !policyExpiryDate) {
      toast({
        title: "Error",
        description: "Please select policy active date",
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
    }
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

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
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

      <div className="max-w-2xl mx-auto space-y-4">
        {/* PDF Upload Card */}
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
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
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
                  <label
                    htmlFor="pdf-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {parsing ? "Processing..." : "Upload Document"}
                    </span>
                  </label>
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
                    className="h-10 text-sm uppercase"
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
                  disabled={loading}
                  className="w-full h-10 text-sm"
                >
                  {loading ? "Adding Policy..." : "Add Policy"}
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
