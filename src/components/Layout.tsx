
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { User, LogOut, Menu, Shield, Home, FileText, AlertTriangle, CreditCard, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Policies', path: '/policies', icon: FileText },
    { name: 'Due Policies', path: '/due-policies', icon: AlertTriangle },
    { name: 'Subscription', path: '/subscription', icon: CreditCard },
  ];

  // Only show Add Policy for premium users or when subscription is loading
  if (subscribed || subscriptionLoading) {
    navigationItems.push({ name: 'Add Policy', path: '/add-policy', icon: Plus });
  }

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden xs:block min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">AgentHub</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Insurance Management</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4 inline mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile and Desktop User Menu */}
            <div className="flex items-center space-x-2">
              {/* Desktop User Menu */}
              <div className="hidden md:flex items-center space-x-3">
                {user && (
                  <>
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-32">{user.email}</p>
                      <p className="text-xs text-gray-600">
                        {subscribed ? 'Premium User' : 'Free User'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
                          <User className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 z-50 bg-white">
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                {user && (
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72 sm:w-80 z-50 bg-white">
                      <div className="py-6">
                        <div className="space-y-6">
                          <div className="text-center border-b pb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <User className="h-8 w-8 text-white" />
                            </div>
                            <p className="font-medium text-gray-900 text-sm break-all px-2">{user.email}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {subscribed ? 'Premium User' : 'Free User'}
                            </p>
                          </div>
                          
                          <div className="space-y-2 px-2">
                            {navigationItems.map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors min-h-[48px] ${
                                  isActivePath(item.path)
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                              >
                                <item.icon className="h-5 w-5 mr-4 flex-shrink-0" />
                                <span className="font-medium">{item.name}</span>
                              </Link>
                            ))}
                          </div>
                          
                          <div className="border-t pt-6 px-2">
                            <Button 
                              onClick={handleSignOut}
                              variant="outline" 
                              className="w-full justify-start min-h-[48px]"
                            >
                              <LogOut className="h-4 w-4 mr-3" />
                              Sign out
                            </Button>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
