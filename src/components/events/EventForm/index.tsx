import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronDown, Settings2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

// Import form steps
import { BasicInfoStep } from "./BasicInfoStep";
import { ScheduleStep } from "./ScheduleStep";
import { MeetingDetailsStep } from "./MeetingDetailsStep";
import { AttendeeSettingsStep } from "./AttendeeSettingsStep";
import { MeetingLinkStep } from "./MeetingLinkStep";
import { AdvancedOptions } from "./AdvancedOptions";

import { FormData, TeamMemberForm, CustomField } from "@/hooks/use-event-types";

interface EventFormProps {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  editingId: string | null;
  organization: any;
  departments: any[];
  selectedDepartmentId: string | null;
  setSelectedDepartmentId: React.Dispatch<React.SetStateAction<string | null>>;
  showAdvanced: boolean;
  setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
  priceInput: string;
  setPriceInput: React.Dispatch<React.SetStateAction<string>>;
  teamMembersList: TeamMemberForm[];
  setTeamMembersList: React.Dispatch<React.SetStateAction<TeamMemberForm[]>>;
  customFields: CustomField[];
  setCustomFields: React.Dispatch<React.SetStateAction<CustomField[]>>;
  userId: string | undefined;
  isMobile: boolean;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function EventForm({
  form,
  setForm,
  editingId,
  organization,
  departments,
  selectedDepartmentId,
  setSelectedDepartmentId,
  showAdvanced,
  setShowAdvanced,
  priceInput,
  setPriceInput,
  teamMembersList,
  setTeamMembersList,
  customFields,
  setCustomFields,
  userId,
  isMobile,
  onSave,
  onCancel,
  isPending
}: EventFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when changing steps on mobile
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when changing steps on mobile
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            form={form}
            setForm={setForm}
            organization={organization}
            departments={departments}
            selectedDepartmentId={selectedDepartmentId}
            setSelectedDepartmentId={setSelectedDepartmentId}
            userId={userId}
            isMobile={isMobile}
          />
        );
      case 2:
        return (
          <ScheduleStep
            form={form}
            setForm={setForm}
            isMobile={isMobile}
          />
        );
      case 3:
        return (
          <MeetingDetailsStep
            form={form}
            setForm={setForm}
            isMobile={isMobile}
          />
        );
      case 4:
        return (
          <AttendeeSettingsStep
            form={form}
            setForm={setForm}
            teamMembersList={teamMembersList}
            setTeamMembersList={setTeamMembersList}
            customFields={customFields}
            setCustomFields={setCustomFields}
            organization={organization}
            isMobile={isMobile}
          />
        );
      case 5:
        return (
          <MeetingLinkStep
            form={form}
            setForm={setForm}
            userId={userId}
            isMobile={isMobile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 max-h-[calc(90vh-120px)]">
      <div className="space-y-6 sm:space-y-8">
        {/* Progress Steps - Desktop */}
        {!isMobile && (
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-colors",
                    step === currentStep
                      ? "bg-slate-900 text-white"
                      : step < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                  onClick={() => setCurrentStep(step)}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                {step < 5 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-colors",
                      step < currentStep ? "bg-green-500" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mobile Step Indicator */}
        {isMobile && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium">
                {currentStep}
              </div>
              <span className="text-xs text-muted-foreground">of {totalSteps}</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "h-1 w-6 rounded-full transition-colors",
                    step <= currentStep ? "bg-slate-900" : "bg-slate-200"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current Step */}
        {renderStep()}

        {/* Advanced Options Toggle */}
        <div className="space-y-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 w-full justify-center py-2 sm:py-3 border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Settings2 className="h-3 w-3 sm:h-4 sm:w-4" />
            {showAdvanced ? "Hide" : "Show"} advanced options
            <ChevronDown
              className={cn(
                "h-3 w-3 sm:h-4 sm:w-4 transition-transform",
                showAdvanced && "rotate-180"
              )}
            />
          </button>

          {showAdvanced && (
            <AdvancedOptions
              form={form}
              setForm={setForm}
              priceInput={priceInput}
              setPriceInput={setPriceInput}
              customFields={customFields}
              setCustomFields={setCustomFields}
              isMobile={isMobile}
            />
          )}
        </div>

        {/* Status Toggle */}
        <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="text-xs sm:text-sm font-medium">Event Status</label>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {form.is_active
                  ? "Active - Guests can book this event"
                  : "Inactive - This event is hidden from booking"}
              </p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            />
          </div>
        </div>

        {/* Navigation Buttons - Desktop */}
        {!isMobile && (
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6"
            >
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="px-6 bg-slate-900 hover:bg-slate-800">
                Next
              </Button>
            ) : (
              <Button
                onClick={onSave}
                className="px-6 bg-slate-900 hover:bg-slate-800"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  editingId ? "Update Event" : "Create Event"
                )}
              </Button>
            )}
          </div>
        )}

        {/* Navigation Buttons - Mobile */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1 h-12 gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext} 
                  className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={onSave}
                  className="flex-1 h-12 bg-slate-900 hover:bg-slate-800"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    editingId ? "Update Event" : "Create Event"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Add bottom padding on mobile to account for fixed navigation */}
        {isMobile && <div className="h-20" />}
      </div>
    </div>
  );
}