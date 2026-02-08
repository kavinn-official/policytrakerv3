import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { MaterialDatePicker } from "@/components/ui/material-date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PolicyDateFilterProps {
  fromDate: Date | undefined;
  toDate: Date | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onClear: () => void;
}

const PolicyDateFilter = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
}: PolicyDateFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasFilter = fromDate || toDate;

  const handleClear = () => {
    onClear();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={hasFilter ? "default" : "outline"} 
          size="sm" 
          className="h-10 gap-2"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">
            {hasFilter 
              ? `${fromDate ? format(fromDate, 'dd-MMM-yy') : '...'} - ${toDate ? format(toDate, 'dd-MMM-yy') : '...'}`
              : 'Date Filter'
            }
          </span>
          <span className="sm:hidden">
            {hasFilter ? 'Filtered' : 'Filter'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Filter by Created Date</h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">From Date</label>
              <MaterialDatePicker
                date={fromDate}
                onDateChange={onFromDateChange}
                placeholder="Select start date"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">To Date</label>
              <MaterialDatePicker
                date={toDate}
                onDateChange={onToDateChange}
                placeholder="Select end date"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PolicyDateFilter;
