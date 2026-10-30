import { useState, type ReactNode } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, CalendarCheck, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const phoneRe = /^[0-9+\s-]{10,16}$/;
const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().regex(phoneRe, "Enter a valid mobile number"),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional(),
});

function friendlyError(msg: string) {
  if (msg.includes("duplicate_submission")) return "We already received your request. Our team will contact you shortly.";
  if (msg.includes("Invalid phone")) return "Please enter a valid mobile number.";
  return "Something went wrong. Please try again or call us.";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}

type Kind = "interest" | "enquiry";

export function LeadForm({
  kind,
  propertyId,
  defaultMessage,
  onDone,
  submitLabel,
}: {
  kind: Kind;
  propertyId?: string;
  defaultMessage?: string;
  onDone?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.website) return; // honeypot
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("enquiries").insert({
      kind,
      property_id: propertyId ?? null,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      message: parsed.data.message || defaultMessage || null,
    });
    setBusy(false);
    if (error) return toast.error(friendlyError(error.message));
    toast.success(kind === "interest" ? "Thank you! We'll get back to you shortly." : "Enquiry sent. Our team will contact you soon.");
    setForm({ name: "", phone: "", email: "", message: "", website: "" });
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input tabIndex={-1} autoComplete="off" className="hidden" value={form.website} onChange={set("website")} aria-hidden />
      <Field label="Full Name *">
        <Input value={form.name} onChange={set("name")} placeholder="Enter your name" maxLength={100} />
      </Field>
      <Field label="Mobile Number *">
        <div className="flex">
          <span className="flex items-center rounded-l-md border border-r-0 bg-secondary px-3 text-sm">+91</span>
          <Input className="rounded-l-none" value={form.phone} onChange={set("phone")} placeholder="Enter mobile number" inputMode="tel" maxLength={16} />
        </div>
      </Field>
      <Field label="Email (Optional)">
        <Input value={form.email} onChange={set("email")} placeholder="Enter email" type="email" maxLength={255} />
      </Field>
      <Field label={kind === "enquiry" ? "Your question *" : "Message (Optional)"}>
        <Textarea value={form.message} onChange={set("message")} placeholder={defaultMessage ?? "I am interested in this property..."} rows={3} maxLength={1000} />
      </Field>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending..." : submitLabel ?? "Submit Interest"} <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

export function EnquiryDialog({ propertyId, trigger }: { propertyId?: string; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-auto flex-col gap-1 py-3">
            <MessageSquare className="h-5 w-5" /> Ask an Enquiry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ask an Enquiry</DialogTitle>
          <DialogDescription>Send us your question and our team will respond shortly.</DialogDescription>
        </DialogHeader>
        <LeadForm kind="enquiry" propertyId={propertyId} submitLabel="Send Enquiry" onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

const visitSchema = leadSchema.extend({
  date: z.string().min(1, "Choose a preferred date"),
  time: z.string().min(1, "Choose a preferred time"),
});

export function VisitDialog({ propertyId, trigger }: { propertyId: string; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", email: "", message: "", date: "", time: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = visitSchema.safeParse(f);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (parsed.data.date < today) return toast.error("Please choose a future date");
    setBusy(true);
    const { error } = await supabase.from("site_visits").insert({
      property_id: propertyId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      message: parsed.data.message || null,
      requested_date: parsed.data.date,
      requested_time: parsed.data.time,
    });
    setBusy(false);
    if (error) return toast.error(friendlyError(error.message));
    toast.success("Visit requested. We'll call you to confirm the time.");
    setOpen(false);
    setF({ name: "", phone: "", email: "", message: "", date: "", time: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-auto flex-col gap-1 py-3">
            <CalendarCheck className="h-5 w-5" /> Schedule a Visit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a Visit</DialogTitle>
          <DialogDescription>Pick a preferred date and time. We'll confirm with you by phone.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Full Name *"><Input value={f.name} onChange={set("name")} maxLength={100} /></Field>
          <Field label="Mobile Number *"><Input value={f.phone} onChange={set("phone")} inputMode="tel" maxLength={16} /></Field>
          <Field label="Email (Optional)"><Input value={f.email} onChange={set("email")} type="email" maxLength={255} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preferred Date *"><Input type="date" min={today} value={f.date} onChange={set("date")} /></Field>
            <Field label="Preferred Time *"><Input type="time" value={f.time} onChange={set("time")} /></Field>
          </div>
          <Field label="Message (Optional)"><Textarea rows={2} value={f.message} onChange={set("message")} maxLength={1000} /></Field>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Sending..." : "Request Visit"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
