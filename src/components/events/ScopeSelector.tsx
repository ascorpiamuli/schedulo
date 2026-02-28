import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EVENT_SCOPE_OPTIONS } from "@/hooks/use-event-types";
import { cn } from "@/lib/utils";

interface ScopeSelectorProps {
  value: string;
  onChange: (scope: any, orgId?: string | null, deptId?: string | null) => void;
  organization: any;
  departments: any[] | undefined;
  selectedDepartmentId: string | null;
  onDepartmentChange: (deptId: string) => void;
}

export function ScopeSelector({
  value,
  onChange,
  organization,
  departments,
  selectedDepartmentId,
  onDepartmentChange
}: ScopeSelectorProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {EVENT_SCOPE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = (option.value === "organization" || option.value === "department") && !organization;

          return (
            <div
              key={option.value}
              className={cn(
                "cursor-pointer rounded-lg border p-4 transition-all relative",
                isSelected
                  ? `${option.bgColor} ${option.borderColor} border-2`
                  : "border-slate-200 hover:border-slate-300",
                isDisabled && "opacity-50 cursor-not-allowed hover:border-slate-200"
              )}
              onClick={() => !isDisabled && onChange(option.value, organization?.id, null)}
            >
              {isDisabled && (
                <div className="absolute top-2 right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          You need to be in an organization to create organization/department events
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "text-lg",
                    isSelected ? option.textColor : "text-slate-400"
                  )}
                >
                  {getIcon(option.icon)}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? option.textColor : "text-slate-600"
                  )}
                >
                  {option.label}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">{option.description}</p>
            </div>
          );
        })}
      </div>

      {/* Department selector - only shown when scope is department */}
      {value === "department" && departments && departments.length > 0 && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
          <Label className="text-xs sm:text-sm mb-2 block">Select Department</Label>
          <Select value={selectedDepartmentId || ""} onValueChange={onDepartmentChange}>
            <SelectTrigger className="h-9 sm:h-11">
              <SelectValue placeholder="Choose a department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span>{dept.name}</span>
                    {dept.member_count !== undefined && (
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        {dept.member_count} members
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!organization && (
            <p className="text-[10px] text-amber-600 mt-2">
              You need to be part of an organization to create department events.
            </p>
          )}
        </div>
      )}

      {value === "department" && (!departments || departments.length === 0) && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700">
            No departments found. Create a department first in Team Management.
          </p>
        </div>
      )}
    </div>
  );
}