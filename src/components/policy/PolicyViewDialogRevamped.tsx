import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Phone, 
  User, 
  Car, 
  Building, 
  FileText, 
  Hash, 
  Tag, 
  IndianRupee,
  Percent,
  Shield,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Policy, formatDateDDMMYYYY } from "@/utils/policyUtils";
import { differenceInDays } from "date-fns";

interface PolicyViewDialogProps {
  policy: Policy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PolicyViewDialogRevamped = ({ policy, open, onOpenChange }: PolicyViewDialogProps) => {
  if (!policy) return null;

  const expiryDate = new Date(policy.policy_expiry_date);
  const today = new Date();
  const daysRemaining = differenceInDays(expiryDate, today);
  const isExpired = daysRemaining < 0;
  const isCritical = daysRemaining >= 0 && daysRemaining <= 7;
  const isWarning = daysRemaining > 7 && daysRemaining <= 30;

  const getInsuranceIcon = () => {
    switch (policy.insurance_type) {
      case 'Health Insurance':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'Life Insurance':
        return <Shield className="h-5 w-5 text-green-500" />;
      default:
        return <Car className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>;
    }
    if (isCritical) {
      return <Badge className="bg-red-100 text-red-700 text-xs">Critical - {daysRemaining} days left</Badge>;
    }
    if (isWarning) {
      return <Badge className="bg-amber-100 text-amber-700 text-xs">{daysRemaining} days remaining</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>;
  };

  const netPremium = Number(policy.net_premium) || 0;
  const commissionPercent = Number(policy.commission_percentage) || 0;
  const firstYearCommission = Number(policy.first_year_commission) || ((netPremium * commissionPercent) / 100);

  // Check if value is meaningful (not empty, null, undefined, 0, "0", or "00")
  const hasValue = (val: string | number | null | undefined): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'number') return val !== 0;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      // Filter out empty, "0", "00", or any string that's just zeros
      return trimmed !== '' && !/^0+$/.test(trimmed);
    }
    return true;
  };

  const InfoRow = ({ icon: Icon, label, value, iconColor = "text-gray-500" }: { icon: any; label: string; value: string | number | null | undefined; iconColor?: string }) => {
    // Don't render if value is empty/0
    if (!hasValue(value)) return null;
    
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium text-foreground truncate">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] p-0 overflow-hidden [&>button]:top-3 [&>button]:right-3 [&>button]:text-white [&>button]:bg-black/30 [&>button]:rounded-full [&>button]:p-1.5 [&>button]:hover:bg-black/50 [&>button]:z-30">
        {/* Scrollable Container */}
        <ScrollArea className="max-h-[90vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white relative">
            <DialogHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3 pr-10">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                    {getInsuranceIcon()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-white">
                      Policy Details
                    </DialogTitle>
                    <p className="text-blue-100 text-sm mt-0.5 truncate">{policy.insurance_type || 'Vehicle Insurance'}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 mt-1">
                  {getStatusBadge()}
                </div>
              </div>
            </DialogHeader>

            {/* Policy Number Header Card */}
            <div className="mt-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100 text-xs uppercase tracking-wide">Policy Number</span>
              </div>
              <p className="text-lg sm:text-xl font-bold break-all">{policy.policy_number}</p>
              <p className="text-blue-200 text-sm mt-1 truncate">{policy.company_name || 'Insurance Company'}</p>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-5">
            
            {/* Client Information Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-foreground">Client Information</h3>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 space-y-1">
                <InfoRow icon={User} label="Client Name" value={policy.client_name} iconColor="text-blue-600" />
                <Separator className="my-1" />
                <InfoRow icon={Phone} label="Contact Number" value={policy.contact_number} iconColor="text-blue-600" />
                <Separator className="my-1" />
                <InfoRow icon={Building} label="Company" value={policy.company_name} iconColor="text-blue-600" />
              </div>
            </div>

            {/* Vehicle Information Section - Show only for vehicle insurance with actual data */}
            {(policy.insurance_type === 'Vehicle Insurance' || !policy.insurance_type) && 
             (hasValue(policy.vehicle_number) || hasValue(policy.vehicle_make) || hasValue(policy.vehicle_model) || (policy.idv && policy.idv > 0)) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Car className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-foreground">Vehicle Information</h3>
                </div>
                <div className="bg-green-50 rounded-xl p-4 space-y-1">
                  <InfoRow icon={Hash} label="Vehicle Number" value={policy.vehicle_number} iconColor="text-green-600" />
                  {hasValue(policy.vehicle_number) && hasValue(policy.vehicle_make) && <Separator className="my-1" />}
                  <InfoRow icon={Tag} label="Vehicle Make" value={policy.vehicle_make} iconColor="text-green-600" />
                  {(hasValue(policy.vehicle_number) || hasValue(policy.vehicle_make)) && hasValue(policy.vehicle_model) && <Separator className="my-1" />}
                  <InfoRow icon={Tag} label="Vehicle Model" value={policy.vehicle_model} iconColor="text-green-600" />
                  {policy.idv && policy.idv > 0 && (
                    <>
                      {(hasValue(policy.vehicle_number) || hasValue(policy.vehicle_make) || hasValue(policy.vehicle_model)) && <Separator className="my-1" />}
                      <InfoRow icon={IndianRupee} label="IDV" value={`₹${policy.idv.toLocaleString('en-IN')}`} iconColor="text-green-600" />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Life/Health Insurance Specific Fields - Show only if there's actual data */}
            {(policy.insurance_type === 'Life Insurance' || policy.insurance_type === 'Health Insurance') && 
             ((policy.sum_assured && policy.sum_assured > 0) || 
              (policy.sum_insured && policy.sum_insured > 0) || 
              (policy.members_covered && policy.members_covered > 0) || 
              (policy.policy_term && policy.policy_term > 0) || 
              hasValue(policy.plan_type)) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {policy.insurance_type === 'Health Insurance' ? (
                    <Heart className="h-4 w-4 text-red-600" />
                  ) : (
                    <Shield className="h-4 w-4 text-emerald-600" />
                  )}
                  <h3 className="font-semibold text-foreground">Policy Coverage</h3>
                </div>
                <div className={`${policy.insurance_type === 'Health Insurance' ? 'bg-red-50' : 'bg-emerald-50'} rounded-xl p-4 space-y-1`}>
                  {policy.sum_assured && policy.sum_assured > 0 && (
                    <InfoRow 
                      icon={IndianRupee} 
                      label="Sum Assured" 
                      value={`₹${policy.sum_assured.toLocaleString('en-IN')}`} 
                      iconColor={policy.insurance_type === 'Health Insurance' ? "text-red-600" : "text-emerald-600"} 
                    />
                  )}
                  {policy.sum_insured && policy.sum_insured > 0 && (
                    <>
                      {policy.sum_assured && policy.sum_assured > 0 && <Separator className="my-1" />}
                      <InfoRow 
                        icon={IndianRupee} 
                        label="Sum Insured" 
                        value={`₹${policy.sum_insured.toLocaleString('en-IN')}`} 
                        iconColor={policy.insurance_type === 'Health Insurance' ? "text-red-600" : "text-emerald-600"} 
                      />
                    </>
                  )}
                  {policy.members_covered && policy.members_covered > 0 && (
                    <>
                      {((policy.sum_assured && policy.sum_assured > 0) || (policy.sum_insured && policy.sum_insured > 0)) && <Separator className="my-1" />}
                      <InfoRow 
                        icon={User} 
                        label="Members Covered" 
                        value={policy.members_covered} 
                        iconColor={policy.insurance_type === 'Health Insurance' ? "text-red-600" : "text-emerald-600"} 
                      />
                    </>
                  )}
                  {policy.policy_term && policy.policy_term > 0 && (
                    <>
                      <Separator className="my-1" />
                      <InfoRow 
                        icon={Clock} 
                        label="Policy Term" 
                        value={`${policy.policy_term} years`} 
                        iconColor={policy.insurance_type === 'Health Insurance' ? "text-red-600" : "text-emerald-600"} 
                      />
                    </>
                  )}
                  {hasValue(policy.plan_type) && (
                    <>
                      <Separator className="my-1" />
                      <InfoRow 
                        icon={FileText} 
                        label="Plan Type" 
                        value={policy.plan_type} 
                        iconColor={policy.insurance_type === 'Health Insurance' ? "text-red-600" : "text-emerald-600"} 
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Policy Dates Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold text-foreground">Policy Period</h3>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-xs font-medium">Start Date</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatDateDDMMYYYY(policy.policy_active_date)}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                      <AlertCircle className="h-3 w-3" />
                      <span className="text-xs font-medium">End Date</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatDateDDMMYYYY(policy.policy_expiry_date)}</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    isExpired ? 'bg-red-100 text-red-700' :
                    isCritical ? 'bg-red-100 text-red-700' :
                    isWarning ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {isExpired 
                      ? `Expired ${Math.abs(daysRemaining)} days ago`
                      : `${daysRemaining} days remaining`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Premium & Commission Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold text-foreground">Premium & Commission</h3>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 space-y-1">
                <InfoRow icon={IndianRupee} label="Net Premium" value={netPremium ? `₹${netPremium.toLocaleString('en-IN')}` : 'Not provided'} iconColor="text-amber-600" />
                {policy.premium_frequency && (
                  <>
                    <Separator className="my-1" />
                    <InfoRow icon={Calendar} label="Premium Frequency" value={policy.premium_frequency} iconColor="text-amber-600" />
                  </>
                )}
                {commissionPercent > 0 && (
                  <>
                    <Separator className="my-1" />
                    <InfoRow icon={Percent} label="Commission Rate" value={`${commissionPercent}%`} iconColor="text-amber-600" />
                    <Separator className="my-1" />
                    <InfoRow icon={IndianRupee} label="Commission Amount" value={`₹${firstYearCommission.toLocaleString('en-IN')}`} iconColor="text-amber-600" />
                  </>
                )}
              </div>
            </div>

            {/* Agent & Reference Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-foreground">Additional Information</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <InfoRow icon={Hash} label="Agent Code" value={policy.agent_code} iconColor="text-gray-600" />
                <Separator className="my-1" />
                <InfoRow icon={FileText} label="Reference" value={policy.reference} iconColor="text-gray-600" />
                <Separator className="my-1" />
                <InfoRow icon={Tag} label="Status" value={policy.status} iconColor="text-gray-600" />
              </div>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyViewDialogRevamped;
