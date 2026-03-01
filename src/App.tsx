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
import OrganizationSettings from "./pages/OrganizationSettings";
import Departments from "./pages/Departments";
import TeamAnalytics from "./pages/TeamAnalytics";
import TeamBookings from "./pages/TeamBookings";
import TeamCalendar from "./pages/TeamCalendar";
import TeamAvailability from "./pages/TeamAvailability";
import TeamEvents from "./pages/TeamEvents";
import Invitations from "./pages/Invitations";
import Billing from "./pages/Billing";
import Usage from "./pages/Usage";
import Integrations from "./pages/Integrations";
import Security from "./pages/Security";
import AcceptInvite from "./pages/AcceptInvite";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import HelpCenter from "./pages/HelpCenter";
import Documentation from "./pages/Documentation";

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
    return <Navigate to="/login" replace />;
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

// Special route for update-password - ALWAYS accessible, no redirects
function UpdatePasswordRoute({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Always render the update password page, regardless of auth state
  // The page itself will handle expired tokens and errors
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
              {/* ============================================
                  PUBLIC ROUTES - No auth required
                  ============================================ */}
              
              {/* Landing page */}
              <Route path="/" element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              } />
              
              {/* Auth routes */}
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
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />
              
              {/* Accept Invite Route - Public, but handles auth state internally */}
              <Route path="/accept-invite/:token" element={<AcceptInvite />} />
              
              {/* Public booking page - accessible to anyone */}
              <Route path="/:username/:eventSlug" element={<BookingPage />} />
              
              {/* ============================================
                  SPECIAL ROUTE: UPDATE PASSWORD
                  ALWAYS accessible, even with active session
                  ============================================ */}
              <Route path="/update-password" element={
                <UpdatePasswordRoute>
                  <UpdatePassword />
                </UpdatePasswordRoute>
              } />

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
              <Route path="/dashboard/team" element={
                <ProtectedRoute>
                  <Teams />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team/calendar" element={
                <ProtectedRoute>
                  <TeamCalendar />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team/members" element={
                <ProtectedRoute>
                  <TeamManagement />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team/departments" element={
                <ProtectedRoute>
                  <Departments />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team/invitations" element={
                <ProtectedRoute>
                  <Invitations />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team/bookings" element={
                <ProtectedRoute>
                  <TeamBookings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team/availability" element={
                <ProtectedRoute>
                  <TeamAvailability />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team/events" element={
                <ProtectedRoute>
                  <TeamEvents />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/team/analytics" element={
                <ProtectedRoute>
                  <TeamAnalytics />
                </ProtectedRoute>
              } />
              
              {/* ===== ORGANIZATION SETTINGS ===== */}
              <Route path="/dashboard/organization" element={
                <ProtectedRoute>
                  <OrganizationSettings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/billing" element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/usage" element={
                <ProtectedRoute>
                  <Usage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/integrations" element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/security" element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/help" element={
                <ProtectedRoute>
                  <HelpCenter/>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/docs" element={
                <ProtectedRoute>
                  <Documentation />
                </ProtectedRoute>
              } />

              {/* Catch-all for dashboard 404 */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <NotFound />
                </ProtectedRoute>
              } />
              
              {/* Global 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;