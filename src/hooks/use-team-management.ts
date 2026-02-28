import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Types
export type TeamRole = 'admin' | 'manager' | 'member' | 'guest';
export type TeamStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: TeamRole;
  department?: string | null;
  title?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  timezone: string;
  status: TeamStatus;
  avatar_url?: string | null;
  full_name?: string | null;
  email: string | null;
  last_active: string | null;
  created_at: string;
  updated_at: string;
  notification_preferences?: any;
  social_links?: any;
  skills?: string[];
  metadata?: any;
  joined_at?: string;
  created_by?: string | null;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  department?: string | null;
  organization_id: string;
  invite_token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  updated_at: string;
  invited_by?: string | null;
  last_resent_at?: string | null;
  resend_count?: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  organization_id: string;
  manager_id?: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface TeamActivity {
  id: string;
  organization_id: string;
  user_id?: string | null;
  user_name?: string | null;
  type: string;
  action: string;
  details?: string | null;
  metadata?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface UserPermissions {
  isAdmin: boolean;
  canManage: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canEdit: boolean;
  role?: TeamRole | null;
}

// Helper to generate invite token
const generateInviteToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};

// Helper to get user email safely using your RPC function
const getUserEmail = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_email', { user_id: userId });
    
    if (error) {
      console.error('Error fetching user email:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error in getUserEmail:', error);
    return null;
  }
};

// Helper to get multiple user emails in batch
const getUserEmailsBatch = async (userIds: string[]): Promise<Map<string, string>> => {
  const emailMap = new Map<string, string>();
  
  if (userIds.length === 0) return emailMap;
  
  try {
    const { data, error } = await supabase
      .rpc('get_user_emails_batch', { user_ids: userIds });
    
    if (!error && data) {
      data.forEach((item: any) => {
        emailMap.set(item.user_id, item.email);
      });
    } else {
      console.warn('Batch email fetch failed, falling back to individual requests');
      await Promise.all(
        userIds.map(async (id) => {
          const email = await getUserEmail(id);
          if (email) emailMap.set(id, email);
        })
      );
    }
  } catch (error) {
    console.error('Error in batch email fetch:', error);
  }
  
  return emailMap;
};

// ============================================
// HOOKS
// ============================================

// Get current user's organization and permissions
export const useCurrentUserPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async (): Promise<UserPermissions> => {
      if (!user) throw new Error('No user logged in');

      try {
        const { data: memberData, error: memberError } = await supabase
          .from('team_members')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) {
          console.error('Error fetching member:', memberError);
        }

        if (!memberData) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();

          if (orgData) {
            return {
              isAdmin: true,
              canManage: true,
              canInvite: true,
              canDelete: true,
              canEdit: true,
              role: 'admin'
            };
          }

          return {
            isAdmin: false,
            canManage: false,
            canInvite: false,
            canDelete: false,
            canEdit: false,
            role: null
          };
        }

        const isAdmin = memberData.role === 'admin';
        const isManager = memberData.role === 'manager';

        return {
          isAdmin,
          canManage: isAdmin || isManager,
          canInvite: isAdmin || isManager,
          canDelete: isAdmin,
          canEdit: isAdmin || isManager,
          role: memberData.role
        };
      } catch (error) {
        console.error('Error in permissions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load permissions',
          variant: 'destructive',
        });
        return {
          isAdmin: false,
          canManage: false,
          canInvite: false,
          canDelete: false,
          canEdit: false,
          role: null
        };
      }
    },
    enabled: !!user,
    retry: 1,
    staleTime: 30000
  });
};

