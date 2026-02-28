// pages/AcceptInvite.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useValidateInvite } from '@/hooks/use-team-management';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  // Single hook that handles both validation and acceptance
  const { data, isLoading, error } = useValidateInvite(
    token || null, 
    user ? { user_id: user.id, user_email: user.email } : null
  );

  // Debug logging
  useEffect(() => {
    console.log('🔍 AcceptInvite state:', {
      token,
      user: user?.email,
      authLoading,
      isLoading,
      data,
      error: error?.message
    });
  }, [token, user, authLoading, isLoading, data, error]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user && token) {
      console.log('🔐 No user, redirecting to login...');
      sessionStorage.setItem('pendingInviteToken', token);
      navigate(`/login?redirect=/accept-invite/${token}`);
    }
  }, [user, authLoading, token, navigate]);

  // After successful accept, redirect to dashboard
  useEffect(() => {
    if (data?.accepted || data?.is_existing_member) {
      console.log('✅ Invite accepted successfully, redirecting to dashboard...');
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [data, navigate]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#1E3A8A]" />
            <p className="text-lg font-medium">Processing your invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Invitation Error</h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <Button onClick={() => navigate('/')} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data yet
  if (!data) {
    return null;
  }

  // Success state (already accepted)
  if (data.accepted || data.is_existing_member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 animate-pulse mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              {data.is_existing_member ? 'Already a Member! 🎉' : 'Welcome to the Team! 🎉'}
            </h2>
            <p className="text-gray-600 mb-4">
              {data.is_existing_member 
                ? `You are already a member of ${data.organization_name}`
                : `You have successfully joined ${data.organization_name}`
              }
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Should not reach here - if we have data but not accepted, it means
  // the user info wasn't provided (shouldn't happen because we check user above)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-['Space_Grotesk'] text-[#1E3A8A]">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/')} className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}