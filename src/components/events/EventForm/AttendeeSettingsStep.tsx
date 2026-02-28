import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ATTENDEE_ROLE_OPTIONS, getInitials } from "@/hooks/use-event-types";

interface AttendeeSettingsStepProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  teamMembersList: any[];
  setTeamMembersList: React.Dispatch<React.SetStateAction<any[]>>;
  customFields: any[];
  setCustomFields: React.Dispatch<React.SetStateAction<any[]>>;
  organization: any;
  isMobile: boolean;
}

export function AttendeeSettingsStep({
  form,
  setForm,
  teamMembersList,
  setTeamMembersList,
  organization,
  isMobile
}: AttendeeSettingsStepProps) {
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (form.scope === "organization" || form.scope === "department") {
      loadUsers();
    }
  }, [form.scope]);

  const loadUsers = async () => {
    if (!organization?.id) return;
    
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          user_id,
          role,
          status,
          department,
          user:profiles!team_members_user_id_fkey (
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("organization_id", organization.id)
        .eq("status", "active");

      if (error) throw error;

      setAvailableUsers(
        data.map((member: any) => ({
          id: member.user_id,
          email: member.user?.email || "",
          full_name: member.user?.full_name,
          role: member.role,
          department: member.department,
          avatar_url: member.user?.avatar_url
        }))
      );
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const addTeamMember = () => {
    setTeamMembersList([
      ...teamMembersList,
      { user_id: "", role: "host", is_required: true }
    ]);
  };

  const updateTeamMember = (index: number, updates: any) => {
    const newMembers = [...teamMembersList];
    newMembers[index] = { ...newMembers[index], ...updates };
    setTeamMembersList(newMembers);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembersList(teamMembersList.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">
          4
        </span>
        Attendee Settings
      </h3>

      <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Min Attendees</Label>
            <Input
              type="number"
              min={1}
              max={form.max_attendees}
              value={form.min_attendees}
              onChange={(e) =>
                setForm((f: any) => ({
                  ...f,
                  min_attendees: parseInt(e.target.value) || 1
                }))
              }
              className="h-9 sm:h-11 text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Minimum people required for this event
            </p>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Max Attendees</Label>
            <Input
              type="number"
              min={form.min_attendees}
              max={100}
              value={form.max_attendees}
              onChange={(e) =>
                setForm((f: any) => ({
                  ...f,
                  max_attendees: parseInt(e.target.value) || 1
                }))
              }
              className="h-9 sm:h-11 text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              {form.max_attendees === 1
                ? "1:1 meeting"
                : `Group event (max ${form.max_attendees} people)`}
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 bg-slate-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs sm:text-sm font-medium">
                Allow Additional Guests
              </Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Let primary guest add more people
              </p>
            </div>
            <Switch
              checked={form.allow_additional_guests}
              onCheckedChange={(v) =>
                setForm((f: any) => ({ ...f, allow_additional_guests: v }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs sm:text-sm font-medium">
                Require Approval
              </Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Manually approve bookings
              </p>
            </div>
            <Switch
              checked={form.require_approval}
              onCheckedChange={(v) =>
                setForm((f: any) => ({ ...f, require_approval: v }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs sm:text-sm font-medium">
                Waiting List
              </Label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Allow people to join when fully booked
              </p>
            </div>
            <Switch
              checked={form.waiting_list_enabled}
              onCheckedChange={(v) =>
                setForm((f: any) => ({ ...f, waiting_list_enabled: v }))
              }
            />
          </div>

          {/* Team Members Section - shown only for organization/department events */}
          {(form.scope === "organization" || form.scope === "department") && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs sm:text-sm font-medium">
                  Team Members
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTeamMember}
                  className="h-7 text-xs"
                  disabled={loadingUsers}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Add Member
                </Button>
              </div>

              {teamMembersList.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">
                  No team members assigned. Any team member can host.
                </p>
              ) : (
                <div className="space-y-2">
                  {teamMembersList.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white p-2 rounded border"
                    >
                      <Select
                        value={member.user_id}
                        onValueChange={(v) =>
                          updateTeamMember(index, { user_id: v })
                        }
                      >
                        <SelectTrigger className="h-8 flex-1">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[8px]">
                                    {getInitials(user.full_name, user.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user.full_name || user.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={member.role}
                        onValueChange={(v: any) =>
                          updateTeamMember(index, { role: v })
                        }
                      >
                        <SelectTrigger className="h-8 w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTENDEE_ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Switch
                        checked={member.is_required}
                        onCheckedChange={(v) =>
                          updateTeamMember(index, { is_required: v })
                        }
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeTeamMember(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}