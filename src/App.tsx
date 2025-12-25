
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
import AddClient from "./pages/AddClient";
import AddPolicy from "./pages/AddPolicy";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import CancellationRefunds from "./pages/CancellationRefunds";
import TermsConditions from "./pages/TermsConditions";
import Shipping from "./pages/Shipping";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={
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
            <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
