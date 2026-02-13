import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "@/lib/auth";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function DashboardPage({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardLayout>{children}</DashboardLayout>
    </RequireAuth>
  );
}

const App = () => (
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
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Dashboard routes - protected */}
            <Route path="/dashboard" element={<DashboardPage><Dashboard /></DashboardPage>} />
            <Route path="/dashboard/events" element={<DashboardPage><EventTypes /></DashboardPage>} />
            <Route path="/dashboard/availability" element={<DashboardPage><Availability /></DashboardPage>} />
            <Route path="/dashboard/bookings" element={<DashboardPage><Bookings /></DashboardPage>} />
            <Route path="/dashboard/team" element={<DashboardPage><div className="text-muted-foreground">Team — coming soon</div></DashboardPage>} />
            <Route path="/dashboard/settings" element={<DashboardPage><div className="text-muted-foreground">Settings — coming soon</div></DashboardPage>} />
            
            {/* Public booking pages - MUST come after dashboard routes */}
             <Route path="/:username" element={<BookingPage />} />            {/* ← THEN THIS */}
            <Route path="/:username/:eventSlug" element={<BookingPage />} /> {/* ← ADD THIS FIRST */}
      
            
            {/* 404 - catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;