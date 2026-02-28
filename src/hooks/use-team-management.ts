// hooks/use-team-management.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

// Types
export type TeamRole = 'admin' | 'manager' | 'member' | 'guest';
export type TeamStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: TeamRole;
  department?: string;
  title?: string;
  phone?: string;
  location?: string;
  bio?: string;
  timezone: string;
  status: TeamStatus;
  avatar_url?: string;
  full_name?: string;
  email: string;
  last_active: string;
  created_at: string;
  updated_at: string;
  notification_preferences?: any;
  social_links?: any;
  skills?: string[];
  metadata?: any;
  joined_at?: string;
  created_by?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  department?: string;
  organization_id: string;
  invite_token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  updated_at: string;
  invited_by?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  color: string;
  organization_id: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface TeamActivity {
  id: string;
  organization_id: string;
  user_id?: string;
  user_name?: string;
  type: string;
  action: string;
  details?: string;
  metadata?: any;
  created_at: string;
}

export interface UserPermissions {
  isAdmin: boolean;
  canManage: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canEdit: boolean;
}

// Helper to generate invite token
const generateInviteToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
};

// Helper to get user email safely
const getUserEmail = async (userId: string): Promise<string> => {
  try {
    // Try to get email from auth.users via a database function
    // You'll need to create this function in Supabase
    const { data, error } = await supabase
      .rpc('get_user_email', { user_id: userId });
    
    if (error) {
      console.error('Error fetching user email:', error);
      return '';
    }
    
    return data || '';
  } catch (error) {
    console.error('Error in getUserEmail:', error);
    return '';
  }
};

// ============================================
// HOOKS
// ============================================

// Get current user's organization and permissions
export const useCurrentUserPermissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async (): Promise<UserPermissions> => {
      if (!user) throw new Error('No user logged in');

      try {
        // Get user's role from team_members
        const { data: memberData, error: memberError } = await supabase
          .from('team_members')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) {
          console.error('Error fetching member:', memberError);
        }

        // If not a team member, check if they're the organization owner
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
              canEdit: true
            };
          }

          return {
            isAdmin: false,
            canManage: false,
            canInvite: false,
            canDelete: false,
            canEdit: false
          };
        }

        const isAdmin = memberData.role === 'admin';
        const isManager = memberData.role === 'manager';

        return {
          isAdmin,
          canManage: isAdmin || isManager,
          canInvite: isAdmin || isManager,
          canDelete: isAdmin,
          canEdit: isAdmin || isManager
        };
      } catch (error) {
        console.error('Error in permissions:', error);
        return {
          isAdmin: false,
          canManage: false,
          canInvite: false,
          canDelete: false,
          canEdit: false
        };
      }
    },
    enabled: !!user,
    retry: 1,
    staleTime: 30000 // 30 seconds
  });
};

// Get user's organization
export const useOrganization = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['organization', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user logged in');

      try {
        // First try to find organization where user is owner
        const { data: ownedOrg } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (ownedOrg) return ownedOrg;

        // Then try to find through team membership
        const { data: memberData } = await supabase
          .from('team_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberData?.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', memberData.organization_id)
            .single();

          return org;
        }

        return null;
      } catch (error) {
        console.error('Error fetching organization:', error);
        return null;
      }
    },
    enabled: !!user,
    retry: 1
  });
};

// Get team members with profile info
export const useTeamMembers = () => {
  const { user } = useAuth();
  const { data: organization } = useOrganization();

  return useQuery({
    queryKey: ['team-members', organization?.id],
    queryFn: async (): Promise<TeamMember[]> => {
      if (!organization?.id) return [];

      try {
        // First get all team members
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select('*')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false });

        if (membersError) {
          console.error('Error fetching team members:', membersError);
          return [];
        }

        // Then get profiles for each member
        const membersWithProfiles = await Promise.all(
          members.map(async (member) => {
            // Get profile data
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, timezone')
              .eq('user_id', member.user_id)
              .maybeSingle();

            // Get email (you'll need to create a get_user_email function in Supabase)
            const email = await getUserEmail(member.user_id);

            return {
              ...member,
              full_name: profile?.full_name || '',
              avatar_url: profile?.avatar_url,
              email: email,
              timezone: profile?.timezone || member.timezone || 'UTC',
              last_active: member.last_active || member.updated_at || new Date().toISOString()
            };
          })
        );

        return membersWithProfiles;
      } catch (error) {
        console.error('Error in team members:', error);
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

// Get departments
export const useDepartments = () => {
  const { data: organization } = useOrganization();

  return useQuery({
    queryKey: ['departments', organization?.id],
    queryFn: async (): Promise<Department[]> => {
      if (!organization?.id) return [];

      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .eq('organization_id', organization.id)
          .order('name');

        if (error) {
          console.error('Error fetching departments:', error);
          return [];
        }

        // Get member counts for each department
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

        return (data || []).map(dept => ({
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

// Create invite
export const useCreateInvite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: organization } = useOrganization();

  return useMutation({
    mutationFn: async (data: { 
      email: string; 
      role: TeamRole; 
      department?: string;
    }) => {
      if (!organization?.id) throw new Error('No organization found');
      if (!user) throw new Error('No user logged in');

      // Check if user already has a pending invite
      const { data: existingInvite } = await supabase
        .from('team_invites')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .eq('organization_id', organization.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvite) {
        throw new Error('An invite already exists for this email');
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const inviteData = {
        organization_id: organization.id,
        email: data.email.toLowerCase(),
        role: data.role,
        department: data.department,
        invited_by: user.id,
        invite_token: generateInviteToken(),
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      };

      const { data: invite, error } = await supabase
        .from('team_invites')
        .insert([inviteData])
        .select()
        .single();

      if (error) {
        console.error('Error creating invite:', error);
        throw new Error('Failed to create invitation');
      }

      // TODO: Send email notification here
      // You can integrate with your email service

      return invite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
    }
  });
};

// Resend invite
export const useResendInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('team_invites')
        .update({
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        console.error('Error resending invite:', error);
        throw new Error('Failed to resend invitation');
      }

      // TODO: Resend email notification

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
    }
  });
};

// Cancel invite
export const useCancelInvite = () => {
  const queryClient = useQueryClient();

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
    }
  });
};

// Update team member
export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, ...data }: { memberId: string; [key: string]: any }) => {
      // Remove any activity logging - it's handled by the database trigger
      const { error } = await supabase
        .from('team_members')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
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
    }
  });
};

// Remove team member
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

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
        role: member.role
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
        color: dept.color
      }));
    },
    enabled: !!departments
  });
};