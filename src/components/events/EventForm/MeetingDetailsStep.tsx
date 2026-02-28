import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCATION_OPTIONS } from "@/hooks/use-event-types";

interface MeetingDetailsStepProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  isMobile: boolean;
}

export function MeetingDetailsStep({ form, setForm, isMobile }: MeetingDetailsStepProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">
          3
        </span>
        Meeting Details
      </h3>

      <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Location Type</Label>
            <Select
              value={form.location_type}
              onValueChange={(v) => setForm((f: any) => ({ ...f, location_type: v }))}
            >
              <SelectTrigger className="h-9 sm:h-11 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_OPTIONS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    <div className="flex items-center gap-2">
                      <span>{l.icon === "Video" ? "🎥" : l.icon === "Phone" ? "📞" : "🏢"}</span>
                      <span className="text-xs sm:text-sm">{l.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Location Details</Label>
            <Input
              value={form.location_details}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, location_details: e.target.value }))
              }
              placeholder={
                form.location_type === "video"
                  ? "Meeting link will be auto-generated"
                  : "Add meeting address or phone number"
              }
              className="h-9 sm:h-11 text-sm"
              disabled={form.location_type === "video" && form.generate_meeting_link}
            />
          </div>
        </div>
      </div>
    </div>
  );
}