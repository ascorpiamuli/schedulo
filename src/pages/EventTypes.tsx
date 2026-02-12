import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useEventTypes, useCreateEventType, useUpdateEventType, useDeleteEventType, EventType } from "@/hooks/use-event-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, MapPin, DollarSign, Pencil, Trash2, Copy, Link as LinkIcon, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const LOCATION_OPTIONS = [
  { value: "video", label: "Video call" },
  { value: "phone", label: "Phone call" },
  { value: "in_person", label: "In person" },
];

const COLOR_OPTIONS = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#EC4899", "#0891B2", "#4F46E5"];

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90, 120];

interface FormData {
  title: string;
  slug: string;
  description: string;
  duration: number;
  location_type: string;
  location_details: string;
  color: string;
  buffer_before: number;
  buffer_after: number;
  is_active: boolean;
  price_cents: number;
  currency: string;
}

const defaultForm: FormData = {
  title: "",
  slug: "",
  description: "",
  duration: 30,
  location_type: "video",
  location_details: "",
  color: "#7C3AED",
  buffer_before: 0,
  buffer_after: 0,
  is_active: true,
  price_cents: 0,
  currency: "usd",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function EventTypes() {
  const { user } = useAuth();
  const { data: events, isLoading } = useEventTypes();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (e: EventType) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      slug: e.slug,
      description: e.description || "",
      duration: e.duration,
      location_type: e.location_type,
      location_details: e.location_details || "",
      color: e.color,
      buffer_before: e.buffer_before,
      buffer_after: e.buffer_after,
      is_active: e.is_active,
      price_cents: e.price_cents || 0,
      currency: e.currency,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...form });
        toast({ title: "Event type updated" });
      } else {
        await createMutation.mutateAsync({ ...form, user_id: user!.id });
        toast({ title: "Event type created" });
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Event type deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (e: EventType) => {
    await updateMutation.mutateAsync({ id: e.id, is_active: !e.is_active });
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    toast({ title: "Link copied!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-['Space_Grotesk']">Event Types</h1>
          <p className="text-muted-foreground mt-1">Create and manage your booking types.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New event type
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-40" />
            </Card>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">No event types yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Create your first event type to start accepting bookings.</p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Create event type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {events?.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className={`relative overflow-hidden ${!e.is_active ? "opacity-60" : ""}`}>
                  <div className="h-1.5" style={{ backgroundColor: e.color }} />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold font-['Space_Grotesk'] truncate">{e.title}</h3>
                        {e.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(e)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyLink(e.slug)}>
                            <Copy className="h-4 w-4 mr-2" /> Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(e.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {e.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {LOCATION_OPTIONS.find((l) => l.value === e.location_type)?.label}
                      </span>
                      {(e.price_cents ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" /> ${((e.price_cents ?? 0) / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Switch checked={e.is_active} onCheckedChange={() => toggleActive(e)} />
                        <span className="text-xs text-muted-foreground">{e.is_active ? "Active" : "Inactive"}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => copyLink(e.slug)}>
                        <LinkIcon className="h-3 w-3" /> Copy link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-['Space_Grotesk']">
              {editingId ? "Edit event type" : "New event type"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
                }}
                placeholder="e.g. 30-min consultation"
              />
            </div>
            <div className="space-y-2">
              <Label>URL slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="30-min-consultation"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this meeting type"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={String(form.duration)} onValueChange={(v) => setForm((f) => ({ ...f, duration: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((d) => (
                      <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={form.location_type} onValueChange={(v) => setForm((f) => ({ ...f, location_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buffer before (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.buffer_before}
                  onChange={(e) => setForm((f) => ({ ...f, buffer_before: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Buffer after (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.buffer_after}
                  onChange={(e) => setForm((f) => ({ ...f, buffer_after: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={(form.price_cents / 100).toFixed(2)}
                  onChange={(e) => setForm((f) => ({ ...f, price_cents: Math.round(Number(e.target.value) * 100) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${form.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
              <Label>Active (visible on booking page)</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving…" : editingId ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
