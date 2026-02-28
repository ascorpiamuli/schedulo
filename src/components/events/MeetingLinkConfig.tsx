import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Info, Loader2, RadioTower, RefreshCcw, User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MEETING_PROVIDERS, getMeetingProviderLabel } from "@/hooks/use-event-types";
import { MeetingLinkExplanation } from "./MeetingLInkExplanation";
import { cn } from "@/lib/utils";

interface MeetingLinkConfigProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  userId: string;
}

export function MeetingLinkConfig({ form, setForm, userId }: MeetingLinkConfigProps) {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const isOneOnOne = form.max_attendees === 1 && form.scope === "personal";
  const isOrgOrDepartment = form.scope === "organization" || form.scope === "department";

  const generateMeetingLink = async () => {
    setGenerating(true);
    try {
      const meetingMetadata = {
        title: form.title || "Meeting Room",
        description: form.description || "Scheduled meeting",
        duration: form.duration,
        hostName: userId,
        eventType: isOneOnOne ? "1-on-1" : "group",
        maxAttendees: form.max_attendees,
        scope: form.scope,
        scheduleType: form.schedule_type,
        oneTimeEvent: form.one_time_event,
        isPermanent: isOrgOrDepartment || form.schedule_type === "one_time",
        conferenceData: {
          ...form.conference_data,
          metadata: {
            eventTitle: form.title,
            eventSlug: form.slug,
            hostJoinFirst: form.host_join_first,
            scheduleType: form.schedule_type,
            scope: form.scope,
            oneTimeEvent: form.one_time_event,
            createdAt: new Date().toISOString()
          }
        }
      };

      const { data, error } = await supabase.functions.invoke("create-conference", {
        body: {
          provider: form.meeting_provider,
          title: meetingMetadata.title,
          description: meetingMetadata.description,
          duration: meetingMetadata.duration,
          hostUserId: userId,
          isPermanent: meetingMetadata.isPermanent,
          metadata: meetingMetadata
        }
      });

      if (error) throw error;

      if (data?.meetLink) {
        setForm({
          ...form,
          permanent_meeting_link: data.meetLink,
          conference_data: {
            ...data.conferenceData,
            generatedAt: new Date().toISOString(),
            eventDetails: meetingMetadata,
            isPermanent: isOrgOrDepartment || form.schedule_type === "one_time",
            scheduleType: form.schedule_type,
            scope: form.scope,
            oneTimeEvent: form.one_time_event
          }
        });

        toast({
          title:
            isOrgOrDepartment || form.schedule_type === "one_time"
              ? "✅ Permanent meeting link created"
              : "✅ Meeting link template created",
          description:
            isOrgOrDepartment || form.schedule_type === "one_time"
              ? `Your ${getMeetingProviderLabel(form.meeting_provider)} link is ready. All attendees will use this link.`
              : `Each booking will get its own unique ${getMeetingProviderLabel(form.meeting_provider)} link.`
        });
      } else if (data?.status === "coming_soon") {
        toast({
          title: "Coming soon",
          description: data.message,
          variant: "default"
        });
      }
    } catch (err: any) {
      toast({
        title: "Failed to generate link",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const testMeetingLink = () => {
    if (form.permanent_meeting_link) {
      window.open(form.permanent_meeting_link, "_blank");
    }
  };

  return (
    <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RadioTower className="h-4 w-4 text-slate-600" />
          <Label className="text-sm font-medium">Meeting Link Configuration</Label>
        </div>
        <Badge
          variant="outline"
          className={cn(
            form.generate_meeting_link ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
          )}
        >
          {form.generate_meeting_link ? "Auto-generate" : "Manual"}
        </Badge>
      </div>

      <MeetingLinkExplanation
        maxAttendees={form.max_attendees}
        scope={form.scope}
        generateMeetingLink={form.generate_meeting_link}
        meetingProvider={form.meeting_provider}
        scheduleType={form.schedule_type}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Auto-generate meeting links</span>
          <Switch
            checked={form.generate_meeting_link}
            onCheckedChange={(v) => setForm({ ...form, generate_meeting_link: v })}
          />
        </div>

        {form.generate_meeting_link && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Meeting Provider</Label>
              <Select
                value={form.meeting_provider}
                onValueChange={(v: any) => setForm({ ...form, meeting_provider: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-lg",
                            provider.color
                          )}
                        >
                          {provider.icon === "Video" ? "🎥" : "🔗"}
                        </span>
                        <span>{provider.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground">Host must join first</span>
                <p className="text-[10px] text-muted-foreground">
                  {isOneOnOne
                    ? "Recommended - ensures you're ready before guest joins"
                    : "Optional - attendees can wait in lobby"}
                </p>
              </div>
              <Switch
                checked={form.host_join_first}
                onCheckedChange={(v) => setForm({ ...form, host_join_first: v })}
              />
            </div>

            {form.meeting_provider === "custom" && (
              <div className="space-y-2">
                <Label className="text-xs">Custom Meeting Link</Label>
                <Input
                  value={form.permanent_meeting_link}
                  onChange={(e) => setForm({ ...form, permanent_meeting_link: e.target.value })}
                  placeholder="https://meet.google.com/your-link"
                  className="h-9 text-sm"
                />
                {isOrgOrDepartment || form.schedule_type === "one_time" ? (
                  <p className="text-[10px] text-green-600">This link will be shared with all attendees.</p>
                ) : (
                  <p className="text-[10px] text-blue-600">
                    This link will be used as a template for generating unique links per booking.
                  </p>
                )}
              </div>
            )}

            {form.meeting_provider !== "custom" && (
              <div className="space-y-2">
                <Label className="text-xs">
                  {isOrgOrDepartment || form.schedule_type === "one_time" ? "Meeting Link" : "Meeting Link Template"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={form.permanent_meeting_link}
                    onChange={(e) => setForm({ ...form, permanent_meeting_link: e.target.value })}
                    placeholder={
                      isOrgOrDepartment || form.schedule_type === "one_time"
                        ? "Click generate to create a meeting link for all attendees"
                        : "Click generate to create a meeting link template"
                    }
                    className="h-9 text-sm flex-1"
                    readOnly={!form.permanent_meeting_link}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateMeetingLink}
                    disabled={generating || !form.title}
                    className="h-9 gap-1"
                  >
                    {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
                    Generate
                  </Button>
                  {form.permanent_meeting_link && (
                    <Button variant="outline" size="sm" onClick={testMeetingLink} className="h-9">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {form.permanent_meeting_link && (
              <div className="space-y-2">
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded",
                    isOrgOrDepartment || form.schedule_type === "one_time"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-blue-50 text-blue-700"
                  )}
                >
                  {isOrgOrDepartment || form.schedule_type === "one_time" ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span className="flex-1 truncate">
                    {isOrgOrDepartment || form.schedule_type === "one_time"
                      ? "All attendees will use this link"
                      : "Each booking gets a unique link"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      navigator.clipboard.writeText(form.permanent_meeting_link);
                      toast({ title: "Copied!", description: "Meeting link copied to clipboard" });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {form.conference_data && (
                  <div className="text-xs bg-white p-2 rounded border space-y-1">
                    <p className="font-medium text-slate-700 mb-1">Meeting details:</p>
                    <p className="text-muted-foreground">• Title: {form.title}</p>
                    <p className="text-muted-foreground">• Duration: {form.duration} minutes</p>
                    <p className="text-muted-foreground">• Scope: {form.scope}</p>
                    <p className="text-muted-foreground">
                      • Schedule: {form.schedule_type === "one_time" ? "One-Time" : "Flexible"}
                    </p>
                    {form.one_time_event && (
                      <p className="text-muted-foreground text-[8px]">
                        • Date: {new Date(form.one_time_event.date).toLocaleDateString()} {form.one_time_event.start_time}-
                        {form.one_time_event.end_time}
                      </p>
                    )}
                    {form.host_join_first && <p className="text-muted-foreground">• Host must join first</p>}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!form.generate_meeting_link && (
          <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
            <Info className="h-3 w-3 mt-0.5" />
            <span>
              Manual mode: You'll provide your own meeting link or location details.
              {isOrgOrDepartment || form.schedule_type === "one_time"
                ? " Make sure your link can accommodate multiple attendees."
                : " Great for using your personal meeting room."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}