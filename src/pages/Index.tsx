import { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import DuePolicies from "@/components/DuePolicies";
import UsageIndicators from "@/components/dashboard/UsageIndicators";
import CommissionSummary from "@/components/dashboard/CommissionSummary";
import TodayFollowUps from "@/components/dashboard/TodayFollowUps";
import UpcomingRenewals from "@/components/dashboard/UpcomingRenewals";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Shield, Phone, Mail, Scale, AlertTriangle, Plus, BarChart3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

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
    { name: 'Add Policy', path: '/add-policy', icon: Plus, color: 'from-green-500 to-green-600' },
    { name: 'Policies', path: '/policies', icon: FileText, color: 'from-indigo-500 to-indigo-600' },
    { name: 'Due Policies', path: '/due-policies', icon: AlertTriangle, color: 'from-orange-500 to-orange-600' },
    { name: 'Reports', path: '/reports', icon: BarChart3, color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {fullName || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Here's an overview of your insurance portfolio
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Quick Access Buttons - Now visible on both mobile and web */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickAccessButtons.map((button) => (
                <Button
                  key={button.path}
                  onClick={() => navigate(button.path)}
                  className={`h-20 sm:h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${button.color} hover:opacity-90 transition-opacity`}
                >
                  <button.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  <span className="text-xs sm:text-sm font-medium text-white text-center">{button.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Dashboard Stats */}
        <DashboardStats />
        
        {/* Dashboard Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <UsageIndicators />
          <CommissionSummary />
          <TodayFollowUps />
          <UpcomingRenewals />
        </div>
        
        {/* Due Policies */}
        <DuePolicies />
        
        {/* Policy Pages Section */}
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
      </div>
    </div>
  );
};

export default Index;
