import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, Table as TableIcon } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: "all" | "active" | "inactive";
  onFilterStatusChange: (value: "all" | "active" | "inactive") => void;
  scopeFilter: "all" | "personal" | "organization" | "department";
  onScopeFilterChange: (value: "all" | "personal" | "organization" | "department") => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  stats: {
    total: number;
    active: number;
    personalEvents: number;
    organizationEvents: number;
    departmentEvents: number;
  };
  isMobile: boolean;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  scopeFilter,
  onScopeFilterChange,
  viewMode,
  onViewModeChange,
  stats,
  isMobile
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:w-64 lg:w-72">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 sm:pl-9 h-9 sm:h-10 text-sm"
          />
        </div>

        <Select value={filterStatus} onValueChange={(v: any) => onFilterStatusChange(v)}>
          <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 text-sm">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({stats.total})</SelectItem>
            <SelectItem value="active">Active ({stats.active})</SelectItem>
            <SelectItem value="inactive">Inactive ({stats.total - stats.active})</SelectItem>
          </SelectContent>
        </Select>

        <Select value={scopeFilter} onValueChange={(v: any) => onScopeFilterChange(v)}>
          <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 text-sm">
            <SelectValue placeholder="Scope" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scopes</SelectItem>
            <SelectItem value="personal">Personal ({stats.personalEvents})</SelectItem>
            <SelectItem value="organization">Organization ({stats.organizationEvents})</SelectItem>
            <SelectItem value="department">Department ({stats.departmentEvents})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-background ml-auto sm:ml-0">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => onViewModeChange("grid")}
          >
            <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => onViewModeChange("table")}
            disabled={isMobile}
          >
            <TableIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}