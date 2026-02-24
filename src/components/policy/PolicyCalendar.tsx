import { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    parseISO
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Policy, getComputedPolicyStatus, getStatusColor } from "@/utils/policyUtils";
import { Badge } from "@/components/ui/badge";

interface PolicyCalendarProps {
    policies: Policy[];
    onViewPolicy: (policy: Policy) => void;
}

const PolicyCalendar = ({ policies, onViewPolicy }: PolicyCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const today = () => setCurrentMonth(new Date());

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={today}>
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEEE";
        const days = [];
        let startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center font-medium text-sm text-gray-500 py-2">
                    {format(addDays(startDate, i), dateFormat).substring(0, 3)}
                </div>
            );
        }

        return <div className="grid grid-cols-7 border-b">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        // Group policies by date for quick lookup
        // We map policy by Risk Start Date ONLY to prevent clutter, per common practice,
        // or by End Date if visualizing renewals. User said "(based on Risk Start Date / Risk End Date)", 
        // Let's use Risk Start Date for the primary mapping to put the policy on the calendar.
        const policiesByDate: Record<string, Policy[]> = {};
        policies.forEach(p => {
            // Risk start date mapping
            if (p.policy_active_date) {
                // try parsing safely in case of timezones
                try {
                    const activeFormat = format(new Date(p.policy_active_date), 'yyyy-MM-dd');
                    if (!policiesByDate[activeFormat]) policiesByDate[activeFormat] = [];
                    policiesByDate[activeFormat].push(p);
                } catch (e) { }
            }
        });

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayPolicies = policiesByDate[dateKey] || [];

                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[120px] p-1 sm:p-2 border-r border-b relative overflow-y-auto ${!isCurrentMonth ? "bg-gray-50/50 text-gray-400" : "bg-white"
                            } ${isToday ? "bg-blue-50/30" : ""}`}
                    >
                        <div className="flex justify-end">
                            <span className={`text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white" : ""
                                }`}>
                                {formattedDate}
                            </span>
                        </div>

                        <div className="mt-1 space-y-1">
                            {dayPolicies.map((policy, idx) => {
                                const status = getComputedPolicyStatus(policy);
                                let statusColor = "";
                                if (status === "Active" || status === "Fresh") statusColor = "bg-green-100 text-green-800";
                                else if (status === "Expired") statusColor = "bg-red-100 text-red-800";
                                else statusColor = "bg-blue-100 text-blue-800";

                                return (
                                    <div
                                        key={policy.id}
                                        onClick={() => onViewPolicy(policy)}
                                        className="cursor-pointer text-xs p-1.5 rounded border bg-white hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden"
                                    >
                                        <div className="font-semibold truncate text-[10px] sm:text-xs text-gray-800">{policy.client_name}</div>
                                        <div className="truncate text-[9px] sm:text-[10px] text-gray-500">{policy.policy_number}</div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="truncate text-[9px] sm:text-[10px] font-medium text-gray-600 max-w-[60%]">{policy.company_name?.substring(0, 10)}</span>
                                            <span className={`text-[8px] sm:text-[9px] px-1 py-0.5 rounded-sm ${statusColor}`}>
                                                {status.substring(0, 1)}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="border-l border-t rounded-lg overflow-hidden">{rows}</div>;
    };

    return (
        <div className="bg-white p-4 rounded-xl border shadow-sm">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

export default PolicyCalendar;
