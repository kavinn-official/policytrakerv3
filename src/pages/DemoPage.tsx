import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  FileText, 
  Users, 
  Bell, 
  BarChart3, 
  Clock, 
  CheckCircle,
  Car,
  Heart,
  Shield,
  Home,
  Plus,
  Eye,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  Menu,
  LogOut,
  User,
  Settings,
  CreditCard
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from '@/assets/logo.png';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

// Extended mock demo data
const demoPolicies = [
  {
    id: "1",
    clientName: "Rajesh Kumar",
    policyNumber: "POL-2024-001234",
    insuranceType: "Motor",
    vehicleNumber: "MH-01-AB-1234",
    vehicleMake: "Maruti",
    vehicleModel: "Swift",
    companyName: "ICICI Lombard",
    premium: 12500,
    activeDate: "2024-01-20",
    expiryDate: "2025-01-20",
    status: "Due Soon",
    daysLeft: 6,
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com"
  },
  {
    id: "2",
    clientName: "Priya Sharma",
    policyNumber: "POL-2024-005678",
    insuranceType: "Health",
    companyName: "Star Health",
    premium: 25000,
    activeDate: "2024-01-25",
    expiryDate: "2025-01-25",
    status: "Due Soon",
    daysLeft: 11,
    phone: "+91 87654 32109",
    email: "priya.sharma@email.com"
  },
  {
    id: "3",
    clientName: "Amit Patel",
    policyNumber: "POL-2024-009012",
    insuranceType: "Motor",
    vehicleNumber: "GJ-05-CD-5678",
    vehicleMake: "Honda",
    vehicleModel: "City",
    companyName: "New India Assurance",
    premium: 8500,
    activeDate: "2024-02-15",
    expiryDate: "2025-02-15",
    status: "Active",
    daysLeft: 32,
    phone: "+91 76543 21098",
    email: "amit.patel@email.com"
  },
  {
    id: "4",
    clientName: "Sunita Verma",
    policyNumber: "POL-2024-003456",
    insuranceType: "Life",
    companyName: "LIC",
    premium: 50000,
    activeDate: "2024-03-10",
    expiryDate: "2025-03-10",
    status: "Active",
    daysLeft: 55,
    phone: "+91 65432 10987",
    email: "sunita.verma@email.com"
  },
  {
    id: "5",
    clientName: "Vikram Singh",
    policyNumber: "POL-2024-007890",
    insuranceType: "Motor",
    vehicleNumber: "DL-08-EF-9012",
    vehicleMake: "Hyundai",
    vehicleModel: "Creta",
    companyName: "Bajaj Allianz",
    premium: 15000,
    activeDate: "2024-01-18",
    expiryDate: "2025-01-18",
    status: "Due Soon",
    daysLeft: 4,
    phone: "+91 54321 09876",
    email: "vikram.singh@email.com"
  },
  {
    id: "6",
    clientName: "Meera Reddy",
    policyNumber: "POL-2024-004567",
    insuranceType: "Health",
    companyName: "HDFC Ergo",
    premium: 35000,
    activeDate: "2024-04-01",
    expiryDate: "2025-04-01",
    status: "Active",
    daysLeft: 78,
    phone: "+91 43210 98765",
    email: "meera.reddy@email.com"
  }
];

const demoStats = {
  totalPolicies: 156,
  dueSoon: 12,
  expiredPolicies: 3,
  newThisMonth: 8,
  totalPremium: 2450000,
  activeClients: 89
};