// Get user's organization
export const useOrganization = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['organization', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user logged in');

      try {
        const { data: ownedOrg, error: ownedError } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (ownedError) console.error('Error fetching owned org:', ownedError);
        if (ownedOrg) return ownedOrg;

        const { data: memberData, error: memberError } = await supabase
          .from('team_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) console.error('Error fetching team member:', memberError);

        if (memberData?.organization_id) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', memberData.organization_id)
            .single();

          if (orgError) console.error('Error fetching org:', orgError);
          return org;
        }

        return null;
      } catch (error) {
        console.error('Error fetching organization:', error);
        toast({
          title: 'Error',
          description: 'Failed to load organization',
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!user,
    retry: 1
  });
};

// Get team members with profile info and emails
export const useTeamMembers = () => {
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['team-members', organization?.id],
    queryFn: async (): Promise<TeamMember[]> => {
      if (!organization?.id) return [];

      try {
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false });

        if (membersError) {
          console.error('Error fetching team members:', membersError);
          toast({
            title: 'Error',
            description: 'Failed to fetch team members',
            variant: 'destructive',
          });
          return [];
        }

        if (!members || members.length === 0) return [];

        const userIds = members
          .map(m => m.user_id)
          .filter((id): id is string => !!id);

        let profiles: any[] = [];
        if (userIds.length > 0) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url, timezone')
            .in('user_id', userIds);
          profiles = profileData || [];
        }

        const emailMap = await getUserEmailsBatch(userIds);
        const profileMap = new Map(profiles.map(p => [p.user_id, p]));

        return members.map(member => ({
          ...member,
          full_name: member.user_id ? profileMap.get(member.user_id)?.full_name || null : null,
          email: member.user_id ? emailMap.get(member.user_id) || null : null,
          avatar_url: member.user_id ? profileMap.get(member.user_id)?.avatar_url || null : null,
          timezone: member.user_id ? profileMap.get(member.user_id)?.timezone || member.timezone || 'UTC' : member.timezone || 'UTC',
          last_active: member.last_active || member.updated_at || new Date().toISOString(),
          department: member.department || null,
        }));
      } catch (error) {
        console.error('Error in team members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team members',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!organization?.id,
    retry: 1
  });
};

// Get pending team invites
export const useTeamInvites = () => {
  const { data: organization } = useOrganization();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['team-invites', organization?.id],
    queryFn: async (): Promise<TeamInvite[]> => {
      if (!organization?.id) return [];

      try {
        const { data, error } = await supabase
          .from('team_invites')
          .select('*')
          .eq('organization_id', organization.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching invites:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch invites',
            variant: 'destructive',
          });
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in team invites:', error);
        return [];
      }
    },
    enabled: !!organization?.id
  });
};

// Get departments with member counts
export const useDepartments = () => {
  const { data: organization } = useOrganization();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['departments', organization?.id],
    queryFn: async (): Promise<Department[]> => {
      if (!organization?.id) return [];

      try {
        const { data, error } = await supabase
          .rpc('get_departments_with_stats', {
            p_organization_id: organization.id
          });

        if (!error && data) {
          return data;
        }

        console.warn('RPC failed, falling back to manual department fetch');
        
        const { data: depts, error: deptsError } = await supabase
          .from('departments')
          .select('*')
          .eq('organization_id', organization.id)
          .order('name');

        if (deptsError) {
          console.error('Error fetching departments:', deptsError);
          toast({
            title: 'Error',
            description: 'Failed to fetch departments',
            variant: 'destructive',
          });
          return [];
        }

        const { data: members } = await supabase
          .from('team_members')
          .select('department')
          .eq('organization_id', organization.id);

        const memberCounts: Record<string, number> = {};
        members?.forEach(m => {
          if (m.department) {
            memberCounts[m.department] = (memberCounts[m.department] || 0) + 1;
          }
        });

        return (depts || []).map(dept => ({
          ...dept,
          member_count: memberCounts[dept.name] || 0
        }));
      } catch (error) {
        console.error('Error in departments:', error);
        return [];
      }
    },
    enabled: !!organization?.id
  });
};

// Get team activity
export const useTeamActivity = (limit = 20) => {
  const { data: organization } = useOrganization();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['team-activity', organization?.id, limit],
    queryFn: async (): Promise<TeamActivity[]> => {
      if (!organization?.id) return [];

      try {
        const { data, error } = await supabase
          .from('team_activity')
          .select('*')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching activity:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch activity',
            variant: 'destructive',
          });
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in team activity:', error);
        return [];
      }
    },
    enabled: !!organization?.id
  });
};

