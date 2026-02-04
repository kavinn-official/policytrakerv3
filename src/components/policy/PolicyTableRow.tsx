import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, FileText } from "lucide-react";
import { Policy, formatDateDDMMYYYY } from "@/utils/policyUtils";

interface PolicyTableRowProps {
  policy: Policy;
  daysToExpiry: number;
  statusColor: string;
  onViewPolicy: (policy: Policy) => void;
  onEditPolicy: (policy: Policy) => void;
  onDeletePolicy: (policy: Policy) => void;
  onPreviewDocument?: (policy: Policy) => void;
}

const PolicyTableRow = ({ policy, daysToExpiry, statusColor, onViewPolicy, onEditPolicy, onDeletePolicy, onPreviewDocument }: PolicyTableRowProps) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-blue-600 text-sm sm:text-base">{policy.policy_number}</span>
          {policy.document_url && (
            <span title="Document attached">
              <FileText className="h-4 w-4 text-purple-500" />
            </span>
          )}
        </div>
        <div className="text-xs sm:text-sm text-gray-500">{policy.company_name}</div>
      </td>
      <td className="p-3 sm:p-4">
        <div className="font-medium text-sm sm:text-base">{policy.client_name}</div>
        <div className="text-xs sm:text-sm text-gray-500">Agent: {policy.agent_code}</div>
      </td>
      <td className="p-3 sm:p-4">
        <div className="font-medium text-sm sm:text-base">{policy.vehicle_number}</div>
        <div className="text-xs sm:text-sm text-gray-500">{policy.vehicle_make} {policy.vehicle_model}</div>
      </td>
      <td className="p-3 sm:p-4">
        <div className="text-xs sm:text-sm">{formatDateDDMMYYYY(policy.policy_active_date)}</div>
      </td>
      <td className="p-3 sm:p-4">
        <div className="text-xs sm:text-sm">{formatDateDDMMYYYY(policy.policy_expiry_date)}</div>
        {daysToExpiry <= 30 && (
          <div className="text-xs text-red-600 font-medium mt-1">
            {daysToExpiry > 0 ? `${daysToExpiry} days left` : 'Expired'}
          </div>
        )}
      </td>
      <td className="p-3 sm:p-4">
        <Badge className={`${statusColor} text-xs px-2 py-1`}>{policy.status}</Badge>
      </td>
      <td className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewPolicy(policy)}
            className="h-8 px-2 sm:px-3 text-xs hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md min-w-[70px]"
          >
            <Eye className="h-3 w-3 sm:mr-1 text-blue-600" />
            <span className="hidden sm:inline text-blue-600 font-medium">View</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditPolicy(policy)}
            className="h-8 px-2 sm:px-3 text-xs hover:bg-green-50 hover:border-green-200 transition-all duration-200 shadow-sm hover:shadow-md min-w-[70px]"
          >
            <Edit className="h-3 w-3 sm:mr-1 text-green-600" />
            <span className="hidden sm:inline text-green-600 font-medium">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeletePolicy(policy)}
            className="h-8 px-2 sm:px-3 text-xs hover:bg-red-50 hover:border-red-200 transition-all duration-200 shadow-sm hover:shadow-md min-w-[70px]"
          >
            <Trash2 className="h-3 w-3 sm:mr-1 text-red-600" />
            <span className="hidden sm:inline text-red-600 font-medium">Delete</span>
          </Button>
          {policy.document_url && onPreviewDocument && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreviewDocument(policy)}
              className="h-8 px-2 sm:px-3 text-xs hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 shadow-sm hover:shadow-md min-w-[70px]"
            >
              <FileText className="h-3 w-3 sm:mr-1 text-purple-600" />
              <span className="hidden sm:inline text-purple-600 font-medium">PDF</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PolicyTableRow;
