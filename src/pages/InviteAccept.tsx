import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const InviteAccept: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('project_invitations')
          .select(`
            *,
            projects (name),
            profiles!project_invitations_invited_by_fkey (full_name, email)
          `)
          .eq('token', token)
          .eq('accepted_at', null)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError('This invitation is invalid, expired, or has already been accepted.');
        } else {
          setInvitation(data);
        }
      } catch (error: any) {
        console.error('Error fetching invitation:', error);
        setError('Failed to load invitation details');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!user) {
      // Redirect to auth with return URL
      navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!token) return;

    setAccepting(true);
    try {
      const { data, error } = await supabase.rpc('accept_project_invitation', {
        invitation_token: token
      });

      if (error) throw error;

      // Type check the response data
      const response = data as any;
      if (response && typeof response === 'object' && 'error' in response) {
        throw new Error(response.error);
      }

      toast({
        title: "Invitation accepted!",
        description: "You have successfully joined the project.",
      });

      // Redirect to the project
      navigate('/');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Failed to accept invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading invitation...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Project Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitation && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg">{invitation.projects?.name}</h3>
                <p className="text-sm text-gray-600">
                  Invited by {invitation.profiles?.full_name || invitation.profiles?.email}
                </p>
                <p className="text-sm text-gray-600">
                  Role: <span className="capitalize font-medium">{invitation.role}</span>
                </p>
              </div>

              {!user ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    You need to sign in to accept this invitation
                  </p>
                  <Button 
                    onClick={() => navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`)}
                    className="w-full"
                  >
                    Sign In to Accept
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Click below to join the project
                  </p>
                  <Button 
                    onClick={handleAcceptInvitation}
                    disabled={accepting}
                    className="w-full"
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Invitation
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteAccept;
