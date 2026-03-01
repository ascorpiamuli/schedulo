// components/RouteGuard.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // List of public routes that don't require auth
    const publicRoutes = [
      '/login',
      '/signup',
      '/forgot-password',
      '/update-password',
      '/verify-email',
      '/accept-invite'
    ];

    const isPublicRoute = publicRoutes.some(route => 
      location.pathname.startsWith(route)
    );

    // If it's the update-password page, ALWAYS allow access
    // The page itself will handle the recovery session check
    if (location.pathname === '/update-password') {
      console.log("🛡️ [RouteGuard] Update password page - allowing access");
      return;
    }

    // If not authenticated and not on public route, redirect to login
    if (!user && !isPublicRoute) {
      console.log("🛡️ [RouteGuard] Not authenticated, redirecting to login");
      navigate('/login', { state: { from: location.pathname } });
    }

    // If authenticated and on public route (except update-password), redirect to dashboard
    if (user && isPublicRoute && location.pathname !== '/update-password') {
      console.log("🛡️ [RouteGuard] Already authenticated, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [user, isLoading, location, navigate]);

  // Always render children for update-password page
  if (location.pathname === '/update-password') {
    return <>{children}</>;
  }

  // For other routes, show nothing while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
      </div>
    );
  }

  // For public routes, always render
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/verify-email', '/accept-invite'];
  if (publicRoutes.some(route => location.pathname.startsWith(route))) {
    return <>{children}</>;
  }

  // For protected routes, only render if authenticated
  return user ? <>{children}</> : null;
}