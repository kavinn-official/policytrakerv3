import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calendar
} from "lucide-react";
import logo from '@/assets/logo.png';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

// Mock demo data
const demoPolicies = [
  {
    id: "1",
    clientName: "Rajesh Kumar",
    policyNumber: "POL-2024-001234",
    insuranceType: "Motor",
    vehicleNumber: "MH-01-AB-1234",
    companyName: "ICICI Lombard",
    premium: 12500,
    expiryDate: "2025-01-20",
    status: "Due Soon",
    daysLeft: 6,
    phone: "+91 98765 43210"
  },
  {
    id: "2",
    clientName: "Priya Sharma",
    policyNumber: "POL-2024-005678",
    insuranceType: "Health",
    companyName: "Star Health",
    premium: 25000,
    expiryDate: "2025-01-25",
    status: "Due Soon",
    daysLeft: 11,
    phone: "+91 87654 32109"
  },
  {
    id: "3",
    clientName: "Amit Patel",
    policyNumber: "POL-2024-009012",
    insuranceType: "Motor",
    vehicleNumber: "GJ-05-CD-5678",
    companyName: "New India Assurance",
    premium: 8500,
    expiryDate: "2025-02-15",
    status: "Active",
    daysLeft: 32,
    phone: "+91 76543 21098"
  },
  {
    id: "4",
    clientName: "Sunita Verma",
    policyNumber: "POL-2024-003456",
    insuranceType: "Life",
    companyName: "LIC",
    premium: 50000,
    expiryDate: "2025-03-10",
    status: "Active",
    daysLeft: 55,
    phone: "+91 65432 10987"
  },
  {
    id: "5",
    clientName: "Vikram Singh",
    policyNumber: "POL-2024-007890",
    insuranceType: "Motor",
    vehicleNumber: "DL-08-EF-9012",
    companyName: "Bajaj Allianz",
    premium: 15000,
    expiryDate: "2025-01-18",
    status: "Due Soon",
    daysLeft: 4,
    phone: "+91 54321 09876"
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

const DemoPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50">
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

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logo} alt="Policy Tracker" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Policy Tracker.in</h1>
                <p className="text-xs text-gray-600">Demo Mode</p>
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <FileText className="h-4 w-4 hidden sm:block" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="due" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              Due Soon
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4 hidden sm:block" />
              Clients
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Dashboard</h2>
                <p className="text-gray-600">Overview of your insurance business</p>
              </div>
              <Button className="hidden sm:flex bg-gradient-to-r from-cyan-600 to-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Policies</p>
                      <p className="text-3xl font-bold text-gray-900">{demoStats.totalPolicies}</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Due Soon</p>
                      <p className="text-3xl font-bold text-yellow-600">{demoStats.dueSoon}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Clients</p>
                      <p className="text-3xl font-bold text-gray-900">{demoStats.activeClients}</p>
                    </div>
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Premium</p>
                      <p className="text-2xl font-bold text-gray-900">₹24.5L</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-sm">
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
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Policies</h2>
              <Button className="bg-gradient-to-r from-cyan-600 to-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </div>

            <div className="grid gap-4">
              {demoPolicies.map(policy => (
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
                            <p className="text-sm text-gray-500">{policy.vehicleNumber}</p>
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
          </TabsContent>

          {/* Due Soon Tab */}
          <TabsContent value="due" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Policies Due Soon</h2>
                <p className="text-gray-600">Send reminders before expiry</p>
              </div>
            </div>

            <div className="grid gap-4">
              {demoPolicies.filter(p => p.status === "Due Soon").map(policy => (
                <Card key={policy.id} className="bg-white border-0 shadow-sm border-l-4 border-l-yellow-400">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{policy.clientName}</h3>
                          <p className="text-sm text-gray-500">{policy.policyNumber}</p>
                          <p className="text-sm text-gray-500">{policy.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-yellow-600">{policy.daysLeft} days left</p>
                          <p className="text-sm text-gray-500">₹{policy.premium.toLocaleString()}</p>
                        </div>
                        <Button className="gap-2 bg-green-600 hover:bg-green-700">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Clients</h2>
              <Button className="bg-gradient-to-r from-cyan-600 to-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(new Set(demoPolicies.map(p => p.clientName))).map((clientName, index) => {
                const clientPolicies = demoPolicies.filter(p => p.clientName === clientName);
                return (
                  <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {clientName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{clientName}</h3>
                          <p className="text-sm text-gray-500">{clientPolicies[0].phone}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{clientPolicies.length} Policies</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-r from-cyan-600 to-teal-600 border-0 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Manage Your Policies?</h3>
            <p className="text-cyan-100 mb-6 max-w-2xl mx-auto">
              Start your free account today. No credit card required. Add up to 50 policies free forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/enquiry">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2025 policytracker.in. All rights reserved.</p>
        </div>
      </footer>

      <WhatsAppFloatingButton />
    </div>
  );
};

export default DemoPage;
