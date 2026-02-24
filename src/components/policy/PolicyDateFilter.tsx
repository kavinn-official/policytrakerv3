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
  rsdFromDate: Date | undefined;
  rsdToDate: Date | undefined;
  onRsdFromChange: (date: Date | undefined) => void;
  onRsdToChange: (date: Date | undefined) => void;

  redFromDate: Date | undefined;
  redToDate: Date | undefined;
  onRedFromChange: (date: Date | undefined) => void;
  onRedToChange: (date: Date | undefined) => void;

  createdFromDate: Date | undefined;
  createdToDate: Date | undefined;
  onCreatedFromChange: (date: Date | undefined) => void;
  onCreatedToChange: (date: Date | undefined) => void;

  onClear: () => void;
}

const PolicyDateFilter = ({
  rsdFromDate, rsdToDate, onRsdFromChange, onRsdToChange,
  redFromDate, redToDate, onRedFromChange, onRedToChange,
  createdFromDate, createdToDate, onCreatedFromChange, onCreatedToChange,
  onClear,
}: PolicyDateFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasFilter = rsdFromDate || rsdToDate || redFromDate || redToDate || createdFromDate || createdToDate;

  const handleClear = () => {
    onClear();
    setIsOpen(false);
  };

  const getLabel = () => {
    if (hasFilter) return "Filters Active";
    return "Date Filters";
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
            {getLabel()}
          </span>
          <span className="sm:hidden">
            {hasFilter ? 'Filtered' : 'Filter'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-4 max-h-[80vh] overflow-y-auto" align="end">
        <div className="space-y-6">
          {/* Risk Start Date Filter */}
          <div className="space-y-3 border-b-2 pb-4">
            <h4 className="font-medium text-sm text-gray-800">Risk Start Date</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From</label>
                <MaterialDatePicker
                  date={rsdFromDate}
                  onDateChange={onRsdFromChange}
                  placeholder="Start date"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To</label>
                <MaterialDatePicker
                  date={rsdToDate}
                  onDateChange={onRsdToChange}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Risk End Date Filter */}
          <div className="space-y-3 border-b-2 pb-4">
            <h4 className="font-medium text-sm text-gray-800">Risk End Date</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From</label>
                <MaterialDatePicker
                  date={redFromDate}
                  onDateChange={onRedFromChange}
                  placeholder="Start date"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To</label>
                <MaterialDatePicker
                  date={redToDate}
                  onDateChange={onRedToChange}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {/* Created Date Filter */}
          <div className="space-y-3 pb-2">
            <h4 className="font-medium text-sm text-gray-800">Created Date</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From</label>
                <MaterialDatePicker
                  date={createdFromDate}
                  onDateChange={onCreatedFromChange}
                  placeholder="Start date"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To</label>
                <MaterialDatePicker
                  date={createdToDate}
                  onDateChange={onCreatedToChange}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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
