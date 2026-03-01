// pages/AcceptInvite.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle, Building2, Mail } from 'lucide-react';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [action, setAction] = useState<'processing' | 'success' | 'needs_signup' | 'error'>('processing');

  useEffect(() => {
    const processInvite = async () => {
      if (!token) {
        setError('No invitation token provided');
        setAction('error');
        setLoading(false);
        return;
      }

      try {
        console.log('Processing invite with token:', token);
        
        // Call the database function
        const { data, error: rpcError } = await supabase
          .rpc('accept_invite_by_email', {
            p_invite_token: token
          });

        if (rpcError) {
          console.error('RPC Error:', rpcError);
          throw rpcError;
        }

        console.log('RPC Response:', data);

        if (!data.success) {
          throw new Error(data.error || 'Failed to process invitation');
        }

        setInviteData(data);

        switch (data.action) {
          case 'accepted':
          case 'already_member':
            setAction('success');
            break;
          case 'needs_signup':
            setAction('needs_signup');
            break;
          default:
            setAction('error');
            setError('Unexpected response');
        }

      } catch (err: any) {
        console.error('Error processing invite:', err);
        setError(err.message);
        setAction('error');
      } finally {
        setLoading(false);
      }
    };

    processInvite();
  }, [token]);

  // Redirect after success
  useEffect(() => {
    if (action === 'success') {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [action, navigate]);

  if (loading) {
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

  if (action === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Invitation Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Could not process invitation'}</p>
            <Button onClick={() => navigate('/')} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (action === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 animate-pulse mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              {inviteData?.action === 'already_member' ? 'Already a Member! 🎉' : 'Welcome to the Team! 🎉'}
            </h2>
            <p className="text-gray-600 mb-4">
              {inviteData?.action === 'already_member' 
                ? `You are already a member of ${inviteData.organization_name}`
                : `You have successfully joined ${inviteData.organization_name}`
              }
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard in 3 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (action === 'needs_signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-[#1E3A8A]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-['Space_Grotesk'] text-[#1E3A8A]">
              Create an Account
            </CardTitle>
            <CardDescription>
              You've been invited to join {inviteData?.organization_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invite Details */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-blue-800">
                <strong className="block mb-1">Invitation Details:</strong>
                <span className="block">📧 {inviteData?.email}</span>
                <span className="block">👤 Role: {inviteData?.role}</span>
                {inviteData?.department && (
                  <span className="block">🏢 Department: {inviteData.department}</span>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  const signupUrl = `/signup?email=${encodeURIComponent(inviteData.email)}&role=${inviteData.role}&department=${inviteData.department || ''}&organization=${encodeURIComponent(inviteData.organization_name)}`;
                  navigate(signupUrl);
                }} 
                className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 h-12 text-base"
              >
                Create Account
              </Button>
              <Button 
                onClick={() => navigate('/login')} 
                variant="outline"
                className="w-full h-12 text-base"
              >
                Already have an account? Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}