import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

// Eager load critical landing page for SEO
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";

// Lazy load other pages for performance
const Index = lazy(() => import("./pages/Index"));
const Policies = lazy(() => import("./pages/Policies"));
const DuePoliciesPage = lazy(() => import("./pages/DuePoliciesPage"));
const ExpiredPoliciesPage = lazy(() => import("./pages/ExpiredPoliciesPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AddClient = lazy(() => import("./pages/AddClient"));
const AddPolicy = lazy(() => import("./pages/AddPolicy"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const EditPolicy = lazy(() => import("./pages/EditPolicy"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CancellationRefunds = lazy(() => import("./pages/CancellationRefunds"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const EnquiryPage = lazy(() => import("./pages/EnquiryPage"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage"));
const PremiumCalculatorPage = lazy(() => import("./pages/PremiumCalculatorPage"));
const DemoRequestPage = lazy(() => import("./pages/DemoRequestPage"));
const BulkUploadPage = lazy(() => import("./pages/BulkUploadPage"));

// Admin Panel Pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/expired-policies" element={
                <ProtectedRoute>
                  <Layout>
                    <ExpiredPoliciesPage />
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
              <Route path="/bulk-upload" element={
                <ProtectedRoute>
                  <Layout>
                    <BulkUploadPage />
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
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogArticlePage />} />
              <Route path="/calculator" element={<PremiumCalculatorPage />} />
              <Route path="/demo-request" element={<DemoRequestPage />} />
              
              {/* Admin Panel Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="audit" element={<AdminAuditLogs />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;