import { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DuePolicies from "@/components/DuePolicies";
import TodayFollowUps from "@/components/dashboard/TodayFollowUps";
import UpcomingRenewals from "@/components/dashboard/UpcomingRenewals";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Shield, Phone, Mail, Scale, AlertTriangle, Plus, BarChart3, Users, UploadCloud, Calendar as CalendarIcon, Activity } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.full_name) {
        setFullName(data.full_name);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const quickAccessButtons = [
    { name: 'Add Policy', path: '/add-policy', icon: Plus, color: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Policies', path: '/policies', icon: FileText, color: 'bg-slate-700 hover:bg-slate-800' },
    { name: 'View Renewals', path: '/due-policies', icon: CalendarIcon, color: 'bg-emerald-600 hover:bg-emerald-700' },
    { name: 'Reports', path: '/reports', icon: BarChart3, color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 px-3 sm:px-6 lg:px-8 pb-8 pt-2 max-w-7xl mx-auto">
      {/* 1. TOP HEADER & BRANDING */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
            Welcome back, {fullName || user?.email?.split('@')[0] || 'Agent'} 👋
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            PolicyTracker.in • {format(new Date(), "EEEE, MMMM do, yyyy")}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* 2. QUICK ACTIONS */}
        <section aria-label="Quick Actions">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickAccessButtons.map((button) => (
              <Button
                key={button.path}
                onClick={() => navigate(button.path)}
                className={`h-16 sm:h-20 flex items-center justify-start px-4 gap-4 ${button.color} transition-all duration-200 shadow-sm hover:shadow-md rounded-xl w-full border-0`}
              >
                <div className="bg-white/20 p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                  <button.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-white whitespace-nowrap">{button.name}</span>
              </Button>
            ))}
          </div>
        </section>

        {/* 3. KEY METRICS (Top Section) */}
        <section aria-label="Key Metrics">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-500" />
              Portfolio Overview
            </h2>
          </div>
          <DashboardStats />
        </section>

        {/* 4. INSIGHTS & VISUALS (Middle Section - Placeholder for charts) */}
        <section aria-label="Insights & Visuals">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              Analytics & Trends
            </h2>
          </div>
          <DashboardCharts />
        </section>

        {/* 5. ACTION PANELS (Bottom Section) */}
        <section aria-label="Action Panels">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Left Panel: Renewals */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Upcoming Renewals
              </h2>
              <UpcomingRenewals />
            </div>

            {/* Right Panel: Smart Alerts / Today's Tasks & Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Today's Alerts & Tasks
              </h2>
              <TodayFollowUps />

              <div className="pt-2">
                <RecentActivity />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Legal Footer & Redundant Info Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Important Information & Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/terms-conditions"
                className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <Scale className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-center text-gray-900">Terms & Conditions</span>
                <span className="text-xs text-gray-600 mt-1 text-center">Read our terms of service</span>
              </Link>

              <Link
                to="/privacy"
                className="flex flex-col items-center p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <Shield className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-center text-gray-900">Privacy Policy</span>
                <span className="text-xs text-gray-600 mt-1 text-center">How we handle your data</span>
              </Link>

              <Link
                to="/cancellation-refunds"
                className="flex flex-col items-center p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <FileText className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-center text-gray-900">Cancellation & Refunds</span>
                <span className="text-xs text-gray-600 mt-1 text-center">Refund policy details</span>
              </Link>

              <Link
                to="/contact"
                className="flex flex-col items-center p-6 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
              >
                <Phone className="h-8 w-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-center text-gray-900">Contact Us</span>
                <span className="text-xs text-gray-600 mt-1 text-center">Get in touch with support</span>
              </Link>

              <Link
                to="/contact"
                className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <Mail className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-center text-gray-900">Support Center</span>
                <span className="text-xs text-gray-600 mt-1 text-center">Help & documentation</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} PolicyTracker.in. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
