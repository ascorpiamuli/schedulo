import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScopeSelector } from "../ScopeSelector";
import { truncateUserId, slugify } from "@/hooks/use-event-types";

interface BasicInfoStepProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  organization: any;
  departments: any[];
  selectedDepartmentId: string | null;
  setSelectedDepartmentId: React.Dispatch<React.SetStateAction<string | null>>;
  userId: string | undefined;
  isMobile: boolean;
}

export function BasicInfoStep({
  form,
  setForm,
  organization,
  departments,
  selectedDepartmentId,
  setSelectedDepartmentId,
  userId,
  isMobile
}: BasicInfoStepProps) {
  const handleScopeChange = (scope: any, orgId?: string | null, deptId?: string | null) => {
    setForm((f: any) => ({
      ...f,
      scope,
      organization_id: orgId,
      department_id: deptId
    }));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">
          1
        </span>
        Basic Information & Scope
      </h3>

      <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">
            Event Title <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f: any) => ({
                ...f,
                title,
                slug: slugify(title)
              }));
            }}
            placeholder="e.g., Math Class Feb 23 or 30-min Call"
            className="h-9 sm:h-11 text-sm"
          />
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Choose a clear, descriptive name for your event
          </p>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">
            URL Slug <span className="text-red-500">*</span>
          </Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <span className="text-[10px] sm:text-xs text-muted-foreground bg-slate-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-md sm:rounded-l-md sm:rounded-tr-none border border-b-0 sm:border-r-0 w-full sm:w-auto">
              {window.location.origin}/{userId ? truncateUserId(userId) : "user"}/
            </span>
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, slug: slugify(e.target.value) }))
              }
              placeholder="math-class-feb-23"
              className="rounded-b-md sm:rounded-l-none sm:rounded-r-md h-9 sm:h-11 text-sm w-full"
            />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            This will be your booking link. Use hyphens instead of spaces.
          </p>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, description: e.target.value }))
            }
            placeholder="Brief description of what this meeting is about..."
            rows={isMobile ? 2 : 3}
            className="resize-none text-sm"
          />
        </div>

        {/* Scope Selector */}
        <div className="pt-2">
          <Label className="text-xs sm:text-sm mb-2 block">Event Scope</Label>
          <ScopeSelector
            value={form.scope}
            onChange={handleScopeChange}
            organization={organization}
            departments={departments}
            selectedDepartmentId={selectedDepartmentId}
            onDepartmentChange={setSelectedDepartmentId}
          />
        </div>
      </div>
    </div>
  );
}