const demoClients = [
  { name: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh.kumar@email.com", policies: 3, address: "Mumbai, Maharashtra" },
  { name: "Priya Sharma", phone: "+91 87654 32109", email: "priya.sharma@email.com", policies: 2, address: "Delhi" },
  { name: "Amit Patel", phone: "+91 76543 21098", email: "amit.patel@email.com", policies: 4, address: "Ahmedabad, Gujarat" },
  { name: "Sunita Verma", phone: "+91 65432 10987", email: "sunita.verma@email.com", policies: 1, address: "Jaipur, Rajasthan" },
  { name: "Vikram Singh", phone: "+91 54321 09876", email: "vikram.singh@email.com", policies: 2, address: "Delhi" },
];

const DemoPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInsuranceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "motor": return <Car className="h-4 w-4" />;
      case "health": return <Heart className="h-4 w-4" />;
      case "life": return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Due Soon": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Active": return "bg-green-100 text-green-800 border-green-200";
      case "Expired": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const navigationItems = [
    { name: 'Dashboard', id: 'dashboard', icon: Home },
    { name: 'Policies', id: 'policies', icon: FileText },
    { name: 'Due Policies', id: 'due', icon: AlertTriangle },
    { name: 'Add Policy', id: 'addpolicy', icon: Plus },
    { name: 'Reports', id: 'reports', icon: BarChart3 },
    { name: 'Subscription', id: 'subscription', icon: CreditCard },
  ];

  const filteredPolicies = demoPolicies.filter(policy => 
    policy.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 px-4 text-center">
        <p className="text-sm sm:text-base font-medium flex items-center justify-center gap-2 flex-wrap">
          <Eye className="h-4 w-4" />
          <span>You're viewing the Policy Tracker Demo with sample data</span>
          <Link to="/auth">
            <Button size="sm" variant="secondary" className="ml-2 bg-white text-teal-700 hover:bg-gray-100">
              Create Free Account
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </p>
      </div>

      {/* Header - Matches Real App Layout Component */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <img src={logo} alt="Policy Tracker.in" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
              <div className="hidden xs:block min-w-0">
                <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">Policy Tracker.in</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Demo Mode</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4 inline mr-2" />
                  {item.name}
                </button>
              ))}
            </div>

            {/* Desktop User Menu */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">demo@policytracker.in</p>
                  <p className="text-xs text-gray-600">Premium User (Demo)</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-50 bg-white">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/auth" className="flex items-center w-full cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Up Free
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Menu */}
              <div className="lg:hidden">
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
                          <img src={logo} alt="Policy Tracker.in" className="w-16 h-16 mx-auto mb-4" />
                          <p className="font-medium text-gray-900 text-sm">demo@policytracker.in</p>
                          <p className="text-sm text-gray-600 mt-1">Premium User (Demo)</p>
                        </div>
                        
                        <div className="space-y-2 px-2">
                          {navigationItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors min-h-[48px] ${
                                activeTab === item.id
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              <item.icon className="h-5 w-5 mr-4 flex-shrink-0" />
                              <span className="font-medium">{item.name}</span>
                            </button>
                          ))}
                        </div>
                        
                        <div className="border-t pt-6 px-2">
                          <Link to="/auth">
                            <Button className="w-full bg-gradient-to-r from-cyan-600 to-teal-600">
                              Create Free Account
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  Welcome back, Demo User!
                </h1>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                  Here's an overview of your insurance portfolio
                </p>
              </div>
            </div>

            {/* Quick Access */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Add Policy', icon: Plus, color: 'from-green-500 to-green-600' },
                    { name: 'Policies', icon: FileText, color: 'from-indigo-500 to-indigo-600' },
                    { name: 'Due Policies', icon: AlertTriangle, color: 'from-orange-500 to-orange-600' },
                    { name: 'Reports', icon: BarChart3, color: 'from-teal-500 to-teal-600' },
                  ].map((button, index) => (
                    <Button
                      key={index}
                      onClick={() => setActiveTab(button.name.toLowerCase().replace(' ', ''))}
                      className={`h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${button.color} hover:opacity-90 transition-opacity`}
                    >
                      <button.icon className="h-6 w-6 text-white" />
                      <span className="text-sm font-medium text-white">{button.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid - Matching Real App Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Total Policies</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{demoStats.totalPolicies}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Due Soon</p>
                      <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{demoStats.dueSoon}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Active Clients</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{demoStats.activeClients}</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Total Premium</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">₹24.5L</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policies Due This Week */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Policies Due This Week</CardTitle>
                <CardDescription>Send reminders to retain clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoPolicies.filter(p => p.daysLeft <= 7).map(policy => (
                    <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                          {getInsuranceIcon(policy.insuranceType)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{policy.clientName}</p>
                          <p className="text-sm text-gray-500">{policy.policyNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge className={getStatusColor(policy.status)}>{policy.daysLeft} days left</Badge>
                        </div>
                        <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-200 hover:bg-green-50">
                          <MessageCircle className="h-3 w-3" />
                          Remind
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === "policies" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Policies</h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search policies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button className="bg-gradient-to-r from-cyan-600 to-teal-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Policy
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredPolicies.map(policy => (
                <Card key={policy.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getInsuranceIcon(policy.insuranceType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{policy.clientName}</h3>
                            <Badge variant="outline">{policy.insuranceType}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{policy.policyNumber}</p>
                          {policy.vehicleNumber && (
                            <p className="text-sm text-gray-500">{policy.vehicleNumber} • {policy.vehicleMake} {policy.vehicleModel}</p>
                          )}
                          <p className="text-sm text-gray-500">{policy.companyName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{policy.premium.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                            <Calendar className="h-3 w-3" />
                            {new Date(policy.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(policy.status)}>{policy.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Due Policies Tab - Matching real app UI */}
        {activeTab === "due" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Due Policies</h2>
                <p className="text-gray-600 text-sm sm:text-base">Policies expiring in the next 30 days</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Search and Filters - Matching real app */}
            <Card className="shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by client name, policy number..."
                      className="pl-10 h-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 h-10">
                      <Filter className="h-4 w-4" />
                      This Week
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats for Due Policies */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-red-600 font-medium">Critical</p>
                      <p className="text-lg sm:text-xl font-bold text-red-700">2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-yellow-600 font-medium">Due Soon</p>
                      <p className="text-lg sm:text-xl font-bold text-yellow-700">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">Upcoming</p>
                      <p className="text-lg sm:text-xl font-bold text-green-700">7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Due Policies List - Matching real app layout */}
            <div className="space-y-3">
              {demoPolicies.filter(p => p.status === "Due Soon").map((policy, index) => {
                const urgency = policy.daysLeft <= 3 ? 'critical' : policy.daysLeft <= 7 ? 'warning' : 'normal';
                const urgencyStyles = {
                  critical: { bg: 'bg-red-50', border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', icon: 'text-red-500' },
                  warning: { bg: 'bg-yellow-50', border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700', icon: 'text-yellow-500' },
                  normal: { bg: 'bg-green-50', border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', icon: 'text-green-500' }
                };
                const styles = urgencyStyles[urgency];

                return (
                  <Card key={policy.id} className={`${styles.bg} border-0 shadow-sm border-l-4 ${styles.border}`}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Policy Info */}
                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${urgency === 'critical' ? 'bg-red-100' : urgency === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                            {urgency === 'critical' ? (
                              <AlertTriangle className={`h-5 w-5 sm:h-6 sm:w-6 ${styles.icon}`} />
                            ) : (
                              <Clock className={`h-5 w-5 sm:h-6 sm:w-6 ${styles.icon}`} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{policy.clientName}</h3>
                              <Badge variant="outline" className="text-xs">{policy.insuranceType}</Badge>
                              <Badge className={`text-xs ${styles.badge}`}>
                                {policy.daysLeft} days left
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">{policy.policyNumber}</p>
                            <div className="flex flex-wrap gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {policy.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expires: {new Date(policy.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            {policy.vehicleNumber && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                {policy.vehicleNumber} • {policy.vehicleMake} {policy.vehicleModel}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Premium & Actions */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0">
                          <div className="text-left lg:text-right">
                            <p className="text-lg sm:text-xl font-bold text-gray-900">₹{policy.premium.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{policy.companyName}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-1 h-8 sm:h-9 text-xs sm:text-sm">
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                              Call
                            </Button>
                            <Button size="sm" className="gap-1 h-8 sm:h-9 bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
                              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              WhatsApp
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination hint */}
            <div className="text-center text-sm text-gray-500 py-4">
              Showing 3 of 12 due policies • <span className="text-teal-600 cursor-pointer hover:underline">View all policies</span>
            </div>
          </div>
        )}

        {/* Add Policy Tab */}
        {activeTab === "addpolicy" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Policy</h2>
                <p className="text-gray-600">Enter policy details or upload a PDF for auto-fill</p>
              </div>
            </div>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                {/* PDF Upload Section */}
                <div className="mb-8">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors cursor-pointer bg-gradient-to-br from-cyan-50/50 to-teal-50/50">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Upload Policy PDF</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Drag & drop or click to upload. We'll auto-extract policy details using AI.
                    </p>
                    <Button className="bg-gradient-to-r from-cyan-600 to-teal-600">
                      <FileText className="h-4 w-4 mr-2" />
                      Select PDF or Image
                    </Button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Policy Number *</label>
                    <Input placeholder="e.g., POL-2024-001234" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Client Name *</label>
                    <Input placeholder="e.g., Rajesh Kumar" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Insurance Type</label>
                    <select className="w-full h-11 px-3 border rounded-md">
                      <option>Vehicle Insurance</option>
                      <option>Health Insurance</option>
                      <option>Life Insurance</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <Input placeholder="e.g., ICICI Lombard" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Vehicle Number</label>
                    <Input placeholder="e.g., MH-01-AB-1234" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contact Number</label>
                    <Input placeholder="e.g., 9876543210" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Policy Active Date *</label>
                    <Input type="date" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Policy Expiry Date *</label>
                    <Input type="date" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Net Premium (₹)</label>
                    <Input placeholder="e.g., 12500" type="number" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Reference</label>
                    <Input placeholder="Optional reference" className="h-11" />
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                  <Button variant="outline" className="h-11">
                    Cancel
                  </Button>
                  <Button className="h-11 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Save Policy (Demo)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab - Matching real app UI */}
        {activeTab === "reports" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reports & Analytics</h2>
                <p className="text-gray-600 text-sm sm:text-base">View and export your business reports</p>
              </div>
              <Button variant="outline" className="gap-2 self-start sm:self-auto">
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>

            {/* Overall Summary Cards - Matching ReportsPage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Policies</p>
                      <p className="text-4xl font-bold mt-2">156</p>
                      <p className="text-blue-100 text-sm mt-1">
                        01 Dec - 14 Jan 2026
                      </p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-xl">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Net Premium</p>
                      <p className="text-4xl font-bold mt-2">₹24,50,000</p>
                      <p className="text-green-100 text-sm mt-1">
                        Collected in this period
                      </p>
                    </div>
                    <div className="p-4 bg-white/20 rounded-xl">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insurance Type Stats - Matching real app */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Insurance</p>
                      <p className="text-2xl font-bold mt-1">89</p>
                      <p className="text-sm text-gray-500 mt-1">₹14,25,000</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Health Insurance</p>
                      <p className="text-2xl font-bold mt-1">34</p>
                      <p className="text-sm text-gray-500 mt-1">₹5,40,000</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Life Insurance</p>
                      <p className="text-2xl font-bold mt-1">23</p>
                      <p className="text-sm text-gray-500 mt-1">₹3,65,000</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Other Insurance</p>
                      <p className="text-2xl font-bold mt-1">10</p>
                      <p className="text-sm text-gray-500 mt-1">₹1,20,000</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Policy Distribution by Type - Matching reference image */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Policy Distribution by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { type: "Motor", count: 89, percentage: 57, color: "bg-cyan-500" },
                    { type: "Health", count: 34, percentage: 22, color: "bg-green-500" },
                    { type: "Life", count: 23, percentage: 15, color: "bg-purple-500" },
                    { type: "Others", count: 10, percentage: 6, color: "bg-gray-500" },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-900">{item.type}</span>
                        <span className="text-gray-500">{item.count} policies ({item.percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-600">
                Select the perfect plan for your insurance management needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card className="relative overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Free</h3>
                    <p className="text-sm text-gray-500">Perfect for getting started</p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">₹0</span>
                      <span className="text-gray-500">/forever</span>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8">
                    {["Up to 50 Policies", "Basic Dashboard", "Secure Data Storage"].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full h-12" disabled>
                    Current Plan (Demo)
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="relative overflow-hidden ring-2 ring-cyan-600 shadow-xl">
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs font-semibold px-4 py-1.5 rounded-bl-lg">
                    RECOMMENDED
                  </div>
                </div>
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Premium</h3>
                    <p className="text-sm text-gray-500">For professional agents</p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">₹199</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8">
                    {["Unlimited Policies", "Advanced Analytics", "WhatsApp Reminders", "PDF Auto-Fill", "Priority Support"].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/auth">
                    <Button className="w-full h-12 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                      Upgrade Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-cyan-600 to-teal-600 py-12 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Manage Your Policies Like a Pro?
          </h2>
          <p className="text-cyan-100 mb-6">
            Join 1000+ insurance agents who trust Policy Tracker.in
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100 text-lg px-10">
              Create Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <WhatsAppFloatingButton />
    </div>
  );
};

export default DemoPage;
