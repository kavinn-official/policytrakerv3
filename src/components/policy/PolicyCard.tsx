import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Car, User, Eye, Edit, Building, Trash2, FileText } from "lucide-react";
import { Policy } from "@/utils/policyUtils";

interface PolicyCardProps {
  policy: Policy;
  daysToExpiry: number;
  statusColor: string;
  onViewPolicy: (policy: Policy) => void;
  onEditPolicy: (policy: Policy) => void;
  onDeletePolicy: (policy: Policy) => void;
  onPreviewDocument?: (policy: Policy) => void;
}

const PolicyCard = ({ policy, daysToExpiry, statusColor, onViewPolicy, onEditPolicy, onDeletePolicy, onPreviewDocument }: PolicyCardProps) => {
  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-200 border-gray-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-blue-600 text-lg">{policy.policy_number}</h3>
              {policy.document_url && (
                <span title="Document attached">
                  <FileText className="h-4 w-4 text-purple-500" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{policy.company_name}</p>
          </div>
          <Badge className={statusColor}>{policy.status}</Badge>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 mr-3 text-gray-500" />
            <span className="font-medium">{policy.client_name}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 mr-3 text-gray-500" />
            <span className="text-gray-600">Agent: {policy.agent_code}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Car className="h-4 w-4 mr-3 text-gray-500" />
            <span>{policy.vehicle_number} - {policy.vehicle_make} {policy.vehicle_model}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-3 text-gray-500" />
            <span>{new Date(policy.policy_active_date).toLocaleDateString()} - {new Date(policy.policy_expiry_date).toLocaleDateString()}</span>
          </div>
          
          {daysToExpiry <= 30 && (
            <div className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">
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
