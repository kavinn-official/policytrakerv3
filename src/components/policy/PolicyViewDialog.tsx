
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, User, Car, Building, FileText, Hash, Tag } from "lucide-react";
import { Policy } from "@/utils/policyUtils";

interface PolicyViewDialogProps {
  policy: Policy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PolicyViewDialog = ({ policy, open, onOpenChange }: PolicyViewDialogProps) => {
  if (!policy) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white mx-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-blue-900 flex items-center gap-2 sm:gap-3">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            Policy Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-8 p-2 sm:p-6">
          {/* Policy Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-blue-900 mb-2">{policy.policy_number}</h2>
                <p className="text-base sm:text-xl text-blue-700 font-medium">{policy.company_name || 'Insurance Company'}</p>
              </div>
              <Badge className={`${policy.status === "Fresh" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"} px-3 py-1 text-sm sm:text-lg self-start`}>
                {policy.status}
              </Badge>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Client Information
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700 w-1/3 sm:w-1/4">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="text-xs sm:text-sm">Client Name</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{policy.client_name}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="text-xs sm:text-sm">Contact</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{policy.contact_number || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="text-xs sm:text-sm">Company</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{policy.company_name || 'Not provided'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
            <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Car className="h-4 w-4 sm:h-5 sm:w-5" />
              Vehicle Information
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700 w-1/3 sm:w-1/4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="text-xs sm:text-sm">Vehicle Number</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{policy.vehicle_number}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="text-xs sm:text-sm">Vehicle Make</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{policy.vehicle_make}</td>
                  </tr>
                  <tr>
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="text-xs sm:text-sm">Vehicle Model</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{policy.vehicle_model}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Policy Dates */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200">
            <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              Policy Dates
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700 w-1/3 sm:w-1/4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="text-xs sm:text-sm">Risk Start Date (PSD)</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium text-xs sm:text-sm">{new Date(policy.policy_active_date).toLocaleDateString()}</span>
                        <div className="h-1 w-3 sm:w-4 bg-green-500 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        <span className="text-xs sm:text-sm">Risk End Date (PED)</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-medium text-xs sm:text-sm">{new Date(policy.policy_expiry_date).toLocaleDateString()}</span>
                        <div className="h-1 w-3 sm:w-4 bg-red-500 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-orange-200">
            <h3 className="text-base sm:text-lg font-semibold text-orange-900 mb-3 sm:mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Additional Information
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700 w-1/3 sm:w-1/4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                        <span className="text-xs sm:text-sm">Agent Code</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{policy.agent_code}</td>
                  </tr>
                  <tr>
                    <td className="border-r border-gray-300 bg-gray-50 px-3 py-3 sm:px-4 sm:py-4 font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                        <span className="text-xs sm:text-sm">Reference</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 text-gray-900 font-medium text-xs sm:text-sm">{policy.reference}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyViewDialog;
