import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";
import villa from "@/assets/hero-villa.jpg";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ValuePillars } from "@/components/public/ValuePillars";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CONTACT, PROPERTY_TYPES, telHref, waHref } from "@/lib/constants";

export const Route = createFileRoute("/list-property")({
  head: () => ({
    meta: [
      { title: "List Your Property in Pune | Nimra Properties" },
      { name: "description", content: "List your property with Nimra Properties and get professional support, photography and wider exposure." },
      { property: "og:title", content: "List Your Property | Nimra Properties" },
      { property: "og:description", content: "Get the right exposure for your property in Pune." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListProperty,
});

const schema = z.object({
  title: z.string().trim().min(3, "Add a property title").max(120),
  category: z.enum(["residential", "commercial", "plot"]),
  purpose: z.enum(["sell", "rent", "lease"]),
  property_type: z.string().min(1),
  locality: z.string().trim().min(2, "Add the locality").max(100),
  expected_price: z.coerce.number().min(0).optional(),
  description: z.string().trim().max(1000).optional(),
  owner_name: z.string().trim().min(2, "Add your name").max(100),
  owner_phone: z.string().trim().regex(/^[0-9+\s-]{10,16}$/, "Enter a valid mobile number"),
  owner_email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
});

function ListProperty() {
  const [f, setF] = useState({ title: "", category: "residential", purpose: "sell", property_type: "Apartment", locality: "", expected_price: "", description: "", owner_name: "", owner_phone: "", owner_email: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(f);
    if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Please check the form"); return; }
    setBusy(true);
    const { description, ...rest } = p.data;
    const { error } = await supabase.from("seller_applications").insert({ ...rest, owner_email: rest.owner_email || null, expected_price: rest.expected_price ?? null, details: { description: description ?? "" } });
    setBusy(false);
    if (error) { toast.error("Could not submit. Please try again or call us."); return; }
    setDone(true);
  }

  const sel = "h-9 w-full rounded-md border bg-card px-3 text-sm";
  return (
    <PublicLayout>
      <section className="relative mx-auto max-w-7xl overflow-hidden md:mt-4 md:rounded-2xl">
        <img src={villa} alt="" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-transparent" />
        <div className="relative px-5 py-10 md:px-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">List your property</p>
          <h1 className="mt-2 max-w-lg text-3xl font-semibold text-primary md:text-5xl">Get the right exposure for <span className="text-gold">your property</span></h1>
        </div>
      </section>
      <div className="mx-auto mt-6 max-w-7xl px-4"><div className="rounded-xl border bg-card p-5"><ValuePillars variant="row" /></div></div>
      <div className="mx-auto mt-6 grid max-w-7xl gap-6 px-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border bg-card p-5 md:p-8">
          {done ? (
            <div className="py-10 text-center"><h2 className="text-section-title">Thank you!</h2><p className="mt-2 text-sm text-muted-foreground">Your property has been submitted. Our team will review it and contact you.</p></div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
              <h2 className="text-section-title md:col-span-2">Property Details</h2>
              <div className="space-y-1.5 md:col-span-2"><Label>Property Title *</Label><Input value={f.title} onChange={set("title")} placeholder="e.g. 2 BHK Apartment in Dhanori" /></div>
              <div className="space-y-1.5"><Label>Category *</Label><select className={sel} value={f.category} onChange={set("category")}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="plot">Plot / Land</option></select></div>
              <div className="space-y-1.5"><Label>Listing Purpose *</Label><select className={sel} value={f.purpose} onChange={set("purpose")}><option value="sell">Sell</option><option value="rent">Rent</option><option value="lease">Lease</option></select></div>
              <div className="space-y-1.5"><Label>Property Type *</Label><select className={sel} value={f.property_type} onChange={set("property_type")}>{PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div className="space-y-1.5"><Label>Locality *</Label><Input value={f.locality} onChange={set("locality")} placeholder="e.g. Kharadi" /></div>
              <div className="space-y-1.5"><Label>Expected Price (₹)</Label><Input type="number" min={0} value={f.expected_price} onChange={set("expected_price")} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Description</Label><Textarea rows={3} maxLength={1000} value={f.description} onChange={set("description")} /></div>
              <h2 className="text-section-title md:col-span-2">Owner Details</h2>
              <div className="space-y-1.5"><Label>Name *</Label><Input value={f.owner_name} onChange={set("owner_name")} /></div>
              <div className="space-y-1.5"><Label>Mobile *</Label><Input value={f.owner_phone} onChange={set("owner_phone")} inputMode="tel" /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Email</Label><Input type="email" value={f.owner_email} onChange={set("owner_email")} /></div>
              <Button type="submit" disabled={busy} className="md:col-span-2">{busy ? "Submitting..." : "Submit Property"}</Button>
            </form>
          )}
        </div>
        <aside className="h-fit space-y-3 rounded-xl border bg-card p-5 text-sm">
          <h2 className="text-section-title">Need help listing your property?</h2>
          <a href={telHref(CONTACT.callPhone)} className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />Call us {CONTACT.callPhone}</a>
          <a href={waHref(CONTACT.whatsappPhone)} target="_blank" rel="noreferrer" className="flex items-center gap-2"><WhatsAppIcon className="h-4 w-4 text-whatsapp" />WhatsApp {CONTACT.whatsappPhone}</a>
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 text-primary" />{CONTACT.email}</a>
        </aside>
      </div>
    </PublicLayout>
  );
}
