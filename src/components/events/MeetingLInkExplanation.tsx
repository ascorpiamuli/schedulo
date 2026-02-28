import { Card, CardContent } from "@/components/ui/card";
import { User, Users, CalendarDays, CalendarCheck2, Link2, Video, Clock9 } from "lucide-react";
import { MEETING_PROVIDERS } from "@/hooks/use-event-types";
import { cn } from "@/lib/utils";

interface MeetingLinkExplanationProps {
  maxAttendees: number;
  scope: string;
  generateMeetingLink: boolean;
  meetingProvider: string;
  scheduleType: "flexible" | "one_time";
}

export function MeetingLinkExplanation({
  maxAttendees,
  scope,
  generateMeetingLink,
  meetingProvider,
  scheduleType
}: MeetingLinkExplanationProps) {
  const isOneOnOne = maxAttendees === 1 && scope === "personal";
  const isOrgOrDepartment = scope === "organization" || scope === "department";
  const providerLabel = MEETING_PROVIDERS.find((p) => p.value === meetingProvider)?.label || meetingProvider;

  const getScopeStyle = () => {
    switch (scope) {
      case "personal":
        return {
          container: "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50",
          icon: "bg-blue-100",
          iconColor: "text-blue-600",
          title: "text-blue-900"
        };
      case "organization":
        return {
          container: "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50",
          icon: "bg-green-100",
          iconColor: "text-green-600",
          title: "text-green-900"
        };
      case "department":
        return {
          container: "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50",
          icon: "bg-purple-100",
          iconColor: "text-purple-600",
          title: "text-purple-900"
        };
      default:
        return {
          container: "border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50",
          icon: "bg-slate-100",
          iconColor: "text-slate-600",
          title: "text-slate-900"
        };
    }
  };

  const style = getScopeStyle();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "User":
        return <User className={cn("h-5 w-5", style.iconColor)} />;
      case "Users":
        return <Users className={cn("h-5 w-5", style.iconColor)} />;
      case "CalendarDays":
        return <CalendarDays className={cn("h-5 w-5", style.iconColor)} />;
      case "CalendarCheck2":
        return <CalendarCheck2 className={cn("h-5 w-5", style.iconColor)} />;
      default:
        return <Video className={cn("h-5 w-5", style.iconColor)} />;
    }
  };

  return (
    <Card className={cn("border-2 overflow-hidden", style.container)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={cn("rounded-full p-2", style.icon)}>
            {isOneOnOne ? (
              <User className={cn("h-5 w-5", style.iconColor)} />
            ) : isOrgOrDepartment ? (
              <Users className={cn("h-5 w-5", style.iconColor)} />
            ) : scheduleType === "one_time" ? (
              <CalendarCheck2 className={cn("h-5 w-5", style.iconColor)} />
            ) : (
              <CalendarDays className={cn("h-5 w-5", style.iconColor)} />
            )}
          </div>
          <div className="flex-1">
            <h4 className={cn("font-semibold text-sm mb-2", style.title)}>
              {scope === "personal" && isOneOnOne && "👤 For 1:1 Meetings"}
              {scope === "personal" && !isOneOnOne && "👥 Personal Group Event"}
              {scope === "organization" && "👥 Organization Event"}
              {scope === "department" && "🏢 Department Event"}
              {scheduleType === "one_time" && " - One-Time"}
            </h4>

            {scope === "personal" && isOneOnOne ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Guest Picks Their Own Time</p>
                    <p className="text-xs text-blue-600">
                      Guests can choose any available time from your calendar. Each booking gets its own unique meeting
                      link.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Video className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800">Unique Links per Booking</p>
                    <p className="text-xs text-blue-600">
                      Each guest receives their own secure meeting link. Perfect for privacy.
                    </p>
                  </div>
                </div>

                {generateMeetingLink && (
                  <div className="mt-2 p-2 bg-blue-100/50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>🔔 How it works:</strong> When a guest books, we'll automatically generate a unique{" "}
                      {providerLabel} link just for them.
                    </p>
                  </div>
                )}
              </div>
            ) : scope === "organization" || scope === "department" ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Users className={cn("h-4 w-4 mt-0.5 shrink-0", style.iconColor)} />
                  <div>
                    <p className={cn("font-medium", style.title)}>
                      {scope === "organization" ? "Any Team Member Can Host" : "Department Members Can Host"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scope === "organization"
                        ? "Bookings are distributed round-robin among team members."
                        : "Only members of the selected department can host these meetings."}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Link2 className={cn("h-4 w-4 mt-0.5 shrink-0", style.iconColor)} />
                  <div>
                    <p className={cn("font-medium", style.title)}>Single Link for Everyone</p>
                    <p className="text-xs text-muted-foreground">
                      {scheduleType === "one_time"
                        ? "All attendees use the same meeting link - perfect for one-time events."
                        : "All attendees use the same permanent meeting link."}
                    </p>
                  </div>
                </div>

                {generateMeetingLink && (
                  <div className="mt-2 p-2 bg-white/50 rounded-lg border border-current/20">
                    <p className={cn("text-xs", style.iconColor)}>
                      <strong>🔔 How it works:</strong> When guests book, we'll give them the same permanent{" "}
                      {providerLabel} link. {scheduleType === "one_time" ? "Great for one-time events." : "Great for ongoing team meetings."}
                    </p>
                  </div>
                )}
              </div>
            ) : scheduleType === "one_time" ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <CalendarCheck2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800">Fixed Date & Time</p>
                    <p className="text-xs text-purple-600">
                      You've set a specific date and time. Guests can only book this exact slot.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Clock9 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800">Perfect for Scheduled Classes</p>
                    <p className="text-xs text-purple-600">
                      Great for workshops, webinars, or lessons that happen at a specific time. All attendees join
                      together.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Link2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-purple-800">Single Link for Everyone</p>
                    <p className="text-xs text-purple-600">
                      All attendees use the same meeting link - perfect for group sessions.
                    </p>
                  </div>
                </div>

                {generateMeetingLink && (
                  <div className="mt-2 p-2 bg-purple-100/50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-700">
                      <strong>🔔 How it works:</strong> When guests book, we'll give them the same permanent{" "}
                      {providerLabel} link. Great for one-time events.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <CalendarDays className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">Flexible Group Booking</p>
                    <p className="text-xs text-green-600">
                      Guests can pick from your available time slots, but all use the same meeting link.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                  <Link2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-800">Single Link for Everyone</p>
                    <p className="text-xs text-green-600">
                      Perfect for team meetings where multiple people join the same call.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick comparison table */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-[10px] font-medium text-gray-500 mb-2">Quick Comparison:</p>
          <div className="grid grid-cols-3 gap-1 text-[8px] sm:text-[10px]">
            <div
              className={cn(
                "p-1 rounded",
                scope === "personal" && isOneOnOne ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
              )}
            >
              <p className="font-medium mb-1">1:1 Personal</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>• Guest picks time</li>
                <li>• Unique links</li>
                <li>• Private rooms</li>
              </ul>
            </div>
            <div
              className={cn(
                "p-1 rounded",
                scheduleType === "one_time" ? "bg-purple-50 border border-purple-200" : "bg-gray-50"
              )}
            >
              <p className="font-medium mb-1">One-Time</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>• Fixed time</li>
                <li>• One link for all</li>
                <li>• Perfect for classes</li>
              </ul>
            </div>
            <div
              className={cn(
                "p-1 rounded",
                (scope === "organization" || scope === "department") && !isOneOnOne
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50"
              )}
            >
              <p className="font-medium mb-1">Org/Dept</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>• Round-robin</li>
                <li>• One link for all</li>
                <li>• Shared hosting</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}