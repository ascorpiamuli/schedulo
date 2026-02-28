// pages/AcceptInvite.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useAcceptInvite, useValidateInvite } from '@/hooks/use-team-management';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const { data, isLoading: inviteLoading, error } = useValidateInvite(token || null);
  const acceptInvite = useAcceptInvite();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user && token) {
      // Save token to redirect back after login
      sessionStorage.setItem('pendingInviteToken', token);
      navigate(`/login?redirect=/accept-invite/${token}`);
    }
  }, [user, authLoading, token, navigate]);

  // Handle loading states
  if (authLoading || inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#1E3A8A]" />
            <p className="text-lg font-medium">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated - useEffect will handle redirect
  if (!user) {
    return null;
  }

  // Invalid invite
  if (error || data?.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-6">
              {error?.message || data?.error || 'This invitation link is invalid or has expired.'}
            </p>
            <Button onClick={() => navigate('/')} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already a member
  if (data?.is_existing_member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Already a Member</h2>
            <p className="text-gray-600 mb-6">You are already a member of {data.organization_name}.</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Requires signup (shouldn't happen since user is logged in, but handle anyway)
  if (data?.requires_signup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-['Space_Grotesk'] text-[#1E3A8A]">Complete Setup</CardTitle>
            <CardDescription>
              You need to complete your account setup to join {data.organization_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate(`/signup?email=${encodeURIComponent(data.email)}&invite_token=${token}`)}
              className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
            >
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Accept invitation
  const handleAccept = () => {
    if (!token || !user) return;
    
    acceptInvite.mutate({ 
      token, 
      user_id: user.id, 
      user_email: user.email 
    }, {
      onSuccess: () => {
        // Clear any pending invite
        sessionStorage.removeItem('pendingInviteToken');
        navigate('/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-['Space_Grotesk'] text-[#1E3A8A]">Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join {data?.organization_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Role:</strong> {data?.role}<br />
              {data?.department && <><strong>Department:</strong> {data?.department}<br /></>}
            </p>
          </div>
          <Button
            onClick={handleAccept}
            disabled={acceptInvite.isPending}
            className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
          >
            {acceptInvite.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept & Join Team'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}