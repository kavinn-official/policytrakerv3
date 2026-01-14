import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Policies from "./pages/Policies";
import DuePoliciesPage from "./pages/DuePoliciesPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AddClient from "./pages/AddClient";
import AddPolicy from "./pages/AddPolicy";
import ReportsPage from "./pages/ReportsPage";
import EditPolicy from "./pages/EditPolicy";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import CancellationRefunds from "./pages/CancellationRefunds";
import TermsConditions from "./pages/TermsConditions";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import LandingPage from "./pages/LandingPage";
import EnquiryPage from "./pages/EnquiryPage";
import DemoPage from "./pages/DemoPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Index />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/policies" element={
              <ProtectedRoute>
                <Layout>
                  <Policies />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/due-policies" element={
              <ProtectedRoute>
                <Layout>
                  <DuePoliciesPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute>
                <Layout>
                  <SubscriptionPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/add-client" element={
              <ProtectedRoute>
                <Layout>
                  <AddClient />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/add-policy" element={
              <ProtectedRoute>
                <Layout>
                  <AddPolicy />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/edit-policy/:policyId" element={
              <ProtectedRoute>
                <Layout>
                  <EditPolicy />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/enquiry" element={<EnquiryPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;