import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, RequireAuth } from "@/lib/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EventTypes from "./pages/EventTypes";
import Availability from "./pages/Availability";
import Bookings from "./pages/Bookings";
import DashboardLayout from "./components/DashboardLayout";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import Teams from "./pages/Teams";
import TeamManagement from "./pages/Teams";
import Settings from "./pages/Settings";
import OrganizationSettings from "./pages/OrganizationSettings"; // NEW: Org-level settings
import Departments from "./pages/Departments"; // NEW: Department management
import TeamAnalytics from "./pages/TeamAnalytics"; // NEW: Team performance analytics
import TeamBookings from "./pages/TeamBookings"; // NEW: Team-wide bookings view
import TeamAvailability from "./pages/TeamAvailability"; // NEW: Team availability overview
import TeamEvents from "./pages/TeamEvents"; // NEW: Team event types
import Invitations from "./pages/Invitations"; // NEW: Manage team invitations
import Billing from "./pages/Billing"; // NEW: Organization billing
import Usage from "./pages/Usage"; // NEW: Team usage analytics
import Integrations from "./pages/Integrations"; // NEW: Team integrations
import Security from "./pages/Security"; // NEW: Team security settings

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Loading component
function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

// Public route wrapper (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <Routes>
              {/* Public routes - accessible only when NOT logged in */}
              <Route path="/" element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />
              
              {/* Public booking pages - accessible to everyone (no auth check) */}
              <Route path="/:username" element={<BookingPage />} />
              <Route path="/:username/:eventSlug" element={<BookingPage />} />
              
              {/* ============================================
                  DASHBOARD ROUTES - Protected, require authentication
                  ============================================ */}
              
              {/* Main Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* ===== INDIVIDUAL USER ROUTES ===== */}
              {/* Personal scheduling routes */}
              <Route path="/dashboard/events" element={
                <ProtectedRoute>
                  <EventTypes />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/availability" element={
                <ProtectedRoute>
                  <Availability />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/bookings" element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              } />
              
              {/* ===== TEAM MANAGEMENT ROUTES ===== */}
              {/* Main team overview */}
              <Route path="/dashboard/team" element={
                <ProtectedRoute>
                  <Teams />
                </ProtectedRoute>
              } />
              
              {/* Detailed team management (your current page) */}
              <Route path="/dashboard/team/members" element={
                <ProtectedRoute>
                  <TeamManagement />
                </ProtectedRoute>
              } />
              
              {/* Department management */}
              <Route path="/dashboard/team/departments" element={
                <ProtectedRoute>
                  <Departments />
                </ProtectedRoute>
              } />
              
              {/* Team invitations */}
              <Route path="/dashboard/team/invitations" element={
                <ProtectedRoute>
                  <Invitations />
                </ProtectedRoute>
              } />
              
              {/* Team bookings overview */}
              <Route path="/dashboard/team/bookings" element={
                <ProtectedRoute>
                  <TeamBookings />
                </ProtectedRoute>
              } />
              
              {/* Team availability calendar */}
              <Route path="/dashboard/team/availability" element={
                <ProtectedRoute>
                  <TeamAvailability />
                </ProtectedRoute>
              } />
              
              {/* Team event types */}
              <Route path="/dashboard/team/events" element={
                <ProtectedRoute>
                  <TeamEvents />
                </ProtectedRoute>
              } />
              
              {/* Team analytics */}
              <Route path="/dashboard/team/analytics" element={
                <ProtectedRoute>
                  <TeamAnalytics />
                </ProtectedRoute>
              } />
              
              {/* ===== ORGANIZATION SETTINGS ===== */}
              {/* Organization-level settings */}
              <Route path="/dashboard/organization" element={
                <ProtectedRoute>
                  <OrganizationSettings />
                </ProtectedRoute>
              } />
              
              {/* Billing & subscription */}
              <Route path="/dashboard/billing" element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } />
              
              {/* Usage & limits */}
              <Route path="/dashboard/usage" element={
                <ProtectedRoute>
                  <Usage />
                </ProtectedRoute>
              } />
              
              {/* Integrations */}
              <Route path="/dashboard/integrations" element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              } />
              
              {/* Security settings */}
              <Route path="/dashboard/security" element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              } />
              
              {/* User settings (profile, preferences) */}
              <Route path="/dashboard/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* 404 - catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;