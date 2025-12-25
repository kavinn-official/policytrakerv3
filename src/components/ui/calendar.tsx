
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown"
      fromYear={1900}
      toYear={2100}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center pt-1 pb-4 relative",
        caption_label: "text-sm font-medium hidden",
        caption_dropdowns: "flex items-center gap-1",
        vhidden: "hidden",
        dropdown: cn(
          "text-sm font-medium text-foreground bg-transparent border-0 hover:bg-transparent focus:outline-none appearance-none cursor-pointer pr-5 relative"
        ),
        dropdown_icon: "absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-60",
        dropdown_month: "",
        dropdown_year: "",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 hover:bg-transparent opacity-60 hover:opacity-100"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse mt-2",
        head_row: "flex mb-2",
        head_cell:
          "text-muted-foreground w-10 font-medium text-xs uppercase",
        row: "flex w-full",
        cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-normal hover:bg-transparent relative rounded-full transition-all"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "rounded-full text-white hover:text-white focus:text-white",
        day_today: "font-medium",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-50",
        day_disabled: "text-muted-foreground opacity-30",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
        DayContent: ({ date, ...props }) => {
          const isToday = new Date().toDateString() === date.toDateString();
          const isSelected = props.activeModifiers?.selected;
          
          return (
            <div className="relative flex items-center justify-center h-full w-full">
              {isSelected && (
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: '#6200EA' }}
                />
              )}
              {isToday && !isSelected && (
                <div 
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: '#757575' }}
                />
              )}
              <span className="relative z-10">{date.getDate()}</span>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
