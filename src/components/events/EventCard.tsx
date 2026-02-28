import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreVertical, Copy, Pencil, Sparkles, Eye, EyeOff, Trash2, Clock, Users, DollarSign, CalendarCheck2 } from "lucide-react";
import { LOCATION_OPTIONS, CURRENCY_OPTIONS, MEETING_PROVIDERS, getScopeIcon, getScopeBadgeClass } from "@/hooks/use-event-types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EventCardProps {
  event: any;
  bookingCount: number;
  onCopy: (slug: string) => void;
  onEdit: (event: any) => void;
  onDuplicate: (event: any) => void;
  onToggle: (event: any) => void;
  onDelete: (id: string) => void;
}

export function EventCard({ event, bookingCount, onCopy, onEdit, onDuplicate, onToggle, onDelete }: EventCardProps) {
  const LocationIcon = LOCATION_OPTIONS.find((l) => l.value === event.location_type)?.icon || "MapPin";
  const currency = CURRENCY_OPTIONS.find((c) => c.value === event.currency);
  const ProviderIcon = MEETING_PROVIDERS.find((p) => p.value === event.meeting_provider)?.icon || "Video";
  const ScopeIcon = getScopeIcon(event.scope);
  const isOneOnOne = event.max_attendees === 1 && event.scope === "personal";

  const getLocationIcon = () => {
    switch (LocationIcon) {
      case "Video":
        return "🎥";
      case "Phone":
        return "📞";
      case "Building2":
        return "🏢";
      default:
        return "📍";
    }
  };

  const getProviderIcon = () => {
    switch (ProviderIcon) {
      case "Video":
        return "🎥";
      case "Link2":
        return "🔗";
      default:
        return "🎥";
    }
  };

  const getScopeIconEmoji = () => {
    switch (ScopeIcon) {
      case "User":
        return "👤";
      case "Users":
        return "👥";
      case "Building2":
        return "🏢";
      default:
        return "📅";
    }
  };

  return (
    <Card
      key={event.id}
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-lg border-t-4",
        !event.is_active && "opacity-70"
      )}
      style={{ borderTopColor: event.color }}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
              <h3 className="font-semibold text-sm sm:text-lg truncate">{event.title}</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">/{event.slug}</p>

            {/* Scope Badge */}
            <div className="mt-1">
              <Badge variant="outline" className={cn("text-[8px] sm:text-[10px] px-1.5 py-0", getScopeBadgeClass(event.scope))}>
                <span className="mr-1">{getScopeIconEmoji()}</span>
                {event.scope === "personal"
                  ? "Personal"
                  : event.scope === "organization"
                  ? event.organization?.name || "Organization"
                  : event.department?.name || "Department"}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 sm:w-40">
              <DropdownMenuItem onClick={() => onCopy(event.slug)} className="text-xs sm:text-sm">
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(event)} className="text-xs sm:text-sm">
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(event)} className="text-xs sm:text-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggle(event)} className="text-xs sm:text-sm">
                {event.is_active ? (
                  <>
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(event.id)} className="text-red-600 text-xs sm:text-sm">
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {event.description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4 line-clamp-2">{event.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {event.duration}min
          </Badge>
          <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
            <span className="text-xs">{getLocationIcon()}</span>
            <span className="capitalize">
              {event.location_type === "in_person" ? "In person" : event.location_type}
            </span>
          </Badge>
          {event.generate_meeting_link && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1 text-[10px] sm:text-xs px-1.5 py-0.5",
                event.meeting_provider === "google_meet"
                  ? "bg-blue-100 text-blue-700"
                  : event.meeting_provider === "zoom"
                  ? "bg-blue-100 text-blue-700"
                  : event.meeting_provider === "microsoft_teams"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              <span className="text-xs">{getProviderIcon()}</span>
              {isOneOnOne ? "Auto-link" : "Permalink"}
            </Badge>
          )}
          {event.schedule_type === "one_time" && event.one_time_event && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 gap-1">
              <CalendarCheck2 className="h-2.5 w-2.5" />
              {new Date(event.one_time_event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Badge>
          )}
          {(event.price_cents ?? 0) > 0 && (
            <Badge variant="secondary" className="gap-1 bg-amber-100 text-[10px] sm:text-xs px-1.5 py-0.5">
              <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {currency?.symbol}
              {((event.price_cents ?? 0) / 100).toFixed(2)}
            </Badge>
          )}
          {event.max_attendees > 1 && (
            <Badge variant="secondary" className="gap-1 bg-blue-100 text-[10px] sm:text-xs px-1.5 py-0.5">
              <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              Up to {event.max_attendees}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={cn(
                "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                event.is_active ? "bg-green-500" : "bg-slate-300"
              )}
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {event.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={bookingCount > 0 ? "default" : "outline"}
                  className={cn(
                    "cursor-help text-[10px] sm:text-xs px-1.5 py-0.5",
                    bookingCount > 0 && "bg-slate-900"
                  )}
                >
                  <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  {bookingCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-[10px] sm:text-xs">{bookingCount} total bookings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}