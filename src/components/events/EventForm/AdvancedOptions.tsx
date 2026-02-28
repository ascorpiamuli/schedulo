import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, DollarSign } from "lucide-react";
import { 
  CURRENCY_OPTIONS, 
  REMINDER_OPTIONS, 
  CUSTOM_FIELD_TYPES, 
  COLOR_OPTIONS,
  slugify 
} from "@/hooks/use-event-types";
import { cn } from "@/lib/utils";

interface AdvancedOptionsProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  priceInput: string;
  setPriceInput: React.Dispatch<React.SetStateAction<string>>;
  customFields: any[];
  setCustomFields: React.Dispatch<React.SetStateAction<any[]>>;
  isMobile: boolean;
}

export function AdvancedOptions({
  form,
  setForm,
  priceInput,
  setPriceInput,
  customFields,
  setCustomFields,
  isMobile
}: AdvancedOptionsProps) {
  const handlePriceChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPriceInput(value);
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setForm((f: any) => ({ ...f, price_cents: Math.round(numValue * 100) }));
      }
    }
  };

  const addCustomField = () => {
    setCustomFields([
      ...customFields,
      { name: `field_${customFields.length + 1}`, label: "", type: "text", required: false }
    ]);
  };

  const updateCustomField = (index: number, updates: any) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], ...updates };
    if (updates.label) {
      newFields[index].name = slugify(updates.label);
    }
    setCustomFields(newFields);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 sm:space-y-6 pt-3 sm:pt-4">
      {/* Buffer Times */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">Buffer before (minutes)</Label>
          <Input
            type="number"
            min={0}
            step={5}
            value={form.buffer_before}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, buffer_before: Number(e.target.value) }))
            }
            className="h-9 sm:h-11 text-sm"
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">Buffer after (minutes)</Label>
          <Input
            type="number"
            min={0}
            step={5}
            value={form.buffer_after}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, buffer_after: Number(e.target.value) }))
            }
            className="h-9 sm:h-11 text-sm"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={priceInput}
              onChange={(e) => handlePriceChange(e.target.value)}
              onBlur={() => {
                if (priceInput === "" || priceInput === ".") {
                  setPriceInput("0");
                  setForm((f: any) => ({ ...f, price_cents: 0 }));
                } else {
                  const numValue = parseFloat(priceInput);
                  if (!isNaN(numValue)) {
                    setPriceInput(numValue.toFixed(2));
                  }
                }
              }}
              className="pl-7 sm:pl-9 h-9 sm:h-11 text-sm"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Label className="text-xs sm:text-sm">Currency</Label>
          <Select
            value={form.currency}
            onValueChange={(v) => setForm((f: any) => ({ ...f, currency: v }))}
          >
            <SelectTrigger className="h-9 sm:h-11 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <span className="mr-1 sm:mr-2">{c.flag}</span>
                  <span className="text-xs sm:text-sm">{c.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reminders */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-xs sm:text-sm">Reminders</Label>
        <div className="space-y-2 sm:space-y-3 bg-slate-50 p-3 sm:p-4 rounded-lg">
          {REMINDER_OPTIONS.map((reminder) => (
            <div key={reminder.value} className="flex items-center justify-between">
              <span className="text-[10px] sm:text-sm">{reminder.label}</span>
              <Switch
                checked={form.reminder_settings[reminder.value] || false}
                onCheckedChange={(v) =>
                  setForm((f: any) => ({
                    ...f,
                    reminder_settings: { ...f.reminder_settings, [reminder.value]: v }
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Fields */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs sm:text-sm">Custom Fields</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomField}
            className="h-7 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Field
          </Button>
        </div>

        {customFields.length === 0 ? (
          <p className="text-[10px] text-muted-foreground italic">
            No custom fields. Add fields to collect additional information from guests.
          </p>
        ) : (
          <div className="space-y-2">
            {customFields.map((field, index) => (
              <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                <Select
                  value={field.type}
                  onValueChange={(v: any) => updateCustomField(index, { type: v })}
                >
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOM_FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => updateCustomField(index, { label: e.target.value })}
                  className="h-8 flex-1 text-xs"
                />

                <Switch
                  checked={field.required}
                  onCheckedChange={(v) => updateCustomField(index, { required: v })}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeCustomField(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Color Theme */}
      <div className="space-y-1.5 sm:space-y-2">
        <Label className="text-xs sm:text-sm">Color theme</Label>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              className={cn(
                "h-7 w-7 sm:h-10 sm:w-10 rounded-full transition-all hover:scale-110 border-2",
                form.color === c.value ? "border-slate-900 scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c.value }}
              onClick={() => setForm((f: any) => ({ ...f, color: c.value }))}
              title={c.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}