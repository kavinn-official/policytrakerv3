import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Shield } from "lucide-react";

interface ReportFiltersProps {
  insuranceTypes: string[];
  companies: string[];
  selectedType: string;
  selectedCompany: string;
  onTypeChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
}

export const ReportFilters = ({
  insuranceTypes,
  companies,
  selectedType,
  selectedCompany,
  onTypeChange,
  onCompanyChange,
}: ReportFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t">
      <div className="w-full sm:w-48 space-y-2">
        <Label className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Insurance Type
        </Label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {insuranceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-64 space-y-2">
        <Label className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Insurance Company
        </Label>
        <Select value={selectedCompany} onValueChange={onCompanyChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
