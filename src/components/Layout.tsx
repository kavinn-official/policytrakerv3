
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { User, LogOut, Menu, Home, FileText, AlertTriangle, CreditCard, Plus, UserCircle, Settings, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from '@/assets/logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Policies', path: '/policies', icon: FileText },
    { name: 'Due Policies', path: '/due-policies', icon: AlertTriangle },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Subscription', path: '/subscription', icon: CreditCard },
  ];

  // Only show Add Policy for premium users or when subscription is loading
  if (subscribed || subscriptionLoading) {
    navigationItems.push({ name: 'Add Policy', path: '/add-policy', icon: Plus });
  }

  const isActivePath = (path: string) => location.pathname === path;

  const getCurrentPageName = () => {
    const allItems = [
      ...navigationItems,
      { name: 'Profile', path: '/profile', icon: UserCircle },
      { name: 'Settings', path: '/settings', icon: Settings },
      { name: 'Add Client', path: '/add-client', icon: Plus },
      { name: 'Edit Policy', path: '/edit-policy', icon: FileText },
      { name: 'Bulk Upload', path: '/bulk-upload', icon: FileText },
      { name: 'Expired Policies', path: '/expired-policies', icon: AlertTriangle },
    ];
    const match = allItems.find(i => location.pathname === i.path || (i.path !== '/dashboard' && location.pathname.startsWith(i.path)));
    return match?.name || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <img src={logo} alt="Policy Tracker.in" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
              {/* Desktop: show brand name */}
              <div className="hidden lg:block min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-foreground truncate">Policy Tracker.in</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Insurance Management</p>
              </div>
              {/* Mobile: show current page name */}
              <div className="lg:hidden min-w-0">
                <h1 className="text-sm font-bold text-foreground truncate">{getCurrentPageName()}</h1>
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
              <div className="hidden lg:flex items-center space-x-3">
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
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link to="/profile" className="flex items-center w-full">
                            <UserCircle className="h-4 w-4 mr-2" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link to="/settings" className="flex items-center w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
              <div className="lg:hidden">
                {user && (
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-72 sm:w-80 z-50 bg-white overflow-y-auto">
                      <div className="py-6">
                        <div className="space-y-6">
                          <div className="text-center border-b pb-6">
                            <img src={logo} alt="Policy Tracker.in" className="w-16 h-16 mx-auto mb-4" />
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
                          
                          <div className="border-t pt-4 mt-2 space-y-2 px-2">
                            <Link
                              to="/profile"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors min-h-[48px] ${
                                isActivePath('/profile')
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              <UserCircle className="h-5 w-5 mr-4 flex-shrink-0" />
                              <span className="font-medium">Profile</span>
                            </Link>
                            <Link
                              to="/settings"
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors min-h-[48px] ${
                                isActivePath('/settings')
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              <Settings className="h-5 w-5 mr-4 flex-shrink-0" />
                              <span className="font-medium">Settings</span>
                            </Link>
                          </div>
                          
                          <div className="border-t pt-6 px-2">
                            <Button 
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                handleSignOut();
                              }}
                              variant="destructive" 
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