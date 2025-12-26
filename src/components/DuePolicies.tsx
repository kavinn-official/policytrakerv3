
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Phone, AlertTriangle, Calendar, Bell, Download, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from 'xlsx';

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
}

interface DuePolicy extends PolicyData {
  daysLeft: number;
  urgency: string;
  company_name?: string;
  selected?: boolean;
}

const DuePolicies = () => {
  const [duePolicies, setDuePolicies] = useState<DuePolicy[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDuePolicies();

      // Set up real-time subscription to policy changes
      const channel = supabase
        .channel('due-policy-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'policies',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchDuePolicies();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchDuePolicies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('policies')
        .select('id, policy_number, client_name, vehicle_number, vehicle_make, vehicle_model, policy_expiry_date, contact_number, status, reference')
        .eq('user_id', user.id)
        .order('policy_expiry_date', { ascending: true });

      if (error) {
        console.error('Error fetching policies:', error);
        throw error;
      }

      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const duePoliciesData = (data || [])
        .filter((policy: PolicyData) => {
          const expiryDate = new Date(policy.policy_expiry_date);
          return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        })
        .map((policy: PolicyData) => {
          const expiryDate = new Date(policy.policy_expiry_date);
          const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let urgency = "low";
          if (daysLeft <= 7) urgency = "critical";
          else if (daysLeft <= 15) urgency = "high";
          else if (daysLeft <= 21) urgency = "medium";

          return {
            id: policy.id,
            policy_number: policy.policy_number,
            client_name: policy.client_name,
            vehicle_number: policy.vehicle_number,
            vehicle_make: policy.vehicle_make,
            vehicle_model: policy.vehicle_model,
            policy_expiry_date: policy.policy_expiry_date,
            contact_number: policy.contact_number,
            status: policy.status,
            reference: policy.reference,
            company_name: "Not specified", // Default value since column might not exist yet
            daysLeft,
            urgency
          } as DuePolicy;
        });

      setDuePolicies(duePoliciesData);
    } catch (error) {
      console.error('Error fetching due policies:', error);
      toast({
        title: "Error",
        description: "Failed to load due policies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === "critical") return <AlertTriangle className="h-4 w-4" />;
    if (urgency === "high") return <Bell className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const generateWhatsAppMessage = (policy: DuePolicy) => {
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
your policy ${policy.policy_number} is expiring in ${policy.daysLeft} days.
Vehicle Details : ${vehicleDetails}
Registration Number : ${policy.vehicle_number}
Expires : ${formattedExpiry}

Please contact us for renewal.`;
  };

  const handleWhatsApp = (policy: DuePolicy) => {
    const message = generateWhatsAppMessage(policy);
    const phoneNumber = policy.contact_number?.replace(/\D/g, '') || '';
    
    // If no contact number, open WhatsApp with just the message so user can select contact
    const whatsappUrl = phoneNumber 
      ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Message",
      description: phoneNumber 
        ? `Opening WhatsApp for ${policy.client_name}`
        : `Opening WhatsApp - please select a contact`,
    });
  };

  const handleCall = (policy: DuePolicy) => {
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

  const handleRemind = (policy: DuePolicy) => {
    toast({
      title: "Reminder Set",
      description: `Reminder set for policy ${policy.policy_number}`,
    });
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
    if (selectedPolicies.size === duePolicies.length) {
      setSelectedPolicies(new Set());
    } else {
      setSelectedPolicies(new Set(duePolicies.map(p => p.id)));
    }
  };

  const handleBulkWhatsApp = () => {
    const selected = duePolicies.filter(p => selectedPolicies.has(p.id));
    
    if (selected.length === 0) {
      toast({
        title: "No Policies Selected",
        description: "Please select at least one policy to send WhatsApp messages.",
        variant: "destructive",
      });
      return;
    }

    // Open WhatsApp for each selected policy with a delay
    selected.forEach((policy, index) => {
      setTimeout(() => {
        const message = generateWhatsAppMessage(policy);
        const phoneNumber = policy.contact_number?.replace(/\D/g, '') || '';
        const whatsappUrl = phoneNumber 
          ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`
          : `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      }, index * 1000); // 1 second delay between each
    });

    toast({
      title: "Bulk WhatsApp",
      description: `Opening WhatsApp for ${selected.length} policies`,
    });
  };

  const downloadExpiringPolicies = () => {
    if (duePolicies.length === 0) {
      toast({
        title: "No Expiring Policies",
        description: "There are no policies expiring in the next 30 days.",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(duePolicies.map(policy => ({
      'Policy Number': policy.policy_number,
      'Client Name': policy.client_name,
      'Vehicle Number': policy.vehicle_number,
      'Vehicle Make': policy.vehicle_make,
      'Vehicle Model': policy.vehicle_model,
      'Expiry Date': new Date(policy.policy_expiry_date).toLocaleDateString(),
      'Days to Expiry': policy.daysLeft,
      'Urgency': policy.urgency,
      'Status': policy.status,
      'Contact Number': policy.contact_number || '',
      'Reference': policy.reference
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expiring Policies');
    
    const fileName = `expiring_policies_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Download Complete",
      description: `Downloaded ${duePolicies.length} expiring policies to ${fileName}`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading due policies...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Due Policies Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {duePolicies.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <Checkbox
                checked={selectedPolicies.size === duePolicies.length && duePolicies.length > 0}
                onCheckedChange={toggleSelectAll}
                id="selectAll"
              />
              <label htmlFor="selectAll" className="text-sm text-muted-foreground cursor-pointer">
                Select All ({selectedPolicies.size}/{duePolicies.length} selected)
              </label>
            </div>
          )}
          {duePolicies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No policies are due for renewal in the next 30 days.
            </div>
          ) : (
            <div className="space-y-4">
              {duePolicies.map((policy) => (
                <Card key={policy.id} className={`border rounded-lg hover:shadow-md transition-all duration-200 ${
                  policy.urgency === "critical" ? "border-red-200 bg-red-50" :
                  policy.urgency === "high" ? "border-orange-200 bg-orange-50" :
                  policy.urgency === "medium" ? "border-yellow-200 bg-yellow-50" :
                  "border-blue-200 bg-blue-50"
                }`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {/* Header with Badge, Checkbox and Days Left */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedPolicies.has(policy.id)}
                            onCheckedChange={() => togglePolicySelection(policy.id)}
                          />
                          <Badge className={getUrgencyColor(policy.urgency)}>
                            {getUrgencyIcon(policy.urgency)}
                            <span className="ml-1 capitalize">{policy.urgency}</span>
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">
                            {policy.daysLeft} days left
                          </span>
                        </div>
                      </div>
                      
                      {/* Policy Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{policy.client_name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 break-all">{policy.contact_number || 'No contact number'}</p>
                          <p className="text-xs sm:text-sm text-gray-600 break-all">Policy: {policy.policy_number}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900">Vehicle Insurance</p>
                          <p className="text-xs sm:text-sm text-gray-600">{policy.vehicle_make} {policy.vehicle_model}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{policy.vehicle_number}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900">Company & Reference</p>
                          <p className="text-xs sm:text-sm text-gray-600">{policy.company_name || 'Not specified'}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Ref: {policy.reference}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-gray-600">Expires: {new Date(policy.policy_expiry_date).toLocaleDateString()}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Status: {policy.status}</p>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {policy.daysLeft} days remaining
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white min-h-[40px] flex-1 sm:flex-none"
                          onClick={() => handleWhatsApp(policy)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          WhatsApp
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons at Bottom */}
      {duePolicies.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
          <Button 
            variant="default"
            onClick={handleBulkWhatsApp}
            disabled={selectedPolicies.size === 0}
            className="bg-green-600 hover:bg-green-700 text-white min-h-[44px] w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            Send WhatsApp to Selected ({selectedPolicies.size})
          </Button>
          <Button 
            variant="outline"
            onClick={downloadExpiringPolicies}
            className="hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 min-h-[44px] w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Expiring Policies
          </Button>
        </div>
      )}
    </div>
  );
};

export default DuePolicies;
