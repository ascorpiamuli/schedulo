import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MoreVertical, Copy, Pencil, Sparkles, Eye, EyeOff, Trash2, Clock, Users, DollarSign, CalendarCheck2, User } from "lucide-react";
import { LOCATION_OPTIONS, CURRENCY_OPTIONS, MEETING_PROVIDERS, getScopeIcon, getScopeBadgeClass } from "@/hooks/use-event-types";
import { cn } from "@/lib/utils";

interface TableViewProps {
  events: any[];
  bookingCounts: Record<string, number>;
  onCopy: (slug: string) => void;
  onEdit: (event: any) => void;
  onDuplicate: (event: any) => void;
  onToggle: (event: any) => void;
  onDelete: (id: string) => void;
}

export function TableView({ events, bookingCounts, onCopy, onEdit, onDuplicate, onToggle, onDelete }: TableViewProps) {
  const getLocationIcon = (iconName: string) => {
    switch (iconName) {
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google_meet":
        return "🎥";
      case "zoom":
        return "🎥";
      case "microsoft_teams":
        return "🎥";
      case "custom":
        return "🔗";
      default:
        return "🎥";
    }
  };

  const getScopeIconEmoji = (scope: string) => {
    switch (scope) {
      case "personal":
        return "👤";
      case "organization":
        return "👥";
      case "department":
        return "🏢";
      default:
        return "📅";
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-xs sm:text-sm">Event</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Scope</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Type</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Duration</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Location</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Meeting</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Price</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Attendees</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Status</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm">Bookings</TableHead>
            <TableHead className="font-semibold text-xs sm:text-sm text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            const currency = CURRENCY_OPTIONS.find((c) => c.value === event.currency);
            const bookingCount = bookingCounts?.[event.id] || 0;
            const isOneOnOne = event.max_attendees === 1 && event.scope === "personal";

            return (
              <TableRow key={event.id} className={cn(!event.is_active && "opacity-60")}>
                <TableCell>
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{event.title}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">/{event.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[10px] sm:text-xs px-1.5 py-0.5", getScopeBadgeClass(event.scope))}>
                    <span className="mr-1">{getScopeIconEmoji(event.scope)}</span>
                    {event.scope === "personal"
                      ? "Personal"
                      : event.scope === "organization"
                      ? event.organization?.name || "Organization"
                      : event.department?.name || "Department"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {event.schedule_type === "one_time" ? (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                      <CalendarCheck2 className="h-2.5 w-2.5 mr-1" />
                      One-Time
                    </Badge>
                  ) : isOneOnOne ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                      <User className="h-2.5 w-2.5 mr-1" />
                      1:1
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px]">
                      <span className="mr-1">📅</span>
                      Flexible
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {event.duration}min
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className="text-xs">{getLocationIcon(event.location_type)}</span>
                    <span className="text-[10px] sm:text-sm capitalize truncate max-w-[80px] sm:max-w-none">
                      {event.location_type === "in_person" ? "In person" : event.location_type}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {event.generate_meeting_link ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{getProviderIcon(event.meeting_provider)}</span>
                            <span className="text-[10px] sm:text-xs">
                              {MEETING_PROVIDERS.find((p) => p.value === event.meeting_provider)?.label.split(" ")[0]}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {isOneOnOne ? "Unique links per booking" : "Same link for all attendees"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-[10px] sm:text-xs text-muted-foreground">Manual</span>
                  )}
                </TableCell>
                <TableCell>
                  {(event.price_cents ?? 0) > 0 ? (
                    <span className="text-[10px] sm:text-sm font-medium text-amber-600">
                      {currency?.symbol}
                      {((event.price_cents ?? 0) / 100).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[10px] sm:text-sm text-muted-foreground">Free</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1 text-[10px] sm:text-xs px-1.5 py-0.5">
                    <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {event.min_attendees}-{event.max_attendees}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div
                      className={cn(
                        "h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full",
                        event.is_active ? "bg-green-500" : "bg-slate-300"
                      )}
                    />
                    <span className="text-[10px] sm:text-sm">{event.is_active ? "Active" : "Inactive"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={bookingCount > 0 ? "default" : "secondary"}
                    className={cn("text-[10px] sm:text-xs px-1.5 py-0.5", bookingCount > 0 && "bg-slate-900")}
                  >
                    {bookingCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 sm:h-8 sm:w-8"
                            onClick={() => onCopy(event.slug)}
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Copy link</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8">
                          <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 sm:w-40">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}