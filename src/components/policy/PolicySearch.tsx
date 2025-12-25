
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PolicySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const PolicySearch = ({ searchTerm, onSearchChange }: PolicySearchProps) => {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search policies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 min-h-[44px]"
        />
      </div>
    </div>
  );
};

export default PolicySearch;
