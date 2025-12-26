import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { MaterialDatePicker } from "@/components/ui/material-date-picker";
import { User, Car, FileText, Upload, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { Policy } from "@/utils/policyUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { vehicleMakes, vehicleModels, insuranceCompanies } from "@/data/vehicleData";

interface PolicyEditDialogProps {
  policy: Policy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPolicyUpdated: () => void;
}

const PolicyEditDialog = ({ policy, open, onOpenChange, onPolicyUpdated }: PolicyEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<Policy>>({});
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Helper function to format text to Camel Case
  const toCamelCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (policy) {
      setFormData(policy);
      setActiveDate(new Date(policy.policy_active_date));
      setDocumentFile(null);
    }
  }, [policy]);

  useEffect(() => {
    if (formData.vehicle_make && vehicleModels[formData.vehicle_make]) {
      setAvailableModels(vehicleModels[formData.vehicle_make]);
    } else {
      setAvailableModels([]);
    }
  }, [formData.vehicle_make]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "policy_number") {
      // Allow letters, numbers, and special characters - all uppercase
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (name === "client_name") {
      // Auto-format to Camel Case, letters and spaces only
      const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: toCamelCase(cleanedValue) }));
    } else if (name === "vehicle_number") {
      // Uppercase alphanumeric only
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') }));
    } else if (name === "contact_number") {
      // Only digits, max 10
      const digits = value.replace(/\D/g, '').substring(0, 10);
      setFormData(prev => ({ ...prev, [name]: digits }));
    } else if (name === "agent_code") {
      // Auto-format to Camel Case, letters and spaces only
      const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: toCamelCase(cleanedValue) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setActiveDate(date);
      const localActiveDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const expiryDate = new Date(localActiveDate);
      expiryDate.setDate(expiryDate.getDate() + 365);
      
      const formatLocalDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      setFormData(prev => ({
        ...prev,
        policy_active_date: formatLocalDate(localActiveDate),
        policy_expiry_date: formatLocalDate(expiryDate)
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File",
          description: "Please upload a PDF file only.",
          variant: "destructive",
        });
        return;
      }
      setDocumentFile(file);
    }
  };

  const handleRemoveDocument = async () => {
    if (!policy) return;
    
    setIsUploadingDocument(true);
    try {
      // Delete from storage if exists
      if (formData.document_url) {
        await supabase.storage
          .from('policy-documents')
          .remove([formData.document_url]);
      }

      // Update policy to remove document reference
      const { error } = await supabase
        .from('policies')
        .update({ document_url: null })
        .eq('id', policy.id);

      if (error) throw error;

      setFormData(prev => ({ ...prev, document_url: undefined }));
      setDocumentFile(null);
      
      toast({
        title: "Document Removed",
        description: "Policy document has been removed.",
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: "Error",
        description: "Failed to remove document.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const uploadDocument = async (policyId: string): Promise<string | null> => {
    if (!documentFile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = documentFile.name.split('.').pop();
    const fileName = `${user.id}/${policyId}/${Date.now()}.${fileExt}`;

    // Delete old document if exists
    if (formData.document_url) {
      await supabase.storage
        .from('policy-documents')
        .remove([formData.document_url]);
    }

    const { error: uploadError } = await supabase.storage
      .from('policy-documents')
      .upload(fileName, documentFile, { contentType: 'application/pdf' });

    if (uploadError) throw uploadError;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;

    // Validate vehicle number
    if (!formData.vehicle_number || formData.vehicle_number.trim() === "") {
      toast({
        title: "Error",
        description: "Vehicle number is required",
        variant: "destructive",
      });
      return;
    }

    // Validate contact number (optional, but if provided must be 10 digits)
    if (formData.contact_number && formData.contact_number.replace(/\D/g, '').length !== 10) {
      toast({
        title: "Error",
        description: "Contact number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload document if new file selected
      let documentUrl = formData.document_url;
      if (documentFile) {
        documentUrl = await uploadDocument(policy.id) || undefined;
      }

      // Use edge function for server-side validation
      const { data: result, error: validationError } = await supabase.functions.invoke('validate-policy', {
        body: {
          action: 'update',
          policyId: policy.id,
          data: {
            policy_number: formData.policy_number,
            client_name: formData.client_name,
            vehicle_number: formData.vehicle_number,
            vehicle_make: formData.vehicle_make,
            vehicle_model: formData.vehicle_model,
            policy_active_date: formData.policy_active_date,
            policy_expiry_date: formData.policy_expiry_date,
            status: formData.status,
            agent_code: formData.agent_code,
            reference: formData.reference,
            contact_number: formData.contact_number,
            company_name: formData.company_name,
            document_url: documentUrl,
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
        description: "Policy updated successfully",
      });
      
      onPolicyUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        title: "Error",
        description: "Failed to update policy",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-y-auto bg-white mx-auto">
        <DialogHeader className="pb-4 sm:pb-6 border-b">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-blue-900 flex items-center gap-2 sm:gap-3">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Edit Policy Details
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8 p-2 sm:p-6">
          {/* Client Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-blue-200">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Client Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Policy Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="policy_number"
                    value={formData.policy_number || ''}
                    onChange={handleInputChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm uppercase"
                    placeholder="ABC-123-XYZ"
                    required
                  />
                  <p className="text-xs text-gray-500">Letters, numbers, and special characters (auto CAPS)</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    name="client_name"
                    inputMode="text"
                    value={formData.client_name || ''}
                    onChange={handleInputChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="John Doe"
                    required
                  />
                  <p className="text-xs text-gray-500">Letters only (auto Camel Case)</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Contact Number
                  </Label>
                  <Input
                    name="contact_number"
                    type="tel"
                    inputMode="numeric"
                    value={formData.contact_number || ''}
                    onChange={handleInputChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">10 digits only (optional)</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Insurance Company <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={insuranceCompanies.map(company => ({ value: company, label: company }))}
                    value={formData.company_name || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, company_name: value }))}
                    placeholder="Select insurance company"
                    searchPlaceholder="Search companies..."
                    emptyText="No company found."
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Information Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-green-200">
            <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Car className="h-4 w-4 sm:h-5 sm:w-5" />
              Vehicle Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_number" className="text-xs sm:text-sm font-medium">
                    Vehicle Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="vehicle_number"
                    name="vehicle_number"
                    type="text"
                    value={formData.vehicle_number || ''}
                    onChange={handleInputChange}
                    required
                    className="h-9 sm:h-10 text-xs sm:text-sm uppercase"
                    placeholder="TN01AB1234"
                  />
                  <p className="text-xs text-gray-500">Uppercase letters and numbers only</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Vehicle Make <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={vehicleMakes.map(make => ({ value: make, label: make }))}
                    value={formData.vehicle_make || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, vehicle_make: value, vehicle_model: '' }))}
                    placeholder="Select vehicle make"
                    searchPlaceholder="Search makes..."
                    emptyText="No make found."
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Vehicle Model <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={availableModels.map(model => ({ value: model, label: model }))}
                    value={formData.vehicle_model || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, vehicle_model: value }))}
                    placeholder={formData.vehicle_make ? "Select vehicle model" : "Select make first"}
                    searchPlaceholder="Search models..."
                    emptyText="No model found."
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    disabled={!formData.vehicle_make}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Policy Information Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-purple-200">
            <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Policy Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Agent Name
                  </Label>
                  <Input
                    name="agent_code"
                    value={formData.agent_code || ''}
                    onChange={handleInputChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="Agent Name"
                  />
                  <p className="text-xs text-gray-500">Letters only (auto Camel Case, optional)</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Reference</Label>
                  <Input
                    name="reference"
                    value={formData.reference || ''}
                    onChange={handleInputChange}
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                    placeholder="Enter reference"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">
                    Policy Active Date <span className="text-red-500">*</span>
                  </Label>
                  <MaterialDatePicker
                    date={activeDate || undefined}
                    onDateChange={(date) => handleDateChange(date || null)}
                    placeholder="Select date"
                    className="h-9 sm:h-10 text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium">Policy Expiry Date</Label>
                  <Input
                    value={formData.policy_expiry_date ? format(new Date(formData.policy_expiry_date), "PPP") : "Auto-calculated"}
                    disabled
                    className="h-9 sm:h-10 text-xs sm:text-sm bg-gray-50"
                  />
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Policy Document (PDF)</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                
                {formData.document_url && !documentFile ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 flex-1">Document attached</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveDocument}
                      disabled={isUploadingDocument}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : documentFile ? (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-blue-700 flex-1 truncate">{documentFile.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDocumentFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="h-8"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-16 border-dashed"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Policy Document (PDF)
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Policy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyEditDialog;
