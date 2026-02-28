import { MeetingLinkConfig } from "../MeetingLinkConfig";

interface MeetingLinkStepProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  userId: string | undefined;
  isMobile: boolean;
}

export function MeetingLinkStep({ form, setForm, userId, isMobile }: MeetingLinkStepProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-xs sm:text-sm font-medium text-slate-900 flex items-center gap-2">
        <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] sm:text-xs">
          5
        </span>
        Meeting Link Configuration
      </h3>

      <div className="space-y-3 sm:space-y-4 pl-6 sm:pl-8">
        <MeetingLinkConfig form={form} setForm={setForm} userId={userId || ""} />
      </div>
    </div>
  );
}