// Create invite - UPDATED to use create-team-invite edge function
export const useCreateInvite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: organization } = useOrganization();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { 
      email: string; 
      role: TeamRole; 
      department?: string;
    }) => {
      if (!organization?.id) throw new Error('No organization found');
      if (!user) throw new Error('No user logged in');

      // Call the create-team-invite edge function
      const { data: result, error } = await supabase.functions.invoke('create-team-invite', {
        body: { 
          email: data.email, 
          role: data.role, 
          department: data.department 
        }
      });

      if (error) {
        console.error('Error creating invite:', error);
        throw new Error(error.message || 'Failed to create invitation');
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      return result?.invite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  });
};

// Resend invite - UPDATED to use resend-team-invite edge function
export const useResendInvite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data, error } = await supabase.functions.invoke('resend-team-invite', {
        body: { inviteId }
      });

      if (error) {
        console.error('Error resending invite:', error);
        throw new Error(error.message || 'Failed to resend invitation');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      toast({
        title: 'Success',
        description: 'Invitation resent successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  });
};

// Cancel invite
export const useCancelInvite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('team_invites')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error cancelling invite:', error);
        throw new Error('Failed to cancel invitation');
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      toast({
        title: 'Success',
        description: 'Invitation cancelled successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel invitation',
        variant: 'destructive',
      });
    }
  });
};

// In your hooks file - useAcceptInvite hook
export const useAcceptInvite = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.functions.invoke('accept-team-invite', {
        body: { token }
      });

      if (error) {
        console.error('Error accepting invite:', error);
        throw new Error(error.message || 'Failed to accept invitation');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      if (data?.requires_signup) {
        // Redirect to signup page with email pre-filled
        navigate(`/signup?email=${encodeURIComponent(data.email)}&invite_token=${data.invite_token}`);
        toast({
          title: 'Almost there!',
          description: 'Please create an account to join the team.',
        });
      } else {
        // Successfully joined
        queryClient.invalidateQueries({ queryKey: ['team-members'] });
        queryClient.invalidateQueries({ queryKey: ['team-invites'] });
        queryClient.invalidateQueries({ queryKey: ['organization'] });
        
        toast({
          title: 'Welcome to the team! 🎉',
          description: data.message || 'You have successfully joined the team',
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    }
  });
};

// Validate invite hook
export const useValidateInvite = (token: string | null) => {
  return useQuery({
    queryKey: ['validate-invite', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided');

      const { data, error } = await supabase.functions.invoke('accept-team-invite', {
        body: { token }
      });

      if (error) {
        console.error('Error validating invite:', error);
        throw new Error('Invalid or expired invitation');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    enabled: !!token,
    retry: false,
    staleTime: 0
  });
};
// Update team member
export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ memberId, ...data }: { memberId: string; [key: string]: any }) => {
      const updateData: any = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      });

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', memberId);

      if (error) {
        console.error('Error updating member:', error);
        throw new Error('Failed to update team member');
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-activity'] });
      toast({
        title: 'Success',
        description: 'Team member updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update team member',
        variant: 'destructive',
      });
    }
  });
};

// Remove team member
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        throw new Error('Failed to remove team member');
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-activity'] });
      toast({
        title: 'Success',
        description: 'Team member removed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove team member',
        variant: 'destructive',
      });
    }
  });
};

// Get team member options (for dropdowns)
export const useTeamMemberOptions = () => {
  const { data: members } = useTeamMembers();

  return useQuery({
    queryKey: ['team-member-options'],
    queryFn: () => {
      return (members || []).map(member => ({
        value: member.id,
        label: member.full_name || member.email || 'Unknown',
        email: member.email,
        role: member.role,
        department: member.department
      }));
    },
    enabled: !!members
  });
};

// Get department options (for dropdowns)
export const useDepartmentOptions = () => {
  const { data: departments } = useDepartments();

  return useQuery({
    queryKey: ['department-options'],
    queryFn: () => {
      return (departments || []).map(dept => ({
        value: dept.name,
        label: dept.name,
        color: dept.color,
        member_count: dept.member_count
      }));
    },
    enabled: !!departments
  });
};
