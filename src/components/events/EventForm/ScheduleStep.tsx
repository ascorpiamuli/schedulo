import { Label } from "@/components/ui/label";
import { OneTimeEventInput } from "../OneTimeEventInput";
import { EVENT_SCHEDULE_TYPES } from "@/hooks/use-event-types";
import { cn } from "@/lib/utils";

interface ScheduleStepProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  isMobile: boolean;
}

export function ScheduleStep({ form, setForm, isMobile }: ScheduleStepProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">
          2
        </span>
        Event Type & Schedule
      </h3>

      <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Schedule Type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {EVENT_SCHEDULE_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = form.schedule_type === type.value;
              return (
                <div
                  key={type.value}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 transition-all",
                    isSelected
                      ? type.value === "one_time"
                        ? "border-purple-500 bg-purple-50"
                        : type.value === "flexible"
                        ? form.max_attendees === 1
                          ? "border-blue-500 bg-blue-50"
                          : "border-green-500 bg-green-50"
                        : "border-slate-500 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                  onClick={() =>
                    setForm((f: any) => ({
                      ...f,
                      schedule_type: type.value as "flexible" | "one_time"
                    }))
                  }
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "text-2xl",
                        isSelected
                          ? type.value === "one_time"
                            ? "text-purple-600"
                            : type.value === "flexible"
                            ? form.max_attendees === 1
                              ? "text-blue-600"
                              : "text-green-600"
                            : "text-slate-600"
                          : "text-slate-400"
                      )}
                    >
                      {Icon === "CalendarDays" ? "📅" : "📆"}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isSelected
                          ? type.value === "one_time"
                            ? "text-purple-900"
                            : type.value === "flexible"
                            ? form.max_attendees === 1
                              ? "text-blue-900"
                              : "text-green-900"
                            : "text-slate-900"
                          : "text-slate-600"
                      )}
                    >
                      {type.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* One-Time Event Input */}
        {form.schedule_type === "one_time" && (
          <OneTimeEventInput
            value={form.one_time_event}
            onChange={(data) =>
              setForm((f: any) => ({ ...f, one_time_event: data }))
            }
          />
        )}
      </div>
    </div>
  );
}