import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

interface MaterialDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function MaterialDatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  className,
}: MaterialDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date);

  const handleOk = () => {
    onDateChange(tempDate);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempDate(date);
    setOpen(false);
  };

  React.useEffect(() => {
    if (open) {
      setTempDate(date);
    }
  }, [open, date]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal h-10 border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
          !date && "text-muted-foreground",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
        {date ? format(date, "PPP") : <span>{placeholder}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-[calc(100vw-2rem)] sm:max-w-[420px] border-0 shadow-2xl overflow-hidden rounded-lg">
          {/* Purple Header */}
          <div style={{ backgroundColor: '#6200EA' }} className="text-white px-6 py-6">
            <div className="text-xs font-medium uppercase tracking-widest opacity-90 mb-3">
              SELECT DATE
            </div>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-normal">
                {tempDate ? format(tempDate, "EEE, MMM d") : "Select date"}
              </div>
              <Pencil className="h-6 w-6 opacity-80" />
            </div>
          </div>

          {/* Calendar Section */}
          <div className="p-4 bg-background">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={setTempDate}
              className="pointer-events-auto"
              initialFocus
            />
          </div>

          {/* Action Buttons */}
          <DialogFooter className="px-6 pb-5 pt-2 flex-row justify-end gap-6 bg-background">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              style={{ color: '#6200EA' }}
              className="hover:bg-transparent font-semibold text-sm uppercase tracking-wide h-auto p-0"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleOk}
              style={{ color: '#6200EA' }}
              className="hover:bg-transparent font-semibold text-sm uppercase tracking-wide h-auto p-0"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
