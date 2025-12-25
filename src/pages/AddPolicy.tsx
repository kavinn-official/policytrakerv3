import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { MaterialDatePicker } from "@/components/ui/material-date-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { format, addDays } from "date-fns";
import { vehicleMakes, vehicleModels, insuranceCompanies } from "@/data/vehicleData";

const AddPolicy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
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
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Helper function to format text to Camel Case
  const toCamelCase = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    if (formData.vehicle_make && vehicleModels[formData.vehicle_make]) {
      setAvailableModels(vehicleModels[formData.vehicle_make]);
      // Reset model if it's not valid for the new make
      if (!vehicleModels[formData.vehicle_make].includes(formData.vehicle_model)) {
        setFormData(prev => ({ ...prev, vehicle_model: "" }));
      }
    } else {
      setAvailableModels([]);
    }
  }, [formData.vehicle_make]);

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

    // Validate vehicle number format (alphanumeric, uppercase only)
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

    setLoading(true);

    try {
      // Check policy count for free users
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
        // Count existing policies for this user
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

      const { error } = await supabase.from("policies").insert([
        {
          ...formData,
          policy_active_date: format(policyActiveDate, "yyyy-MM-dd"),
          policy_expiry_date: format(policyExpiryDate, "yyyy-MM-dd"),
          user_id: user?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Policy added successfully!",
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
      // Allow letters, numbers, and special characters - all uppercase
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else if (name === "client_name") {
      // Auto-format to Camel Case, letters and spaces only
      const cleanedValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: toCamelCase(cleanedValue) });
    } else if (name === "vehicle_number") {
      // Uppercase alphanumeric only
      setFormData({ ...formData, [name]: value.toUpperCase().replace(/[^A-Z0-9]/g, '') });
    } else if (name === "contact_number") {
      // Only digits, max 10
      const digits = value.replace(/\D/g, '').substring(0, 10);
      setFormData({ ...formData, [name]: digits });
    } else if (name === "agent_code") {
      // Auto-format to Camel Case, letters and spaces only
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

      <div className="max-w-2xl mx-auto">
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
                    Vehicle Make <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={vehicleMakes.map(make => ({ value: make, label: make }))}
                    value={formData.vehicle_make}
                    onChange={(value) => setFormData({ ...formData, vehicle_make: value })}
                    placeholder="Select vehicle make"
                    searchPlaceholder="Search makes..."
                    emptyText="No make found."
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_model" className="text-sm font-medium">
                    Vehicle Model <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={availableModels.map(model => ({ value: model, label: model }))}
                    value={formData.vehicle_model}
                    onChange={(value) => setFormData({ ...formData, vehicle_model: value })}
                    placeholder={formData.vehicle_make ? "Select vehicle model" : "Select make first"}
                    searchPlaceholder="Search models..."
                    emptyText="No model found."
                    className="h-10 text-sm"
                    disabled={!formData.vehicle_make}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-sm font-medium">
                    Insurance Company <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={insuranceCompanies.map(company => ({ value: company, label: company }))}
                    value={formData.company_name}
                    onChange={(value) => setFormData({ ...formData, company_name: value })}
                    placeholder="Select insurance company"
                    searchPlaceholder="Search companies..."
                    emptyText="No company found."
                    className="h-10 text-sm"
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
