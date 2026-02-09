import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Car, User, Eye, Edit, Building, Trash2, FileText, AlertTriangle, Heart, Shield } from "lucide-react";
import { Policy, formatDateDDMMYYYY } from "@/utils/policyUtils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PolicyCardProps {
  policy: Policy;
  daysToExpiry: number;
  statusColor: string;
  onViewPolicy: (policy: Policy) => void;
  onEditPolicy: (policy: Policy) => void;
  onDeletePolicy: (policy: Policy) => void;
  onPreviewDocument?: (policy: Policy) => void;
}

// Get icon based on insurance type
const getInsuranceIcon = (insuranceType?: string) => {
  switch (insuranceType) {
    case 'Health Insurance':
      return <Heart className="h-4 w-4 mr-2 sm:mr-3 text-red-500 flex-shrink-0" />;
    case 'Life Insurance':
      return <Shield className="h-4 w-4 mr-2 sm:mr-3 text-emerald-500 flex-shrink-0" />;
    case 'Vehicle Insurance':
    default:
      return <Car className="h-4 w-4 mr-2 sm:mr-3 text-blue-500 flex-shrink-0" />;
  }
};

// Get display text for vehicle/coverage info based on insurance type
const getInsuranceDetailText = (policy: Policy): string => {
  switch (policy.insurance_type) {
    case 'Health Insurance':
      const sumInsured = policy.sum_insured ? `₹${policy.sum_insured.toLocaleString('en-IN')}` : '';
      const members = policy.members_covered ? `${policy.members_covered} members` : '';
      return [sumInsured, members].filter(Boolean).join(' • ') || 'Health Policy';
    case 'Life Insurance':
      const sumAssured = policy.sum_assured ? `₹${policy.sum_assured.toLocaleString('en-IN')}` : '';
      const term = policy.policy_term ? `${policy.policy_term} years` : '';
      return [sumAssured, term].filter(Boolean).join(' • ') || 'Life Policy';
    case 'Vehicle Insurance':
    default:
      const vehicleInfo = [policy.vehicle_number, policy.vehicle_make, policy.vehicle_model].filter(Boolean).join(' - ');
      return vehicleInfo || 'Vehicle Policy';
  }
};

// Check for missing required fields - context-aware
const getMissingFields = (policy: Policy): string[] => {
  const missing: string[] = [];
  if (!policy.policy_number?.trim()) missing.push("Policy Number");
  if (!policy.client_name?.trim()) missing.push("Client Name");
  // Vehicle number only required for Vehicle Insurance
  if (policy.insurance_type === 'Vehicle Insurance' && !policy.vehicle_number?.trim()) {
    missing.push("Vehicle Number");
  }
  if (!policy.policy_active_date) missing.push("Risk Start Date");
  if (!policy.policy_expiry_date) missing.push("Risk End Date");
  return missing;
};

const PolicyCard = ({ policy, daysToExpiry, statusColor, onViewPolicy, onEditPolicy, onDeletePolicy, onPreviewDocument }: PolicyCardProps) => {
  const missingFields = getMissingFields(policy);
  const hasWarning = missingFields.length > 0;
  return (
    <Card className={`shadow-sm hover:shadow-lg transition-all duration-200 ${hasWarning ? 'border-amber-400 border-2' : 'border-gray-200'}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="min-w-0 flex-1 mr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-blue-600 text-base sm:text-lg break-all">{policy.policy_number || "No Policy #"}</h3>
              {policy.document_url && (
                <span title="Document attached">
                  <FileText className="h-4 w-4 text-purple-500 flex-shrink-0" />
                </span>
              )}
              {hasWarning && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-medium text-amber-600">Missing fields:</p>
                    <ul className="text-sm list-disc list-inside">
                      {missingFields.map(field => <li key={field}>{field}</li>)}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{policy.company_name}</p>
          </div>
          <Badge className={`${statusColor} flex-shrink-0 text-xs`}>{policy.status}</Badge>
        </div>
        
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div className="flex items-center text-xs sm:text-sm">
            <User className="h-4 w-4 mr-2 sm:mr-3 text-gray-500 flex-shrink-0" />
            <span className="font-medium truncate">{policy.client_name}</span>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm">
            <Building className="h-4 w-4 mr-2 sm:mr-3 text-gray-500 flex-shrink-0" />
            <span className="text-gray-600 truncate">Agent: {policy.agent_code || '—'}</span>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm">
            {getInsuranceIcon(policy.insurance_type)}
            <span className="truncate">{getInsuranceDetailText(policy)}</span>
          </div>
          
          <div className="flex items-center text-xs sm:text-sm">
            <Calendar className="h-4 w-4 mr-2 sm:mr-3 text-gray-500 flex-shrink-0" />
            <span className="truncate">{formatDateDDMMYYYY(policy.policy_active_date)} - {formatDateDDMMYYYY(policy.policy_expiry_date)}</span>
          </div>
          
          {daysToExpiry <= 30 && (
            <div className="text-xs sm:text-sm text-red-600 font-medium bg-red-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
              {daysToExpiry > 0 ? `${daysToExpiry} days to expiry` : 'Expired'}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewPolicy(policy)}
            className="hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md h-10"
          >
            <Eye className="h-4 w-4 flex-shrink-0" />
            <span className="text-blue-600 font-medium ml-1 hidden sm:inline">View</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditPolicy(policy)}
            className="hover:bg-green-50 hover:border-green-200 transition-all duration-200 shadow-sm hover:shadow-md h-10"
          >
            <Edit className="h-4 w-4 flex-shrink-0" />
            <span className="text-green-600 font-medium ml-1 hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeletePolicy(policy)}
            className="hover:bg-red-50 hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md h-10"
          >
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            <span className="text-red-600 font-medium ml-1 hidden sm:inline">Delete</span>
          </Button>
        </div>
        {policy.document_url && onPreviewDocument && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreviewDocument(policy)}
            className="w-full mt-2 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 shadow-sm hover:shadow-md h-10"
          >
            <FileText className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
            <span className="text-purple-600 font-medium">View Policy Document</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PolicyCard;
